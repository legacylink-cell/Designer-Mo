"""Backend tests for analytics tracking, admin stats aggregation, and SEO static assets."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or "").rstrip("/")
if not BASE_URL:
    from pathlib import Path
    for line in Path("/app/frontend/.env").read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
            break
assert BASE_URL, "REACT_APP_BACKEND_URL must be set"

API = f"{BASE_URL}/api"
ADMIN_TOKEN = "y2T6AaC52m3VacfPtff2j7C_BfAbF_YK"
WRONG_TOKEN = "nope"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def admin():
    sess = requests.Session()
    sess.headers.update({"X-Admin-Token": ADMIN_TOKEN, "Content-Type": "application/json"})
    return sess


# ---------- SEO static assets ----------
class TestSEOStatic:
    def test_root_html_has_seo_meta_and_jsonld(self, s):
        r = s.get(BASE_URL + "/")
        assert r.status_code == 200, r.text
        html = r.text
        assert "<title>Mo. — Freelance Web Designer" in html or "Mo. \u2014 Freelance Web Designer" in html
        assert 'name="description"' in html
        assert 'property="og:title"' in html
        assert "og-image.png" in html
        assert 'name="twitter:card"' in html
        assert 'application/ld+json' in html

    def test_og_image_served(self, s):
        r = s.get(BASE_URL + "/og-image.png")
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("image/png")
        assert len(r.content) > 1000

    def test_sitemap_xml(self, s):
        r = s.get(BASE_URL + "/sitemap.xml")
        assert r.status_code == 200
        assert "<urlset" in r.text and "</urlset>" in r.text

    def test_robots_txt(self, s):
        r = s.get(BASE_URL + "/robots.txt")
        assert r.status_code == 200
        assert "Disallow: /admin" in r.text


# ---------- /api/track ----------
class TestTrack:
    def test_track_with_payload(self, s):
        sid = f"TEST_{uuid.uuid4()}"
        r = s.post(f"{API}/track", json={
            "path": "/", "referrer": "https://www.google.com/search",
            "screen": "1920x1080", "session_id": sid,
        })
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_track_empty_body(self, s):
        r = s.post(f"{API}/track", json={})
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_track_no_body(self, s):
        # FastAPI requires JSON body for the model; sending {} is the empty case.
        # An entirely missing body should still parse to defaults if model has all defaults.
        r = s.post(f"{API}/track", data="", headers={"Content-Type": "application/json"})
        # Either 200 (parsed as defaults) or 422 (rejected) is acceptable; assert no 500.
        assert r.status_code in (200, 422)


# ---------- /api/admin/stats auth + shape ----------
class TestStatsAuth:
    def test_stats_no_auth_401(self, s):
        r = s.get(f"{API}/admin/stats")
        assert r.status_code == 401

    def test_stats_wrong_token_401(self, s):
        r = s.get(f"{API}/admin/stats", headers={"X-Admin-Token": WRONG_TOKEN})
        assert r.status_code == 401

    def test_stats_shape_and_keys(self, admin):
        r = admin.get(f"{API}/admin/stats", params={"days": 7})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["range_days"] == 7
        for k in ("totals", "daily", "referrers", "devices", "browsers", "projects", "budgets"):
            assert k in data, f"missing key {k}"
        for k in ("views", "uniques", "leads", "form_leads", "booking_leads", "conversion_pct"):
            assert k in data["totals"], f"missing totals.{k}"
        assert isinstance(data["daily"], list)
        assert len(data["daily"]) == 7
        for d in data["daily"]:
            assert {"date", "views", "uniques", "leads"} <= set(d.keys())


# ---------- aggregation correctness ----------
class TestStatsAggregation:
    def test_seed_views_and_leads_then_aggregate(self, s, admin):
        # Capture baseline totals for 1-day window
        base = admin.get(f"{API}/admin/stats", params={"days": 1}).json()
        base_views = base["totals"]["views"]
        base_leads = base["totals"]["leads"]
        base_refs = {r["name"]: r["value"] for r in base["referrers"]}

        # Seed 5 views with mixed referrers
        seeds = [
            "https://www.linkedin.com/feed",
            "https://lnkd.in/abc",
            "https://www.google.com/search?q=mo",
            "",  # Direct
            "https://example.com/blog",
        ]
        for ref in seeds:
            rr = s.post(f"{API}/track", json={"path": "/", "referrer": ref,
                                              "session_id": f"TEST_seed_{uuid.uuid4()}"})
            assert rr.status_code == 200

        # Seed 2 contact submissions
        for i in range(2):
            cp = {
                "name": f"TEST_StatSeed{i}",
                "email": f"TEST_statseed{i}@example.com",
                "project_type": "Design",
                "budget": "< $1,500",
                "message": "stats aggregation seed",
            }
            cr = s.post(f"{API}/contact", json=cp)
            assert cr.status_code == 200

        # Allow eventual write
        time.sleep(0.5)

        after = admin.get(f"{API}/admin/stats", params={"days": 1}).json()
        assert after["totals"]["views"] - base_views >= 5, (base_views, after["totals"]["views"])
        assert after["totals"]["leads"] - base_leads >= 2

        ref_map = {r["name"]: r["value"] for r in after["referrers"]}
        # LinkedIn (2 from linkedin.com + lnkd.in), Google (1), Direct (1), example.com (1)
        for label in ("LinkedIn", "Google", "Direct"):
            assert label in ref_map, f"expected referrer bucket {label} in {ref_map}"
            assert ref_map[label] >= base_refs.get(label, 0) + (1 if label != "LinkedIn" else 2)


# ---------- regression: contact still works ----------
class TestContactRegression:
    def test_contact_post_still_200(self, s):
        r = s.post(f"{API}/contact", json={
            "name": "TEST_RegressionUser",
            "email": "TEST_regression@example.com",
            "project_type": "Design",
            "budget": "< $1,500",
            "message": "regression check after analytics added",
        })
        assert r.status_code == 200

    def test_admin_list_still_works(self, admin):
        r = admin.get(f"{API}/contact")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
