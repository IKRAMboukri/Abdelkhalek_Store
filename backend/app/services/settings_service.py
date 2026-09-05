import re

from sqlalchemy.orm import Session

from app.models import StoreSettings
from app.repositories.misc import StoreSettingsRepository
from app.schemas.settings import StoreSettingsUpdate

_CAMEL_TO_SNAKE = re.compile(r"(?<!^)(?=[A-Z])")


class SettingsService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = StoreSettingsRepository(db)

    def get(self) -> StoreSettings:
        return self.repo.get_single()

    def update(self, data: StoreSettingsUpdate) -> StoreSettings:
        settings = self.repo.get_single()
        # Update schemas expose camelCase fields while ORM columns are
        # snake_case: translate before touching the model.
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(settings, _CAMEL_TO_SNAKE.sub("_", key).lower(), value)
        return settings
