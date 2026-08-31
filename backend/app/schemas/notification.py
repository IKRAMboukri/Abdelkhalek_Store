import datetime as dt

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app.schemas.common import ApiModel


class NotificationCreate(BaseModel):
    type: str = "system"
    title: str
    message: str
    read: bool = False
    link: str = ""


class NotificationRead(ApiModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

    id: int
    type: str
    title: str
    message: str
    read: bool
    link: str
    created_at: dt.datetime


class UnreadCount(BaseModel):
    count: int
