import { useEffect } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, onClose }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-[0_16px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="text-base font-semibold text-[#1e1e1e]">{title}</div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-md hover:bg-black/5 text-[#1e1e1e]"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}