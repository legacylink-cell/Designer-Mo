"""Backend API tests for Mo's studio landing site (public + admin auth)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    from pathlib import Path
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().strip('"')
                break

assert BASE_URL, "REACT_APP_BACKEND_URL must be set"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_TOKEN = "y2T6AaC52m3VacfPtff2j7C_BfAbF_YK"
WRONG_TOKEN = "this-is-wrong"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "X-Admin-Token": ADMIN_TOKEN,
    })
    return s


# ----- Root -----
class TestRoot:
    def test_root_message(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("message") == "Hello from Mo's studio"


# ----- Public POST /api/contact (no auth) -----
class TestContactCreatePublic:
    def test_create_valid_submission_no_auth(self, session):
        payload = {
            "name": "TEST_Alex Pytest",
            "email": "TEST_alex_pytest@example.com",
            "project_type": "Full service",
            "budget": "$3,000 - $6,000",
            "message": "I'd like a new editorial site for my brand.",
            "company": "TEST_Atelier Pytest",
        }
        r = session.post(f"{API}/contact", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        for k in ("name", "email", "project_type", "budget", "message", "company"):
            assert data[k] == payload[k]
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert "_id" not in data

    def test_create_booking_prequalify_payload(self, session):
        """Landing page booking form path — message prefixed with [Booking pre-qualify]"""
        payload = {
            "name": "TEST_Booking User",
            "email": "TEST_booking@example.com",
            "project_type": "Booking",
            "budget": "$3,000 - $6,000",
            "message": "[Booking pre-qualify] I want a discovery call next week.",
        }
        r = session.post(f"{API}/contact", json=payload)
        assert r.status_code == 200, r.text
        assert r.json()["message"].startswith("[Booking pre-qualify]")

    def test_invalid_email_returns_422(self, session):
        payload = {
            "name": "TEST_BadEmail",
            "email": "not-an-email",
            "project_type": "Design",
            "budget": "$1,500 - $3,000",
            "message": "Hello",
        }
        r = session.post(f"{API}/contact", json=payload)
        assert 400 <= r.status_code < 500

    def test_missing_required_returns_422(self, session):
        payload = {"name": "TEST_Missing", "email": "TEST_missing@example.com"}
        r = session.post(f"{API}/contact", json=payload)
        assert 400 <= r.status_code < 500


# ----- Admin auth on GET /api/contact -----
class TestContactListAuth:
    def test_list_without_token_returns_401(self, session):
        r = session.get(f"{API}/contact")
        assert r.status_code == 401, r.text

    def test_list_with_wrong_token_returns_401(self, session):
        r = session.get(f"{API}/contact", headers={"X-Admin-Token": WRONG_TOKEN})
        assert r.status_code == 401, r.text

    def test_list_with_valid_token_returns_200(self, admin_session):
        r = admin_session.get(f"{API}/contact")
        assert r.status_code == 200, r.text
        items = r.json()
        assert isinstance(items, list)
        for item in items:
            assert "_id" not in item
            assert "id" in item
            assert "created_at" in item

    def test_list_sorted_desc_by_created_at(self, admin_session):
        r = admin_session.get(f"{API}/contact")
        assert r.status_code == 200
        timestamps = [i["created_at"] for i in r.json()]
        assert timestamps == sorted(timestamps, reverse=True)


# ----- Admin verify endpoint -----
class TestAdminVerify:
    def test_verify_without_token_returns_401(self, session):
        r = session.post(f"{API}/admin/verify", json={})
        assert r.status_code == 401

    def test_verify_wrong_token_returns_401(self, session):
        r = session.post(
            f"{API}/admin/verify", json={}, headers={"X-Admin-Token": WRONG_TOKEN}
        )
        assert r.status_code == 401

    def test_verify_correct_token_returns_200(self, admin_session):
        r = admin_session.post(f"{API}/admin/verify", json={})
        assert r.status_code == 200
        assert r.json().get("ok") is True


# ----- Admin DELETE -----
class TestContactDelete:
    def test_delete_without_token_401(self, session):
        r = session.delete(f"{API}/contact/non-existent-id")
        assert r.status_code == 401

    def test_delete_wrong_token_401(self, session):
        r = session.delete(
            f"{API}/contact/non-existent-id",
            headers={"X-Admin-Token": WRONG_TOKEN},
        )
        assert r.status_code == 401

    def test_delete_unknown_id_returns_404(self, admin_session):
        r = admin_session.delete(f"{API}/contact/does-not-exist-uuid-xyz")
        assert r.status_code == 404

    def test_create_then_delete_then_verify_removal(self, session, admin_session):
        # CREATE (public, no auth)
        create_payload = {
            "name": "TEST_DeleteMe",
            "email": "TEST_deleteme@example.com",
            "project_type": "Design",
            "budget": "< $1,500",
            "message": "to be deleted",
        }
        cr = session.post(f"{API}/contact", json=create_payload)
        assert cr.status_code == 200
        created_id = cr.json()["id"]

        # DELETE (admin auth)
        dr = admin_session.delete(f"{API}/contact/{created_id}")
        assert dr.status_code == 200
        body = dr.json()
        assert body.get("ok") is True
        assert body.get("deleted") == created_id

        # Verify it's gone from list
        lr = admin_session.get(f"{API}/contact")
        assert lr.status_code == 200
        ids = [i["id"] for i in lr.json()]
        assert created_id not in ids

        # Deleting again returns 404
        dr2 = admin_session.delete(f"{API}/contact/{created_id}")
        assert dr2.status_code == 404
