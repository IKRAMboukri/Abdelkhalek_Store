from typing import Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: Literal["admin", "manager", "sales", "viewer"] = "sales"
    avatar: str = ""
    active: bool = True


class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    password: str | None = None
    role: Literal["admin", "manager", "sales", "viewer"] | None = None
    avatar: str | None = None
    active: bool | None = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, alias_generator=to_camel)

    id: int
    name: str
    email: str
    role: str
    avatar: str
    active: bool
