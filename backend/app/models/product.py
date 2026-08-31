import datetime as dt

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    category_id: Mapped[int | None] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    subcategory_id: Mapped[int | None] = mapped_column(
        ForeignKey("subcategories.id", ondelete="SET NULL"), nullable=True
    )
    options_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    purchase_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    selling_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    availability: Mapped[str] = mapped_column(String(20), nullable=False, default="sur_commande")
    unit: Mapped[str] = mapped_column(String(20), nullable=False, default="piece")
    image: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    barcode: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, nullable=False)

    category: Mapped["Category | None"] = relationship(back_populates="products")  # noqa: F821
    subcategory: Mapped["SubCategory | None"] = relationship()  # noqa: F821

    @property
    def category_name(self) -> str:
        return self.category.name if self.category else ""

    @property
    def subcategory_name(self) -> str:
        return self.subcategory.name if self.subcategory else ""

    @property
    def options(self) -> dict:
        return self.options_json if self.options_json else {}
