import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export function Toast({
  open,
  message,
  type = "info",
  onClose,
}: {
  open: boolean;
  message: string;
  type?: ToastType;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  const styles =
    type === "success"
      ? "bg-[#30d158] text-white"
      : type === "error"
      ? "bg-[#ff3b30] text-white"
      : "bg-[#0071e3] text-white";

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`rounded-lg px-4 py-3 shadow-lg ${styles}`}>
        <div className="text-sm font-medium">{message}</div>
      </div>
    </div>
  );
}