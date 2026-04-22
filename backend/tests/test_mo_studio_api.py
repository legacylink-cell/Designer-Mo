"""Backend API tests for Mo's studio landing site."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fallback to frontend env file
    from pathlib import Path
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
                break

assert BASE_URL, "REACT_APP_BACKEND_URL must be set"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ----- Root -----
class TestRoot:
    def test_root_message(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("message") == "Hello from Mo's studio"


# ----- Contact create -----
class TestContactCreate:
    def test_create_valid_submission(self, session):
        payload = {
            "name": "TEST_Alex Pytest",
            "email": "TEST_alex_pytest@example.com",
            "project_type": "Full service",
            "budget": "$3,000 – $6,000",
            "message": "I'd like a new editorial site for my brand.",
            "company": "TEST_Atelier Pytest",
        }
        r = session.post(f"{API}/contact", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        # Field assertions
        for k in ("name", "email", "project_type", "budget", "message", "company"):
            assert data[k] == payload[k]
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert "created_at" in data and isinstance(data["created_at"], str)
        assert "_id" not in data

    def test_create_without_optional_company(self, session):
        payload = {
            "name": "TEST_NoCompany",
            "email": "TEST_nocompany@example.com",
            "project_type": "Design",
            "budget": "< $1,500",
            "message": "Quick landing page request.",
        }
        r = session.post(f"{API}/contact", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["company"] is None

    def test_invalid_email_returns_422(self, session):
        payload = {
            "name": "TEST_BadEmail",
            "email": "not-an-email",
            "project_type": "Design",
            "budget": "$1,500 – $3,000",
            "message": "Hello",
        }
        r = session.post(f"{API}/contact", json=payload)
        assert 400 <= r.status_code < 500, r.text

    def test_missing_required_returns_422(self, session):
        payload = {"name": "TEST_Missing", "email": "TEST_missing@example.com"}
        r = session.post(f"{API}/contact", json=payload)
        assert 400 <= r.status_code < 500

    def test_empty_message_rejected(self, session):
        payload = {
            "name": "TEST_EmptyMsg",
            "email": "TEST_emptymsg@example.com",
            "project_type": "Design",
            "budget": "$1,500 – $3,000",
            "message": "",
        }
        r = session.post(f"{API}/contact", json=payload)
        assert 400 <= r.status_code < 500


# ----- Contact list -----
class TestContactList:
    def test_list_returns_array_no_objectid(self, session):
        # Seed one
        seed = {
            "name": "TEST_Listcheck",
            "email": "TEST_listcheck@example.com",
            "project_type": "SEO",
            "budget": "$3,000 – $6,000",
            "message": "Listing test.",
        }
        cr = session.post(f"{API}/contact", json=seed)
        assert cr.status_code == 200
        created_id = cr.json()["id"]

        r = session.get(f"{API}/contact")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 1
        # No mongo _id leaked
        for item in items:
            assert "_id" not in item
            assert "id" in item
            assert "created_at" in item

        # Verify our seeded item is present
        ids = [i["id"] for i in items]
        assert created_id in ids

    def test_list_sorted_desc_by_created_at(self, session):
        # Create two consecutive
        for n in ("TEST_sort_a", "TEST_sort_b"):
            session.post(
                f"{API}/contact",
                json={
                    "name": n,
                    "email": f"{n}@example.com",
                    "project_type": "Design",
                    "budget": "< $1,500",
                    "message": "sort test",
                },
            )
        r = session.get(f"{API}/contact")
        assert r.status_code == 200
        items = r.json()
        timestamps = [i["created_at"] for i in items]
        assert timestamps == sorted(timestamps, reverse=True)
