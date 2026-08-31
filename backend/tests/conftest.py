import datetime as dt

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401  (register all models on Base.metadata)
from app.api.deps import get_db
from app.core.security import hash_password
from app.database.session import Base
from app.main import app
from app.models import Category, Product, User


@pytest.fixture()
def db_engine():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    engine.dispose()


@pytest.fixture()
def db_session(db_engine):
    TestingSessionLocal = sessionmaker(
        bind=db_engine, autocommit=False, autoflush=False, expire_on_commit=False
    )
    session = TestingSessionLocal()
    yield session
    session.close()


@pytest.fixture()
def client(db_engine):
    TestingSessionLocal = sessionmaker(
        bind=db_engine, autocommit=False, autoflush=False, expire_on_commit=False
    )

    with TestingSessionLocal() as seed_db:
        seed_db.add(
            User(
                name="Administrator",
                email="admin@furniture.com",
                password_hash=hash_password("admin1234"),
                role="admin",
                avatar="",
                active=True,
                created_at=dt.datetime.utcnow(),
            )
        )
        seed_db.commit()

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def make_category():
    def _make(db, name: str, description: str = "", created_at=None) -> Category:
        category = Category(
            name=name,
            description=description,
            image="",
            created_at=created_at or dt.datetime.utcnow(),
        )
        db.add(category)
        db.flush()
        return category

    return _make


@pytest.fixture()
def make_product():
    def _make(db, name: str, category_id: int) -> Product:
        product = Product(
            name=name,
            description="",
            category_id=category_id,
            subcategory_id=None,
            options_json={},
            purchase_price=10.0,
            selling_price=20.0,
            availability="sur_place",
            unit="piece",
            image="",
            status="active",
            barcode="",
            created_at=dt.datetime.utcnow(),
            updated_at=dt.datetime.utcnow(),
        )
        db.add(product)
        db.flush()
        return product

    return _make
