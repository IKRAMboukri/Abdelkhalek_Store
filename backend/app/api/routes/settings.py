import re
import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from app.api.deps import CurrentUser, DbSession, bad_request, not_found
from app.core.config import settings
from app.schemas.settings import StoreSettingsRead, StoreSettingsUpdate
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services import SettingsService, UserService

router = APIRouter(prefix="/settings", tags=["settings"])

# Configurable path (default backend/uploads/logos); set MEDIA_ROOT to a
# mounted persistent disk path in production so logos survive restarts.
UPLOAD_DIR = settings.MEDIA_ROOT
# Create the directory at import time so a missing/unwritable storage path
# fails fast at startup (visible in Render logs) instead of on first upload.
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_LOGO_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
}
# Fallback: match by filename suffix when the client reports no/odd MIME type.
LOGO_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}
MAX_LOGO_SIZE = 5 * 1024 * 1024  # 5 MB

_SVG_PROBE_RE = re.compile(rb"<svg[\s>]", re.IGNORECASE)


def _resolve_logo_extension(content_type: str | None, filename: str, data: bytes) -> str | None:
    """Resolve the logo extension from, in order: MIME type, filename suffix,
    and file signature. Returns None when the file looks like neither a known
    raster/SVG image nor a supported content type."""
    normalized = (content_type or "").split(";", 1)[0].strip().lower()
    if normalized in ALLOWED_LOGO_TYPES:
        return ALLOWED_LOGO_TYPES[normalized]

    suffix = Path(filename).suffix.lower()
    if suffix in LOGO_EXTENSIONS:
        return ".jpg" if suffix == ".jpeg" else suffix

    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if data.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if data[:4] in (b"GIF87a", b"GIF89a"):
        return ".gif"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    if _SVG_PROBE_RE.search(data[:1024]):
        return ".svg"
    return None


@router.get("", response_model=StoreSettingsRead)
def get_settings(db: DbSession):
    return StoreSettingsRead.model_validate(SettingsService(db).get())


@router.put("", response_model=StoreSettingsRead)
def update_settings(data: StoreSettingsUpdate, db: DbSession):
    settings = SettingsService(db).update(data)
    db.flush()
    return StoreSettingsRead.model_validate(settings)


@router.post("/logo", response_model=StoreSettingsRead)
def upload_logo(
    db: DbSession,
    current_user: CurrentUser,
    file: UploadFile = File(...),
):
    """Persist a logo image on the server and store its URL in store_settings."""
    data = file.file.read()
    if len(data) == 0:
        raise bad_request(ValueError("The selected file is empty."))
    if len(data) > MAX_LOGO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image is too large. Maximum size is 5 MB.",
        )

    extension = _resolve_logo_extension(file.content_type, file.filename or "", data)
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image type. Use PNG, JPG, WEBP, GIF or SVG.",
        )

    service = SettingsService(db)
    settings_row = service.get()

    filename = f"logo_{uuid.uuid4().hex}{extension}"
    target = UPLOAD_DIR / filename
    target.write_bytes(data)

    # Remove the previous uploaded file to avoid orphans.
    old_logo = settings_row.logo
    if old_logo.startswith("/api/v1/uploads/logos/"):
        old_path = UPLOAD_DIR / Path(old_logo).name
        old_path.unlink(missing_ok=True)

    settings_row.logo = f"/api/v1/uploads/logos/{filename}"
    db.flush()
    return StoreSettingsRead.model_validate(settings_row)


LOGO_MEDIA_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
}


# Served without authentication: logo images are referenced from <img> tags,
# which cannot attach Authorization headers. Only files inside UPLOAD_DIR
# with a known image extension are reachable.
uploads_router = APIRouter(prefix="/uploads", tags=["settings"])


@uploads_router.get("/logos/{filename}", response_class=FileResponse)
def get_logo_file(filename: str):
    safe_name = Path(filename).name
    if safe_name != filename or "/" in filename or "\\" in filename:
        raise not_found("Logo not found")
    path = UPLOAD_DIR / safe_name
    if not path.is_file():
        raise not_found("Logo not found")
    media_type = LOGO_MEDIA_TYPES.get(path.suffix.lower())
    if media_type is None:
        raise not_found("Logo not found")
    return FileResponse(path, media_type=media_type)


@router.get("/logo", response_class=FileResponse)
def get_current_logo(db: DbSession):
    """Serve the currently configured logo (used as a fallback URL)."""
    logo = SettingsService(db).get().logo
    if not logo.startswith("/api/v1/uploads/logos/"):
        raise not_found("No logo uploaded")
    path = UPLOAD_DIR / Path(logo).name
    if not path.is_file():
        raise not_found("Logo file missing")
    media_type = LOGO_MEDIA_TYPES.get(path.suffix.lower(), "application/octet-stream")
    return FileResponse(path, media_type=media_type)


@uploads_router.get("/logo", response_class=FileResponse)
def get_current_logo_public(db: DbSession):
    """Serve the currently configured store logo without authentication.

    The login page is reachable before a user is authenticated, so it cannot
    read the protected /settings endpoint to discover the logo filename.
    This public route resolves the current logo (persisted in store settings)
    so it stays visible on refresh, logout/login and redeployment."""
    logo = SettingsService(db).get().logo
    if not logo.startswith("/api/v1/uploads/logos/"):
        raise not_found("No logo uploaded")
    path = UPLOAD_DIR / Path(logo).name
    if not path.is_file():
        raise not_found("Logo file missing")
    media_type = LOGO_MEDIA_TYPES.get(path.suffix.lower(), "application/octet-stream")
    return FileResponse(path, media_type=media_type)


@router.get("/users", response_model=list[UserRead])
def list_users(db: DbSession):
    service = UserService(db)
    return [UserRead.model_validate(u) for u in service.list_all()]


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(data: UserCreate, db: DbSession):
    service = UserService(db)
    try:
        user = service.create(data)
    except ValueError as exc:
        raise bad_request(exc) from exc
    db.flush()
    return UserRead.model_validate(user)


@router.put("/users/{user_id}", response_model=UserRead)
def update_user(user_id: int, data: UserUpdate, db: DbSession):
    service = UserService(db)
    user = service.get(user_id)
    if user is None:
        raise not_found("User not found")
    try:
        service.update(user, data)
    except ValueError as exc:
        raise bad_request(exc) from exc
    db.flush()
    return UserRead.model_validate(user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: DbSession):
    service = UserService(db)
    user = service.get(user_id)
    if user is None:
        raise not_found("User not found")
    service.delete(user)
    db.flush()
