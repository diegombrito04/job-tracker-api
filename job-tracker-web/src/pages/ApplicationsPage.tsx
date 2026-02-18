import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Application, ApplicationStatus } from "../lib/types";
import { useSearch } from "../context/SearchContext";
import { useTranslation, type Translations } from "../context/UserContext";
import { buildAuthJsonHeaders, notifyUnauthorizedFromStatus } from "../lib/auth";

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // page index (0-based)
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
};

type SortOption = "appliedDate,desc" | "appliedDate,asc" | "company,asc";

// ✅ Compatível com VITE_API_URL e VITE_API_BASE_URL (pra não quebrar nada)
const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";

const STATUS_COLOR: Record<ApplicationStatus, string> = {
  APPLIED: "bg-[#0071e3] text-white",
  INTERVIEW: "bg-[#ff9500] text-white",
  OFFER: "bg-[#30d158] text-white",
  REJECTED: "bg-[#ff3b30] text-white",
};

const COMPANY_DOMAIN_BY_NAME: Record<string, string> = {
  accenture: "accenture.com",
  adobe: "adobe.com",
  adyen: "adyen.com",
  airbus: "airbus.com",
  airbnb: "airbnb.com",
  alibaba: "alibaba.com",
  alphabet: "abc.xyz",
  amazon: "amazon.com",
  amd: "amd.com",
  amex: "americanexpress.com",
  asana: "asana.com",
  apple: "apple.com",
  aws: "aws.amazon.com",
  atlassian: "atlassian.com",
  b3: "b3.com.br",
  "banco do brasil": "bb.com.br",
  "bank of america": "bankofamerica.com",
  bitso: "bitso.com",
  blizzard: "blizzard.com",
  booking: "booking.com",
  btg: "btgpactual.com",
  c6: "c6bank.com.br",
  caixa: "caixa.gov.br",
  canva: "canva.com",
  carrefour: "carrefour.com",
  cisco: "cisco.com",
  coinbase: "coinbase.com",
  disney: "disney.com",
  discord: "discord.com",
  docker: "docker.com",
  datadog: "datadoghq.com",
  deepmind: "deepmind.google",
  deloitte: "deloitte.com",
  doit: "doit.com",
  dropbox: "dropbox.com",
  ebay: "ebay.com",
  embraer: "embraer.com",
  "epic games": "epicgames.com",
  ericsson: "ericsson.com",
  etsy: "etsy.com",
  exxonmobil: "exxonmobil.com",
  figma: "figma.com",
  ford: "ford.com",
  globo: "globo.com",
  "goldman sachs": "goldmansachs.com",
  google: "google.com",
  heineken: "heineken.com",
  honda: "honda.com",
  hsbc: "hsbc.com",
  huawei: "huawei.com",
  ibm: "ibm.com",
  "itaú": "itau.com.br",
  itau: "itau.com.br",
  ifood: "ifood.com.br",
  intel: "intel.com",
  inter: "bancointer.com.br",
  intuitive: "intuitive.com",
  jimdo: "jimdo.com",
  johnson: "jnj.com",
  kpmg: "kpmg.com",
  lg: "lg.com",
  "linha direta": "linhadireta.com.br",
  loco: "loco.com",
  linkedin: "linkedin.com",
  lyft: "lyft.com",
  mastercard: "mastercard.com",
  meta: "meta.com",
  microsoft: "microsoft.com",
  monday: "monday.com",
  mcdonalds: "mcdonalds.com",
  mercedes: "mercedes-benz.com",
  mercadolivre: "mercadolivre.com.br",
  "mercado livre": "mercadolivre.com.br",
  mongodb: "mongodb.com",
  monzo: "monzo.com",
  nasa: "nasa.gov",
  netflix: "netflix.com",
  nestle: "nestle.com",
  nike: "nike.com",
  notion: "notion.so",
  nvidia: "nvidia.com",
  nubank: "nubank.com.br",
  olx: "olx.com.br",
  openai: "openai.com",
  oracle: "oracle.com",
  patreon: "patreon.com",
  paypal: "paypal.com",
  pepsico: "pepsico.com",
  pinterest: "pinterest.com",
  porsche: "porsche.com",
  procter: "pg.com",
  qualcomm: "qualcomm.com",
  quora: "quora.com",
  rappi: "rappi.com",
  renault: "renaultgroup.com",
  revolut: "revolut.com",
  robinhood: "robinhood.com",
  samsung: "samsung.com",
  sap: "sap.com",
  salesforce: "salesforce.com",
  santander: "santander.com.br",
  shell: "shell.com",
  shopify: "shopify.com",
  siemens: "siemens.com",
  sony: "sony.com",
  slack: "slack.com",
  snap: "snap.com",
  soundcloud: "soundcloud.com",
  spotify: "spotify.com",
  starbucks: "starbucks.com",
  stone: "stone.com.br",
  stripe: "stripe.com",
  swift: "swift.com",
  target: "target.com",
  tesla: "tesla.com",
  "the new york times": "nytimes.com",
  tmobile: "t-mobile.com",
  toyota: "toyota.com",
  tsla: "tesla.com",
  tiktok: "tiktok.com",
  twitch: "twitch.tv",
  twitter: "x.com",
  uber: "uber.com",
  unilever: "unilever.com",
  vale: "vale.com",
  vercel: "vercel.com",
  volvo: "volvo.com",
  visa: "visa.com",
  vivo: "vivo.com.br",
  volkswagen: "volkswagen.com",
  walmart: "walmart.com",
  whatsapp: "whatsapp.com",
  wise: "wise.com",
  yahoo: "yahoo.com",
  youtube: "youtube.com",
  zillow: "zillow.com",
  zoom: "zoom.us",
  x: "x.com",
};

const LEGAL_SUFFIXES = new Set([
  "inc",
  "incorporated",
  "corp",
  "corporation",
  "co",
  "company",
  "llc",
  "ltd",
  "limited",
  "plc",
  "sa",
  "s.a",
  "s.a.",
  "s/a",
  "ltda",
  "me",
  "eireli",
  "group",
  "holding",
  "holdings",
  "tech",
  "technology",
  "technologies",
  "digital",
  "solutions",
  "solucoes",
  "soluções",
  "software",
]);

const COMMON_DOMAINS_TLDS = [".com", ".com.br", ".io", ".co", ".ai", ".dev", ".net"];

function stripDiacritics(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeCompanyName(company: string): string {
  return stripDiacritics(company.trim().toLowerCase());
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean)));
}

function extractDomainLikeValue(input: string): string | null {
  const normalized = normalizeCompanyName(input).replace(/^www\./, "");
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(normalized)) return normalized;
  return null;
}

function buildProviderUrls(domain: string): string[] {
  return [
    `https://logo.clearbit.com/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  ];
}

function inferDomainsFromName(company: string): string[] {
  const normalized = normalizeCompanyName(company);
  if (!normalized) return [];

  const explicitDomain = extractDomainLikeValue(normalized);
  if (explicitDomain) return [explicitDomain];

  const directKnown = COMPANY_DOMAIN_BY_NAME[normalized];
  if (directKnown) return [directKnown];

  const compact = normalized.replace(/[^a-z0-9]/g, "");
  const compactKnown = COMPANY_DOMAIN_BY_NAME[compact];
  const partialKnown = Object.entries(COMPANY_DOMAIN_BY_NAME).find(
    ([key]) => key.length >= 3 && normalized.includes(key)
  )?.[1];

  const words = normalized
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .filter((word) => !LEGAL_SUFFIXES.has(word));

  const baseCandidates = unique([
    words.join(""),
    words.slice(0, 2).join(""),
    words[0] ?? "",
    compact,
  ]).filter((value) => value.length >= 2);

  const inferredDomains = baseCandidates.flatMap((base) =>
    COMMON_DOMAINS_TLDS.map((tld) => `${base}${tld}`)
  );

  return unique([directKnown ?? "", compactKnown ?? "", partialKnown ?? "", ...inferredDomains]);
}

function resolveCompanyLogoUrls(company: string): string[] {
  const domains = inferDomainsFromName(company);
  if (domains.length === 0) return [];

  return unique(domains.flatMap((domain) => buildProviderUrls(domain)));
}

function formatDateBR(isoYYYYMMDD: string) {
  const [y, m, d] = (isoYYYYMMDD || "").split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return isoYYYYMMDD;
  const dd = String(d).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${dd}/${mm}/${y}`;
}

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function safeISODate(value: unknown): string {
  if (typeof value === "string" && value.trim().length >= 10) return value.slice(0, 10);
  return todayISO();
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

// ✅ Melhor erro: tenta ler texto quando não for JSON (pra não ficar só "Failed to fetch")
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: buildAuthJsonHeaders(init?.headers),
  });

  if (!res.ok) {
    notifyUnauthorizedFromStatus(res.status);
    let msg = `HTTP error ${res.status}`;
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const body = await res.json();
        msg = body?.message || body?.error || msg;
      } else {
        const text = await res.text();
        if (text) msg = text;
      }
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as T;

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return (await res.text()) as unknown as T;
  }

  return (await res.json()) as T;
}

async function listApplications(params: {
  page: number;
  size: number;
  sort: string; // e.g. "appliedDate,desc"
  status?: ApplicationStatus;
}): Promise<PageResponse<Application>> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  qs.set("size", String(params.size));
  qs.set("sort", params.sort);
  if (params.status) qs.set("status", params.status);

  return api<PageResponse<Application>>(`/applications?${qs.toString()}`);
}

async function createApplication(payload: Omit<Application, "id">): Promise<Application> {
  return api<Application>(`/applications`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function updateApplication(id: number, payload: Omit<Application, "id">): Promise<Application> {
  // ✅ usa o endpoint novo do backend: PUT /applications/{id}
  return api<Application>(`/applications/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

async function deleteApplication(id: number): Promise<void> {
  await api<void>(`/applications/${id}`, { method: "DELETE" });
}

async function patchStatus(id: number, status: ApplicationStatus): Promise<Application> {
  return api<Application>(`/applications/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/** Toasts */
type Toast = { id: string; type: "success" | "error" | "info"; title: string; message?: string };
function toastColors(t: Toast["type"]) {
  if (t === "success") return "border-[#30d158] bg-white dark:bg-[#2c2c2e]";
  if (t === "error") return "border-[#ff3b30] bg-white dark:bg-[#2c2c2e]";
  return "border-[#0071e3] bg-white dark:bg-[#2c2c2e]";
}

export function ApplicationsPage() {
  const t = useTranslation();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL");

  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasAnyApplications, setHasAnyApplications] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [size] = useState(12);

  const [sort, setSort] = useState<SortOption>("appliedDate,desc");

  const { query: search, setQuery: setSearch } = useSearch();
  const statusLabels: Record<ApplicationStatus, string> = useMemo(
    () => ({
      APPLIED: t.status_applied,
      INTERVIEW: t.status_interview,
      OFFER: t.status_offer,
      REJECTED: t.status_rejected,
    }),
    [t]
  );
  const statusOptions: { value: ApplicationStatus; label: string }[] = useMemo(
    () => [
      { value: "APPLIED", label: t.status_applied },
      { value: "INTERVIEW", label: t.status_interview },
      { value: "OFFER", label: t.status_offer },
      { value: "REJECTED", label: t.status_rejected },
    ],
    [t]
  );
  const statusParam = useMemo(
    () => (statusFilter === "ALL" ? undefined : statusFilter),
    [statusFilter]
  );

  // Modals / menus
  const [openCreate, setOpenCreate] = useState(false);
  const [openEditFor, setOpenEditFor] = useState<Application | null>(null); // ✅ NOVO: editar
  const [openStatusFor, setOpenStatusFor] = useState<Application | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Application | null>(null);

  const [busyAction, setBusyAction] = useState<number | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = (t: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [{ id, ...t }, ...prev].slice(0, 4));
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3000);
  };

  // Reset page when filters/sort change
  useEffect(() => {
    setPage(0);
  }, [statusParam, sort]);

  // Centralizei o reload pra não repetir lógica e evitar bugs
  async function reload(opts?: { pageOverride?: number }) {
    const targetPage = opts?.pageOverride ?? page;

    setLoading(true);
    setError(null);

    try {
      const [data, totalData] = await Promise.all([
        listApplications({
          page: targetPage,
          size,
          sort,
          status: statusParam,
        }),
        listApplications({
          page: 0,
          size: 1,
          sort: "appliedDate,desc",
        }),
      ]);

      setApps(data.content);
      setTotal(data.totalElements);
      setTotalPages(data.totalPages);
      setHasAnyApplications(totalData.totalElements > 0);
      if (opts?.pageOverride !== undefined) setPage(targetPage);
    } catch (error: unknown) {
      setError(getErrorMessage(error, t.applications_error_fetch));
    } finally {
      setLoading(false);
    }
  }

  // Load data
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [data, totalData] = await Promise.all([
          listApplications({
            page,
            size,
            sort,
            status: statusParam,
          }),
          listApplications({
            page: 0,
            size: 1,
            sort: "appliedDate,desc",
          }),
        ]);

        if (!alive) return;

        setApps(data.content);
        setTotal(data.totalElements);
        setTotalPages(data.totalPages);
        setHasAnyApplications(totalData.totalElements > 0);
      } catch (error: unknown) {
        if (!alive) return;
        setError(getErrorMessage(error, t.applications_error_fetch));
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [page, size, sort, statusParam, t.applications_error_fetch]);

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter((a) => {
      const company = (a.company ?? "").toLowerCase();
      const role = (a.role ?? "").toLowerCase();
      return company.includes(q) || role.includes(q);
    });
  }, [apps, search]);
  const showFirstApplicationCta = !loading && !error && total === 0 && !hasAnyApplications;
  const showNoResultsCard =
    !loading &&
    !error &&
    !showFirstApplicationCta &&
    (total === 0 || filteredApps.length === 0);
  const noResultsDescription =
    total === 0 ? t.applications_no_match_filters : t.applications_not_found_desc;

  async function onCreate(payload: Omit<Application, "id">) {
    try {
      setBusyAction(-1);

      const cleanPayload: Omit<Application, "id"> = {
        company: payload.company.trim(),
        role: payload.role.trim(),
        status: payload.status,
        appliedDate: payload.appliedDate,
        notes: payload.notes || null,
        jobUrl: payload.jobUrl || null,
        salary: payload.salary || null,
      };

      await createApplication(cleanPayload);

      pushToast({ type: "success", title: t.applications_created_title, message: t.applications_created_msg });
      setOpenCreate(false);
      setSearch("");

      await reload({ pageOverride: 0 });
    } catch (error: unknown) {
      pushToast({
        type: "error",
        title: t.applications_error_create,
        message: getErrorMessage(error, t.applications_error_retry),
      });
    } finally {
      setBusyAction(null);
    }
  }

  // ✅ NOVO: editar (PUT)
  async function onEdit(appId: number, payload: Omit<Application, "id">) {
    try {
      setBusyAction(appId);

      const cleanPayload: Omit<Application, "id"> = {
        company: payload.company.trim(),
        role: payload.role.trim(),
        status: payload.status,
        appliedDate: payload.appliedDate,
        notes: payload.notes || null,
        jobUrl: payload.jobUrl || null,
        salary: payload.salary || null,
      };

      await updateApplication(appId, cleanPayload);

      pushToast({
        type: "success",
        title: t.applications_updated_title,
        message: t.applications_updated_msg,
      });
      setOpenEditFor(null);

      await reload(); // recarrega página atual
    } catch (error: unknown) {
      pushToast({
        type: "error",
        title: t.applications_error_edit,
        message: getErrorMessage(error, t.applications_error_retry),
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function onChangeStatus(app: Application, status: ApplicationStatus) {
    try {
      setBusyAction(app.id);
      await patchStatus(app.id, status);
      pushToast({
        type: "success",
        title: t.applications_status_updated_title,
        message: t.applications_status_updated_msg(statusLabels[status]),
      });
      setOpenStatusFor(null);

      await reload();
    } catch (error: unknown) {
      pushToast({
        type: "error",
        title: t.applications_error_update_status,
        message: getErrorMessage(error, t.applications_error_retry),
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function onDelete(app: Application) {
    try {
      setBusyAction(app.id);
      await deleteApplication(app.id);
      pushToast({ type: "success", title: t.applications_deleted_title, message: t.applications_deleted_msg });
      setConfirmDelete(null);

      const nextPage = page > 0 && apps.length === 1 ? page - 1 : page;
      await reload({ pageOverride: nextPage });
    } catch (error: unknown) {
      pushToast({
        type: "error",
        title: t.applications_error_delete,
        message: getErrorMessage(error, t.applications_error_retry),
      });
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toasts */}
      <div className="fixed right-4 top-20 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "w-[320px] rounded-lg border-l-4 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)]",
              toastColors(t.type),
            ].join(" ")}
            role="status"
            aria-live="polite"
          >
            <div className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7]">{t.title}</div>
            {t.message && <div className="text-sm text-[#6e6e73] dark:text-[#98989d] mt-0.5">{t.message}</div>}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1e1e1e] dark:text-[#f5f5f7]">
            {t.applications_title}
          </h1>
          <p className="text-sm text-[#6e6e73] dark:text-[#98989d]">
            {loading ? t.loading : t.applications_registered(total)}
          </p>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="h-10 px-4 rounded-md bg-[#0071e3] text-white text-sm font-medium hover:brightness-95"
        >
          + {t.new_application}
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip active={statusFilter === "ALL"} onClick={() => setStatusFilter("ALL")}>
            {t.applications_filter_all}
          </FilterChip>
          <FilterChip active={statusFilter === "APPLIED"} onClick={() => setStatusFilter("APPLIED")}>
            {t.applied}
          </FilterChip>
          <FilterChip
            active={statusFilter === "INTERVIEW"}
            onClick={() => setStatusFilter("INTERVIEW")}
          >
            {t.interview}
          </FilterChip>
          <FilterChip active={statusFilter === "OFFER"} onClick={() => setStatusFilter("OFFER")}>
            {t.offers}
          </FilterChip>
          <FilterChip
            active={statusFilter === "REJECTED"}
            onClick={() => setStatusFilter("REJECTED")}
          >
            {t.rejected}
          </FilterChip>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="bg-white dark:bg-[#2c2c2e] rounded-md shadow-sm border border-black/5 dark:border-white/5 h-10 px-3 flex items-center gap-2">
              <span className="text-[#6e6e73] dark:text-[#98989d] text-sm">{t.applications_sort_by}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="text-sm outline-none bg-transparent text-[#1e1e1e] dark:text-[#f5f5f7]"
                aria-label={t.applications_sort_by}
              >
                <option value="appliedDate,desc">{t.applications_sort_date_desc}</option>
                <option value="appliedDate,asc">{t.applications_sort_date_asc}</option>
                <option value="company,asc">{t.applications_sort_company_asc}</option>
              </select>
            </div>

            <div className="bg-white dark:bg-[#2c2c2e] rounded-md shadow-sm border border-black/5 dark:border-white/5 h-10 px-3 flex items-center gap-2 w-full sm:w-[340px]">
              <span className="text-[#6e6e73] dark:text-[#98989d] text-sm">🔎</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.applications_search_placeholder}
                className="w-full text-sm outline-none text-[#1e1e1e] dark:text-[#f5f5f7] placeholder:text-[#6e6e73] dark:text-[#98989d]"
              />
            </div>
          </div>

          <div className="text-sm text-[#6e6e73] dark:text-[#98989d]">
            {t.applications_page_of(page + 1, Math.max(totalPages, 1))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-white dark:bg-[#2c2c2e] rounded-lg p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="text-[#ff3b30] font-medium">{t.error}</div>
          <div className="text-sm text-[#6e6e73] dark:text-[#98989d] mt-1">{error}</div>
          <div className="mt-3 text-sm text-[#6e6e73] dark:text-[#98989d]">
            {t.applications_error_api_hint}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#2c2c2e] rounded-lg p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-36 bg-black/10 dark:bg-white/10 rounded" />
                <div className="h-6 w-20 bg-black/10 dark:bg-white/10 rounded-full" />
              </div>
              <div className="h-6 w-56 bg-black/10 dark:bg-white/10 rounded mt-4" />
              <div className="h-4 w-28 bg-black/10 dark:bg-white/10 rounded mt-6" />
              <div className="flex gap-2 mt-5">
                <div className="h-9 w-24 bg-black/10 dark:bg-white/10 rounded" />
                <div className="h-9 w-24 bg-black/10 dark:bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {showFirstApplicationCta && (
        <div className="bg-white dark:bg-[#2c2c2e] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-10 text-center">
          <div className="text-4xl mb-2">🗂️</div>
          <div className="text-[#1e1e1e] dark:text-[#f5f5f7] font-semibold">{t.applications_empty_title}</div>
          <div className="text-sm text-[#6e6e73] dark:text-[#98989d] mt-1">
            {t.applications_empty_desc}
          </div>
          <div className="mt-4">
            <button
              onClick={() => setOpenCreate(true)}
              className="h-10 px-4 rounded-md bg-[#0071e3] text-white text-sm font-medium hover:brightness-95"
            >
              {t.applications_add_first}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && !showFirstApplicationCta && (
        <>
          {showNoResultsCard ? (
            <div className="bg-white dark:bg-[#2c2c2e] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8 text-center">
              <div className="text-[#1e1e1e] dark:text-[#f5f5f7] font-semibold">{t.applications_not_found_title}</div>
              <div className="text-sm text-[#6e6e73] dark:text-[#98989d] mt-1">
                {noResultsDescription}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                {search.trim() && (
                  <button
                    onClick={() => setSearch("")}
                    className="h-10 px-4 rounded-md bg-[#6e6e73] text-white text-sm font-medium hover:brightness-95"
                  >
                    {t.clear_search}
                  </button>
                )}
                {statusFilter !== "ALL" && (
                  <button
                    onClick={() => setStatusFilter("ALL")}
                    className="h-10 px-4 rounded-md bg-[#0071e3] text-white text-sm font-medium hover:brightness-95"
                  >
                    {t.applications_clear_filters}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredApps.map((a) => (
                <div
                  key={a.id}
                  className="bg-white dark:bg-[#2c2c2e] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-2">
                      <CompanyLogo company={a.company} />
                      <div className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7] truncate">{a.company}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {a.jobUrl && (
                        <a
                          href={a.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md text-[#0071e3] hover:bg-[#0071e3]/10 transition-colors"
                          title={t.open_job_link}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                        </a>
                      )}
                      <button
                        onClick={() => setOpenStatusFor(a)}
                        className={`text-xs px-2 py-1 rounded-full ${STATUS_COLOR[a.status]} hover:brightness-95`}
                        title={t.applications_change_status}
                      >
                        {statusLabels[a.status]}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-lg font-semibold text-[#1e1e1e] dark:text-[#f5f5f7] leading-tight">{a.role}</div>

                  {a.salary && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#30d158]/15 text-[#1a8a3a] dark:bg-[#30d158]/20 dark:text-[#30d158] font-medium">
                        💰 {a.salary}
                      </span>
                    </div>
                  )}

                  {a.notes && (
                    <div className="mt-2 text-sm text-[#6e6e73] dark:text-[#98989d] line-clamp-2">
                      {a.notes}
                    </div>
                  )}

                  <div className="mt-3 text-sm text-[#6e6e73] dark:text-[#98989d]">
                    {t.applications_applied_on}{" "}
                    <span className="font-medium text-[#1e1e1e] dark:text-[#f5f5f7]">
                      {a.appliedDate ? formatDateBR(a.appliedDate) : "—"}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setOpenStatusFor(a)}
                      disabled={busyAction === a.id}
                      className="h-9 px-3 rounded-md bg-black/5 dark:bg-white/5 text-[#1e1e1e] dark:text-[#f5f5f7] text-sm hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-60"
                    >
                      {busyAction === a.id ? t.applications_busy_updating : t.applications_change_status}
                    </button>

                    <button
                      onClick={() => setOpenEditFor(a)}
                      disabled={busyAction === a.id}
                      className="h-9 px-3 rounded-md bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-[#1e1e1e] dark:text-[#f5f5f7] text-sm hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60"
                    >
                      {t.edit}
                    </button>

                    <button
                      onClick={() => setConfirmDelete(a)}
                      disabled={busyAction === a.id}
                      className="h-9 px-3 rounded-md bg-[#ff3b30] text-white text-sm hover:brightness-95 disabled:opacity-60"
                    >
                      {busyAction === a.id ? "..." : t.delete}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 0 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                className="h-9 px-3 rounded-md bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-sm text-[#1e1e1e] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
              >
                {t.previous}
              </button>

              <PageNumbers
                page={page}
                totalPages={Math.max(totalPages, 1)}
                onGo={(p) => setPage(p)}
              />

              <button
                onClick={() => setPage((p) => Math.min(Math.max(totalPages - 1, 0), p + 1))}
                disabled={page >= totalPages - 1 || loading || totalPages === 0}
                className="h-9 px-3 rounded-md bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-sm text-[#1e1e1e] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
              >
                {t.next}
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {openCreate && (
        <Modal title={t.new_application} onClose={() => setOpenCreate(false)} closeLabel={t.close}>
          <ApplicationForm
            key="create-form"
            busy={busyAction === -1}
            initial={{
              company: "",
              role: "",
              status: "APPLIED",
              appliedDate: todayISO(),
              notes: "",
              jobUrl: "",
              salary: "",
            }}
            onCancel={() => setOpenCreate(false)}
            onSubmit={(payload) => onCreate(payload)}
            labels={t}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {openEditFor && (
        <Modal title={t.applications_edit_title} onClose={() => setOpenEditFor(null)} closeLabel={t.close}>
          <ApplicationForm
            key={`edit-form-${openEditFor.id}`}
            busy={busyAction === openEditFor.id}
            initial={{
              company: openEditFor.company ?? "",
              role: openEditFor.role ?? "",
              status: openEditFor.status,
              appliedDate: safeISODate(openEditFor.appliedDate),
              notes: openEditFor.notes ?? "",
              jobUrl: openEditFor.jobUrl ?? "",
              salary: openEditFor.salary ?? "",
            }}
            onCancel={() => setOpenEditFor(null)}
            onSubmit={(payload) => onEdit(openEditFor.id, payload)}
            labels={t}
          />
        </Modal>
      )}

      {/* Status quick modal */}
      {openStatusFor && (
        <Modal title={t.applications_change_status_title} onClose={() => setOpenStatusFor(null)} closeLabel={t.close}>
          <div className="space-y-3">
            <div className="text-sm text-[#6e6e73] dark:text-[#98989d]">
              <span className="font-medium text-[#1e1e1e] dark:text-[#f5f5f7]">{openStatusFor.company}</span> —{" "}
              {openStatusFor.role}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onChangeStatus(openStatusFor, opt.value)}
                  disabled={busyAction === openStatusFor.id}
                  className={[
                    "h-11 rounded-md px-3 text-sm font-medium flex items-center justify-between",
                    "bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60",
                  ].join(" ")}
                >
                  <span className="text-[#1e1e1e] dark:text-[#f5f5f7]">{opt.label}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLOR[opt.value]}`}>
                    {statusLabels[opt.value]}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setOpenStatusFor(null)}
                className="h-10 px-4 rounded-md bg-[#6e6e73] text-white text-sm font-medium hover:brightness-95"
              >
                {t.close}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <Modal title={t.applications_delete_title} onClose={() => setConfirmDelete(null)} closeLabel={t.close}>
          <div className="space-y-4">
            <div className="text-sm text-[#6e6e73] dark:text-[#98989d]">
              {t.applications_delete_confirm(confirmDelete.company, confirmDelete.role)}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="h-10 px-4 rounded-md bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-sm text-[#1e1e1e] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => onDelete(confirmDelete)}
                disabled={busyAction === confirmDelete.id}
                className="h-10 px-4 rounded-md bg-[#ff3b30] text-white text-sm font-medium hover:brightness-95 disabled:opacity-60"
              >
                {busyAction === confirmDelete.id ? t.applications_busy_deleting : t.delete}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Small components ---------- */

function CompanyLogo({ company }: { company: string }) {
  const logoCandidates = useMemo(() => resolveCompanyLogoUrls(company), [company]);
  const [logoState, setLogoState] = useState<{ company: string; index: number }>({
    company,
    index: 0,
  });

  const candidateIndex = logoState.company === company ? logoState.index : 0;
  const logoUrl = logoCandidates[candidateIndex];
  if (!logoUrl) return null;

  return (
    <img
      src={logoUrl}
      alt={`${company} logo`}
      className="w-6 h-6 rounded-md border border-black/10 dark:border-white/10 bg-white object-contain p-0.5 shrink-0"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() =>
        setLogoState((prev) => ({
          company,
          index: (prev.company === company ? prev.index : 0) + 1,
        }))
      }
    />
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        // base
        "px-3 py-1.5 rounded-full text-sm shadow-sm transition-colors",
        "border",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",

        // ✅ ativo mantém como estava
        active
          ? "bg-[#1e1e1e] text-white border-[#1e1e1e]"
          : // ✅ inativo com contraste garantido (fundo claro + texto escuro)
            "bg-white dark:bg-[#2c2c2e] text-[#1e1e1e] dark:text-[#f5f5f7] border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/20 dark:hover:border-white/20",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Modal({
  title,
  children,
  onClose,
  closeLabel = "Close",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  closeLabel?: string;
}) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-[560px] bg-white dark:bg-[#2c2c2e] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.22)] overflow-hidden animate-[modalIn_160ms_ease-out]">
        <div className="h-14 px-5 flex items-center justify-between border-b border-black/5 dark:border-white/5">
          <div className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7]">{title}</div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#1e1e1e] dark:text-[#f5f5f7]"
            aria-label={closeLabel}
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

type FormInitial = {
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: string;
  notes?: string;
  jobUrl?: string;
  salary?: string;
};

function ApplicationForm({
  busy,
  initial,
  onCancel,
  onSubmit,
  labels,
}: {
  busy: boolean;
  initial: FormInitial;
  onCancel: () => void;
  onSubmit: (payload: Omit<Application, "id">) => void;
  labels: Translations;
}) {
  const [company, setCompany] = useState(initial.company);
  const [role, setRole] = useState(initial.role);
  const [status, setStatus] = useState<ApplicationStatus>(initial.status);
  const [appliedDate, setAppliedDate] = useState<string>(safeISODate(initial.appliedDate));
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [jobUrl, setJobUrl] = useState(initial.jobUrl ?? "");
  const [salary, setSalary] = useState(initial.salary ?? "");

  const canSave =
    company.trim().length > 0 && role.trim().length > 0 && appliedDate.trim().length > 0;
  const formStatusOptions: { value: ApplicationStatus; label: string }[] = [
    { value: "APPLIED", label: labels.status_applied },
    { value: "INTERVIEW", label: labels.status_interview },
    { value: "OFFER", label: labels.status_offer },
    { value: "REJECTED", label: labels.status_rejected },
  ];

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSave || busy) return;

        onSubmit({
          company: company.trim(),
          role: role.trim(),
          status,
          appliedDate,
          notes: notes.trim() || null,
          jobUrl: jobUrl.trim() || null,
          salary: salary.trim() || null,
        });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label={labels.company_required}>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="h-10 w-full rounded-md border border-black/10 dark:border-white/10 px-3 text-sm outline-none focus:border-black/20 bg-white dark:bg-[#3a3a3c] text-[#1e1e1e] dark:text-[#f5f5f7]"
            placeholder="Ex: Amazon"
            required
          />
        </Field>

        <Field label={labels.role_required}>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-10 w-full rounded-md border border-black/10 dark:border-white/10 px-3 text-sm outline-none focus:border-black/20 bg-white dark:bg-[#3a3a3c] text-[#1e1e1e] dark:text-[#f5f5f7]"
            placeholder="Ex: Backend Intern"
            required
          />
        </Field>

        <Field label={labels.status}>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
            className="h-10 w-full rounded-md border border-black/10 dark:border-white/10 px-3 text-sm outline-none focus:border-black/20 bg-white dark:bg-[#3a3a3c] text-[#1e1e1e] dark:text-[#f5f5f7]"
          >
            {formStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={labels.applied_date}>
          <input
            type="date"
            value={appliedDate}
            onChange={(e) => setAppliedDate(e.target.value)}
            className="h-10 w-full rounded-md border border-black/10 dark:border-white/10 px-3 text-sm outline-none focus:border-black/20 bg-white dark:bg-[#3a3a3c] text-[#1e1e1e] dark:text-[#f5f5f7]"
          />
        </Field>

        <Field label={labels.salary}>
          <input
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="h-10 w-full rounded-md border border-black/10 dark:border-white/10 px-3 text-sm outline-none focus:border-black/20 bg-white dark:bg-[#3a3a3c] text-[#1e1e1e] dark:text-[#f5f5f7] placeholder:text-[#6e6e73] dark:placeholder:text-[#98989d]"
            placeholder={labels.salary_placeholder}
          />
        </Field>

        <Field label={labels.job_url}>
          <input
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            type="url"
            className="h-10 w-full rounded-md border border-black/10 dark:border-white/10 px-3 text-sm outline-none focus:border-black/20 bg-white dark:bg-[#3a3a3c] text-[#1e1e1e] dark:text-[#f5f5f7] placeholder:text-[#6e6e73] dark:placeholder:text-[#98989d]"
            placeholder={labels.job_url_placeholder}
          />
        </Field>
      </div>

      <Field label={labels.notes}>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-black/10 dark:border-white/10 px-3 py-2 text-sm outline-none focus:border-black/20 bg-white dark:bg-[#3a3a3c] text-[#1e1e1e] dark:text-[#f5f5f7] placeholder:text-[#6e6e73] dark:placeholder:text-[#98989d] resize-none"
          placeholder={labels.notes_placeholder}
        />
      </Field>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 px-4 rounded-md bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-sm text-[#1e1e1e] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5"
          disabled={busy}
        >
          {labels.cancel}
        </button>
        <button
          type="submit"
          disabled={!canSave || busy}
          className="h-10 px-4 rounded-md bg-[#0071e3] text-white text-sm font-medium hover:brightness-95 disabled:opacity-60"
        >
          {busy ? labels.applications_busy_saving : labels.save}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-[#1e1e1e] dark:text-[#f5f5f7] mb-1">{label}</div>
      {children}
    </label>
  );
}

function PageNumbers({
  page,
  totalPages,
  onGo,
}: {
  page: number;
  totalPages: number;
  onGo: (p: number) => void;
}) {
  const pages = useMemo(() => {
    const current = page + 1;
    const max = totalPages;

    const out: (number | "...")[] = [];
    const push = (v: number | "...") => out.push(v);

    const addRange = (start: number, end: number) => {
      for (let i = start; i <= end; i++) push(i);
    };

    if (max <= 7) {
      addRange(1, max);
      return out;
    }

    push(1);

    const left = Math.max(2, current - 1);
    const right = Math.min(max - 1, current + 1);

    if (left > 2) push("...");
    addRange(left, right);
    if (right < max - 1) push("...");

    push(max);
    return out;
  }, [page, totalPages]);

  return (
    <div className="flex items-center gap-1">
      {pages.map((p, idx) => {
        if (p === "...") {
          return (
            <span key={`dots-${idx}`} className="px-2 text-[#6e6e73] dark:text-[#98989d]">
              ...
            </span>
          );
        }

        const isActive = p === page + 1;
        return (
          <button
            key={p}
            onClick={() => onGo(p - 1)}
            className={[
              "h-9 min-w-9 px-2 rounded-md text-sm border",
              isActive
                ? "bg-[#1e1e1e] text-white border-[#1e1e1e]"
                : "bg-white dark:bg-[#2c2c2e] text-[#1e1e1e] dark:text-[#f5f5f7] border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5",
            ].join(" ")}
          >
            {p}
          </button>
        );
      })}
    </div>
  );
}
