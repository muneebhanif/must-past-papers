import { Activity, FileText, Heart, MessageSquare, Trash2 } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

export function ActivityTab({ activityTypeFilter, setActivityTypeFilter, filteredActivity, formatDate, onDeleteActivity }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Activity Log</h2>
          <p className="text-sm text-slate-500">Monitor user interactions and platform activity</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={activityTypeFilter}
            onChange={(e) => setActivityTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
          >
            <option value="all">All Activity</option>
            <option value="comment">Comments</option>
            <option value="like">Likes</option>
            <option value="paper_edit">Paper Edits</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        {filteredActivity.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={Activity} title="No activity yet" description="User interactions like comments and likes will appear here." />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivity.map((item) => (
              <div key={item._id || item.id} className="flex items-start gap-4 p-4 transition-colors hover:bg-slate-50">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                    item.type === "comment"
                      ? "bg-blue-100"
                      : item.type === "paper_edit"
                        ? "bg-amber-100"
                        : "bg-rose-100"
                  }`}
                >
                  {item.type === "comment" ? (
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  ) : item.type === "paper_edit" ? (
                    <FileText className="h-5 w-5 text-amber-600" />
                  ) : (
                    <Heart className="h-5 w-5 text-rose-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">@{item.actorName}</span>
                    <span className="text-slate-500">
                      {item.type === "comment" ? "commented on" : item.type === "paper_edit" ? "edited" : "liked"}
                    </span>
                    <span className="truncate font-semibold text-slate-900">{item.paperTitle}</span>
                  </div>
                  {item.type === "comment" && item.content ? <p className="mt-1 text-sm text-slate-600">"{item.content}"</p> : null}
                  <p className="mt-1 text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                </div>
                {item.type === "comment" || item.type === "like" ? (
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
