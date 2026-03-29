import { usePaginatedQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { LoginSplash } from "../components/feed/LoginSplash";
import { PaperCard } from "../components/feed/PaperCard";
import { DEPARTMENTS } from "../constants/departments";

const PAPER_TABS = ["All", "Midterm", "Terminal", "Summer", "Improve"];

export function FeedPage({ department, setDepartment, search, onRequireAuth }) {
  const [paperType, setPaperType] = useState("All");

  const { results, status, loadMore } = usePaginatedQuery(
    api.papers.listApproved,
    { department, search, paperType },
    { initialNumItems: 6 },
  );

  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current || status !== "CanLoadMore") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore(4);
      },
      { rootMargin: "380px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [status, loadMore]);

  return (
    <div className="space-y-4 pb-16 xl:pb-0">
      <LoginSplash />

      <header className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 md:text-xs">
            Departments
          </p>
          <div className="mobile-scroll-hide flex gap-2 overflow-x-auto pb-1">
            {DEPARTMENTS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDepartment(item)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                  department === item ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 md:text-xs">
          Faculty of Engineering / {department === "All" ? "All" : department}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
          {department === "All" ? "Academic Archive" : department}
        </h1>

        <div className="mobile-scroll-hide mt-3 flex gap-2 overflow-x-auto pb-1">
          {PAPER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setPaperType(tab)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition ${
                paperType === tab ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {results.map((paper) => (
        <PaperCard key={paper._id} paper={paper} onRequireAuth={onRequireAuth} />
      ))}

      {!results.length ? (
        <div className="rounded-xl bg-white p-6 text-sm text-slate-600 shadow-sm">No approved papers found.</div>
      ) : null}

      <div ref={sentinelRef} className="py-8 text-center text-sm text-slate-500">
        {status === "LoadingMore"
          ? "Loading more..."
          : status === "Exhausted"
            ? "You reached the end"
            : "Scroll for more"}
      </div>
    </div>
  );
}
