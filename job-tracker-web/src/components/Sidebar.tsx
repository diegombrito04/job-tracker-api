import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Briefcase, ChevronLeft, FileText, LayoutDashboard, Settings } from "lucide-react";
import { useTranslation } from "../context/UserContext";

type Props = {
  isOpen: boolean;
  isVisible: boolean;
  onClose: () => void;
  onToggleVisibility: () => void;
};

export function Sidebar({ isOpen, isVisible, onClose, onToggleVisibility }: Props) {
  const location = useLocation();
  const t = useTranslation();

  return (
    <>
      {/* Overlay on mobile */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 lg:hidden ${isOpen ? "block" : "hidden"}`}
        onClick={onClose}
      />

      <aside
        className={[
          "fixed left-0 top-0 z-40 h-full w-[250px] bg-white dark:bg-[#1c1c1e] text-[#1e1e1e] dark:text-[#f5f5f7] border-r border-black/10 dark:border-white/10",
          "transform transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isVisible ? "lg:translate-x-0" : "lg:-translate-x-full",
        ].join(" ")}
      >
        <div className="h-[60px] px-5 flex items-center gap-2 border-b border-black/10 dark:border-white/10">
          <Briefcase className="w-5 h-5 text-[#0071e3]" />
          <span className="font-semibold">Job Tracker</span>
          <div className="flex-1" />
          <button
            onClick={onToggleVisibility}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#6e6e73] dark:text-[#98989d]"
            aria-label={t.hide_sidebar}
            title={t.hide_sidebar}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          <NavItem
            to="/"
            icon={<LayoutDashboard className="w-4 h-4" />}
            label={t.dashboard}
            active={location.pathname === "/"}
            onClick={onClose}
          />
          <NavItem
            to="/applications"
            icon={<FileText className="w-4 h-4" />}
            label={t.applications}
            active={location.pathname === "/applications"}
            onClick={onClose}
          />
          <NavItem
            to="/statistics"
            icon={<BarChart3 className="w-4 h-4" />}
            label={t.statistics}
            active={location.pathname === "/statistics"}
            onClick={onClose}
          />
          <NavItem
            to="/settings"
            icon={<Settings className="w-4 h-4" />}
            label={t.settings}
            active={location.pathname === "/settings"}
            onClick={onClose}
          />
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 text-xs text-[#6e6e73] dark:text-[#98989d] border-t border-black/10 dark:border-white/10">
          v0.1 • Portfolio
        </div>
      </aside>
    </>
  );
}

function NavItem({
  to,
  icon,
  label,
  active,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={[
        "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm",
        "border-l-4 transition-colors",
        active
          ? "bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]"
          : "border-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[#1e1e1e] dark:text-[#f5f5f7]",
      ].join(" ")}
    >
      <span className={active ? "text-[#0071e3]" : "text-[#6e6e73] dark:text-[#98989d]"}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
