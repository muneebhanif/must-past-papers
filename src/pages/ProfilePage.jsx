import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export function ProfilePage() {
  const { isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const uploads = useQuery(api.papers.listMyUploads, isAuthenticated ? {} : "skip") ?? [];
  const updateProfile = useMutation(api.users.updateProfile);

  const [username, setUsername] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setUsername(me?.username ?? "");
    setImage(me?.image ?? "");
  }, [me?.username, me?.image]);

  if (!isAuthenticated) {
    return <p className="rounded-xl bg-white p-6 text-sm text-slate-600 shadow-sm">Please sign in to view profile.</p>;
  }

  const onSave = async (e) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      await updateProfile({ username, image: image.trim() || undefined });
      setMessage("Profile updated.");
    } catch (err) {
      setMessage(err?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 xl:pb-0">
      <section className="relative rounded-2xl bg-white p-4 shadow-sm">
        <div className="h-28 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100" />
        <div className="-mt-10 flex items-end gap-4 px-4">
          <img
            src={me?.image || "https://i.pravatar.cc/100?img=48"}
            alt={me?.username ?? me?.name ?? "User"}
            className="h-20 w-20 rounded-2xl border-4 border-white object-cover"
          />
          <div className="pb-1">
            <h2 className="text-2xl font-extrabold text-slate-900">@{me?.username ?? "set_username"}</h2>
            <p className="text-sm text-slate-500">Public profile visible by username only.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-xl font-bold text-slate-900">Profile Settings</h3>
        <form onSubmit={onSave} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Profile picture URL
            </label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          {message ? <p className="text-sm font-semibold text-slate-600">{message}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-xl font-bold text-slate-900">My Saved Papers / Uploads ({uploads.length})</h3>
        <div className="space-y-3">
          {uploads.map((paper) => (
            <article key={paper._id} className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-slate-900">{paper.title}</p>
                  <p className="text-sm text-slate-600">{paper.subject} · {paper.teacher} · {paper.year}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    paper.status === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : paper.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {paper.status}
                </span>
              </div>
            </article>
          ))}
          {!uploads.length ? <p className="text-sm text-slate-500">No uploads yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
