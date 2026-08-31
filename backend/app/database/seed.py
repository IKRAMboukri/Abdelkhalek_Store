"""Ensure the minimal system configuration exists on startup.

Only the admin account and the store settings are ensured here. No demo,
sample or mock business data (products, categories, customers, sales,
payments, credits, notifications) is ever created.
"""

import datetime as dt

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.database.session import SessionLocal
from app.models import StoreSettings, User


def seed_if_empty() -> None:
    """Guarantee the admin account and store settings exist. Never seeds demo
    business data so the application always starts with empty, real-world lists."""
    with SessionLocal() as db:
        _ensure_admin(db)
        _ensure_settings(db)


def _ensure_admin(db: Session) -> None:
    email = "admin@furniture.com"
    existing = db.scalar(select(User).where(User.email == email))
    if existing is None:
        db.add(
            User(
                name="Administrator",
                email=email,
                password_hash=hash_password(settings.SEED_DEFAULT_PASSWORD),
                role="admin",
                avatar="",
                active=True,
                created_at=dt.datetime.utcnow(),
            )
        )
        db.commit()


def _ensure_settings(db: Session) -> None:
    existing = db.scalar(select(StoreSettings).limit(1))
    if existing is None:
        db.add(
            StoreSettings(
                store_name="Abdelkhalek_Store",
                store_email="abdelkhalekboukri668@gmail.com",
                store_phone="0723312525",
                store_address="Casablanca, Sidi Maarouf, Hay Sacem",
                currency="MAD",
                currency_symbol="DH",
                logo="",
                fiscal_year=str(dt.date.today().year),
                timezone="Africa/Casablanca",
                date_format="DD/MM/YYYY",
            )
        )
        db.commit()
