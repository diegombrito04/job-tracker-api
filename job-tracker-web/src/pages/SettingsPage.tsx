import { useState } from "react";
import { Check, Globe, Moon, Sun, User } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useUser, useTranslation } from "../context/UserContext";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { profile, updateProfile } = useUser();
  const t = useTranslation();

  const [name, setName] = useState(profile.name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [saved, setSaved] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSaveProfile() {
    const trimmedName = name.trim() || (profile.language === "pt" ? "Usuário" : "User");
    setBusy(true);
    setError(null);
    await updateProfile({ name: trimmedName, avatarUrl: avatarUrl.trim() })
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message) {
          setError(err.message);
          return;
        }
        setError(t.error);
      })
      .finally(() => setBusy(false));

    setImgError(false);
  }

  function getInitials(n: string) {
    return n.trim().charAt(0).toUpperCase() || "U";
  }

  const showAvatar = profile.avatarUrl && !imgError;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1e1e1e] dark:text-[#f5f5f7]">
          {t.settings}
        </h1>
        <p className="text-sm text-[#6e6e73] dark:text-[#98989d] mt-0.5">
          {profile.language === "pt"
            ? "Gerencie suas preferências"
            : "Manage your preferences"}
        </p>
      </div>

      {/* ── Profile ── */}
      <Section icon={<User className="w-4 h-4" />} title={t.profile}>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-[#0071e3] flex items-center justify-center text-white text-2xl font-bold overflow-hidden shrink-0 select-none">
            {showAvatar ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              getInitials(profile.name)
            )}
          </div>
          <div>
            <div className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7]">{profile.name}</div>
            <div className="text-sm text-[#6e6e73] dark:text-[#98989d]">Portfolio</div>
          </div>
        </div>

        <div className="space-y-3">
          <FormField label={t.name}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-md border border-black/10 dark:border-white/10 px-3 text-sm outline-none focus:border-[#0071e3] bg-white dark:bg-[#3a3a3c] text-[#1e1e1e] dark:text-[#f5f5f7] placeholder:text-[#6e6e73]"
              placeholder={profile.language === "pt" ? "Seu nome" : "Your name"}
            />
          </FormField>

          <FormField label={t.avatar_url}>
            <input
              value={avatarUrl}
              onChange={(e) => {
                setAvatarUrl(e.target.value);
                setImgError(false);
              }}
              className="h-10 w-full rounded-md border border-black/10 dark:border-white/10 px-3 text-sm outline-none focus:border-[#0071e3] bg-white dark:bg-[#3a3a3c] text-[#1e1e1e] dark:text-[#f5f5f7] placeholder:text-[#6e6e73]"
              placeholder="https://example.com/photo.jpg"
            />
          </FormField>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveProfile}
              disabled={busy}
              className="h-10 px-4 rounded-md bg-[#0071e3] text-white text-sm font-medium hover:brightness-95 flex items-center gap-2 transition-all"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  {t.saved}
                </>
              ) : (
                t.save
              )}
            </button>
          </div>
          {error && <div className="text-sm text-[#ff3b30]">{error}</div>}
        </div>
      </Section>

      {/* ── Appearance ── */}
      <Section icon={<Sun className="w-4 h-4" />} title={t.appearance}>
        <div className="flex gap-3 flex-wrap">
          <ThemeOption
            label={t.theme_light}
            icon={<Sun className="w-5 h-5" />}
            active={theme === "light"}
            onClick={() => setTheme("light")}
          />
          <ThemeOption
            label={t.theme_dark}
            icon={<Moon className="w-5 h-5" />}
            active={theme === "dark"}
            onClick={() => setTheme("dark")}
          />
        </div>
      </Section>

      {/* ── Language ── */}
      <Section icon={<Globe className="w-4 h-4" />} title={t.language}>
        <div className="flex gap-3 flex-wrap">
          <LangOption
            label="Português"
            flag="🇧🇷"
            active={profile.language === "pt"}
            onClick={() => void updateProfile({ language: "pt" })}
          />
          <LangOption
            label="English"
            flag="🇺🇸"
            active={profile.language === "en"}
            onClick={() => void updateProfile({ language: "en" })}
          />
        </div>
      </Section>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-[#2c2c2e] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
        <span className="text-[#6e6e73] dark:text-[#98989d]">{icon}</span>
        <h2 className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-[#1e1e1e] dark:text-[#f5f5f7] mb-1">{label}</div>
      {children}
    </label>
  );
}

function ThemeOption({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex flex-col items-center gap-2 px-8 py-4 rounded-lg border-2 text-sm font-medium transition-colors",
        active
          ? "border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3]"
          : "border-black/10 dark:border-white/10 text-[#6e6e73] dark:text-[#98989d] hover:border-black/20 dark:hover:border-white/20",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}

function LangOption({
  label,
  flag,
  active,
  onClick,
}: {
  label: string;
  flag: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-2.5 px-5 py-3 rounded-lg border-2 text-sm font-medium transition-colors",
        active
          ? "border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3]"
          : "border-black/10 dark:border-white/10 text-[#6e6e73] dark:text-[#98989d] hover:border-black/20 dark:hover:border-white/20",
      ].join(" ")}
    >
      <span className="text-xl">{flag}</span>
      {label}
    </button>
  );
}
