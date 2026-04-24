"""Backend tests for client review workflow."""
import os
import pytest
import requests
from pathlib import Path

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
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
WRONG_TOKEN = "nope"
TINY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgAAIAAAUAAeImBZsAAAAASUVORK5CYII="


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "X-Admin-Token": ADMIN_TOKEN})
    return s


@pytest.fixture(scope="module")
def created_tokens():
    """Track tokens/reviews created for cleanup."""
    return {"tokens": [], "reviews": []}


@pytest.fixture(scope="module", autouse=True)
def cleanup(admin, created_tokens):
    yield
    for rid in created_tokens["reviews"]:
        admin.delete(f"{API}/admin/reviews/{rid}")
    for tok in created_tokens["tokens"]:
        admin.delete(f"{API}/admin/review-tokens/{tok}")


def _create_token(admin, created_tokens, name="TEST_Client", email="test_client@example.com",
                  project="TEST_Project", send_email=False):
    r = admin.post(f"{API}/admin/review-tokens", json={
        "client_name": name, "client_email": email,
        "project": project, "send_email": send_email,
    })
    assert r.status_code == 200, r.text
    data = r.json()
    created_tokens["tokens"].append(data["token"])
    return data


# ----- POST /api/admin/review-tokens -----
class TestReviewTokenCreate:
    def test_requires_auth(self, session):
        r = session.post(f"{API}/admin/review-tokens",
                         json={"client_name": "X", "client_email": "x@x.com"})
        assert r.status_code == 401

    def test_wrong_token_401(self, session):
        r = session.post(f"{API}/admin/review-tokens",
                         json={"client_name": "X", "client_email": "x@x.com"},
                         headers={"X-Admin-Token": WRONG_TOKEN})
        assert r.status_code == 401

    def test_create_ok_no_email(self, admin, created_tokens):
        data = _create_token(admin, created_tokens, send_email=False)
        for k in ("token", "client_name", "client_email", "project", "created_at", "expires_at"):
            assert k in data
        assert data["client_name"] == "TEST_Client"
        assert data["project"] == "TEST_Project"
        # 60-day window
        from datetime import datetime
        ca = datetime.fromisoformat(data["created_at"])
        ex = datetime.fromisoformat(data["expires_at"])
        days = (ex - ca).days
        assert 59 <= days <= 60

    def test_create_ok_with_email_flag_does_not_fail(self, admin, created_tokens):
        # send_email=True fires background task but API must return 200 regardless
        r = admin.post(f"{API}/admin/review-tokens", json={
            "client_name": "TEST_EmailFlag",
            "client_email": "test_emailflag@example.com",
            "project": "TEST_P",
            "send_email": True,
        })
        assert r.status_code == 200
        created_tokens["tokens"].append(r.json()["token"])


# ----- GET /api/reviews/invite/{token} -----
class TestReviewInvitePublic:
    def test_unknown_token_404(self, session):
        r = session.get(f"{API}/reviews/invite/doesnotexist999")
        assert r.status_code == 404

    def test_fresh_token_200(self, session, admin, created_tokens):
        tok = _create_token(admin, created_tokens, name="TEST_Invite",
                            email="test_invite@example.com", project="TEST_proj")["token"]
        r = session.get(f"{API}/reviews/invite/{tok}")
        assert r.status_code == 200
        data = r.json()
        assert data["token"] == tok
        assert data["client_name"] == "TEST_Invite"
        assert data["project"] == "TEST_proj"

    def test_used_token_410(self, session, admin, created_tokens):
        tok = _create_token(admin, created_tokens, name="TEST_Used",
                            email="test_used@example.com")["token"]
        # Submit a review to mark it used
        sub = session.post(f"{API}/reviews", json={
            "token": tok, "name": "TEST_Used", "quote": "Great work on the site.",
            "rating": 5,
        })
        assert sub.status_code == 200
        created_tokens["reviews"].append(sub.json()["id"])
        # Now invite returns 410
        r = session.get(f"{API}/reviews/invite/{tok}")
        assert r.status_code == 410


# ----- POST /api/reviews -----
class TestReviewSubmit:
    def test_submit_ok_marks_token_used(self, session, admin, created_tokens):
        tok = _create_token(admin, created_tokens, name="TEST_Sub1",
                            email="test_sub1@example.com")["token"]
        r = session.post(f"{API}/reviews", json={
            "token": tok, "name": "TEST_Sub1", "role": "Founder",
            "company": "TEST_Co", "quote": "Really delivered on time.",
            "rating": 4, "photo_data_url": TINY_PNG,
        })
        assert r.status_code == 200
        rid = r.json()["id"]
        created_tokens["reviews"].append(rid)
        # Second submission same token = 410
        r2 = session.post(f"{API}/reviews", json={
            "token": tok, "name": "TEST_Sub1", "quote": "Second try here.",
            "rating": 5,
        })
        assert r2.status_code == 410

    def test_unknown_token_404(self, session):
        r = session.post(f"{API}/reviews", json={
            "token": "nosuchtoken", "name": "X", "quote": "hello world ten+",
            "rating": 4,
        })
        assert r.status_code == 404

    def test_invalid_photo_400(self, session, admin, created_tokens):
        tok = _create_token(admin, created_tokens, name="TEST_BadPhoto",
                            email="test_badphoto@example.com")["token"]
        r = session.post(f"{API}/reviews", json={
            "token": tok, "name": "X", "quote": "valid quote here yes",
            "rating": 3, "photo_data_url": "http://example.com/img.png",
        })
        assert r.status_code == 400

    def test_rating_zero_rejected(self, session, admin, created_tokens):
        tok = _create_token(admin, created_tokens, name="TEST_R0",
                            email="test_r0@example.com")["token"]
        r = session.post(f"{API}/reviews", json={
            "token": tok, "name": "X", "quote": "some quote here hi", "rating": 0,
        })
        assert 400 <= r.status_code < 500
        assert r.status_code != 200

    def test_rating_six_rejected(self, session, admin, created_tokens):
        tok = _create_token(admin, created_tokens, name="TEST_R6",
                            email="test_r6@example.com")["token"]
        r = session.post(f"{API}/reviews", json={
            "token": tok, "name": "X", "quote": "some quote here hi", "rating": 6,
        })
        assert 400 <= r.status_code < 500
        assert r.status_code != 200

    def test_short_quote_rejected(self, session, admin, created_tokens):
        tok = _create_token(admin, created_tokens, name="TEST_Short",
                            email="test_short@example.com")["token"]
        r = session.post(f"{API}/reviews", json={
            "token": tok, "name": "X", "quote": "hi", "rating": 3,
        })
        assert 400 <= r.status_code < 500


# ----- GET /api/reviews (public) + approval flow -----
class TestReviewApprovalFlow:
    def test_public_list_only_shows_approved(self, session, admin, created_tokens):
        # Create token + submit
        tok = _create_token(admin, created_tokens, name="TEST_Approve",
                            email="test_approve@example.com")["token"]
        sub = session.post(f"{API}/reviews", json={
            "token": tok, "name": "TEST_Approve",
            "quote": "Outstanding delivery and polish.", "rating": 5,
        })
        rid = sub.json()["id"]
        created_tokens["reviews"].append(rid)

        # Unapproved — should NOT appear in public
        pub = session.get(f"{API}/reviews")
        assert pub.status_code == 200
        ids = [r["id"] for r in pub.json()]
        assert rid not in ids

        # Approve
        pr = admin.patch(f"{API}/admin/reviews/{rid}", json={"approved": True})
        assert pr.status_code == 200
        assert pr.json()["approved"] is True

        # Now in public
        pub2 = session.get(f"{API}/reviews")
        assert pub2.status_code == 200
        items = pub2.json()
        match = next((r for r in items if r["id"] == rid), None)
        assert match is not None
        assert match["name"] == "TEST_Approve"
        # approved_at set
        assert match.get("approved_at")
        # public should NOT leak token
        assert "token" not in match

        # Unapprove — disappears
        pr2 = admin.patch(f"{API}/admin/reviews/{rid}", json={"approved": False})
        assert pr2.status_code == 200
        pub3 = session.get(f"{API}/reviews")
        assert rid not in [r["id"] for r in pub3.json()]

    def test_patch_requires_auth(self, session):
        r = session.patch(f"{API}/admin/reviews/any", json={"approved": True})
        assert r.status_code == 401

    def test_patch_unknown_id_404(self, admin):
        r = admin.patch(f"{API}/admin/reviews/nonexistent-id-123", json={"approved": True})
        assert r.status_code == 404


# ----- GET /api/admin/reviews -----
class TestAdminReviewsList:
    def test_requires_auth(self, session):
        r = session.get(f"{API}/admin/reviews")
        assert r.status_code == 401

    def test_returns_reviews_and_tokens_with_url(self, admin, created_tokens):
        _create_token(admin, created_tokens, name="TEST_ListURL",
                      email="test_listurl@example.com")
        r = admin.get(f"{API}/admin/reviews")
        assert r.status_code == 200
        data = r.json()
        assert "reviews" in data and isinstance(data["reviews"], list)
        assert "tokens" in data and isinstance(data["tokens"], list)
        # Every token has a url
        for t in data["tokens"]:
            assert "url" in t
            assert "/review/" in t["url"]
            assert t["url"].endswith(t["token"])


# ----- DELETE endpoints -----
class TestDeleteAuth:
    def test_delete_review_requires_auth(self, session):
        r = session.delete(f"{API}/admin/reviews/foo")
        assert r.status_code == 401

    def test_delete_review_unknown_404(self, admin):
        r = admin.delete(f"{API}/admin/reviews/nope-id-xyz")
        assert r.status_code == 404

    def test_delete_token_requires_auth(self, session):
        r = session.delete(f"{API}/admin/review-tokens/foo")
        assert r.status_code == 401

    def test_delete_token_unknown_404(self, admin):
        r = admin.delete(f"{API}/admin/review-tokens/nope-token-xyz")
        assert r.status_code == 404


# ----- Regression -----
class TestRegression:
    def test_contact_public_still_works(self, session):
        r = session.post(f"{API}/contact", json={
            "name": "TEST_RegReview",
            "email": "test_regreview@example.com",
            "project_type": "Design",
            "budget": "$1,500 - $3,000",
            "message": "regression check after reviews added",
        })
        assert r.status_code == 200
