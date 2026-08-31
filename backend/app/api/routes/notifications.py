from fastapi import APIRouter, status

from app.api.deps import DbSession, not_found
from app.schemas.notification import NotificationCreate, NotificationRead, UnreadCount
from app.services import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationRead])
def list_notifications(db: DbSession):
    service = NotificationService(db)
    return [NotificationRead.model_validate(n) for n in service.list_all()]


@router.get("/unread-count", response_model=UnreadCount)
def unread_count(db: DbSession):
    service = NotificationService(db)
    return UnreadCount(count=service.unread_count())


@router.get("/{notification_id}", response_model=NotificationRead)
def get_notification(notification_id: int, db: DbSession):
    service = NotificationService(db)
    notification = service.get(notification_id)
    if notification is None:
        raise not_found("Notification not found")
    return NotificationRead.model_validate(notification)


@router.post("", response_model=NotificationRead, status_code=status.HTTP_201_CREATED)
def create_notification(data: NotificationCreate, db: DbSession):
    service = NotificationService(db)
    notification = service.create(data)
    db.flush()
    return NotificationRead.model_validate(notification)


@router.put("/{notification_id}/read", response_model=NotificationRead)
def mark_read(notification_id: int, db: DbSession):
    service = NotificationService(db)
    notification = service.get(notification_id)
    if notification is None:
        raise not_found("Notification not found")
    service.mark_read(notification)
    db.flush()
    return NotificationRead.model_validate(notification)


@router.put("/read-all", response_model=UnreadCount)
def mark_all_read(db: DbSession):
    service = NotificationService(db)
    service.mark_all_read()
    db.flush()
    return UnreadCount(count=0)


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: int, db: DbSession):
    service = NotificationService(db)
    notification = service.get(notification_id)
    if notification is None:
        raise not_found("Notification not found")
    service.delete(notification)
    db.flush()
