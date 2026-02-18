import { useState } from "react";
import { Briefcase } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/UserContext";

type Mode = "login" | "register";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function AuthPage() {
  const { isAuthenticated, login, register } = useAuth();
  const t = useTranslation();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, t.auth_generic_error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#1c1c1e] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#2c2c2e] rounded-2xl border border-black/10 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-6">
        <div className="flex items-center gap-2 mb-6">
          <Briefcase className="w-5 h-5 text-[#0071e3]" />
          <div className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7]">Job Tracker</div>
        </div>

        <h1 className="text-2xl font-bold text-[#1e1e1e] dark:text-[#f5f5f7]">
          {mode === "login" ? t.auth_login_title : t.auth_register_title}
        </h1>
        <p className="text-sm text-[#6e6e73] dark:text-[#98989d] mt-1 mb-5">
          {mode === "login" ? t.auth_login_subtitle : t.auth_register_subtitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <Field label={t.name}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-md border border-black/10 dark:border-white/10 px-3 text-sm bg-white dark:bg-[#3a3a3c] text-[#1e1e1e] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
                placeholder={t.auth_name_placeholder}
                required
              />
            </Field>
          )}

          <Field label={t.auth_email}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-md border border-black/10 dark:border-white/10 px-3 text-sm bg-white dark:bg-[#3a3a3c] text-[#1e1e1e] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
              placeholder="you@example.com"
              required
            />
          </Field>

          <Field label={t.auth_password}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-md border border-black/10 dark:border-white/10 px-3 text-sm bg-white dark:bg-[#3a3a3c] text-[#1e1e1e] dark:text-[#f5f5f7] outline-none focus:border-[#0071e3]"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </Field>

          {error && (
            <div className="text-sm rounded-md px-3 py-2 bg-[#ff3b30]/10 text-[#ff3b30] border border-[#ff3b30]/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full h-11 rounded-md bg-[#0071e3] text-white font-medium hover:brightness-95 disabled:opacity-60"
          >
            {busy
              ? mode === "login"
                ? t.auth_login_loading
                : t.auth_register_loading
              : mode === "login"
              ? t.auth_login_button
              : t.auth_register_button}
          </button>
        </form>

        <div className="mt-4 text-sm text-center text-[#6e6e73] dark:text-[#98989d]">
          {mode === "login" ? t.auth_no_account : t.auth_have_account}{" "}
          <button
            type="button"
            onClick={() => {
              setMode((prev) => (prev === "login" ? "register" : "login"));
              setError(null);
            }}
            className="text-[#0071e3] hover:underline font-medium"
          >
            {mode === "login" ? t.auth_switch_to_register : t.auth_switch_to_login}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-[#1e1e1e] dark:text-[#f5f5f7]">{label}</div>
      {children}
    </label>
  );
}
