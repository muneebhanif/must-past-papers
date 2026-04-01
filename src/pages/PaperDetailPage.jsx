import { useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PaperCard } from "../components/feed/PaperCard";
import { api } from "../lib/api";

export function PaperDetailPage({ onRequireAuth }) {
  const { paperId } = useParams();
  const paper = useQuery(api.papers.getById, paperId ? { paperId } : "skip");

  return (
    <div className="space-y-4 pb-24 sm:space-y-6 xl:pb-0">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>
      </div>

      {paper === undefined ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm sm:rounded-2xl">
          Loading post...
        </div>
      ) : null}

      {paper === null ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm sm:rounded-2xl">
          This post is unavailable or you don&apos;t have access to it.
        </div>
      ) : null}

      {paper ? (
        <PaperCard paper={paper} onRequireAuth={onRequireAuth} isFocused />
      ) : null}
    </div>
  );
}
