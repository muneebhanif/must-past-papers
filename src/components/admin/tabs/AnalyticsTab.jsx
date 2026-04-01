import { useQuery } from "convex/react";
import { api } from "../../../lib/api";
import { BarChart3, Clock, FileText, Heart, MessageSquare, TrendingUp, Upload, Users } from "lucide-react";
import { MiniBarChart, MiniLineChart, DonutChart, HorizontalBarChart } from "../ui/MiniBarChart";

export function AnalyticsTab({ allPapers, users, activity, token }) {
  const stats = useQuery(api.adminPanel.getAdminStats, token ? { token } : "skip");

  const approved = allPapers.filter((paper) => paper.status === "approved");
  const totalLikes = approved.reduce((sum, paper) => sum + (paper.likeCount ?? 0), 0);
  const totalComments = approved.reduce((sum, paper) => sum + (paper.commentCount ?? 0), 0);
  const avgEngagement = approved.length ? ((totalLikes + totalComments) / approved.length).toFixed(1) : "0.0";

  const colors = [
    "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
    "#f43f5e", "#ef4444", "#f97316", "#eab308", "#22c55e",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Analytics & Insights</h2>
        <p className="text-sm text-slate-500">Comprehensive overview of platform metrics and trends.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Papers</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{allPapers.length}</p>
              <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" />
                {stats?.growth?.last7?.papers ?? 0} this week
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 transition-transform group-hover:scale-150" />
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{users.length}</p>
              <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" />
                {stats?.growth?.last7?.users ?? 0} this week
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 opacity-10 transition-transform group-hover:scale-150" />
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Engagement</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{totalLikes + totalComments}</p>
              <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-600">
                <BarChart3 className="h-3 w-3" />
                {avgEngagement} avg/paper
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 opacity-10 transition-transform group-hover:scale-150" />
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Approval Rate</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {allPapers.length > 0 ? ((approved.length / allPapers.length) * 100).toFixed(0) : 0}%
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-violet-600">
                <Clock className="h-3 w-3" />
                {allPapers.filter((p) => p.status === "pending").length} pending
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 opacity-10 transition-transform group-hover:scale-150" />
        </div>
      </div>

      {/* Charts Row 1: Trends */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">📈 Daily Uploads (Last 7 Days)</h3>
          <MiniBarChart
            data={stats?.chartData?.dailyUploads ?? [0, 0, 0, 0, 0, 0, 0]}
            labels={stats?.chartData?.dayLabels ?? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
            color="#6366f1"
            height={160}
          />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">💬 Daily Comments (Last 7 Days)</h3>
          <MiniLineChart
            data={stats?.chartData?.dailyComments ?? [0, 0, 0, 0, 0, 0, 0]}
            labels={stats?.chartData?.dayLabels ?? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
            color="#3b82f6"
            height={160}
          />
        </div>
      </div>

      {/* Charts Row 2: Distribution */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Paper Status</h3>
          <DonutChart
            segments={[
              { label: "Approved", value: allPapers.filter((p) => p.status === "approved").length, color: "#10b981" },
              { label: "Pending", value: allPapers.filter((p) => p.status === "pending").length, color: "#f59e0b" },
              { label: "Rejected", value: allPapers.filter((p) => p.status === "rejected").length, color: "#ef4444" },
            ]}
            size={140}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Paper Types</h3>
          <DonutChart
            segments={(stats?.papersByType ?? []).map((type, idx) => ({
              label: type.name,
              value: type.count,
              color: colors[idx % colors.length],
            }))}
            size={140}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">📊 Daily Likes</h3>
          <MiniBarChart
            data={stats?.chartData?.dailyLikes ?? [0, 0, 0, 0, 0, 0, 0]}
            labels={stats?.chartData?.dayLabels ?? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
            color="#f43f5e"
            height={120}
          />
        </div>
      </div>

      {/* Charts Row 3: Rankings */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">🏫 Top Departments</h3>
          <HorizontalBarChart
            items={(stats?.topDepartments ?? []).map((d, idx) => ({
              label: d.name,
              value: d.count,
              color: colors[idx % colors.length],
            }))}
          />
          {(!stats?.topDepartments || stats.topDepartments.length === 0) && (
            <p className="text-sm text-slate-400 py-4 text-center">No data yet</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">🔥 Most Popular Papers</h3>
          <div className="space-y-2.5">
            {(stats?.mostLikedPapers ?? []).map((paper, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                  idx === 0 ? "bg-amber-500" : idx === 1 ? "bg-slate-400" : idx === 2 ? "bg-amber-700" : "bg-slate-300"
                }`}>{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">{paper.title}</p>
                  <p className="text-xs text-slate-400">{paper.department}</p>
                </div>
                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">
                  {paper.likeCount} ❤️
                </span>
              </div>
            ))}
            {(!stats?.mostLikedPapers || stats.mostLikedPapers.length === 0) && (
              <p className="text-sm text-slate-400 py-4 text-center">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Engagement Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">📊 Engagement Summary</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 p-4">
            <Heart className="h-5 w-5 text-rose-600" />
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalLikes}</p>
            <p className="text-xs text-slate-500">Total Likes</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalComments}</p>
            <p className="text-xs text-slate-500">Total Comments</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4">
            <BarChart3 className="h-5 w-5 text-amber-600" />
            <p className="mt-2 text-2xl font-bold text-slate-900">{avgEngagement}</p>
            <p className="text-xs text-slate-500">Avg Engagement</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
            <Upload className="h-5 w-5 text-emerald-600" />
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats?.growth?.last30?.papers ?? 0}</p>
            <p className="text-xs text-slate-500">Uploads (30d)</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 p-4">
            <Users className="h-5 w-5 text-violet-600" />
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats?.growth?.last30?.users ?? 0}</p>
            <p className="text-xs text-slate-500">New Users (30d)</p>
          </div>
        </div>
      </div>

      {/* 30 Day Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">📅 30-Day Growth</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{stats?.growth?.last30?.papers ?? 0}</p>
            <p className="mt-1 text-sm text-slate-500">New Papers</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${Math.min(((stats?.growth?.last30?.papers ?? 0) / Math.max(allPapers.length, 1)) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-600">{stats?.growth?.last30?.users ?? 0}</p>
            <p className="mt-1 text-sm text-slate-500">New Users</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(((stats?.growth?.last30?.users ?? 0) / Math.max(users.length, 1)) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stats?.growth?.last30?.comments ?? 0}</p>
            <p className="mt-1 text-sm text-slate-500">New Comments</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(((stats?.growth?.last30?.comments ?? 0) / Math.max(stats?.totals?.comments ?? 1, 1)) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-rose-600">{stats?.growth?.last30?.likes ?? 0}</p>
            <p className="mt-1 text-sm text-slate-500">New Likes</p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${Math.min(((stats?.growth?.last30?.likes ?? 0) / Math.max(stats?.totals?.likes ?? 1, 1)) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
