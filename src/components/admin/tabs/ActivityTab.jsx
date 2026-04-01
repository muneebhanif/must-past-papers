import { Activity, CornerDownRight, Edit3, FileText, Heart, MessageSquare, Trash2, Upload } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

export function ActivityTab({ activityTypeFilter, setActivityTypeFilter, filteredActivity, formatDate, onDeleteActivity }) {
  // Count by type
  const typeCounts = {
    comment: 0, like: 0, paper_edit: 0, upload: 0,
  };
  filteredActivity.forEach((item) => {
    if (typeCounts[item.type] !== undefined) typeCounts[item.type]++;
  });

  const getIcon = (type) => {
    switch (type) {
      case "comment": return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case "paper_edit": return <Edit3 className="h-5 w-5 text-amber-600" />;
      case "upload": return <Upload className="h-5 w-5 text-indigo-600" />;
      case "like": return <Heart className="h-5 w-5 text-rose-600" />;
      default: return <Activity className="h-5 w-5 text-slate-600" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case "comment": return "bg-blue-100";
      case "paper_edit": return "bg-amber-100";
      case "upload": return "bg-indigo-100";
      case "like": return "bg-rose-100";
      default: return "bg-slate-100";
    }
  };

  const getLabel = (type) => {
    switch (type) {
      case "comment": return "commented on";
      case "paper_edit": return "edited";
      case "upload": return "uploaded";
      case "like": return "liked";
      default: return "interacted with";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Activity Log</h2>
          <p className="text-sm text-slate-500">Monitor all user interactions and platform activity</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={activityTypeFilter}
            onChange={(e) => setActivityTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
          >
            <option value="all">All Activity ({filteredActivity.length})</option>
            <option value="comment">Comments ({typeCounts.comment})</option>
            <option value="like">Likes ({typeCounts.like})</option>
            <option value="upload">Uploads ({typeCounts.upload})</option>
            <option value="paper_edit">Paper Edits ({typeCounts.paper_edit})</option>
          </select>
        </div>
      </div>

      {/* Activity Type Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{typeCounts.comment}</p>
            <p className="text-[10px] text-slate-500 font-medium">Comments</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100">
            <Heart className="h-4 w-4 text-rose-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{typeCounts.like}</p>
            <p className="text-[10px] text-slate-500 font-medium">Likes</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
            <Upload className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{typeCounts.upload}</p>
            <p className="text-[10px] text-slate-500 font-medium">Uploads</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
            <Edit3 className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{typeCounts.paper_edit}</p>
            <p className="text-[10px] text-slate-500 font-medium">Edits</p>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filteredActivity.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={Activity} title="No activity yet" description="User interactions like comments, likes, and uploads will appear here." />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivity.map((item) => (
              <div key={item._id || item.id} className="flex items-start gap-4 p-4 transition-colors hover:bg-slate-50">
                {/* Icon */}
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${getBg(item.type)}`}>
                  {getIcon(item.type)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-[10px] font-bold text-white overflow-hidden">
                      {item.actorImage ? (
                        <img src={item.actorImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (item.actorName?.[0] ?? "?").toUpperCase()
                      )}
                    </div>
                    <span className="font-semibold text-slate-900 text-sm">@{item.actorName}</span>
                    <span className="text-sm text-slate-500">{getLabel(item.type)}</span>
                    <span className="truncate font-semibold text-slate-900 text-sm">{item.paperTitle}</span>
                    {item.isReply && (
                      <span className="inline-flex items-center gap-0.5 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                        <CornerDownRight className="h-2.5 w-2.5" /> reply
                      </span>
                    )}
                    {item.paperStatus && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        item.paperStatus === "approved" ? "bg-emerald-100 text-emerald-700" :
                        item.paperStatus === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {item.paperStatus}
                      </span>
                    )}
                  </div>
                  {item.type === "comment" && item.content ? (
                    <p className="mt-1 text-sm text-slate-600 italic">"{item.content.slice(0, 150)}{item.content.length > 150 ? "..." : ""}"</p>
                  ) : null}
                  {item.paperDepartment && (
                    <p className="mt-0.5 text-xs text-slate-400">{item.paperDepartment}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                </div>

                {/* Delete action for comments and likes */}
                {(item.type === "comment" || item.type === "like") ? (
                  <button
                    onClick={() => onDeleteActivity(item._id || item.id)}
                    className="flex-shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
