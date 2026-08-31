from sqlalchemy import select

from app.models import Notification, StoreSettings, User
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository):
    model = Notification

    def list_all(self):
        stmt = select(Notification).order_by(Notification.created_at.desc())
        return list(self.db.scalars(stmt).all())

    def get_unread_count(self) -> int:
        from sqlalchemy import func

        count_stmt = (
            select(func.count())
            .select_from(Notification)
            .where(Notification.read.is_(False))
        )
        return self.db.scalar(count_stmt) or 0

    def mark_all_read(self) -> None:
        for notification in self.list_all():
            notification.read = True


class UserRepository(BaseRepository):
    model = User

    def get_by_email(self, email: str):
        stmt = select(User).where(User.email == email).limit(1)
        return self.db.scalar(stmt)


class StoreSettingsRepository(BaseRepository):
    model = StoreSettings

    def get_single(self) -> StoreSettings:
        stmt = select(StoreSettings).limit(1)
        obj = self.db.scalar(stmt)
        if obj is None:
            obj = StoreSettings()
            self.db.add(obj)
            self.db.flush()
        return obj
