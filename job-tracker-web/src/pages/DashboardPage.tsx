import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Clock, Plus, TrendingUp, Trophy, XCircle } from "lucide-react";
import type { Application, ApplicationStatus } from "../lib/types";
import { fetchRecentApplications, fetchStatusCount, fetchTotalCount } from "../lib/apiClient";
import { useTranslation } from "../context/UserContext";

type Stats = {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
};

const STATUS_COLOR: Record<ApplicationStatus, string> = {
  APPLIED: "bg-[#0071e3] text-white",
  INTERVIEW: "bg-[#ff9500] text-white",
  OFFER: "bg-[#30d158] text-white",
  REJECTED: "bg-[#ff3b30] text-white",
};

function formatDateBR(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslation();
  const statusLabels: Record<ApplicationStatus, string> = {
    APPLIED: t.status_applied,
    INTERVIEW: t.status_interview,
    OFFER: t.status_offer,
    REJECTED: t.status_rejected,
  };

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [total, applied, interview, offer, rejected, recentApps] = await Promise.all([
          fetchTotalCount(),
          fetchStatusCount("APPLIED"),
          fetchStatusCount("INTERVIEW"),
          fetchStatusCount("OFFER"),
          fetchStatusCount("REJECTED"),
          fetchRecentApplications(5),
        ]);
        if (!alive) return;
        setStats({ total, applied, interview, offer, rejected });
        setRecent(recentApps);
      } catch (error: unknown) {
        if (alive) setError(getErrorMessage(error, t.error_loading));
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [t.error_loading]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="bg-white dark:bg-[#2c2c2e] rounded-lg p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="text-[#ff3b30] font-medium">{t.error_loading}</div>
        <div className="text-sm text-[#6e6e73] dark:text-[#98989d] mt-1">{error}</div>
      </div>
    );
  }

  const s = stats!;
  const offerRate = s.total > 0 ? Math.round((s.offer / s.total) * 100) : 0;
  const interviewRate = s.total > 0 ? Math.round(((s.interview + s.offer) / s.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1e1e1e] dark:text-[#f5f5f7]">
            {t.dashboard}
          </h1>
          <p className="text-sm text-[#6e6e73] dark:text-[#98989d] mt-0.5">{t.overview}</p>
        </div>
        <Link
          to="/applications"
          className="h-10 px-4 rounded-md bg-[#0071e3] text-white text-sm font-medium hover:brightness-95 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          {t.new_application}
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          label={t.total}
          value={s.total}
          icon={<Briefcase className="w-5 h-5 text-[#6e6e73] dark:text-[#98989d]" />}
          accent="border-[#6e6e73]"
        />
        <StatCard
          label={t.applied}
          value={s.applied}
          icon={<Clock className="w-5 h-5 text-[#0071e3]" />}
          accent="border-[#0071e3]"
        />
        <StatCard
          label={t.interview}
          value={s.interview}
          icon={<TrendingUp className="w-5 h-5 text-[#ff9500]" />}
          accent="border-[#ff9500]"
        />
        <StatCard
          label={t.offers}
          value={s.offer}
          icon={<Trophy className="w-5 h-5 text-[#30d158]" />}
          accent="border-[#30d158]"
        />
        <StatCard
          label={t.rejected}
          value={s.rejected}
          icon={<XCircle className="w-5 h-5 text-[#ff3b30]" />}
          accent="border-[#ff3b30]"
        />
      </div>

      {s.total === 0 ? (
        <div className="bg-white dark:bg-[#2c2c2e] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-12 text-center">
          <div className="text-5xl mb-3">🚀</div>
          <div className="text-[#1e1e1e] dark:text-[#f5f5f7] font-semibold text-lg">{t.start_now}</div>
          <div className="text-sm text-[#6e6e73] dark:text-[#98989d] mt-1">{t.add_first_desc}</div>
          <div className="mt-5">
            <Link
              to="/applications"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md bg-[#0071e3] text-white text-sm font-medium hover:brightness-95"
            >
              <Plus className="w-4 h-4" />
              {t.add_application}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent applications */}
          <div className="lg:col-span-2 bg-white dark:bg-[#2c2c2e] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7]">
                {t.recent_applications}
              </h2>
              <Link to="/applications" className="text-sm text-[#0071e3] hover:underline">
                {t.see_all}
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="text-sm text-[#6e6e73] dark:text-[#98989d] py-6 text-center">
                {t.no_applications_yet}
              </div>
            ) : (
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {recent.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-[#1e1e1e] dark:text-[#f5f5f7] truncate">
                        {a.company}
                      </div>
                      <div className="text-xs text-[#6e6e73] dark:text-[#98989d] truncate">{a.role}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[a.status]}`}>
                        {statusLabels[a.status]}
                      </span>
                      <span className="text-xs text-[#6e6e73] dark:text-[#98989d] hidden sm:block">
                        {a.appliedDate ? formatDateBR(a.appliedDate) : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metrics */}
          <div className="bg-white dark:bg-[#2c2c2e] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5 space-y-5">
            <h2 className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7]">{t.metrics}</h2>

            <RateBar
              label={t.interview_rate}
              pct={interviewRate}
              detail={`${s.interview + s.offer} ${t.of} ${s.total}`}
              barColor="bg-[#ff9500]"
            />

            <RateBar
              label={t.offer_rate}
              pct={offerRate}
              detail={`${s.offer} ${t.of} ${s.total}`}
              barColor="bg-[#30d158]"
            />

            <div className="pt-3 border-t border-black/5 dark:border-white/5">
              <Link to="/statistics" className="text-sm text-[#0071e3] hover:underline">
                {t.see_stats}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-[#2c2c2e] rounded-lg p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-l-4 ${accent}`}
    >
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-2xl font-bold text-[#1e1e1e] dark:text-[#f5f5f7]">{value}</span>
      </div>
      <div className="text-sm text-[#6e6e73] dark:text-[#98989d]">{label}</div>
    </div>
  );
}

function RateBar({
  label,
  pct,
  detail,
  barColor,
}: {
  label: string;
  pct: number;
  detail: string;
  barColor: string;
}) {
  const t = useTranslation();
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-[#6e6e73] dark:text-[#98989d]">{label}</span>
        <span className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7]">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-black/5 dark:bg-white/5">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-[#6e6e73] dark:text-[#98989d] mt-1">
        {detail} {t.of_applications}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-9 w-44 bg-black/10 dark:bg-white/10 rounded" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#2c2c2e] rounded-lg p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] h-24 border-l-4 border-black/10 dark:border-white/10"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-[#2c2c2e] rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] h-60" />
        <div className="bg-white dark:bg-[#2c2c2e] rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] h-60" />
      </div>
    </div>
  );
}
