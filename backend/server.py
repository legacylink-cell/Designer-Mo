from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import hmac
import asyncio
import smtplib
import logging
from email.message import EmailMessage
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', '')
GMAIL_SENDER = os.environ.get('GMAIL_SENDER', '')
GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD', '').replace(' ', '')
NOTIFY_EMAIL = os.environ.get('NOTIFY_EMAIL', GMAIL_SENDER)

logger = logging.getLogger(__name__)


def require_admin(x_admin_token: str = Header(default="")):
    """Constant-time compare of the shared admin secret."""
    if not ADMIN_TOKEN or not hmac.compare_digest(x_admin_token or "", ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


def _html_escape(value: str) -> str:
    return (
        (value or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


async def send_lead_notification(submission: "ContactSubmission") -> None:
    """Fire-and-forget Gmail SMTP notification. Swallows errors so the API call never fails."""
    if not GMAIL_APP_PASSWORD or not GMAIL_SENDER or not NOTIFY_EMAIL:
        logger.info("Gmail SMTP not configured; skipping email notification")
        return

    is_booking = (submission.message or "").startswith("[Booking pre-qualify]")
    source_label = "Booking · Pre-qualify" if is_booking else "Contact form"

    name = _html_escape(submission.name)
    email = _html_escape(submission.email)
    project = _html_escape(submission.project_type)
    budget = _html_escape(submission.budget)
    company = _html_escape(submission.company or "")
    message = _html_escape(submission.message)

    company_row = (
        f'<tr><td style="color:#595959;padding:6px 16px 6px 0;">Company</td>'
        f'<td style="padding:6px 0;">{company}</td></tr>'
        if company
        else ""
    )

    html_body = f"""
<!doctype html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;background:#F3F2ED;padding:32px;color:#121212;">
  <table cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#F3F2ED;">
    <tr><td style="padding-bottom:24px;border-bottom:1px solid #D5D3CB;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#595959;">{source_label}</div>
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:34px;margin:8px 0 0 0;letter-spacing:-0.01em;">New lead<span style="color:#E83B22;">.</span></h1>
    </td></tr>
    <tr><td style="padding:24px 0;">
      <table cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.5;">
        <tr><td style="color:#595959;padding:6px 16px 6px 0;">Name</td><td style="padding:6px 0;"><strong>{name}</strong></td></tr>
        <tr><td style="color:#595959;padding:6px 16px 6px 0;">Email</td><td style="padding:6px 0;"><a href="mailto:{email}" style="color:#121212;">{email}</a></td></tr>
        {company_row}
        <tr><td style="color:#595959;padding:6px 16px 6px 0;">Project</td><td style="padding:6px 0;">{project}</td></tr>
        <tr><td style="color:#595959;padding:6px 16px 6px 0;">Budget</td><td style="padding:6px 0;">{budget}</td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:16px;background:#EAE9E4;border-left:3px solid #E83B22;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#595959;margin-bottom:8px;">Message</div>
      <div style="white-space:pre-wrap;font-size:14px;line-height:1.6;">{message}</div>
    </td></tr>
    <tr><td style="padding-top:24px;font-size:12px;color:#595959;font-family:'JetBrains Mono',monospace;">
      Hit reply to respond directly to {email}.<br/>
      Sent from mohamedabouzeid.com · {submission.created_at.strftime('%b %d, %Y at %H:%M UTC')}
    </td></tr>
  </table>
</body>
</html>
""".strip()

    plain_body = (
        f"{source_label} lead from {submission.name} <{submission.email}>\n\n"
        f"Project: {submission.project_type}\n"
        f"Budget:  {submission.budget}\n"
        + (f"Company: {submission.company}\n" if submission.company else "")
        + f"\nMessage:\n{submission.message}\n\n"
        f"Sent {submission.created_at.strftime('%b %d, %Y at %H:%M UTC')}\n"
        f"Reply to this email to respond directly to {submission.email}."
    )

    msg = EmailMessage()
    msg['Subject'] = f"New lead · Mo Studio · {submission.name}"
    msg['From'] = f"Mo Studio Leads <{GMAIL_SENDER}>"
    msg['To'] = NOTIFY_EMAIL
    msg['Reply-To'] = submission.email
    msg.set_content(plain_body)
    msg.add_alternative(html_body, subtype='html')

    def _send():
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=15) as smtp:
            smtp.login(GMAIL_SENDER, GMAIL_APP_PASSWORD)
            smtp.send_message(msg)

    try:
        await asyncio.to_thread(_send)
        logger.info(f"Email notification sent for submission {submission.id}")
    except Exception as e:
        logger.error(f"Gmail SMTP send failed for {submission.id}: {e}")

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ----- Models -----
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class ContactSubmissionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    project_type: str = Field(min_length=1, max_length=80)
    budget: str = Field(min_length=1, max_length=80)
    message: str = Field(min_length=1, max_length=4000)
    company: Optional[str] = Field(default=None, max_length=160)


class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    project_type: str
    budget: str
    message: str
    company: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ----- Routes -----
@api_router.get("/")
async def root():
    return {"message": "Hello from Mo's studio"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check.get('timestamp'), str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


@api_router.post("/contact", response_model=ContactSubmission)
async def create_contact(submission: ContactSubmissionCreate, background_tasks: BackgroundTasks):
    try:
        obj = ContactSubmission(**submission.model_dump())
        doc = obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.contact_submissions.insert_one(doc)
        logger.info(f"New contact submission from {obj.email}")
        # Fire email notification in the background — never blocks the API response
        background_tasks.add_task(send_lead_notification, obj)
        return obj
    except Exception as e:
        logger.error(f"Failed to save contact submission: {e}")
        raise HTTPException(status_code=500, detail="Could not save your submission. Please try again.")


@api_router.get("/contact", response_model=List[ContactSubmission])
async def list_contacts(_: bool = Depends(require_admin)):
    items = await db.contact_submissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for item in items:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return items


@api_router.post("/admin/verify")
async def admin_verify(_: bool = Depends(require_admin)):
    """Ping endpoint used by the admin UI to validate the password."""
    return {"ok": True}


@api_router.delete("/contact/{submission_id}")
async def delete_contact(submission_id: str, _: bool = Depends(require_admin)):
    res = await db.contact_submissions.delete_one({"id": submission_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"ok": True, "deleted": submission_id}


# ---------- Analytics ----------
class PageViewCreate(BaseModel):
    path: str = Field(default="/", max_length=200)
    referrer: Optional[str] = Field(default=None, max_length=500)
    screen: Optional[str] = Field(default=None, max_length=40)
    session_id: Optional[str] = Field(default=None, max_length=80)


def _hash_ip(ip: str) -> str:
    import hashlib
    # Rotate the hash daily so we count daily-uniques without storing raw IPs.
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    return hashlib.sha256(f"{ip}|{today}|{ADMIN_TOKEN}".encode()).hexdigest()[:16]


@api_router.post("/track")
async def track_view(
    event: PageViewCreate,
    x_forwarded_for: str = Header(default=""),
    user_agent: str = Header(default=""),
):
    try:
        ip = (x_forwarded_for.split(",")[0].strip() if x_forwarded_for else "") or "unknown"
        doc = {
            "id": str(uuid.uuid4()),
            "path": event.path or "/",
            "referrer": (event.referrer or "")[:500],
            "ua": (user_agent or "")[:500],
            "screen": event.screen,
            "session_id": event.session_id,
            "ip_hash": _hash_ip(ip),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.page_views.insert_one(doc)
        return {"ok": True}
    except Exception as e:
        logger.warning(f"track failed: {e}")
        return {"ok": False}


def _bucket_referrer(ref: str) -> str:
    if not ref:
        return "Direct"
    try:
        from urllib.parse import urlparse
        host = (urlparse(ref).netloc or ref).lower().replace("www.", "")
        if not host:
            return "Direct"
        mapping = {
            "google.com": "Google",
            "google.co": "Google",
            "bing.com": "Bing",
            "duckduckgo.com": "DuckDuckGo",
            "linkedin.com": "LinkedIn",
            "lnkd.in": "LinkedIn",
            "twitter.com": "Twitter / X",
            "x.com": "Twitter / X",
            "t.co": "Twitter / X",
            "facebook.com": "Facebook",
            "instagram.com": "Instagram",
            "cal.com": "Cal.com",
            "reddit.com": "Reddit",
        }
        for k, v in mapping.items():
            if k in host:
                return v
        return host.split(":")[0]
    except Exception:
        return "Other"


def _parse_ua(ua: str) -> dict:
    u = (ua or "").lower()
    if "mobile" in u or "iphone" in u or "android" in u:
        device = "Mobile"
    elif "ipad" in u or "tablet" in u:
        device = "Tablet"
    else:
        device = "Desktop"
    if "firefox" in u:
        browser = "Firefox"
    elif "edg/" in u or "edge" in u:
        browser = "Edge"
    elif "chrome" in u and "safari" in u:
        browser = "Chrome"
    elif "safari" in u:
        browser = "Safari"
    else:
        browser = "Other"
    return {"device": device, "browser": browser}


@api_router.get("/admin/stats")
async def admin_stats(days: int = 30, _: bool = Depends(require_admin)):
    days = max(1, min(days, 365))
    now = datetime.now(timezone.utc)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0) - __import__("datetime").timedelta(days=days - 1)
    start_iso = start.isoformat()

    # Fetch only the fields we need, sorted by date
    views = await db.page_views.find(
        {"created_at": {"$gte": start_iso}},
        {"_id": 0, "created_at": 1, "referrer": 1, "ua": 1, "ip_hash": 1, "path": 1},
    ).to_list(20000)
    subs = await db.contact_submissions.find(
        {"created_at": {"$gte": start_iso}},
        {"_id": 0, "created_at": 1, "project_type": 1, "budget": 1, "message": 1, "email": 1},
    ).to_list(2000)

    # Build daily buckets
    from collections import Counter, defaultdict

    daily = defaultdict(lambda: {"views": 0, "uniques": set(), "leads": 0})
    for d in range(days):
        key = (start + __import__("datetime").timedelta(days=d)).strftime("%Y-%m-%d")
        daily[key]  # touch to ensure key exists

    for v in views:
        try:
            key = datetime.fromisoformat(v["created_at"]).strftime("%Y-%m-%d")
        except Exception:
            continue
        bucket = daily[key]
        bucket["views"] += 1
        bucket["uniques"].add(v.get("ip_hash") or v.get("created_at"))

    for s in subs:
        try:
            key = datetime.fromisoformat(s["created_at"]).strftime("%Y-%m-%d")
        except Exception:
            continue
        daily[key]["leads"] += 1

    daily_series = [
        {"date": k, "views": v["views"], "uniques": len(v["uniques"]), "leads": v["leads"]}
        for k, v in sorted(daily.items())
    ]

    # Aggregates
    total_views = sum(r["views"] for r in daily_series)
    total_uniques = len({v.get("ip_hash") for v in views if v.get("ip_hash")})
    total_leads = len(subs)
    conversion = (total_leads / total_views * 100.0) if total_views else 0.0

    referrers = Counter(_bucket_referrer(v.get("referrer") or "") for v in views).most_common(8)
    ua_info = [_parse_ua(v.get("ua") or "") for v in views]
    devices = Counter(x["device"] for x in ua_info).most_common()
    browsers = Counter(x["browser"] for x in ua_info).most_common(6)

    projects = Counter((s.get("project_type") or "Unknown") for s in subs).most_common(8)
    budgets = Counter((s.get("budget") or "Unknown") for s in subs).most_common(8)
    booking_leads = sum(1 for s in subs if (s.get("message") or "").startswith("[Booking pre-qualify]"))
    form_leads = total_leads - booking_leads

    return {
        "range_days": days,
        "totals": {
            "views": total_views,
            "uniques": total_uniques,
            "leads": total_leads,
            "form_leads": form_leads,
            "booking_leads": booking_leads,
            "conversion_pct": round(conversion, 2),
        },
        "daily": daily_series,
        "referrers": [{"name": k, "value": v} for k, v in referrers],
        "devices": [{"name": k, "value": v} for k, v in devices],
        "browsers": [{"name": k, "value": v} for k, v in browsers],
        "projects": [{"name": k, "value": v} for k, v in projects],
        "budgets": [{"name": k, "value": v} for k, v in budgets],
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging (logger instance declared at top of file)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
