import pytest


def _login(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@furniture.com", "password": "admin1234"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["access_token"]
    return {"Authorization": f"Bearer {payload['access_token']}"}


def test_login_and_current_user(client):
    headers = _login(client)
    response = client.get("/api/v1/auth/me", headers=headers)

    assert response.status_code == 200
    assert response.json()["email"] == "admin@furniture.com"


@pytest.mark.parametrize(
    "path",
    [
        "/api/v1/dashboard/stats",
        "/api/v1/dashboard/monthly-sales?year=2026",
        "/api/v1/dashboard/recent-sales?limit=5",
        "/api/v1/products?page=1&limit=10",
        "/api/v1/customers?page=1&limit=10",
        "/api/v1/categories?page=1&limit=10",
        "/api/v1/sales?page=1&limit=10",
        "/api/v1/invoices?page=1&limit=10",
        "/api/v1/credits?page=1&limit=10",
        "/api/v1/settings",
    ],
)
def test_main_page_api_dependencies(client, path):
    response = client.get(path, headers=_login(client))
    assert response.status_code == 200, response.text


@pytest.mark.parametrize(
    "path",
    [
        "/api/v1/products",
        "/api/v1/customers",
        "/api/v1/categories",
        "/api/v1/sales",
        "/api/v1/invoices",
        "/api/v1/credits",
    ],
)
def test_paginated_page_contract(client, path):
    response = client.get(
        path,
        params={"page": 1, "limit": 1, "sortOrder": "desc"},
        headers=_login(client),
    )

    assert response.status_code == 200
    payload = response.json()
    assert set(("data", "total", "page", "limit", "totalPages")) <= payload.keys()
    assert payload["page"] == 1
    assert payload["limit"] == 1
    assert len(payload["data"]) <= 1
