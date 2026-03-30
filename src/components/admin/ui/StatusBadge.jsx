import { CheckCircle, Clock, XCircle } from "lucide-react";

export function StatusBadge({ status }) {
  const config = {
    approved: { variant: "success", icon: CheckCircle, label: "Approved" },
    rejected: { variant: "danger", icon: XCircle, label: "Rejected" },
    pending: { variant: "warning", icon: Clock, label: "Pending" },
  };
  const { variant, icon: Icon, label } = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        variant === "success"
          ? "bg-emerald-100 text-emerald-700"
          : variant === "danger"
            ? "bg-red-100 text-red-700"
            : "bg-amber-100 text-amber-700"
      }`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
