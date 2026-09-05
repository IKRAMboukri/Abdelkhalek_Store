from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


def _normalize_database_url(url: str) -> str:
    """Return a SQLAlchemy-ready database URL.

    Production deployments (Render) provide a PostgreSQL ``DATABASE_URL`` such
    as ``postgresql://user:pass@host/db?sslmode=require``. SQLAlchemy's default
    dialect for ``postgresql://`` uses the ``psycopg2`` driver, which is not
    installed; pin it to the pure-Python ``psycopg`` v3 driver we ship instead,
    and accept the legacy ``postgres://`` scheme.
    """
    if (
        (url.startswith("postgres://") or url.startswith("postgresql://"))
        and "://" in url
        and not url.startswith("postgresql+psycopg://")
    ):
        base = url.split("://", 1)[1]
        return f"postgresql+psycopg://{base}"
    return url


engine = create_engine(
    _normalize_database_url(settings.DATABASE_URL),
    pool_pre_ping=True,
    echo=settings.DATABASE_ECHO,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
