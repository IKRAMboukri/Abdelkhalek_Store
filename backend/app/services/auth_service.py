from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.models import User
from app.repositories.misc import UserRepository
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserRead


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = UserRepository(db)

    def login(self, data: LoginRequest) -> TokenResponse:
        user = self.repo.get_by_email(data.email.strip().lower())
        if user is None or not verify_password(data.password, user.password_hash):
            raise ValueError("Invalid email or password")
        if not user.active:
            raise ValueError("Account is disabled")
        token = create_access_token(subject=str(user.id), role=user.role)
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserRead.model_validate(user),
        )

    def get_user(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)
