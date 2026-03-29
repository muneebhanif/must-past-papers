import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export function AdminPage() {
  const login = useMutation(api.adminPanel.login);
  const logout = useMutation(api.adminPanel.logout);
  const setStatus = useMutation(api.adminPanel.setStatus);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("admin_panel_token") || "");

  const me = useQuery(api.adminPanel.me, token ? { token } : "skip");
  const isAuthorized = Boolean(token && me?.ok);
  const pending = useQuery(api.adminPanel.listPending, isAuthorized ? { token } : "skip") ?? [];

  useEffect(() => {
    if (me?.ok === false) {
      localStorage.removeItem("admin_panel_token");
      setToken("");
    }
  }, [me]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await login({ email, password });
      localStorage.setItem("admin_panel_token", session.token);
      setToken(session.token);
      setPassword("");
    } catch (err) {
      setError(err?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const onLogout = async () => {
    if (token) {
      await logout({ token });
    }
    localStorage.removeItem("admin_panel_token");
    setToken("");
  };

  if (!isAuthorized) {
    return (
      <section className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Private Admin Panel</h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter admin email and password to access moderation controls.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            required
          />

          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Enter Panel"}
          </button>
        </form>
      </section>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">Pending Moderation ({pending.length})</h2>
        <button
          onClick={onLogout}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
        >
          Sign out
        </button>
      </div>
      <div className="space-y-3">
        {pending.map((paper) => (
          <div key={paper._id} className="rounded-lg border border-slate-200 p-3">
            <p className="font-semibold text-slate-800">{paper.title}</p>
            <p className="text-sm text-slate-500">{paper.department} · {paper.subject} · {paper.uploader.name}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setStatus({ token, paperId: paper._id, status: "approved" })}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Approve
              </button>
              <button
                onClick={() => setStatus({ token, paperId: paper._id, status: "rejected" })}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
