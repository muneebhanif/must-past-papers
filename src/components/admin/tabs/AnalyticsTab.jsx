import { BarChart3, MessageSquare, ThumbsUp, Users } from "lucide-react";

const TopList = ({ title, items }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    <div className="mt-3 space-y-2">
      {items.length ? (
        items.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
            <span className="truncate text-sm text-slate-700">{item.label}</span>
            <span className="text-sm font-bold text-slate-900">{item.count}</span>
          </div>
        ))
      ) : (
        <p className="text-sm text-slate-500">No data yet.</p>
      )}
    </div>
  </div>
);

export function AnalyticsTab({ allPapers, users, activity }) {
  const approved = allPapers.filter((paper) => paper.status === "approved");

  const topDepartments = Object.entries(
    approved.reduce((acc, paper) => {
      if (!paper.department) return acc;
      acc[paper.department] = (acc[paper.department] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topSubjects = Object.entries(
    approved.reduce((acc, paper) => {
      if (!paper.subject) return acc;
      acc[paper.subject] = (acc[paper.subject] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const totalLikes = approved.reduce((sum, paper) => sum + (paper.likeCount ?? 0), 0);
  const totalComments = approved.reduce((sum, paper) => sum + (paper.commentCount ?? 0), 0);
  const avgEngagement = approved.length ? ((totalLikes + totalComments) / approved.length).toFixed(1) : "0.0";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Analytics</h2>
        <p className="text-sm text-slate-500">Live moderation metrics and content insights.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Papers</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{allPapers.length}</p>
          <BarChart3 className="mt-3 h-5 w-5 text-blue-600" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Approved Papers</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{approved.length}</p>
          <BarChart3 className="mt-3 h-5 w-5 text-emerald-600" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Users</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{users.length}</p>
          <Users className="mt-3 h-5 w-5 text-violet-600" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Avg Engagement / Paper</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{avgEngagement}</p>
          <MessageSquare className="mt-3 h-5 w-5 text-amber-600" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopList title="Top Departments" items={topDepartments} />
        <TopList title="Top Subjects" items={topSubjects} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900">Engagement Summary</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Total Likes</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{totalLikes}</p>
            <ThumbsUp className="mt-2 h-4 w-4 text-rose-600" />
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Total Comments</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{totalComments}</p>
            <MessageSquare className="mt-2 h-4 w-4 text-blue-600" />
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Activity events cached</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{activity.length}</p>
            <BarChart3 className="mt-2 h-4 w-4 text-emerald-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
