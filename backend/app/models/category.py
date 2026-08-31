import datetime as dt

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    image: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, nullable=False)

    subcategories: Mapped[list["SubCategory"]] = relationship(
        back_populates="category", cascade="all, delete-orphan", order_by="SubCategory.id"
    )  # noqa: F821
    products: Mapped[list["Product"]] = relationship(back_populates="category")  # noqa: F821


class SubCategory(Base):
    __tablename__ = "subcategories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    category: Mapped[Category] = relationship(back_populates="subcategories")
    options: Mapped[list["CategoryOption"]] = relationship(
        back_populates="subcategory", cascade="all, delete-orphan", order_by="CategoryOption.id"
    )


class CategoryOption(Base):
    __tablename__ = "category_options"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    subcategory_id: Mapped[int] = mapped_column(
        ForeignKey("subcategories.id", ondelete="CASCADE"), nullable=False
    )
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    values_json: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

    subcategory: Mapped[SubCategory] = relationship(back_populates="options")

    @property
    def values(self) -> list:
        return self.values_json if self.values_json else []
