from sqlalchemy.orm import Session

from app.core.time import utcnow
from app.models import Notification
from app.repositories.misc import NotificationRepository
from app.schemas.notification import NotificationCreate


class NotificationService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = NotificationRepository(db)

    def list_all(self):
        return self.repo.list_all()

    def get(self, notification_id: int) -> Notification | None:
        return self.repo.get(notification_id)

    def unread_count(self) -> int:
        return self.repo.get_unread_count()

    def create(self, data: NotificationCreate) -> Notification:
        notification = Notification(
            type=data.type,
            title=data.title,
            message=data.message,
            read=data.read,
            link=data.link,
            created_at=utcnow(),
        )
        self.db.add(notification)
        return notification

    def mark_read(self, notification: Notification) -> Notification:
        notification.read = True
        return notification

    def mark_all_read(self) -> None:
        self.repo.mark_all_read()

    def delete(self, notification: Notification) -> None:
        self.repo.delete(notification)
