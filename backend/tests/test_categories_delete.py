from sqlalchemy import func, select

from app.models import Category, Product


def _auth_headers(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@furniture.com", "password": "admin1234"},
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _count(db, *criteria):
    stmt = select(func.count()).select_from(Category)
    for criterion in criteria:
        stmt = stmt.where(criterion)
    return db.scalar(stmt)


def test_delete_empty_category(client, db_session, make_category):
    cat = make_category(db_session, "Vide")
    db_session.commit()
    cat_id = cat.id
    count_before = _count(db_session)

    resp = client.delete(f"/api/v1/categories/{cat_id}", headers=_auth_headers(client))

    assert resp.status_code == 204
    assert _count(db_session) == count_before - 1
    assert _count(db_session, Category.id == cat_id) == 0


def test_delete_category_with_products_disassociates_products(
    client, db_session, make_category, make_product
):
    cat = make_category(db_session, "Canapé")
    for i in range(3):
        make_product(db_session, f"Produit {i}", cat.id)
    db_session.commit()
    cat_id = cat.id
    total_products_before = db_session.scalar(select(func.count()).select_from(Product))

    resp = client.delete(f"/api/v1/categories/{cat_id}", headers=_auth_headers(client))

    assert resp.status_code == 204
    # Category gone
    assert _count(db_session, Category.id == cat_id) == 0
    # No product deleted
    total_products_after = db_session.scalar(select(func.count()).select_from(Product))
    assert total_products_after == total_products_before == 3
    # Every product still exists but now has no category
    products = db_session.scalars(select(Product)).all()
    assert len(products) == 3
    for p in products:
        assert p.category_id is None


def test_delete_uncategorized_last_category_disassociates_products(
    client, db_session, make_category, make_product
):
    uncat = make_category(db_session, "Uncategorized")
    for i in range(20):
        make_product(db_session, f"Orphelin {i}", uncat.id)
    db_session.commit()
    uncat_id = uncat.id
    total_before = db_session.scalar(select(func.count()).select_from(Product))

    resp = client.delete(f"/api/v1/categories/{uncat_id}", headers=_auth_headers(client))

    assert resp.status_code == 204
    # Category gone - no fallback 'Uncategorized' is recreated
    assert _count(db_session, Category.id == uncat_id) == 0
    assert _count(db_session, Category.name == "Uncategorized") == 0
    # All 20 products still exist but now have no category
    total_after = db_session.scalar(select(func.count()).select_from(Product))
    assert total_after == total_before == 20
    products = db_session.scalars(select(Product)).all()
    assert len(products) == 20
    for p in products:
        assert p.category_id is None


def test_delete_nonexistent_category_returns_404(client):
    resp = client.delete("/api/v1/categories/999999", headers=_auth_headers(client))
    assert resp.status_code == 404
