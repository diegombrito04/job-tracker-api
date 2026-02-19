import type { Application, ApplicationStatus, PageResponse } from "./types";
import { buildAuthJsonHeaders, notifyUnauthorizedFromStatus } from "./auth";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: buildAuthJsonHeaders(init?.headers),
  });

  if (!res.ok) {
    notifyUnauthorizedFromStatus(res.status);
    throw new Error(`Erro HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return (await res.text()) as unknown as T;
  return res.json() as Promise<T>;
}

export async function fetchStatusCount(status: ApplicationStatus): Promise<number> {
  const data = await apiFetch<PageResponse<Application>>(
    `/applications?page=0&size=1&sort=appliedDate,desc&status=${status}`
  );
  return data.totalElements;
}

export async function fetchTotalCount(): Promise<number> {
  const data = await apiFetch<PageResponse<Application>>(
    `/applications?page=0&size=1&sort=appliedDate,desc`
  );
  return data.totalElements;
}

export async function fetchRecentApplications(limit = 5): Promise<Application[]> {
  const data = await apiFetch<PageResponse<Application>>(
    `/applications?page=0&size=${limit}&sort=appliedDate,desc`
  );
  return data.content;
}

export async function fetchAllApplications(): Promise<Application[]> {
  const data = await apiFetch<PageResponse<Application>>(
    `/applications?page=0&size=200&sort=appliedDate,desc`
  );
  return data.content;
}

export async function fetchDueFollowUps(limit = 5): Promise<Application[]> {
  const data = await apiFetch<PageResponse<Application>>(
    `/applications?page=0&size=${limit}&sort=followUpDate,asc&followUpDue=true`
  );
  return data.content;
}

export async function fetchOverdueFollowUps(limit = 8): Promise<{
  content: Application[];
  totalElements: number;
}> {
  const data = await apiFetch<PageResponse<Application>>(
    `/applications?page=0&size=${limit}&sort=followUpDate,asc&followUpOverdue=true`
  );
  return {
    content: data.content,
    totalElements: data.totalElements,
  };
}
