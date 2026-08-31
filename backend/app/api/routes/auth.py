from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession, bad_request
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserRead
from app.services import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: DbSession):
    try:
        return AuthService(db).login(data)
    except ValueError as exc:
        raise bad_request(exc) from exc


@router.get("/me", response_model=UserRead)
def me(current_user: CurrentUser):
    return UserRead.model_validate(current_user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(current_user: CurrentUser):
    # JWTs are stateless: the server acknowledges the call and the client
    # discards the token. Kept behind CurrentUser so the request is validated.
    return None
