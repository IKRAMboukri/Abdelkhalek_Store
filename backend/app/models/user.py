import datetime as dt

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="sales")
    avatar: Mapped[str] = mapped_column(Text, nullable=False, default="")
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, nullable=False)


class StoreSettings(Base):
    __tablename__ = "store_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    store_name: Mapped[str] = mapped_column(String(200), nullable=False, default="Abdelkhalek_Store")
    store_email: Mapped[str] = mapped_column(
        String(200), nullable=False, default="abdelkhalekboukri668@gmail.com"
    )
    store_phone: Mapped[str] = mapped_column(String(50), nullable=False, default="0723312525")
    store_address: Mapped[str] = mapped_column(Text, nullable=False, default="Casablanca, Sidi Maarouf, Hay Sacem")
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="MAD")
    currency_symbol: Mapped[str] = mapped_column(String(10), nullable=False, default="DH")
    logo: Mapped[str] = mapped_column(Text, nullable=False, default="")
    fiscal_year: Mapped[str] = mapped_column(String(10), nullable=False, default="")
    timezone: Mapped[str] = mapped_column(String(50), nullable=False, default="Africa/Casablanca")
    date_format: Mapped[str] = mapped_column(String(20), nullable=False, default="DD/MM/YYYY")
