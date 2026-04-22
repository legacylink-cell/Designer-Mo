import React, { useEffect, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Lock, LogOut, RefreshCw, Trash2, Search, Mail, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const TOKEN_KEY = "mo_admin_token";

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
      <div className="w-full max-w-md border border-[#121212] bg-[#F3F2ED] p-10" data-testid="admin-gate">
        <div className="flex items-center gap-3">
          <Lock size={18} />
          <span className="overline">Admin / Mo Studio</span>
        </div>
        <h1 className="font-display text-5xl leading-none tracking-tighter mt-4">
          Leads<span className="text-[#E83B22]">.</span>
        </h1>
        <p className="mt-3 text-sm text-[#595959]">
          Enter your admin password to view submissions.
        </p>
        <form onSubmit={submit} noValidate className="mt-8 field-line space-y-6">
          <div>
            <Input
              type="password"
              autoFocus
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Admin password"
              data-testid="admin-password-input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            data-testid="admin-login-btn"
            className="btn-primary w-full justify-center"
          >
            {loading ? "Checking…" : "Unlock →"}
          </button>
        </form>
        <p className="mt-8 text-xs font-mono text-[#595959]">
          Forgot? It's stored in <code className="bg-[#EAE9E4] px-1">/app/backend/.env</code> as <code>ADMIN_TOKEN</code>.
        </p>
      </div>
    </div>
  );
};

const Dashboard = ({ token, onLogout }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | form | booking

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/contact`, {
        headers: { "X-Admin-Token": token },
      });
      setItems(res.data || []);
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error("Session expired.");
        onLogout();
      } else {
        toast.error("Could not load submissions.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const filtered = items.filter((i) => {
    const isBooking = (i.message || "").startsWith("[Booking pre-qualify]");
    if (filter === "form" && isBooking) return false;
    if (filter === "booking" && !isBooking) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (i.name || "").toLowerCase().includes(q) ||
      (i.email || "").toLowerCase().includes(q) ||
      (i.project_type || "").toLowerCase().includes(q) ||
      (i.budget || "").toLowerCase().includes(q) ||
      (i.message || "").toLowerCase().includes(q) ||
      (i.company || "").toLowerCase().includes(q)
    );
  });

  const counts = {
    total: items.length,
    form: items.filter(
      (i) => !(i.message || "").startsWith("[Booking pre-qualify]")
    ).length,
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
          <div className="flex items-center gap-3">
            <button
              onClick={fetchItems}
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
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div>
            <div className="overline">Dashboard · {counts.total} total</div>
            <h1 className="font-display text-5xl md:text-6xl tracking-tighter mt-3">
              Leads<span className="text-[#E83B22]">.</span>
            </h1>
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

        <div className="mt-8 flex items-center gap-3 border-b border-[#121212] pb-2">
          <Search size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, project, budget…"
            data-testid="admin-search"
            className="flex-1 bg-transparent outline-none text-base py-2"
          />
        </div>

        {loading ? (
          <div className="py-24 text-center text-[#595959] font-mono text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-[#D5D3CB] mt-8">
            <p className="font-display text-3xl">No leads yet.</p>
            <p className="text-sm text-[#595959] mt-2">Submissions will appear here in real time.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-4" data-testid="admin-leads-list">
            {filtered.map((i) => {
              const isBooking = (i.message || "").startsWith("[Booking pre-qualify]");
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
                    <div className="font-display text-2xl mt-2 leading-tight">{i.name}</div>
                    <a
                      href={`mailto:${i.email}`}
                      className="text-sm link-underline break-all"
                      data-testid={`admin-lead-email-${i.id}`}
                    >
                      {i.email}
                    </a>
                    {i.company && (
                      <div className="text-xs text-[#595959] mt-1">{i.company}</div>
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
                    <p className="mt-1 text-sm whitespace-pre-wrap">{i.message}</p>
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
      </main>

      <Toaster position="top-center" richColors />
    </div>
  );
};

const Admin = () => {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [verifying, setVerifying] = useState(!!token);

  useEffect(() => {
    if (!token) return;
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
