import React, { useEffect, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import {
  Lock,
  LogOut,
  RefreshCw,
  Trash2,
  Search,
  Mail,
  Calendar,
  Eye,
  Users,
  Inbox,
  TrendingUp,
  Star,
  Check,
  X as XIcon,
  Link2,
  Copy,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Input } from "@/components/ui/input";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const TOKEN_KEY = "mo_admin_token";

const INK = "#121212";
const BG = "#F3F2ED";
const ACCENT = "#E83B22";
const MUTED = "#595959";

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const shortDate = (d) => {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return d;
  }
};

/* ---------- Gate ---------- */
const Gate = ({ onUnlock }) => {
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!pwd) return;
    setLoading(true);
    try {
      await axios.post(
        `${API}/admin/verify`,
        {},
        { headers: { "X-Admin-Token": pwd } }
      );
      localStorage.setItem(TOKEN_KEY, pwd);
      toast.success("Welcome back, Mo.");
      onUnlock(pwd);
    } catch {
      toast.error("Wrong password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F2ED] px-6">
      <div
        className="w-full max-w-md border border-[#121212] bg-[#F3F2ED] p-10"
        data-testid="admin-gate"
      >
        <div className="flex items-center gap-3">
          <Lock size={18} />
          <span className="overline">Admin / Mo Studio</span>
        </div>
        <h1 className="font-display text-5xl leading-none tracking-tighter mt-4">
          Dashboard<span className="text-[#E83B22]">.</span>
        </h1>
        <p className="mt-3 text-sm text-[#595959]">
          Enter your admin password to view stats and leads.
        </p>
        <form onSubmit={submit} noValidate className="mt-8 field-line space-y-6">
          <Input
            type="password"
            autoFocus
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Admin password"
            data-testid="admin-password-input"
          />
          <button
            type="submit"
            disabled={loading}
            data-testid="admin-login-btn"
            className="btn-primary w-full justify-center"
          >
            {loading ? "Checking…" : "Unlock →"}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ---------- Stat card ---------- */
const StatCard = ({ icon: Icon, label, value, sub, testid }) => (
  <div
    data-testid={testid}
    className="border border-[#121212] bg-[#F3F2ED] p-6 flex flex-col justify-between min-h-[140px]"
  >
    <div className="flex items-start justify-between">
      <span className="overline">{label}</span>
      <Icon size={16} strokeWidth={1.5} />
    </div>
    <div className="mt-6">
      <div className="font-display text-5xl leading-none tracking-tighter">{value}</div>
      {sub && <div className="text-xs text-[#595959] mt-2 font-mono">{sub}</div>}
    </div>
  </div>
);

/* ---------- Dashboard ---------- */
const Dashboard = ({ token, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [range, setRange] = useState(30);

  const load = async (r = range) => {
    setLoading(true);
    try {
      const [sRes, lRes] = await Promise.all([
        axios.get(`${API}/admin/stats?days=${r}`, {
          headers: { "X-Admin-Token": token },
        }),
        axios.get(`${API}/contact`, {
          headers: { "X-Admin-Token": token },
        }),
      ]);
      setStats(sRes.data);
      setItems(lRes.data || []);
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error("Session expired.");
        onLogout();
      } else {
        toast.error("Could not load dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this submission? This can't be undone.")) return;
    try {
      await axios.delete(`${API}/contact/${id}`, {
        headers: { "X-Admin-Token": token },
      });
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted.");
    } catch {
      toast.error("Could not delete.");
    }
  };

  const filteredItems = items.filter((i) => {
    const isBooking = (i.message || "").startsWith("[Booking pre-qualify]");
    if (filter === "form" && isBooking) return false;
    if (filter === "booking" && !isBooking) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return [
      i.name,
      i.email,
      i.project_type,
      i.budget,
      i.message,
      i.company,
    ]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(q));
  });

  const counts = {
    total: items.length,
    form: items.filter((i) => !(i.message || "").startsWith("[Booking pre-qualify]"))
      .length,
    booking: items.filter((i) =>
      (i.message || "").startsWith("[Booking pre-qualify]")
    ).length,
  };

  return (
    <div className="min-h-screen bg-[#F3F2ED] text-[#121212]">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#F3F2ED]/85 border-b border-[#D5D3CB]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-display text-2xl tracking-tighter">
              Mo<span className="text-[#E83B22]">.</span>
            </a>
            <span className="overline hidden sm:inline">/ Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center border border-[#121212]">
              {[7, 30, 90].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  data-testid={`admin-range-${r}`}
                  className={`text-xs uppercase tracking-[0.16em] px-3 py-2 transition-colors ${
                    range === r
                      ? "bg-[#121212] text-[#F3F2ED]"
                      : "hover:bg-[#121212] hover:text-[#F3F2ED]"
                  }`}
                >
                  {r}d
                </button>
              ))}
            </div>
            <button
              onClick={() => load(range)}
              data-testid="admin-refresh"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] border border-[#121212] px-3 py-2 hover:bg-[#121212] hover:text-[#F3F2ED] transition-colors"
            >
              <RefreshCw size={13} /> Refresh
            </button>
            <button
              onClick={onLogout}
              data-testid="admin-logout"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] border border-[#121212] px-3 py-2 hover:bg-[#E83B22] hover:text-white hover:border-[#E83B22] transition-colors"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="overline">Overview · last {range} days</div>
            <h1 className="font-display text-5xl md:text-6xl tracking-tighter mt-3">
              Dashboard<span className="text-[#E83B22]">.</span>
            </h1>
          </div>
        </div>

        {loading && !stats ? (
          <div className="py-24 text-center text-[#595959] font-mono text-sm">
            Loading…
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <section
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
              data-testid="admin-stats-cards"
            >
              <StatCard
                testid="stat-views"
                icon={Eye}
                label="Page views"
                value={stats?.totals?.views ?? 0}
                sub={`${stats?.range_days ?? range} day window`}
              />
              <StatCard
                testid="stat-uniques"
                icon={Users}
                label="Unique visitors"
                value={stats?.totals?.uniques ?? 0}
                sub="daily-unique hashes"
              />
              <StatCard
                testid="stat-leads"
                icon={Inbox}
                label="Total leads"
                value={stats?.totals?.leads ?? 0}
                sub={`${stats?.totals?.form_leads ?? 0} form · ${
                  stats?.totals?.booking_leads ?? 0
                } booking`}
              />
              <StatCard
                testid="stat-conv"
                icon={TrendingUp}
                label="Conversion"
                value={`${stats?.totals?.conversion_pct ?? 0}%`}
                sub="leads / views"
              />
            </section>

            {/* Daily chart */}
            <section className="mt-6 border border-[#121212] bg-[#F3F2ED] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="overline">Traffic · last {range} days</span>
                <span className="font-mono text-xs text-[#595959]">
                  views vs leads
                </span>
              </div>
              <div className="h-60 w-full" data-testid="admin-daily-chart">
                <ResponsiveContainer>
                  <AreaChart
                    data={(stats?.daily || []).map((d) => ({
                      ...d,
                      label: shortDate(d.date),
                    }))}
                  >
                    <defs>
                      <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={INK} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={INK} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={ACCENT} stopOpacity={0.5} />
                        <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#D5D3CB" strokeDasharray="2 4" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", fill: MUTED }}
                      axisLine={{ stroke: "#D5D3CB" }}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", fill: MUTED }}
                      axisLine={{ stroke: "#D5D3CB" }}
                      tickLine={false}
                      allowDecimals={false}
                      width={28}
                    />
                    <Tooltip
                      contentStyle={{
                        background: BG,
                        border: `1px solid ${INK}`,
                        borderRadius: 0,
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 12,
                      }}
                      labelStyle={{ color: INK }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke={INK}
                      strokeWidth={1.5}
                      fill="url(#gViews)"
                      name="Views"
                    />
                    <Area
                      type="monotone"
                      dataKey="leads"
                      stroke={ACCENT}
                      strokeWidth={2}
                      fill="url(#gLeads)"
                      name="Leads"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Breakdowns */}
            <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <BreakdownCard title="Referrers" data={stats?.referrers || []} testid="admin-referrers" />
              <BreakdownCard title="Devices" data={stats?.devices || []} testid="admin-devices" />
              <BreakdownCard title="Project types (leads)" data={stats?.projects || []} testid="admin-projects" />
              <BreakdownCard title="Budgets (leads)" data={stats?.budgets || []} testid="admin-budgets" />
            </section>

            {/* Leads list */}
            <ReviewsPanel token={token} onSessionExpired={onLogout} />

            <section className="mt-10">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div>
                  <div className="overline">Leads · inbox</div>
                  <h2 className="font-display text-4xl md:text-5xl tracking-tighter mt-2">
                    {counts.total} total
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { k: "all", label: `All (${counts.total})` },
                    { k: "form", label: `Form (${counts.form})` },
                    { k: "booking", label: `Booking (${counts.booking})` },
                  ].map((f) => (
                    <button
                      key={f.k}
                      onClick={() => setFilter(f.k)}
                      data-testid={`admin-filter-${f.k}`}
                      className={`text-xs uppercase tracking-[0.16em] px-3 py-2 border border-[#121212] transition-colors ${
                        filter === f.k
                          ? "bg-[#121212] text-[#F3F2ED]"
                          : "hover:bg-[#121212] hover:text-[#F3F2ED]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 border-b border-[#121212] pb-2">
                <Search size={16} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search leads…"
                  data-testid="admin-search"
                  className="flex-1 bg-transparent outline-none text-base py-2"
                />
              </div>

              {filteredItems.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-[#D5D3CB] mt-6">
                  <p className="font-display text-3xl">No leads yet.</p>
                  <p className="text-sm text-[#595959] mt-2">
                    Submissions will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4" data-testid="admin-leads-list">
                  {filteredItems.map((i) => {
                    const isBooking = (i.message || "").startsWith(
                      "[Booking pre-qualify]"
                    );
                    return (
                      <article
                        key={i.id}
                        data-testid={`admin-lead-${i.id}`}
                        className="border border-[#121212] bg-[#F3F2ED] p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-4"
                      >
                        <div className="md:col-span-3">
                          <div className="overline flex items-center gap-2">
                            {isBooking ? <Calendar size={12} /> : <Mail size={12} />}
                            {isBooking ? "Booking" : "Form"}
                          </div>
                          <div className="font-display text-2xl mt-2 leading-tight">
                            {i.name}
                          </div>
                          <a
                            href={`mailto:${i.email}`}
                            className="text-sm link-underline break-all"
                            data-testid={`admin-lead-email-${i.id}`}
                          >
                            {i.email}
                          </a>
                          {i.company && (
                            <div className="text-xs text-[#595959] mt-1">
                              {i.company}
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-3 flex flex-col gap-2 text-sm">
                          <div>
                            <span className="overline">Project</span>
                            <div className="mt-1">{i.project_type}</div>
                          </div>
                          <div>
                            <span className="overline">Budget</span>
                            <div className="mt-1">{i.budget}</div>
                          </div>
                        </div>

                        <div className="md:col-span-5">
                          <span className="overline">Message</span>
                          <p className="mt-1 text-sm whitespace-pre-wrap">
                            {i.message}
                          </p>
                        </div>

                        <div className="md:col-span-1 flex md:flex-col items-start md:items-end justify-between gap-2">
                          <span className="text-[0.7rem] font-mono text-[#595959]">
                            {formatDate(i.created_at)}
                          </span>
                          <button
                            onClick={() => deleteItem(i.id)}
                            data-testid={`admin-lead-delete-${i.id}`}
                            className="text-[#595959] hover:text-[#E83B22] transition-colors"
                            aria-label="Delete submission"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Toaster position="top-center" richColors />
    </div>
  );
};

/* ---------- Reviews panel ---------- */
const ReviewsPanel = ({ token, onSessionExpired }) => {
  const [data, setData] = useState({ reviews: [], tokens: [] });
  const [loading, setLoading] = useState(true);
  const [inviteForm, setInviteForm] = useState({
    client_name: "",
    client_email: "",
    project: "",
    send_email: true,
  });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/reviews`, {
        headers: { "X-Admin-Token": token },
      });
      setData(res.data);
    } catch (err) {
      if (err?.response?.status === 401) {
        onSessionExpired();
      } else {
        toast.error("Could not load reviews.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setApproval = async (id, approved) => {
    try {
      await axios.patch(
        `${API}/admin/reviews/${id}`,
        { approved },
        { headers: { "X-Admin-Token": token } }
      );
      setData((d) => ({
        ...d,
        reviews: d.reviews.map((r) =>
          r.id === id
            ? { ...r, approved, approved_at: approved ? new Date().toISOString() : null }
            : r
        ),
      }));
      toast.success(approved ? "Published to site." : "Unpublished.");
    } catch {
      toast.error("Could not update.");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await axios.delete(`${API}/admin/reviews/${id}`, {
        headers: { "X-Admin-Token": token },
      });
      setData((d) => ({ ...d, reviews: d.reviews.filter((r) => r.id !== id) }));
      toast.success("Deleted.");
    } catch {
      toast.error("Could not delete.");
    }
  };

  const removeToken = async (t) => {
    if (!window.confirm("Delete this invite link?")) return;
    try {
      await axios.delete(`${API}/admin/review-tokens/${t}`, {
        headers: { "X-Admin-Token": token },
      });
      setData((d) => ({ ...d, tokens: d.tokens.filter((x) => x.token !== t) }));
      toast.success("Link deleted.");
    } catch {
      toast.error("Could not delete.");
    }
  };

  const createInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.client_name || !inviteForm.client_email) {
      toast.error("Name and email are required.");
      return;
    }
    setCreating(true);
    try {
      const res = await axios.post(
        `${API}/admin/review-tokens`,
        inviteForm,
        { headers: { "X-Admin-Token": token } }
      );
      const base = window.location.origin;
      const url = `${base}/review/${res.data.token}`;
      setData((d) => ({
        ...d,
        tokens: [{ ...res.data, url }, ...d.tokens],
      }));
      setInviteForm({ client_name: "", client_email: "", project: "", send_email: true });
      toast.success(
        inviteForm.send_email
          ? `Invite emailed to ${res.data.client_email}.`
          : `Link created — copy and send it manually.`
      );
    } catch {
      toast.error("Could not create invite.");
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (url) => {
    try {
      navigator.clipboard.writeText(url);
      toast.success("Link copied.");
    } catch {
      toast.error("Copy failed.");
    }
  };

  const pending = data.reviews.filter((r) => !r.approved);
  const published = data.reviews.filter((r) => r.approved);
  const activeTokens = data.tokens.filter((t) => !t.used_at);

  return (
    <section className="mt-10" data-testid="reviews-panel">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <div className="overline">Reviews · client feedback</div>
          <h2 className="font-display text-4xl md:text-5xl tracking-tighter mt-2">
            {published.length} live · {pending.length} pending
          </h2>
        </div>
        <button
          onClick={load}
          data-testid="reviews-refresh"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] border border-[#121212] px-3 py-2 hover:bg-[#121212] hover:text-[#F3F2ED] transition-colors"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Invite form */}
      <div className="mt-6 border border-[#121212] bg-[#F3F2ED] p-6 md:p-8">
        <div className="overline mb-4 flex items-center gap-2">
          <Plus size={14} /> Send a review invite
        </div>
        <form
          onSubmit={createInvite}
          noValidate
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          data-testid="invite-form"
        >
          <Input
            placeholder="Client name"
            value={inviteForm.client_name}
            onChange={(e) => setInviteForm({ ...inviteForm, client_name: e.target.value })}
            data-testid="invite-name"
          />
          <Input
            type="email"
            placeholder="client@email.com"
            value={inviteForm.client_email}
            onChange={(e) => setInviteForm({ ...inviteForm, client_email: e.target.value })}
            data-testid="invite-email"
          />
          <Input
            placeholder="Project (optional)"
            value={inviteForm.project}
            onChange={(e) => setInviteForm({ ...inviteForm, project: e.target.value })}
            data-testid="invite-project"
          />
          <button
            type="submit"
            disabled={creating}
            data-testid="invite-submit"
            className="inline-flex items-center justify-center gap-2 bg-[#121212] text-[#F3F2ED] px-4 py-2 text-xs uppercase tracking-[0.16em] hover:bg-[#E83B22] transition-colors"
          >
            <Link2 size={13} /> {creating ? "Creating…" : "Create link"}
          </button>
          <label className="md:col-span-4 flex items-center gap-2 text-xs text-[#595959] font-mono">
            <input
              type="checkbox"
              checked={inviteForm.send_email}
              onChange={(e) => setInviteForm({ ...inviteForm, send_email: e.target.checked })}
              data-testid="invite-send-email"
            />
            Email the invite automatically (uses your Gmail SMTP)
          </label>
        </form>
      </div>

      {/* Active invite links */}
      {activeTokens.length > 0 && (
        <div className="mt-4 border border-[#D5D3CB] bg-[#F3F2ED] p-4" data-testid="active-tokens">
          <div className="overline mb-3">Active invite links</div>
          <ul className="space-y-2">
            {activeTokens.map((t) => (
              <li key={t.token} className="flex items-center justify-between gap-3 text-sm border-b border-[#EAE9E4] pb-2 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg truncate">{t.client_name}</div>
                  <div className="text-xs text-[#595959] truncate">{t.url}</div>
                </div>
                <button
                  onClick={() => copyLink(t.url)}
                  className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em] border border-[#121212] px-2 py-1 hover:bg-[#121212] hover:text-[#F3F2ED]"
                >
                  <Copy size={12} /> Copy
                </button>
                <button
                  onClick={() => removeToken(t.token)}
                  className="text-[#595959] hover:text-[#E83B22]"
                  aria-label="Delete invite"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pending + published lists */}
      {loading ? (
        <div className="py-12 text-center font-mono text-sm text-[#595959]">Loading reviews…</div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mt-6" data-testid="pending-reviews">
              <h3 className="overline mb-3">Pending approval ({pending.length})</h3>
              <div className="space-y-3">
                {pending.map((r) => (
                  <ReviewRow
                    key={r.id}
                    r={r}
                    onApprove={() => setApproval(r.id, true)}
                    onDelete={() => remove(r.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-8" data-testid="published-reviews">
            <h3 className="overline mb-3">Live on site ({published.length})</h3>
            {published.length === 0 ? (
              <div className="text-sm text-[#595959] py-6 border border-dashed border-[#D5D3CB] text-center">
                No published reviews yet — placeholder testimonials are showing on the live site.
              </div>
            ) : (
              <div className="space-y-3">
                {published.map((r) => (
                  <ReviewRow
                    key={r.id}
                    r={r}
                    onUnpublish={() => setApproval(r.id, false)}
                    onDelete={() => remove(r.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

const ReviewRow = ({ r, onApprove, onUnpublish, onDelete }) => (
  <article className="border border-[#121212] bg-[#F3F2ED] p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
    <div className="md:col-span-3 flex items-center gap-3">
      {r.photo_data_url ? (
        <img
          src={r.photo_data_url}
          alt={r.name}
          className="w-12 h-12 object-cover border border-[#121212] grayscale flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 border border-[#D5D3CB] bg-[#EAE9E4] flex-shrink-0" />
      )}
      <div className="min-w-0">
        <div className="font-display text-xl truncate">{r.name}</div>
        <div className="text-xs text-[#595959] truncate">
          {[r.role, r.company].filter(Boolean).join(" · ") || "—"}
        </div>
      </div>
    </div>
    <div className="md:col-span-1 flex md:flex-col items-center md:items-start gap-1">
      <div className="flex gap-0.5 text-[#E83B22]">
        {[...Array(Math.max(1, Math.min(5, r.rating)))].map((_, i) => (
          <Star key={i} size={12} fill="currentColor" stroke="none" />
        ))}
      </div>
      <span className="md:hidden text-xs text-[#595959] ml-2">{r.rating}/5</span>
    </div>
    <p className="md:col-span-6 text-sm whitespace-pre-wrap">"{r.quote}"</p>
    <div className="md:col-span-2 flex flex-wrap md:flex-col md:items-end gap-2">
      {onApprove && (
        <button
          onClick={onApprove}
          className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em] bg-[#121212] text-[#F3F2ED] px-2 py-1 hover:bg-[#E83B22]"
        >
          <Check size={12} /> Publish
        </button>
      )}
      {onUnpublish && (
        <button
          onClick={onUnpublish}
          className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em] border border-[#121212] px-2 py-1 hover:bg-[#121212] hover:text-[#F3F2ED]"
        >
          <XIcon size={12} /> Unpublish
        </button>
      )}
      <button
        onClick={onDelete}
        className="text-[#595959] hover:text-[#E83B22] self-end"
        aria-label="Delete review"
      >
        <Trash2 size={15} />
      </button>
    </div>
  </article>
);

const BreakdownCard = ({ title, data, testid }) => {  const total = (data || []).reduce((acc, d) => acc + d.value, 0) || 1;
  return (
    <div
      data-testid={testid}
      className="border border-[#121212] bg-[#F3F2ED] p-6 min-h-[240px]"
    >
      <div className="overline mb-4">{title}</div>
      {(!data || data.length === 0) ? (
        <div className="text-sm text-[#595959] py-8 text-center font-mono">
          No data yet.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((d) => {
            const pct = Math.round((d.value / total) * 100);
            return (
              <div key={d.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="truncate max-w-[70%]">{d.name}</span>
                  <span className="font-mono text-[#595959]">
                    {d.value} · {pct}%
                  </span>
                </div>
                <div className="h-[6px] bg-[#EAE9E4] border border-[#D5D3CB]">
                  <div
                    className="h-full bg-[#121212]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Admin = () => {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [verifying, setVerifying] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      return;
    }
    axios
      .post(`${API}/admin/verify`, {}, { headers: { "X-Admin-Token": token } })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken("");
      })
      .finally(() => setVerifying(false));
  }, [token]);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F2ED] font-mono text-sm">
        Verifying…
      </div>
    );
  }

  if (!token) {
    return (
      <>
        <Gate onUnlock={setToken} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  return <Dashboard token={token} onLogout={logout} />;
};

export default Admin;
