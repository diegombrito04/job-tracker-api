import { useMemo, useState } from "react";
import type { ApplicationStatus } from "../lib/types";

export function ApplicationModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    company: string;
    role: string;
    status: ApplicationStatus;
    appliedDate: string;
  }) => Promise<void>;
}) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("APPLIED");
  const [appliedDate, setAppliedDate] = useState(today);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!company.trim() || !role.trim()) return;

    setSaving(true);
    try {
      await onSubmit({
        company: company.trim(),
        role: role.trim(),
        status,
        appliedDate,
      });

      // limpa e fecha
      setCompany("");
      setRole("");
      setStatus("APPLIED");
      setAppliedDate(today);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Nova candidatura"
    >
      {/* overlay */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Fechar modal"
      />

      {/* modal */}
      <div className="relative w-[92vw] max-w-lg rounded-xl bg-white shadow-xl p-6 animate-[fadeIn_.15s_ease-out]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1e1e1e]">Nova Candidatura</h2>
            <p className="text-sm text-[#6e6e73]">Preencha os dados e salve.</p>
          </div>

          <button
            className="h-9 w-9 rounded-md hover:bg-black/5 text-[#1e1e1e]"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-sm text-[#6e6e73]">Empresa *</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="mt-1 w-full h-11 rounded-md border border-black/10 px-3 outline-none focus:border-[#0071e3]"
              placeholder="Ex: Amazon"
              required
            />
          </div>

          <div>
            <label className="text-sm text-[#6e6e73]">Cargo/Vaga *</label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full h-11 rounded-md border border-black/10 px-3 outline-none focus:border-[#0071e3]"
              placeholder="Ex: Backend Intern"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-[#6e6e73]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="mt-1 w-full h-11 rounded-md border border-black/10 px-3 outline-none focus:border-[#0071e3]"
              >
                <option value="APPLIED">APPLIED</option>
                <option value="INTERVIEW">INTERVIEW</option>
                <option value="OFFER">OFFER</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-[#6e6e73]">Data de aplicação</label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="mt-1 w-full h-11 rounded-md border border-black/10 px-3 outline-none focus:border-[#0071e3]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-md border border-black/15 text-[#1e1e1e] hover:bg-black/5"
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="h-10 px-4 rounded-md bg-[#0071e3] text-white font-medium hover:brightness-95 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}