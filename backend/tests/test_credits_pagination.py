import datetime as dt

from app.models import Credit, Customer


def _auth_headers(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@furniture.com", "password": "admin1234"},
    )
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _customer(name: str) -> Customer:
    now = dt.datetime.now(dt.UTC).replace(tzinfo=None)
    return Customer(
        name=name,
        email="",
        phone="",
        address="",
        company="",
        notes="",
        total_purchases=0,
        credit_balance=0,
        status="active",
        created_at=now,
        updated_at=now,
    )


def test_credit_pages_are_scoped_to_customer(client, db_session):
    selected = _customer("Selected customer")
    other = _customer("Other customer")
    db_session.add_all([selected, other])
    db_session.flush()

    now = dt.datetime.now(dt.UTC).replace(tzinfo=None)
    for index in range(15):
        db_session.add(
            Credit(
                customer_id=selected.id,
                initial_amount=100,
                paid_amount=0,
                remaining_balance=100,
                due_date=now + dt.timedelta(days=30),
                status="active",
                notes="",
                invoice_number=f"SELECTED-{index}",
                created_at=now + dt.timedelta(minutes=index),
                updated_at=now,
            )
        )
    db_session.add(
        Credit(
            customer_id=other.id,
            initial_amount=200,
            paid_amount=0,
            remaining_balance=200,
            due_date=now + dt.timedelta(days=30),
            status="active",
            notes="",
            invoice_number="OTHER-0",
            created_at=now,
            updated_at=now,
        )
    )
    db_session.commit()

    response = client.get(
        "/api/v1/credits",
        params={"customerId": selected.id, "page": 2, "limit": 10, "sortBy": "createdAt"},
        headers=_auth_headers(client),
    )

    assert response.status_code == 200
    page = response.json()
    assert page["total"] == 15
    assert page["totalPages"] == 2
    assert len(page["data"]) == 5
    assert {credit["customerId"] for credit in page["data"]} == {selected.id}
