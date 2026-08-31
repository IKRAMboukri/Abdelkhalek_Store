from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.core.time import utcnow
from app.models import User
from app.repositories.misc import UserRepository
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = UserRepository(db)

    def list_all(self):
        return self.repo.list_all()

    def get(self, user_id: int) -> User | None:
        return self.repo.get(user_id)

    def create(self, data: UserCreate) -> User:
        if self.repo.get_by_email(data.email.strip().lower()):
            raise ValueError("A user with this email already exists")
        user = User(
            name=data.name,
            email=data.email.strip().lower(),
            password_hash=hash_password(data.password),
            role=data.role,
            avatar=data.avatar,
            active=data.active,
            created_at=utcnow(),
        )
        self.db.add(user)
        return user

    def update(self, user: User, data: UserUpdate) -> User:
        payload = data.model_dump(exclude_unset=True)
        if "email" in payload:
            email = payload["email"].strip().lower()
            existing = self.repo.get_by_email(email)
            if existing and existing.id != user.id:
                raise ValueError("A user with this email already exists")
            payload["email"] = email
        if "password" in payload:
            payload["password_hash"] = hash_password(payload.pop("password"))
        for key, value in payload.items():
            setattr(user, key, value)
        return user

    def delete(self, user: User) -> None:
        self.repo.delete(user)
