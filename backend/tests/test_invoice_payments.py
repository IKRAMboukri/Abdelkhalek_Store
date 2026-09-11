import datetime as dt

from app.models import Sale, SaleItem


def _auth_headers(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@furniture.com", "password": "admin1234"},
    )
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _make_sale(db_session, product, invoice_number: str, total: float, advance: float) -> Sale:
    now = dt.datetime.now(dt.UTC).replace(tzinfo=None)
    sale = Sale(
        invoice_number=invoice_number,
        customer_id=None,
        subtotal=total,
        discount=0,
        total=total,
        advance_amount=advance,
        payment_method="cash",
        status="completed",
        notes="",
        created_at=now,
    )
    sale.items.append(
        SaleItem(
            product_id=product.id,
            product_name=product.name,
            quantity=1,
            unit_price=total,
            total=total,
            availability="sur_commande",
        )
    )
    db_session.add(sale)
    db_session.flush()
    db_session.commit()
    return sale


def test_invoice_reflects_advance_and_partial_payments(client, db_session, make_product):
    product = make_product(db_session, "Armchair", category_id=None)
    sale = _make_sale(db_session, product, "INV-1001", 4500, 500)
    headers = _auth_headers(client)

    invoice = client.get(f"/api/v1/invoices/{sale.id}", headers=headers).json()
    assert invoice["total"] == 4500
    assert invoice["amountPaid"] == 500
    assert invoice["remainingBalance"] == 4000

    payment = client.post(
        "/api/v1/payments",
        json={"saleId": sale.id, "amount": 1000, "method": "cash", "status": "completed"},
        headers=headers,
    )
    assert payment.status_code == 201

    invoice = client.get(f"/api/v1/invoices/{sale.id}", headers=headers).json()
    assert invoice["amountPaid"] == 1500
    assert invoice["remainingBalance"] == 3000

    history = client.get(f"/api/v1/payments/by-sale/{sale.id}", headers=headers).json()
    assert len(history) == 1
    assert history[0]["amount"] == 1000
    assert history[0]["method"] == "cash"


def test_payment_exceeding_remaining_balance_is_rejected(client, db_session, make_product):
    product = make_product(db_session, "Sofa", category_id=None)
    sale = _make_sale(db_session, product, "INV-1002", 4500, 500)
    headers = _auth_headers(client)

    response = client.post(
        "/api/v1/payments",
        json={"saleId": sale.id, "amount": 4500, "method": "bank_transfer", "status": "completed"},
        headers=headers,
    )
    assert response.status_code == 400
    assert "remaining balance" in response.json()["detail"]


def test_payment_to_full_marks_sale_completed(client, db_session, make_product):
    product = make_product(db_session, "Cabinet", category_id=None)
    sale = _make_sale(db_session, product, "INV-1003", 2000, 500)
    headers = _auth_headers(client)

    response = client.post(
        "/api/v1/payments",
        json={"saleId": sale.id, "amount": 1500, "method": "cash", "status": "completed"},
        headers=headers,
    )
    assert response.status_code == 201

    invoice = client.get(f"/api/v1/invoices/{sale.id}", headers=headers).json()
    assert invoice["amountPaid"] == 2000
    assert invoice["remainingBalance"] == 0
    assert invoice["status"] == "completed"

    history = client.get(f"/api/v1/payments/by-sale/{sale.id}", headers=headers).json()
    assert len(history) == 1