import { Edit3, Plus, Save, Search, Trash2, UserPlus } from "lucide-react";

export function UsersTab({
  editingUserId,
  userForm,
  setUserForm,
  onSaveUser,
  actionLoading,
  setEditingUserId,
  filteredUsers,
  searchQuery,
  setSearchQuery,
  onEditUser,
  onDeleteUser,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500">Manage platform users and their permissions</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`rounded-2xl border bg-white p-5 transition-all ${editingUserId ? "border-blue-300 ring-4 ring-blue-50" : "border-slate-200"}`}>
          <div className="mb-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${editingUserId ? "bg-blue-100" : "bg-emerald-100"}`}>
              {editingUserId ? <Edit3 className="h-5 w-5 text-blue-600" /> : <UserPlus className="h-5 w-5 text-emerald-600" />}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{editingUserId ? "Edit User" : "Add New User"}</h3>
              <p className="text-xs text-slate-500">{editingUserId ? "Update user details" : "Create a new user account"}</p>
            </div>
          </div>

          <form onSubmit={onSaveUser} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Username</label>
              <input value={userForm.username} onChange={(e) => setUserForm((p) => ({ ...p, username: e.target.value }))} placeholder="username" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Display Name</label>
              <input value={userForm.name} onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))} placeholder="John Doe" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Email</label>
              <input value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} placeholder="user@example.com" type="email" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Profile Image URL</label>
              <input value={userForm.image} onChange={(e) => setUserForm((p) => ({ ...p, image: e.target.value }))} placeholder="https://..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={actionLoading} className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${editingUserId ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                {editingUserId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingUserId ? "Update User" : "Add User"}
              </button>
              {editingUserId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingUserId("");
                    setUserForm({ username: "", name: "", email: "", image: "" });
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">All Users <span className="text-slate-400">({filteredUsers.length})</span></h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users..." className="w-48 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm" />
            </div>
          </div>

          <div className="max-h-[600px] space-y-2 overflow-y-auto pr-2">
            {filteredUsers.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No users found</p>
            ) : (
              filteredUsers.map((user) => (
                <div key={user._id} className={`flex items-center justify-between gap-3 rounded-xl p-3 transition-colors ${editingUserId === user._id ? "bg-blue-50 ring-2 ring-blue-200" : "bg-slate-50 hover:bg-slate-100"}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                      {(user.name || user.username || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">@{user.username || "no_username"}</p>
                      <p className="truncate text-xs text-slate-500">{user.email || "No email"} • {user.uploadCount || 0} uploads</p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <button onClick={() => onEditUser(user)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-blue-600" title="Edit"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => onDeleteUser(user._id)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
