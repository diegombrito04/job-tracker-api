import { useEffect, useRef, useState } from "react";
import { Bell, ChevronLeft, ChevronRight, LogOut, Menu, Moon, Search, Settings, Sun, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import { useTheme } from "../context/ThemeContext";
import { useTranslation, useUser } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import type { Application } from "../lib/types";
import { fetchOverdueFollowUps } from "../lib/apiClient";

type Props = {
  onOpenSidebar: () => void;
  onToggleSidebarVisibility: () => void;
  sidebarVisible: boolean;
  title: string;
};

function dueDateLabel(isoDate: string, language: "pt" | "en", t: ReturnType<typeof useTranslation>) {
  const date = new Date(`${isoDate}T00:00:00`);
  const formatted = new Intl.DateTimeFormat(language === "en" ? "en-US" : "pt-BR", {
    dateStyle: "medium",
  }).format(date);
  return `${t.notifications_due_overdue} - ${formatted}`;
}

export function Topbar({ onOpenSidebar, onToggleSidebarVisibility, sidebarVisible, title }: Props) {
  const { query, setQuery } = useSearch();
  const { theme, toggleTheme } = useTheme();
  const { profile } = useUser();
  const { logout } = useAuth();
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isApplicationsPage = location.pathname === "/applications";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [overdueFollowUps, setOverdueFollowUps] = useState<Application[]>([]);
  const [overdueTotal, setOverdueTotal] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

  const overdueCount = overdueTotal;

  useEffect(() => {
    let alive = true;

    async function loadOverdueFollowUps() {
      try {
        const data = await fetchOverdueFollowUps(8);
        if (alive) {
          setOverdueFollowUps(data.content);
          setOverdueTotal(data.totalElements);
        }
      } catch {
        if (alive) {
          setOverdueFollowUps([]);
          setOverdueTotal(0);
        }
      }
    }

    void loadOverdueFollowUps();
    const interval = window.setInterval(() => void loadOverdueFollowUps(), 60000);

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    if (dropdownOpen || notificationsOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen, notificationsOpen]);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setQuery("");
      return;
    }
    if (e.key === "Enter" && !isApplicationsPage && query.trim()) {
      navigate("/applications");
    }
  }

  function getInitials(name: string) {
    return name.trim().charAt(0).toUpperCase() || "U";
  }

  function handleAvatarError() {
    if (profile.avatarUrl) setFailedAvatarUrl(profile.avatarUrl);
  }

  const showAvatar = Boolean(profile.avatarUrl) && failedAvatarUrl !== profile.avatarUrl;

  return (
    <header
      className={[
        "fixed top-0 right-0 left-0 h-[60px] bg-white dark:bg-[#1c1c1e] shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:border-b dark:border-white/10 z-20",
        sidebarVisible ? "lg:left-[250px]" : "lg:left-0",
      ].join(" ")}
    >
      <div className="h-full px-4 flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#1e1e1e] dark:text-[#f5f5f7]"
          onClick={onOpenSidebar}
          aria-label={t.open_menu}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop sidebar toggle */}
        <button
          className="hidden lg:flex p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#1e1e1e] dark:text-[#f5f5f7]"
          onClick={onToggleSidebarVisibility}
          aria-label={sidebarVisible ? t.hide_sidebar : t.show_sidebar}
          title={sidebarVisible ? t.hide_sidebar : t.show_sidebar}
        >
          {sidebarVisible ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* Page title */}
        <div className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7]">{title}</div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative hidden sm:flex items-center gap-2 px-3 h-9 rounded-md bg-black/5 dark:bg-white/10 w-[220px] focus-within:w-[280px] transition-all duration-200">
          <Search className="w-4 h-4 text-[#6e6e73] dark:text-[#98989d] shrink-0" />
          <input
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-[#6e6e73] dark:placeholder:text-[#98989d] text-[#1e1e1e] dark:text-[#f5f5f7]"
            placeholder={
              isApplicationsPage ? t.search_placeholder : t.search_navigate_hint
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="shrink-0 text-[#6e6e73] dark:text-[#98989d] hover:text-[#1e1e1e] dark:hover:text-[#f5f5f7]"
              aria-label={t.clear_search}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {/* hint when on other pages */}
          {!isApplicationsPage && query.trim() && (
            <button
              onClick={() => navigate("/applications")}
              className="absolute right-0 -bottom-8 left-0 text-xs text-[#0071e3] text-center whitespace-nowrap bg-white dark:bg-[#2c2c2e] border border-black/5 dark:border-white/5 rounded-md py-1 shadow-sm"
            >
              ↵ {t.search_navigate_hint}
            </button>
          )}
        </div>

        {/* Follow-up banner */}
        {overdueCount > 0 && (
          <button
            onClick={() => {
              setNotificationsOpen(true);
              navigate("/applications?overdue=1");
            }}
            className="hidden md:inline-flex h-8 items-center rounded-full bg-[#ff9500]/15 text-[#a75c00] dark:text-[#ffb24d] px-3 text-xs font-medium"
          >
            {t.notifications_due_banner(overdueCount)}
          </button>
        )}

        {/* Bell */}
        <div className="relative" ref={notificationsRef}>
          <button
            className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 relative"
            aria-label={t.notifications}
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell className="w-5 h-5 text-[#6e6e73] dark:text-[#98989d]" />
            {overdueCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#ff3b30] text-white text-[10px] leading-4 text-center">
                {overdueCount > 99 ? "99+" : overdueCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-11 w-[320px] bg-white dark:bg-[#2c2c2e] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/10 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="font-semibold text-sm text-[#1e1e1e] dark:text-[#f5f5f7]">
                  {t.notifications_due_title}
                </div>
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate("/applications?overdue=1");
                  }}
                  className="text-xs text-[#0071e3] hover:underline"
                >
                  {t.see_all}
                </button>
              </div>

              {overdueCount === 0 ? (
                <div className="px-4 py-4 text-sm text-[#6e6e73] dark:text-[#98989d]">
                  {t.notifications_due_empty}
                </div>
              ) : (
                <div className="max-h-[320px] overflow-y-auto">
                  {overdueFollowUps.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate("/applications?overdue=1");
                      }}
                      className="w-full text-left px-4 py-3 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="text-sm font-medium text-[#1e1e1e] dark:text-[#f5f5f7] truncate">
                        {app.company} - {app.role}
                      </div>
                      {app.followUpDate && (
                        <div className="text-xs text-[#6e6e73] dark:text-[#98989d] mt-1">
                          {dueDateLabel(app.followUpDate, profile.language, t)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar / Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="w-9 h-9 rounded-full bg-[#0071e3] flex items-center justify-center text-white text-sm font-semibold overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-1 select-none"
            aria-label={t.profile_menu}
            aria-expanded={dropdownOpen}
          >
            {showAvatar ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
                onError={handleAvatarError}
              />
            ) : (
              getInitials(profile.name)
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-11 w-56 bg-white dark:bg-[#2c2c2e] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-black/5 dark:border-white/10 overflow-hidden z-50">
              {/* User info header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-black/5 dark:border-white/5">
                <div className="w-9 h-9 rounded-full bg-[#0071e3] flex items-center justify-center text-white text-sm font-semibold overflow-hidden shrink-0 select-none">
                  {showAvatar ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                      onError={handleAvatarError}
                    />
                  ) : (
                    getInitials(profile.name)
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-[#1e1e1e] dark:text-[#f5f5f7] truncate">
                    {profile.name}
                  </div>
                  <div className="text-xs text-[#6e6e73] dark:text-[#98989d]">Portfolio</div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-1">
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-[#1e1e1e] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#6e6e73] dark:text-[#98989d]" />
                  {t.settings}
                </Link>

                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-[#1e1e1e] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-[#6e6e73] dark:text-[#98989d]" />
                  ) : (
                    <Moon className="w-4 h-4 text-[#6e6e73]" />
                  )}
                  <span className="flex-1 text-left">
                    {theme === "dark" ? t.theme_light : t.theme_dark}
                  </span>
                  <span className="text-xs text-[#6e6e73] dark:text-[#98989d]">
                    {theme === "dark" ? "🌕" : "🌑"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="flex-1 text-left">{t.logout}</span>
                </button>
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-black/5 dark:border-white/5">
                <div className="text-xs text-[#6e6e73] dark:text-[#98989d]">v0.1 • Portfolio</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
