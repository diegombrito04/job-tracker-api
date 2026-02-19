import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import type {
  Application,
  ApplicationPriority,
  ApplicationStatus,
  StatusHistoryEntry,
} from "../lib/types";
import { useSearch } from "../context/SearchContext";
import { useTranslation, useUser, type Translations } from "../context/UserContext";
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

type SortOption =
  | "appliedDate,desc"
  | "appliedDate,asc"
  | "company,asc"
  | "priority,desc"
  | "followUpDate,asc";

type ViewMode = "grid" | "kanban";

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

const PRIORITY_COLOR: Record<ApplicationPriority, string> = {
  HIGH: "bg-[#ff3b30]/15 text-[#ff3b30]",
  MEDIUM: "bg-[#ff9500]/15 text-[#d97b00]",
  LOW: "bg-[#34c759]/15 text-[#1f8f46]",
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

function compareDateOnly(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);
  return target.getTime() - today.getTime();
}

function getFollowUpKind(followUpDate?: string | null): "overdue" | "today" | "future" | null {
  if (!followUpDate) return null;
  const delta = compareDateOnly(followUpDate);
  if (delta < 0) return "overdue";
  if (delta === 0) return "today";
  return "future";
}

function formatDateTimeLocalized(isoDateTime: string, language: "pt" | "en") {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return isoDateTime;

  return new Intl.DateTimeFormat(language === "en" ? "en-US" : "pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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

function csvCell(value: unknown): string {
  const raw = value == null ? "" : String(value);
  if (!/[",\n\r]/.test(raw)) return raw;
  return `"${raw.replace(/"/g, "\"\"")}"`;
}

function toApplicationsCsv(apps: Application[]): string {
  const header = [
    "company",
    "role",
    "status",
    "priority",
    "appliedDate",
    "followUpDate",
    "salary",
    "jobUrl",
    "notes",
  ];

  const lines = apps.map((app) =>
    [
      app.company ?? "",
      app.role ?? "",
      app.status ?? "APPLIED",
      app.priority ?? "MEDIUM",
      app.appliedDate ?? "",
      app.followUpDate ?? "",
      app.salary ?? "",
      app.jobUrl ?? "",
      app.notes ?? "",
    ]
      .map(csvCell)
      .join(",")
  );

  return [header.join(","), ...lines].join("\n");
}

type JsonBackupPayload = {
  version: number;
  exportedAt: string;
  applications: Array<{
    company: string;
    role: string;
    status: ApplicationStatus;
    priority: ApplicationPriority;
    appliedDate: string;
    followUpDate: string | null;
    salary: string | null;
    jobUrl: string | null;
    notes: string | null;
  }>;
};

function toApplicationsJsonBackup(apps: Application[]): string {
  const payload: JsonBackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    applications: apps.map((app) => ({
      company: app.company ?? "",
      role: app.role ?? "",
      status: app.status ?? "APPLIED",
      priority: app.priority ?? "MEDIUM",
      appliedDate: app.appliedDate ?? todayISO(),
      followUpDate: app.followUpDate ?? null,
      salary: app.salary ?? null,
      jobUrl: app.jobUrl ?? null,
      notes: app.notes ?? null,
    })),
  };

  return JSON.stringify(payload, null, 2);
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === "\"") {
        if (text[i + 1] === "\"") {
          field += "\"";
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === "\"") {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (char === "\r") continue;
    field += char;
  }

  row.push(field);
  rows.push(row);

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function normalizeStatusValue(value: string): ApplicationStatus | null {
  const normalized = value.trim().toUpperCase();
  const map: Record<string, ApplicationStatus> = {
    APPLIED: "APPLIED",
    APLICADA: "APPLIED",
    INTERVIEW: "INTERVIEW",
    ENTREVISTA: "INTERVIEW",
    OFFER: "OFFER",
    OFERTA: "OFFER",
    REJECTED: "REJECTED",
    REJEITADA: "REJECTED",
  };
  return map[normalized] ?? null;
}

function normalizePriorityValue(value: string): ApplicationPriority {
  const normalized = value.trim().toUpperCase();
  const map: Record<string, ApplicationPriority> = {
    HIGH: "HIGH",
    ALTA: "HIGH",
    MEDIUM: "MEDIUM",
    MEDIA: "MEDIUM",
    "MÉDIA": "MEDIUM",
    LOW: "LOW",
    BAIXA: "LOW",
  };
  return map[normalized] ?? "MEDIUM";
}

function normalizeDateValue(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const brMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const [, dd, mm, yyyy] = brMatch;
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

function normalizeStatusFromUnknown(value: unknown): ApplicationStatus | null {
  if (typeof value !== "string") return null;
  return normalizeStatusValue(value);
}

function normalizePriorityFromUnknown(value: unknown): ApplicationPriority {
  if (typeof value !== "string") return "MEDIUM";
  return normalizePriorityValue(value);
}

function normalizeStringFromUnknown(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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
  followUpDue?: boolean;
  followUpOverdue?: boolean;
}): Promise<PageResponse<Application>> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  qs.set("size", String(params.size));
  qs.set("sort", params.sort);
  if (params.status) qs.set("status", params.status);
  if (params.followUpDue) qs.set("followUpDue", "true");
  if (params.followUpOverdue) qs.set("followUpOverdue", "true");

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

async function listStatusHistory(id: number): Promise<StatusHistoryEntry[]> {
  return api<StatusHistoryEntry[]>(`/applications/${id}/history`);
}

/** Toasts */
type Toast = { id: string; type: "success" | "error" | "info"; title: string; message?: string };
function toastColors(t: Toast["type"]) {
  if (t === "success") return "border-[#30d158] bg-white dark:bg-[#2c2c2e]";
  if (t === "error") return "border-[#ff3b30] bg-white dark:bg-[#2c2c2e]";
  return "border-[#0071e3] bg-white dark:bg-[#2c2c2e]";
}

export function ApplicationsPage() {
  const location = useLocation();
  const t = useTranslation();
  const { profile } = useUser();
  const initialDueOnly = useMemo(
    () => new URLSearchParams(location.search).get("due") === "1",
    [location.search]
  );
  const initialOverdueOnly = useMemo(
    () => new URLSearchParams(location.search).get("overdue") === "1",
    [location.search]
  );
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL");

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apps, setApps] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasAnyApplications, setHasAnyApplications] = useState(false);
  const hasLoadedOnceRef = useRef(false);

  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [size] = useState(12);

  const [sort, setSort] = useState<SortOption>("appliedDate,desc");
  const [followUpDueOnly, setFollowUpDueOnly] = useState(initialDueOnly);
  const [followUpOverdueOnly, setFollowUpOverdueOnly] = useState(initialOverdueOnly);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

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
  const priorityLabels: Record<ApplicationPriority, string> = useMemo(
    () => ({
      LOW: t.priority_low,
      MEDIUM: t.priority_medium,
      HIGH: t.priority_high,
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
  const [openHistoryFor, setOpenHistoryFor] = useState<Application | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Application | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<StatusHistoryEntry[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isJsonExporting, setIsJsonExporting] = useState(false);
  const [isJsonImporting, setIsJsonImporting] = useState(false);
  const importFileRef = useRef<HTMLInputElement | null>(null);
  const importJsonFileRef = useRef<HTMLInputElement | null>(null);

  const [busyAction, setBusyAction] = useState<number | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = (t: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [{ id, ...t }, ...prev].slice(0, 4));
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3000);
  };

  useEffect(() => {
    const dueFromUrl = new URLSearchParams(location.search).get("due") === "1";
    const overdueFromUrl = new URLSearchParams(location.search).get("overdue") === "1";
    setFollowUpDueOnly(dueFromUrl);
    setFollowUpOverdueOnly(overdueFromUrl);
  }, [location.search]);

  // Reset page when filters/sort change
  useEffect(() => {
    setPage(0);
  }, [statusParam, sort, followUpDueOnly, followUpOverdueOnly]);

  // Centralizei o reload pra não repetir lógica e evitar bugs
  async function reload(opts?: { pageOverride?: number }) {
    const targetPage = opts?.pageOverride ?? page;
    const softLoad = hasLoadedOnceRef.current;

    if (softLoad) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [data, totalData] = await Promise.all([
        listApplications({
          page: targetPage,
          size,
          sort,
          status: statusParam,
          followUpDue: followUpDueOnly,
          followUpOverdue: followUpOverdueOnly,
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
      hasLoadedOnceRef.current = true;
    } catch (error: unknown) {
      setError(getErrorMessage(error, t.applications_error_fetch));
    } finally {
      if (softLoad) setIsRefreshing(false);
      else setLoading(false);
    }
  }

  // Load data
  useEffect(() => {
    let alive = true;

    async function load() {
      const softLoad = hasLoadedOnceRef.current;
      if (softLoad) setIsRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const [data, totalData] = await Promise.all([
        listApplications({
          page,
          size,
          sort,
          status: statusParam,
          followUpDue: followUpDueOnly,
          followUpOverdue: followUpOverdueOnly,
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
        hasLoadedOnceRef.current = true;
      } catch (error: unknown) {
        if (!alive) return;
        setError(getErrorMessage(error, t.applications_error_fetch));
      } finally {
        if (alive) {
          if (softLoad) setIsRefreshing(false);
          else setLoading(false);
        }
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [page, size, sort, statusParam, followUpDueOnly, followUpOverdueOnly, t.applications_error_fetch]);

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter((a) => {
      const company = (a.company ?? "").toLowerCase();
      const role = (a.role ?? "").toLowerCase();
      return company.includes(q) || role.includes(q);
    });
  }, [apps, search]);
  const showFirstApplicationCta =
    !loading && !isRefreshing && !error && total === 0 && !hasAnyApplications;
  const showNoResultsCard =
    !loading &&
    !isRefreshing &&
    !error &&
    !showFirstApplicationCta &&
    (total === 0 || filteredApps.length === 0);
  const noResultsDescription =
    total === 0 ? t.applications_no_match_filters : t.applications_not_found_desc;
  const kanbanColumns = useMemo<Array<{ status: ApplicationStatus; title: string }>>(
    () => [
      { status: "APPLIED", title: t.status_applied },
      { status: "INTERVIEW", title: t.status_interview },
      { status: "OFFER", title: t.status_offer },
      { status: "REJECTED", title: t.status_rejected },
    ],
    [t.status_applied, t.status_interview, t.status_offer, t.status_rejected]
  );
  const kanbanByStatus = useMemo(
    () =>
      kanbanColumns.reduce<Record<ApplicationStatus, Application[]>>(
        (acc, column) => {
          acc[column.status] = filteredApps.filter((app) => app.status === column.status);
          return acc;
        },
        { APPLIED: [], INTERVIEW: [], OFFER: [], REJECTED: [] }
      ),
    [filteredApps, kanbanColumns]
  );

  async function onCreate(payload: Omit<Application, "id">) {
    try {
      setBusyAction(-1);

      const cleanPayload: Omit<Application, "id"> = {
        company: payload.company.trim(),
        role: payload.role.trim(),
        status: payload.status,
        priority: payload.priority ?? "MEDIUM",
        appliedDate: payload.appliedDate,
        followUpDate: payload.followUpDate || null,
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
        priority: payload.priority ?? "MEDIUM",
        appliedDate: payload.appliedDate,
        followUpDate: payload.followUpDate || null,
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

  async function onOpenHistory(app: Application) {
    setOpenHistoryFor(app);
    setHistoryLoading(true);
    setHistoryError(null);
    setHistoryItems([]);

    try {
      const history = await listStatusHistory(app.id);
      setHistoryItems(history);
    } catch (error: unknown) {
      setHistoryError(getErrorMessage(error, t.applications_history_error));
    } finally {
      setHistoryLoading(false);
    }
  }

  async function onDropStatus(app: Application, targetStatus: ApplicationStatus) {
    if (app.status === targetStatus) return;
    const previous = app.status;

    setApps((prev) =>
      prev.map((item) => (item.id === app.id ? { ...item, status: targetStatus } : item))
    );

    try {
      setBusyAction(app.id);
      await patchStatus(app.id, targetStatus);
      pushToast({
        type: "success",
        title: t.applications_status_updated_title,
        message: t.applications_status_updated_msg(statusLabels[targetStatus]),
      });
      await reload();
    } catch (error: unknown) {
      setApps((prev) => prev.map((item) => (item.id === app.id ? { ...item, status: previous } : item)));
      pushToast({
        type: "error",
        title: t.applications_error_update_status,
        message: getErrorMessage(error, t.applications_error_retry),
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function fetchAllForExport(): Promise<Application[]> {
    const sizeForExport = 100;
    let exportPage = 0;
    let exportTotalPages = 1;
    const all: Application[] = [];

    while (exportPage < exportTotalPages) {
      const data = await listApplications({
        page: exportPage,
        size: sizeForExport,
        sort,
        status: statusParam,
        followUpDue: followUpDueOnly,
        followUpOverdue: followUpOverdueOnly,
      });
      all.push(...data.content);
      exportTotalPages = Math.max(data.totalPages, 1);
      exportPage += 1;
    }

    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter((a) => {
      const company = (a.company ?? "").toLowerCase();
      const role = (a.role ?? "").toLowerCase();
      return company.includes(q) || role.includes(q);
    });
  }

  async function onExportCsv() {
    setIsExporting(true);
    try {
      const all = await fetchAllForExport();
      if (all.length === 0) {
        pushToast({ type: "info", title: t.applications_export_empty });
        return;
      }

      const csv = toApplicationsCsv(all);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `job-tracker-applications-${todayISO()}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      pushToast({ type: "success", title: t.applications_export_success(all.length) });
    } catch (error: unknown) {
      pushToast({
        type: "error",
        title: t.applications_error_fetch,
        message: getErrorMessage(error, t.applications_error_retry),
      });
    } finally {
      setIsExporting(false);
    }
  }

  function onImportClick() {
    importFileRef.current?.click();
  }

  function onImportJsonClick() {
    importJsonFileRef.current?.click();
  }

  async function onImportCsvFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length < 2) {
        throw new Error(t.applications_import_file_invalid);
      }

      const header = rows[0].map((h) => h.trim().toLowerCase());
      const findHeaderIndex = (...names: string[]) =>
        names.map((n) => header.indexOf(n)).find((idx) => idx >= 0) ?? -1;
      const idx = {
        company: findHeaderIndex("company", "empresa"),
        role: findHeaderIndex("role", "vaga", "cargo"),
        status: findHeaderIndex("status"),
        priority: findHeaderIndex("priority", "prioridade"),
        appliedDate: findHeaderIndex("applieddate", "applied_date", "data_aplicacao"),
        followUpDate: findHeaderIndex("followupdate", "follow_up_date", "data_followup"),
        salary: findHeaderIndex("salary", "salario"),
        jobUrl: findHeaderIndex("joburl", "job_url", "url_vaga"),
        notes: findHeaderIndex("notes", "observacoes", "observações"),
      };

      if (idx.company < 0 || idx.role < 0 || idx.status < 0) {
        throw new Error(t.applications_import_file_invalid);
      }

      const toCreate: Omit<Application, "id">[] = [];
      for (const row of rows.slice(1)) {
        const company = (row[idx.company] ?? "").trim();
        const role = (row[idx.role] ?? "").trim();
        const status = normalizeStatusValue(row[idx.status] ?? "");
        if (!company || !role || !status) continue;

        const priority = normalizePriorityValue(row[idx.priority] ?? "");
        const appliedDate = normalizeDateValue(row[idx.appliedDate] ?? "") ?? todayISO();
        const followUpDate = normalizeDateValue(row[idx.followUpDate] ?? "");
        const salary = (row[idx.salary] ?? "").trim();
        const jobUrl = (row[idx.jobUrl] ?? "").trim();
        const notes = row[idx.notes] ?? "";

        toCreate.push({
          company,
          role,
          status,
          priority,
          appliedDate,
          followUpDate,
          salary: salary || null,
          jobUrl: jobUrl || null,
          notes: notes.trim() || null,
        });
      }

      if (toCreate.length === 0) {
        throw new Error(t.applications_import_file_invalid);
      }

      let created = 0;
      let skipped = 0;
      for (const payload of toCreate) {
        try {
          await createApplication(payload);
          created += 1;
        } catch {
          skipped += 1;
        }
      }

      if (created > 0) await reload({ pageOverride: 0 });
      pushToast({ type: "success", title: t.applications_import_success(created, skipped) });
    } catch (error: unknown) {
      pushToast({
        type: "error",
        title: t.applications_import_error,
        message: getErrorMessage(error, t.applications_import_file_invalid),
      });
    } finally {
      setIsImporting(false);
    }
  }

  async function onExportJson() {
    setIsJsonExporting(true);
    try {
      const all = await fetchAllForExport();
      if (all.length === 0) {
        pushToast({ type: "info", title: t.applications_export_empty });
        return;
      }

      const backup = toApplicationsJsonBackup(all);
      const blob = new Blob([backup], { type: "application/json;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `job-tracker-backup-${todayISO()}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      pushToast({ type: "success", title: t.applications_export_json_success(all.length) });
    } catch (error: unknown) {
      pushToast({
        type: "error",
        title: t.applications_error_fetch,
        message: getErrorMessage(error, t.applications_error_retry),
      });
    } finally {
      setIsJsonExporting(false);
    }
  }

  async function onImportJsonFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsJsonImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;

      const rawApps = Array.isArray(parsed)
        ? parsed
        : typeof parsed === "object" && parsed !== null && Array.isArray((parsed as JsonBackupPayload).applications)
          ? (parsed as JsonBackupPayload).applications
          : null;

      if (!rawApps || rawApps.length === 0) {
        throw new Error(t.applications_import_json_invalid);
      }

      const payloads: Omit<Application, "id">[] = [];
      for (const item of rawApps) {
        if (typeof item !== "object" || item === null) continue;

        const raw = item as Record<string, unknown>;
        const company = normalizeStringFromUnknown(raw.company);
        const role = normalizeStringFromUnknown(raw.role);
        const status = normalizeStatusFromUnknown(raw.status);
        if (!company || !role || !status) continue;

        const appliedDate = normalizeDateValue(normalizeStringFromUnknown(raw.appliedDate)) ?? todayISO();
        const followUpDate = normalizeDateValue(normalizeStringFromUnknown(raw.followUpDate));
        const salary = normalizeStringFromUnknown(raw.salary);
        const jobUrl = normalizeStringFromUnknown(raw.jobUrl);
        const notes = normalizeStringFromUnknown(raw.notes);

        payloads.push({
          company,
          role,
          status,
          priority: normalizePriorityFromUnknown(raw.priority),
          appliedDate,
          followUpDate,
          salary: salary || null,
          jobUrl: jobUrl || null,
          notes: notes || null,
        });
      }

      if (payloads.length === 0) {
        throw new Error(t.applications_import_json_invalid);
      }

      let created = 0;
      let skipped = 0;
      for (const payload of payloads) {
        try {
          await createApplication(payload);
          created += 1;
        } catch {
          skipped += 1;
        }
      }

      if (created > 0) await reload({ pageOverride: 0 });
      pushToast({
        type: "success",
        title: t.applications_import_json_success(created, skipped),
      });
    } catch (error: unknown) {
      pushToast({
        type: "error",
        title: t.applications_import_json_error,
        message: getErrorMessage(error, t.applications_import_json_invalid),
      });
    } finally {
      setIsJsonImporting(false);
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
            {loading || isRefreshing ? t.loading : t.applications_registered(total)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <input
            ref={importFileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => void onImportCsvFile(e)}
          />
          <input
            ref={importJsonFileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => void onImportJsonFile(e)}
          />

          <button
            onClick={() => void onExportCsv()}
            disabled={isImporting || isExporting || isJsonExporting || isJsonImporting || loading}
            className="h-10 px-4 rounded-md bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-[#1e1e1e] dark:text-[#f5f5f7] text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60 transition-all duration-200 active:scale-[0.98]"
          >
            {isExporting ? t.applications_exporting : t.applications_export_csv}
          </button>

          <button
            onClick={onImportClick}
            disabled={isImporting || isExporting || isJsonExporting || isJsonImporting || loading}
            className="h-10 px-4 rounded-md bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-[#1e1e1e] dark:text-[#f5f5f7] text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60 transition-all duration-200 active:scale-[0.98]"
          >
            {isImporting ? t.applications_importing : t.applications_import_csv}
          </button>

          <button
            onClick={() => void onExportJson()}
            disabled={isImporting || isExporting || isJsonExporting || isJsonImporting || loading}
            className="h-10 px-4 rounded-md bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-[#1e1e1e] dark:text-[#f5f5f7] text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60 transition-all duration-200 active:scale-[0.98]"
          >
            {isJsonExporting ? t.applications_exporting : t.applications_export_json}
          </button>

          <button
            onClick={onImportJsonClick}
            disabled={isImporting || isExporting || isJsonExporting || isJsonImporting || loading}
            className="h-10 px-4 rounded-md bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-[#1e1e1e] dark:text-[#f5f5f7] text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60 transition-all duration-200 active:scale-[0.98]"
          >
            {isJsonImporting ? t.applications_importing : t.applications_import_json}
          </button>

          <button
            onClick={() => setOpenCreate(true)}
            className="h-10 px-4 rounded-md bg-[#0071e3] text-white text-sm font-medium hover:brightness-95 transition-all duration-200 active:scale-[0.98]"
          >
            + {t.new_application}
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            active={statusFilter === "ALL"}
            onClick={() => setStatusFilter("ALL")}
            disabled={isRefreshing}
          >
            {t.applications_filter_all}
          </FilterChip>
          <FilterChip
            active={statusFilter === "APPLIED"}
            onClick={() => setStatusFilter("APPLIED")}
            disabled={isRefreshing}
          >
            {t.applied}
          </FilterChip>
          <FilterChip
            active={statusFilter === "INTERVIEW"}
            onClick={() => setStatusFilter("INTERVIEW")}
            disabled={isRefreshing}
          >
            {t.interview}
          </FilterChip>
          <FilterChip
            active={statusFilter === "OFFER"}
            onClick={() => setStatusFilter("OFFER")}
            disabled={isRefreshing}
          >
            {t.offers}
          </FilterChip>
          <FilterChip
            active={statusFilter === "REJECTED"}
            onClick={() => setStatusFilter("REJECTED")}
            disabled={isRefreshing}
          >
            {t.rejected}
          </FilterChip>
          <FilterChip
            active={followUpDueOnly}
            onClick={() =>
              setFollowUpDueOnly((prev) => {
                const next = !prev;
                if (next) setFollowUpOverdueOnly(false);
                return next;
              })
            }
            disabled={isRefreshing}
          >
            {t.applications_followup_due_only}
          </FilterChip>
          <FilterChip
            active={followUpOverdueOnly}
            onClick={() =>
              setFollowUpOverdueOnly((prev) => {
                const next = !prev;
                if (next) setFollowUpDueOnly(false);
                return next;
              })
            }
            disabled={isRefreshing}
          >
            {t.applications_followup_overdue_only}
          </FilterChip>
          <div className="inline-flex rounded-md border border-black/10 dark:border-white/10 overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={[
                "h-8 px-3 text-sm transition-colors",
                viewMode === "grid"
                  ? "bg-[#1e1e1e] text-white"
                  : "bg-white dark:bg-[#2c2c2e] text-[#1e1e1e] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5",
              ].join(" ")}
            >
              {t.applications_view_grid}
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={[
                "h-8 px-3 text-sm border-l border-black/10 dark:border-white/10 transition-colors",
                viewMode === "kanban"
                  ? "bg-[#1e1e1e] text-white"
                  : "bg-white dark:bg-[#2c2c2e] text-[#1e1e1e] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5",
              ].join(" ")}
            >
              {t.applications_view_kanban}
            </button>
          </div>
          <div
            className={[
              "text-xs text-[#6e6e73] dark:text-[#98989d] transition-opacity duration-200",
              isRefreshing ? "opacity-100" : "opacity-0",
            ].join(" ")}
            aria-live="polite"
          >
            {t.loading}...
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="bg-white dark:bg-[#2c2c2e] rounded-md shadow-sm border border-black/5 dark:border-white/5 h-10 px-3 flex items-center gap-2">
              <span className="text-[#6e6e73] dark:text-[#98989d] text-sm">{t.applications_sort_by}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                disabled={isRefreshing}
                className="text-sm outline-none bg-transparent text-[#1e1e1e] dark:text-[#f5f5f7]"
                aria-label={t.applications_sort_by}
              >
                <option value="appliedDate,desc">{t.applications_sort_date_desc}</option>
                <option value="appliedDate,asc">{t.applications_sort_date_asc}</option>
                <option value="company,asc">{t.applications_sort_company_asc}</option>
                <option value="priority,desc">{t.applications_sort_priority_desc}</option>
                <option value="followUpDate,asc">{t.applications_sort_follow_up_asc}</option>
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

          <div className="flex items-center gap-2">
            <div className="text-sm text-[#6e6e73] dark:text-[#98989d]">
              {t.applications_page_of(page + 1, Math.max(totalPages, 1))}
            </div>
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
        <div className="relative">
          <div
            className={[
              "transition-opacity duration-200",
              isRefreshing ? "opacity-65 pointer-events-none select-none" : "opacity-100",
            ].join(" ")}
          >
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
                {(statusFilter !== "ALL" || followUpDueOnly || followUpOverdueOnly) && (
                  <button
                    onClick={() => {
                      setStatusFilter("ALL");
                      setFollowUpDueOnly(false);
                      setFollowUpOverdueOnly(false);
                    }}
                    className="h-10 px-4 rounded-md bg-[#0071e3] text-white text-sm font-medium hover:brightness-95"
                  >
                    {t.applications_clear_filters}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredApps.map((a) => (
                    <ApplicationCard
                      key={a.id}
                      app={a}
                      busyAction={busyAction}
                      statusLabels={statusLabels}
                      priorityLabels={priorityLabels}
                      labels={t}
                      onChangeStatus={() => setOpenStatusFor(a)}
                      onOpenHistory={() => void onOpenHistory(a)}
                      onEdit={() => setOpenEditFor(a)}
                      onDelete={() => setConfirmDelete(a)}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                  {kanbanColumns.map((column) => {
                    const columnApps = kanbanByStatus[column.status] ?? [];
                    return (
                      <div
                        key={column.status}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          const rawId = event.dataTransfer.getData("text/plain");
                          const appId = Number(rawId);
                          if (!Number.isFinite(appId)) return;
                          const dragged = filteredApps.find((item) => item.id === appId);
                          if (!dragged) return;
                          void onDropStatus(dragged, column.status);
                        }}
                        className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#2c2c2e]/70 p-3 min-h-[280px]"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-semibold text-sm text-[#1e1e1e] dark:text-[#f5f5f7]">
                            {column.title}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[column.status]}`}>
                            {columnApps.length}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {columnApps.length === 0 && (
                            <div className="text-xs text-[#6e6e73] dark:text-[#98989d] border border-dashed border-black/10 dark:border-white/10 rounded-lg p-3">
                              {t.applications_kanban_empty}
                            </div>
                          )}
                          {columnApps.map((a) => (
                            <div
                              key={a.id}
                              draggable
                              onDragStart={(event) => {
                                event.dataTransfer.setData("text/plain", String(a.id));
                                event.dataTransfer.effectAllowed = "move";
                              }}
                              className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#2c2c2e] p-3 cursor-grab active:cursor-grabbing shadow-sm"
                            >
                              <ApplicationCard
                                app={a}
                                compact
                                busyAction={busyAction}
                                statusLabels={statusLabels}
                                priorityLabels={priorityLabels}
                                labels={t}
                                onChangeStatus={() => setOpenStatusFor(a)}
                                onOpenHistory={() => void onOpenHistory(a)}
                                onEdit={() => setOpenEditFor(a)}
                                onDelete={() => setConfirmDelete(a)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {total > 0 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading || isRefreshing}
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
                disabled={page >= totalPages - 1 || loading || isRefreshing || totalPages === 0}
                className="h-9 px-3 rounded-md bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-sm text-[#1e1e1e] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
              >
                {t.next}
              </button>
            </div>
          )}
          </div>

          {isRefreshing && (
            <div className="absolute right-2 top-2 flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#1f1f21]/90 px-3 py-1.5 text-xs text-[#6e6e73] dark:text-[#98989d] backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#0071e3] animate-pulse" />
              {t.loading}
            </div>
          )}
        </div>
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
              priority: "MEDIUM",
              appliedDate: todayISO(),
              followUpDate: "",
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
              priority: openEditFor.priority ?? "MEDIUM",
              appliedDate: safeISODate(openEditFor.appliedDate),
              followUpDate: openEditFor.followUpDate ? safeISODate(openEditFor.followUpDate) : "",
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

      {/* Status history modal */}
      {openHistoryFor && (
        <Modal title={t.applications_history_title} onClose={() => setOpenHistoryFor(null)} closeLabel={t.close}>
          <div className="space-y-3">
            <div className="text-sm text-[#6e6e73] dark:text-[#98989d]">
              <span className="font-medium text-[#1e1e1e] dark:text-[#f5f5f7]">{openHistoryFor.company}</span> —{" "}
              {openHistoryFor.role}
            </div>

            {historyLoading && (
              <div className="text-sm text-[#6e6e73] dark:text-[#98989d]">{t.applications_history_loading}</div>
            )}

            {!historyLoading && historyError && (
              <div className="text-sm text-[#ff3b30]">{historyError}</div>
            )}

            {!historyLoading && !historyError && historyItems.length === 0 && (
              <div className="text-sm text-[#6e6e73] dark:text-[#98989d]">{t.applications_history_empty}</div>
            )}

            {!historyLoading && !historyError && historyItems.length > 0 && (
              <div className="max-h-[360px] overflow-y-auto pr-1 space-y-2">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#2c2c2e] p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-[#1e1e1e] dark:text-[#f5f5f7]">
                        {item.fromStatus
                          ? `${statusLabels[item.fromStatus]} → ${statusLabels[item.toStatus]}`
                          : `${t.applications_history_initial}: ${statusLabels[item.toStatus]}`}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLOR[item.toStatus]}`}>
                        {statusLabels[item.toStatus]}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-[#6e6e73] dark:text-[#98989d]">
                      {formatDateTimeLocalized(item.changedAt, profile.language)}
                    </div>
                  </div>
                ))}
              </div>
            )}
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

function ApplicationCard({
  app,
  busyAction,
  statusLabels,
  priorityLabels,
  labels,
  onChangeStatus,
  onOpenHistory,
  onEdit,
  onDelete,
  compact = false,
}: {
  app: Application;
  busyAction: number | null;
  statusLabels: Record<ApplicationStatus, string>;
  priorityLabels: Record<ApplicationPriority, string>;
  labels: Translations;
  onChangeStatus: () => void;
  onOpenHistory: () => void;
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
}) {
  const followUpKind = getFollowUpKind(app.followUpDate);

  return (
    <div
      className={[
        compact
          ? "space-y-2"
          : "bg-white dark:bg-[#2c2c2e] rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] motion-safe:hover:-translate-y-0.5 transition-all duration-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-center gap-2">
          <CompanyLogo company={app.company} />
          <div className="font-semibold text-[#1e1e1e] dark:text-[#f5f5f7] truncate">{app.company}</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {app.jobUrl && (
            <a
              href={app.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-[#0071e3] hover:bg-[#0071e3]/10 transition-colors"
              title={labels.open_job_link}
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
          <button
            onClick={onChangeStatus}
            className={`text-xs px-2 py-1 rounded-full ${STATUS_COLOR[app.status]} hover:brightness-95`}
            title={labels.applications_change_status}
          >
            {statusLabels[app.status]}
          </button>
        </div>
      </div>

      <div className="mt-3 text-lg font-semibold text-[#1e1e1e] dark:text-[#f5f5f7] leading-tight">
        {app.role}
      </div>

      <div className="mt-2">
        <span
          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
            PRIORITY_COLOR[app.priority ?? "MEDIUM"]
          }`}
        >
          {labels.priority}: {priorityLabels[app.priority ?? "MEDIUM"]}
        </span>
      </div>

      {app.salary && (
        <div className="mt-2">
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#30d158]/15 text-[#1a8a3a] dark:bg-[#30d158]/20 dark:text-[#30d158] font-medium">
            💰 {app.salary}
          </span>
        </div>
      )}

      {app.followUpDate && (
        <div
          className={[
            "mt-2 text-xs font-medium",
            followUpKind === "overdue"
              ? "text-[#ff3b30]"
              : followUpKind === "today"
                ? "text-[#ff9500]"
                : "text-[#6e6e73] dark:text-[#98989d]",
          ].join(" ")}
        >
          {followUpKind === "overdue"
            ? labels.applications_followup_overdue
            : followUpKind === "today"
              ? labels.applications_followup_due_today
              : labels.applications_followup_due_on(formatDateBR(app.followUpDate))}
        </div>
      )}

      {app.notes && !compact && (
        <div className="mt-2 text-sm text-[#6e6e73] dark:text-[#98989d] line-clamp-2">
          {app.notes}
        </div>
      )}

      <div className="mt-3 text-sm text-[#6e6e73] dark:text-[#98989d]">
        {labels.applications_applied_on}{" "}
        <span className="font-medium text-[#1e1e1e] dark:text-[#f5f5f7]">
          {app.appliedDate ? formatDateBR(app.appliedDate) : "—"}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          onClick={onChangeStatus}
          disabled={busyAction === app.id}
          className="h-9 px-3 rounded-md bg-black/5 dark:bg-white/5 text-[#1e1e1e] dark:text-[#f5f5f7] text-sm hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-60"
        >
          {busyAction === app.id ? labels.applications_busy_updating : labels.applications_change_status}
        </button>

        <button
          onClick={onOpenHistory}
          className="h-9 px-3 rounded-md bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-[#1e1e1e] dark:text-[#f5f5f7] text-sm hover:bg-black/5 dark:hover:bg-white/5"
        >
          {labels.applications_history}
        </button>

        <button
          onClick={onEdit}
          disabled={busyAction === app.id}
          className="h-9 px-3 rounded-md bg-white dark:bg-[#2c2c2e] border border-black/10 dark:border-white/10 text-[#1e1e1e] dark:text-[#f5f5f7] text-sm hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60"
        >
          {labels.edit}
        </button>

        <button
          onClick={onDelete}
          disabled={busyAction === app.id}
          className="h-9 px-3 rounded-md bg-[#ff3b30] text-white text-sm hover:brightness-95 disabled:opacity-60"
        >
          {busyAction === app.id ? "..." : labels.delete}
        </button>
      </div>
    </div>
  );
}

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
  disabled,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        // base
        "px-3 py-1.5 rounded-full text-sm shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
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
  priority: ApplicationPriority;
  appliedDate: string;
  followUpDate?: string;
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
  const [priority, setPriority] = useState<ApplicationPriority>(initial.priority);
  const [appliedDate, setAppliedDate] = useState<string>(safeISODate(initial.appliedDate));
  const [followUpDate, setFollowUpDate] = useState<string>(initial.followUpDate ?? "");
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
  const formPriorityOptions: { value: ApplicationPriority; label: string }[] = [
    { value: "HIGH", label: labels.priority_high },
    { value: "MEDIUM", label: labels.priority_medium },
    { value: "LOW", label: labels.priority_low },
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
          priority,
          appliedDate,
          followUpDate: followUpDate.trim() || null,
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

        <Field label={labels.priority}>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as ApplicationPriority)}
            className="h-10 w-full rounded-md border border-black/10 dark:border-white/10 px-3 text-sm outline-none focus:border-black/20 bg-white dark:bg-[#3a3a3c] text-[#1e1e1e] dark:text-[#f5f5f7]"
          >
            {formPriorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={
            <span className="inline-flex items-center gap-2">
              <span>{labels.follow_up_date}</span>
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/20 dark:border-white/25 bg-[#e8e8ed] dark:bg-[#3a3a3c] text-[11px] font-bold text-[#4a4a4f] dark:text-[#d1d1d6] cursor-help select-none"
                title={labels.follow_up_help}
                aria-label={labels.follow_up_help}
              >
                ?
              </span>
            </span>
          }
        >
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="h-10 w-full rounded-md border border-black/10 dark:border-white/10 px-3 text-sm outline-none focus:border-black/20 bg-white dark:bg-[#3a3a3c] text-[#1e1e1e] dark:text-[#f5f5f7]"
          />
          <div className="mt-1 text-xs text-[#6e6e73] dark:text-[#98989d]">{labels.follow_up_help}</div>
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

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
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
