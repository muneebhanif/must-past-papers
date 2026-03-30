import { useState, useEffect, useRef } from "react";
import { DEPARTMENTS } from "../../constants/departments";
import {
  ChevronDown,
  Search,
  X,
  FolderOpen,
  CheckCircle2,
  Hash,
  GraduationCap,
} from "lucide-react";

// Department icon mapping - dynamically assigns icons based on name patterns
const getDepartmentIcon = (department) => {
  if (department === "All") return FolderOpen;
  return GraduationCap;
};

// Generate a consistent color for each department
const getDepartmentColor = (department, isActive) => {
  if (isActive) return "bg-blue-100 text-blue-700";

  const colors = [
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
    "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
    "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
    "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300",
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
    "bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300",
    "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300",
    "bg-pink-50 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300",
    "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
  ];

  let hash = 0;
  for (let i = 0; i < department.length; i++) {
    hash = department.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from department name
const getInitials = (name) => {
  if (name === "All") return "All";
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
};

export function Sidebar({ selectedDepartment, setDepartment }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const searchRef = useRef(null);

  // Filter departments dynamically based on search
  const filteredDepartments = DEPARTMENTS.filter((dept) =>
    dept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count of total departments (excluding "All" if present)
  const totalCount = DEPARTMENTS.filter((d) => d !== "All").length;

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <aside className="hidden w-72 shrink-0 xl:block">
      <div className="sticky top-20 space-y-2">
        {/* Header Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-[#0b1733]">
          {/* Top Section */}
          <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 dark:border-slate-700 dark:from-[#0f2149] dark:to-[#0b1733]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Departments</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{totalCount} available</p>
                </div>
              </div>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${
                    isCollapsed ? "-rotate-90" : ""
                  }`}
                />
              </button>
            </div>

            {/* Search */}
            {!isCollapsed && (
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Search departments ( / )'
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-700 transition-all placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Department List */}
          <div
            className={`transition-all duration-300 ${
              isCollapsed ? "max-h-0 overflow-hidden opacity-0" : "max-h-[60vh] opacity-100"
            }`}
          >
            <div className="custom-scrollbar max-h-[55vh] overflow-y-auto p-2">
              {/* Active Department Indicator */}
              {selectedDepartment !== "All" && !searchQuery && (
                <div className="mb-2 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 dark:bg-blue-500/15">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  <p className="truncate text-xs font-semibold text-blue-700 dark:text-blue-200">
                    Viewing: {selectedDepartment}
                  </p>
                  <button
                    onClick={() => setDepartment("All")}
                    className="ml-auto rounded-md p-1 text-blue-400 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:text-blue-300 dark:hover:bg-blue-500/20 dark:hover:text-blue-200"
                    title="Clear filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Department Items */}
              <div className="space-y-0.5">
                {filteredDepartments.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
                    <Search className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-300">No departments found</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Try a different search term
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  filteredDepartments.map((department) => {
                    const isActive = selectedDepartment === department;
                    const Icon = getDepartmentIcon(department);
                    const initials = getInitials(department);

                    return (
                      <button
                        key={department}
                        onClick={() => setDepartment(department)}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
                          isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80"
                        }`}
                      >
                        {/* Department Icon/Avatar */}
                        <div
                          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                            isActive
                              ? "bg-white/20 text-white"
                              : getDepartmentColor(department, false)
                          }`}
                        >
                          {department === "All" ? (
                            <FolderOpen className="h-4 w-4" />
                          ) : (
                            initials
                          )}
                        </div>

                        {/* Department Name */}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm font-semibold ${
                              isActive ? "text-white" : "text-slate-800 dark:text-slate-100"
                            }`}
                          >
                            {department}
                          </p>
                          {department === "All" && (
                            <p
                              className={`text-[10px] ${
                                isActive ? "text-blue-100" : "text-slate-400 dark:text-slate-500"
                              }`}
                            >
                              Browse everything
                            </p>
                          )}
                        </div>

                        {/* Active Indicator */}
                        {isActive && (
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        )}

                        {/* Hover Arrow (non-active only) */}
                        {!isActive && (
                          <svg
                            className="h-4 w-4 flex-shrink-0 text-slate-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-slate-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tags Card */}
        {!isCollapsed && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#0b1733]">
            <div className="mb-3 flex items-center gap-2">
              <Hash className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quick Filters
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEPARTMENTS.filter((d) => d !== "All")
                .slice(0, 6)
                .map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setDepartment(dept)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      selectedDepartment === dept
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {dept.length > 15 ? `${dept.slice(0, 15)}…` : dept}
                  </button>
                ))}
              {DEPARTMENTS.filter((d) => d !== "All").length > 6 && (
                <span className="self-center px-1 text-[11px] text-slate-400 dark:text-slate-500">
                  +{DEPARTMENTS.filter((d) => d !== "All").length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Help Tip */}
        {!isCollapsed && (
          <div className="rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-3 dark:from-slate-800 dark:to-blue-900/20">
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">💡 Tip:</span> Press{" "}
              <kbd className="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
                /
              </kbd>{" "}
              to quickly search departments.
            </p>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #475569;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .dark .custom-scrollbar {
          scrollbar-color: #334155 transparent;
        }
      `}</style>
    </aside>
  );
}