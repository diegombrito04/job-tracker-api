import { useEffect, useMemo, useState } from "react";
import type { Application } from "../lib/types";
import { fetchAllApplications, fetchStatusCount, fetchTotalCount } from "../lib/apiClient";
import { useTranslation, useUser } from "../context/UserContext";

type Stats = {
  total: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
};

const STATUS_CONFIG: {
  key: keyof Omit<Stats, "total">;
  labelKey: "applied" | "interview" | "offers" | "rejected";
  bar: string;
  track: string;
}[] = [
  { key: "applied", labelKey: "applied", bar: "bg-[#0071e3]", track: "bg-[#0071e3]/15" },
  { key: "interview", labelKey: "interview", bar: "bg-[#ff9500]", track: "bg-[#ff9500]/15" },
  { key: "offer", labelKey: "offers", bar: "bg-[#30d158]", track: "bg-[#30d158]/15" },
  { key: "rejected", labelKey: "rejected", bar: "bg-[#ff3b30]", track: "bg-[#ff3b30]/15" },
];

function groupByMonth(apps: Application[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of apps) {
    if (!a.appliedDate) continue;
    const month = a.appliedDate.slice(0, 7);
    out[month] = (out[month] || 0) + 1;
  }
  return out;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function StatisticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslation();
  const { profile } = useUser();
  const locale = profile.language === "pt" ? "pt-BR" : "en-US";
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short" }),
    [locale]
  );

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [total, applied, interview, offer, rejected, allApps] = await Promise.all([
          fetchTotalCount(),
          fetchStatusCount("APPLIED"),
          fetchStatusCount("INTERVIEW"),
          fetchStatusCount("OFFER"),
          fetchStatusCount("REJECTED"),
          fetchAllApplications(),
        ]);
        if (!alive) return;
        setStats({ total, applied, interview, offer, rejected });
        setApps(allApps);
      } catch (error: unknown) {
        if (alive) setError(getErrorMessage(error, t.error_loading));
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [t.error_loading]);

  if (loading) return <StatsSkeleton />;

  if (error) {
    return (
      <div className="bg-white dark:bg-[#2c2c2e] rounded-lg p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="text-[#ff3b30] font-medium">{t.error}</div>
        <div className="text-sm text-[#6e6e73] dark:text-[#98989d] mt-1">{error}</div>
      </div>
    );
  }

  const s = stats!;

  if (s.total === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1e1e1e] dark:text-[#f5f5f7]">
          {t.statistics}
        </h1>
        <div className="bg-white dark:bg-[#2c2c2e] rounded-lg p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="text-5xl mb-3">📊</div>
          <div className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7] text-lg">{t.no_data_title}</div>
          <div className="text-sm text-[#6e6e73] dark:text-[#98989d] mt-1">{t.no_data_desc}</div>
        </div>
      </div>
    );
  }

  const monthlyData = groupByMonth(apps);
  const sortedMonths = Object.keys(monthlyData).sort();
  const monthlyPoints = sortedMonths.map((month) => {
    const count = monthlyData[month];
    const [y, m] = month.split("-");
    const monthDate = new Date(Date.UTC(parseInt(y, 10), parseInt(m, 10) - 1, 1));
    const monthName = monthFormatter.format(monthDate).replace(".", "");
    const shortYear = y.slice(2);
    return {
      month,
      count,
      label: `${monthName}/${shortYear}`,
    };
  });
  const maxMonthly = Math.max(...monthlyPoints.map((item) => item.count), 1);

  const interviewRateValue = s.total > 0 ? (s.interview + s.offer) / s.total : 0;
  const offerRateValue = s.total > 0 ? s.offer / s.total : 0;
  const rejectedRateValue = s.total > 0 ? s.rejected / s.total : 0;

  const toInterviewRate = (interviewRateValue * 100).toFixed(1);
  const toOfferRate = (offerRateValue * 100).toFixed(1);
  const interviewToOffer = s.interview > 0 ? ((s.offer / s.interview) * 100).toFixed(1) : "—";

  const interviewPerTen = Math.round(interviewRateValue * 10);
  const offerPerTen = Math.round(offerRateValue * 10);
  const rejectedPerTen = Math.round(rejectedRateValue * 10);
  const quickTip =
    offerRateValue >= 0.15
      ? t.statistics_tip_keep
      : interviewRateValue < 0.25
        ? t.statistics_tip_interview
        : t.statistics_tip_offer;
  const averagePerMonth = monthlyPoints.length > 0 ? s.total / monthlyPoints.length : 0;
  const bestMonth = monthlyPoints.reduce<{ label: string; count: number } | null>(
    (best, current) => {
      if (!best || current.count > best.count) return { label: current.label, count: current.count };
      return best;
    },
    null
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1e1e1e] dark:text-[#f5f5f7]">
          {t.statistics}
        </h1>
        <p className="text-sm text-[#6e6e73] dark:text-[#98989d] mt-0.5">
          {t.total_applications(s.total)}
        </p>
      </div>

      <div className="bg-white dark:bg-[#2c2c2e] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
        <h2 className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7]">{t.statistics_simple_title}</h2>
        <p className="text-sm text-[#6e6e73] dark:text-[#98989d] mt-1">{t.statistics_simple_desc}</p>

        <div className="mt-4 text-sm font-medium text-[#1e1e1e] dark:text-[#f5f5f7]">
          {t.statistics_out_of_ten}
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SimpleSummaryCard
            value={`${interviewPerTen}/10`}
            label={t.statistics_ten_interviews}
            accent="text-[#ff9500]"
            bg="bg-[#ff9500]/10"
          />
          <SimpleSummaryCard
            value={`${offerPerTen}/10`}
            label={t.statistics_ten_offers}
            accent="text-[#30d158]"
            bg="bg-[#30d158]/10"
          />
          <SimpleSummaryCard
            value={`${rejectedPerTen}/10`}
            label={t.statistics_ten_rejected}
            accent="text-[#ff3b30]"
            bg="bg-[#ff3b30]/10"
          />
        </div>

        <div className="mt-4 rounded-md border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-3 py-2">
          <span className="text-sm font-semibold text-[#1e1e1e] dark:text-[#f5f5f7]">{t.statistics_tip_title}: </span>
          <span className="text-sm text-[#6e6e73] dark:text-[#98989d]">{quickTip}</span>
        </div>
      </div>

      {/* Status distribution */}
      <div className="bg-white dark:bg-[#2c2c2e] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
        <h2 className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7] mb-5">
          {t.status_distribution}
        </h2>
        <p className="text-sm text-[#6e6e73] dark:text-[#98989d] -mt-3 mb-5">{t.status_distribution_desc}</p>
        <div className="space-y-5">
          {STATUS_CONFIG.map(({ key, labelKey, bar, track }) => {
            const count = s[key];
            const pct = s.total > 0 ? Math.round((count / s.total) * 100) : 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-[#1e1e1e] dark:text-[#f5f5f7]">{t[labelKey]}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#6e6e73] dark:text-[#98989d]">
                      {count} {t.of_applications}
                    </span>
                    <span className="font-bold text-[#1e1e1e] dark:text-[#f5f5f7] w-10 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className={`h-3 rounded-full ${track} dark:opacity-70`}>
                  <div
                    className={`h-full rounded-full ${bar} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Funnel + Conversion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#2c2c2e] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
          <h2 className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7] mb-5">
            {t.conversion_funnel}
          </h2>
          <p className="text-sm text-[#6e6e73] dark:text-[#98989d] -mt-3 mb-5">{t.conversion_funnel_desc}</p>
          <div className="space-y-4">
            <FunnelStep
              label={t.all_applications}
              count={s.total}
              max={s.total}
              bar="bg-[#6e6e73]"
              track="bg-black/10 dark:bg-white/10"
            />
            <FunnelStep
              label={t.reached_interview}
              count={s.interview + s.offer}
              max={s.total}
              bar="bg-[#ff9500]"
              track="bg-[#ff9500]/15"
            />
            <FunnelStep
              label={t.received_offer}
              count={s.offer}
              max={s.total}
              bar="bg-[#30d158]"
              track="bg-[#30d158]/15"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#2c2c2e] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
          <h2 className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7] mb-5">
            {t.conversion_rates}
          </h2>
          <p className="text-sm text-[#6e6e73] dark:text-[#98989d] -mt-3 mb-5">{t.conversion_rates_desc}</p>
          <div className="space-y-4">
            <ConversionRow
              label={t.app_to_interview}
              value={`${toInterviewRate}%`}
              sub={`${s.interview + s.offer} ${t.of} ${s.total} ${t.of_applications}`}
              color="text-[#ff9500]"
            />
            <ConversionRow
              label={t.interview_to_offer}
              value={interviewToOffer === "—" ? "—" : `${interviewToOffer}%`}
              sub={`${s.offer} ${t.of} ${s.interview} ${t.of_interviews}`}
              color="text-[#30d158]"
            />
            <ConversionRow
              label={t.app_to_offer}
              value={`${toOfferRate}%`}
              sub={`${s.offer} ${t.of} ${s.total} ${t.of_applications}`}
              color="text-[#0071e3]"
            />
          </div>
        </div>
      </div>

      {/* Monthly bar chart */}
      {monthlyPoints.length > 0 && (
        <div className="bg-white dark:bg-[#2c2c2e] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
          <h2 className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7] mb-5">
            {t.monthly_chart}
          </h2>
          <p className="text-sm text-[#6e6e73] dark:text-[#98989d] -mt-3 mb-4">{t.monthly_chart_desc}</p>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {bestMonth && (
              <span className="text-xs px-2 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3]">
                {t.monthly_best_month(bestMonth.label, bestMonth.count)}
              </span>
            )}
            <span className="text-xs px-2 py-1 rounded-full bg-black/10 dark:bg-white/10 text-[#6e6e73] dark:text-[#98989d]">
              {t.monthly_average(averagePerMonth)}
            </span>
          </div>
          <div className="flex items-end gap-2" style={{ height: 120 }}>
            {monthlyPoints.map((point) => {
              const heightPct = (point.count / maxMonthly) * 100;
              return (
                <div key={point.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <span className="text-xs font-semibold text-[#0071e3]">{point.count}</span>
                  <div
                    className="w-full flex items-end bg-[#0071e3]/10 dark:bg-[#0071e3]/20 rounded-t-sm"
                    style={{ height: 90 }}
                  >
                    <div
                      className="w-full rounded-t-sm bg-[#0071e3] transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#6e6e73] dark:text-[#98989d] truncate w-full text-center">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SimpleSummaryCard({
  value,
  label,
  accent,
  bg,
}: {
  value: string;
  label: string;
  accent: string;
  bg: string;
}) {
  return (
    <div className={`rounded-lg px-4 py-3 ${bg}`}>
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-xs text-[#6e6e73] dark:text-[#98989d] mt-1">{label}</div>
    </div>
  );
}

function FunnelStep({
  label,
  count,
  max,
  bar,
  track,
}: {
  label: string;
  count: number;
  max: number;
  bar: string;
  track: string;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-[#6e6e73] dark:text-[#98989d]">{label}</span>
        <span className="font-medium text-[#1e1e1e] dark:text-[#f5f5f7]">
          {count} <span className="text-[#6e6e73] dark:text-[#98989d] font-normal">({pct}%)</span>
        </span>
      </div>
      <div className={`h-2.5 rounded-full ${track}`}>
        <div
          className={`h-full rounded-full ${bar} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ConversionRow({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-black/5 dark:border-white/5 last:border-0">
      <div>
        <div className="text-sm text-[#1e1e1e] dark:text-[#f5f5f7]">{label}</div>
        <div className="text-xs text-[#6e6e73] dark:text-[#98989d] mt-0.5">{sub}</div>
      </div>
      <span className={`text-xl font-bold ${color} shrink-0`}>{value}</span>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-9 w-44 bg-black/10 dark:bg-white/10 rounded" />
      <div className="bg-white dark:bg-[#2c2c2e] rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] h-56" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#2c2c2e] rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] h-48" />
        <div className="bg-white dark:bg-[#2c2c2e] rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] h-48" />
      </div>
    </div>
  );
}
