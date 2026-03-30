import { Activity, CheckCircle, FileClock, FileText, Heart, MessageSquare, Users } from "lucide-react";
import { StatCard } from "../ui/StatCard";

export function DashboardTab({
  allPapers,
  pending,
  users,
  activity,
  approvedPapers,
  pendingPapers,
  rejectedPapers,
  setActiveTab,
  setActivePaper,
  formatDate,
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Papers" value={allPapers.length} icon={FileText} color="blue" trend={12} trendUp />
        <StatCard label="Pending Review" value={pending.length} icon={FileClock} color="amber" subtext="Awaiting moderation" />
        <StatCard label="Total Users" value={users.length} icon={Users} color="emerald" trend={8} trendUp />
        <StatCard label="Recent Activity" value={activity.length} icon={Activity} color="purple" subtext="Last 100 actions" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">Paper Status</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600">Approved</span>
              </div>
              <span className="font-semibold text-slate-900">{approvedPapers.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-sm text-slate-600">Pending</span>
              </div>
              <span className="font-semibold text-slate-900">{pendingPapers.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm text-slate-600">Rejected</span>
              </div>
              <span className="font-semibold text-slate-900">{rejectedPapers.length}</span>
            </div>
          </div>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="bg-emerald-500 transition-all" style={{ width: `${(approvedPapers.length / allPapers.length) * 100 || 0}%` }} />
            <div className="bg-amber-500 transition-all" style={{ width: `${(pendingPapers.length / allPapers.length) * 100 || 0}%` }} />
            <div className="bg-red-500 transition-all" style={{ width: `${(rejectedPapers.length / allPapers.length) * 100 || 0}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Pending Review</h3>
            <button onClick={() => setActiveTab("moderation")} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View all →
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {pending.slice(0, 3).map((paper) => (
              <div key={paper._id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{paper.title}</p>
                  <p className="text-xs text-slate-500">{paper.department} • {paper.subject}</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("moderation");
                    setActivePaper(paper);
                  }}
                  className="flex-shrink-0 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200"
                >
                  Review
                </button>
              </div>
            ))}
            {pending.length === 0 && <p className="py-4 text-center text-sm text-slate-500">No pending papers 🎉</p>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
          <button onClick={() => setActiveTab("activity")} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View all →
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {activity.slice(0, 5).map((item) => (
            <div key={item._id || item.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${item.type === "comment" ? "bg-blue-100" : "bg-rose-100"}`}>
                {item.type === "comment" ? <MessageSquare className="h-4 w-4 text-blue-600" /> : <Heart className="h-4 w-4 text-rose-600" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">@{item.actorName}</span> {item.type === "comment" ? "commented on" : "liked"}{" "}
                  <span className="font-semibold">{item.paperTitle}</span>
                </p>
              </div>
              <span className="flex-shrink-0 text-xs text-slate-400">{formatDate(item.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
