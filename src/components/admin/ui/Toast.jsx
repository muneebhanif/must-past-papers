import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

export function Toast({ message, type = "info", onClose }) {
  const config = {
    success: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", icon: CheckCircle2 },
    error: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: XCircle },
    warning: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", icon: AlertTriangle },
    info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: Info },
  };
  const { bg, border, text, icon: Icon } = config[type];

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flex items-center gap-3 rounded-xl border ${border} ${bg} px-4 py-3 shadow-lg`}>
      <Icon className={`h-5 w-5 ${text}`} />
      <p className={`text-sm font-medium ${text}`}>{message}</p>
      <button onClick={onClose} className={`ml-2 ${text} opacity-60 hover:opacity-100`}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
