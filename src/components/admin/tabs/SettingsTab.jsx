import { Save, Settings } from "lucide-react";

export function SettingsTab({ settingsForm, setSettingsForm, onSaveSettings, actionLoading }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500">Admin panel and moderation preferences.</p>
      </div>

      <form onSubmit={onSaveSettings} className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Settings className="h-4 w-4" /> Site Configuration
          </h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Site Name</label>
              <input
                value={settingsForm.siteName}
                onChange={(e) => setSettingsForm((prev) => ({ ...prev, siteName: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Site Description</label>
              <textarea
                value={settingsForm.siteDescription}
                onChange={(e) => setSettingsForm((prev) => ({ ...prev, siteDescription: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Moderation Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-sm text-slate-700">Email notifications for pending papers</span>
              <input
                type="checkbox"
                checked={settingsForm.emailNotifications}
                onChange={(e) => setSettingsForm((prev) => ({ ...prev, emailNotifications: e.target.checked }))}
              />
            </label>
            <label className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-sm text-slate-700">Strict moderation mode</span>
              <input
                type="checkbox"
                checked={settingsForm.strictModeration}
                onChange={(e) => setSettingsForm((prev) => ({ ...prev, strictModeration: e.target.checked }))}
              />
            </label>
            <label className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-sm text-slate-700">Maintenance mode</span>
              <input
                type="checkbox"
                checked={settingsForm.maintenanceMode}
                onChange={(e) => setSettingsForm((prev) => ({ ...prev, maintenanceMode: e.target.checked }))}
              />
            </label>
          </div>
        </div>

        <div className="lg:col-span-2">
          <button
            type="submit"
            disabled={actionLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
