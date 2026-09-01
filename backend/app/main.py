import logging
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

import app.models  # noqa: F401  (register all models on Base.metadata)
from app.api.router import api_router
from app.core.config import settings
from app.database.seed import seed_if_empty
from app.database.session import Base, engine

logger = logging.getLogger(__name__)

# Legacy migrations for databases created before the inventory removal.
LEGACY_MIGRATIONS = [
    "DROP TABLE IF EXISTS inventory_movements",
    'ALTER TABLE products ADD COLUMN availability VARCHAR(20) NOT NULL DEFAULT \'sur_commande\'',
    "ALTER TABLE products DROP COLUMN stock",
    "ALTER TABLE products DROP COLUMN min_stock",
]

# Column list / select list shared by the SQLite products rebuild below.
_PRODUCT_COLUMNS = [
    "id",
    "name",
    "description",
    "category_id",
    "subcategory_id",
    "options_json",
    "purchase_price",
    "selling_price",
    "availability",
    "unit",
    "image",
    "status",
    "barcode",
    "created_at",
    "updated_at",
]


def _make_category_id_nullable() -> None:
    """Make products.category_id nullable so deleting a category can leave its
    products uncategorized instead of forcing them to be re-assigned to a
    freshly recreated fallback 'Uncategorized' category.

    MySQL supports ALTER COLUMN directly. SQLite cannot drop a NOT NULL
    constraint in place, so it rebuilds the products table instead. The whole
    migration is idempotent and only runs when category_id is still NOT NULL.
    """
    dialect = engine.dialect.name
    if dialect != "sqlite":
        try:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE products MODIFY category_id INT NULL"))
        except Exception:
            pass
        return

    with engine.connect() as conn:
        info = conn.execute(text("PRAGMA table_info(products)")).fetchall()
    # info rows: (cid, name, type, notnull [0 or 1], dflt_value, pk)
    existing = {row[1]: row for row in info}
    if "category_id" not in existing:
        return
    if existing["category_id"][3] == 0:
        return  # already nullable

    cols = ", ".join(_PRODUCT_COLUMNS)
    select_cols = ", ".join(_PRODUCT_COLUMNS)
    rebuild = f"""
        CREATE TABLE products_new (
            id INTEGER NOT NULL,
            name VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            category_id INTEGER,
            subcategory_id INTEGER,
            options_json JSON NOT NULL,
            purchase_price NUMERIC(12, 2) NOT NULL,
            selling_price NUMERIC(12, 2) NOT NULL,
            availability VARCHAR(20) NOT NULL,
            unit VARCHAR(20) NOT NULL,
            image TEXT NOT NULL,
            status VARCHAR(20) NOT NULL,
            barcode VARCHAR(100) NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY(category_id) REFERENCES categories (id) ON DELETE SET NULL,
            FOREIGN KEY(subcategory_id) REFERENCES subcategories (id) ON DELETE SET NULL
        );
        INSERT INTO products_new ({cols}) SELECT {select_cols} FROM products;
        DROP TABLE products;
        ALTER TABLE products_new RENAME TO products;
    """
    # SQLite forbids toggling foreign_keys inside a transaction, so drive the
    # rebuild through the raw DBAPI connection to control the pragma reliably.
    raw = engine.raw_connection()
    try:
        original_fk = raw.execute("PRAGMA foreign_keys").fetchone()[0]
        raw.execute("PRAGMA foreign_keys = OFF")
        for statement in rebuild.strip().split(";"):
            if statement.strip():
                raw.execute(statement)
        raw.commit()
        raw.execute(f"PRAGMA foreign_keys = {original_fk}")
    finally:
        raw.close()


def run_legacy_migrations() -> None:
    """Apply legacy schema migrations.

    Local developer databases are SQLite; production (Render) databases are a
    real MySQL instance configured via the ``DATABASE_URL`` environment
    variable in ``backend/app/core/config.py``. If the configured database
    cannot be reached the migration is skipped with a logged warning instead of
    preventing the API from starting; schema creation (``create_all``) and the
    seed run right after and remain the source of truth.
    """
    try:
        _make_category_id_nullable()
        with engine.begin() as conn:
            for statement in LEGACY_MIGRATIONS:
                with suppress(Exception):
                    conn.execute(text(statement))
            # Store settings created by the original demo seed: replace only
            # rows that still hold those exact untouched demo values. Safe on a
            # fresh database where the table does not exist yet (create_all
            # runs below).
            with suppress(Exception):
                conn.execute(
                    text(
                        """
                        UPDATE store_settings
                        SET store_name = 'Abdelkhalek_Store',
                            store_email = 'abdelkhalekboukri668@gmail.com',
                            store_phone = '0723312525',
                            store_address = 'Casablanca, Sidi Maarouf, Hay Sacem',
                            currency = 'MAD',
                            currency_symbol = 'DH'
                        WHERE logo = ''
                          AND store_name = 'Furniture Store'
                          AND store_email = 'contact@furniturestore.ma'
                        """
                    )
                )
    except SQLAlchemyError as exc:
        logger.warning("Legacy migrations skipped (database unavailable): %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_legacy_migrations()
    Base.metadata.create_all(bind=engine)
    seed_if_empty()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {"app": settings.APP_NAME, "version": settings.APP_VERSION}
