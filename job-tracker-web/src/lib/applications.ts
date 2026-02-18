import type { Application, ApplicationStatus, PageResponse } from "./types";
import { buildAuthJsonHeaders, notifyUnauthorizedFromStatus } from "./auth";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

type ListParams = {
  page?: number;
  size?: number;
  sort?: string; // ex: "appliedDate,desc"
  status?: ApplicationStatus;
};

async function http<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${input}`, {
    ...init,
    credentials: "include",
    headers: buildAuthJsonHeaders(init?.headers),
  });

  if (!res.ok) {
    notifyUnauthorizedFromStatus(res.status);
    const text = await res.text().catch(() => "");
    throw new Error(text || `Erro HTTP ${res.status}`);
  }

  // alguns endpoints podem retornar vazio
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return (await res.text()) as unknown as T;
  }
  return (await res.json()) as T;
}

export async function listApplications(params: ListParams): Promise<PageResponse<Application>> {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page ?? 0));
  sp.set("size", String(params.size ?? 12));
  if (params.sort) sp.set("sort", params.sort);
  if (params.status) sp.set("status", params.status);

  return http<PageResponse<Application>>(`/applications?${sp.toString()}`);
}

export type CreateApplicationInput = {
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: string;
};

export async function createApplication(body: CreateApplicationInput): Promise<Application> {
  return http<Application>(`/applications`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteApplication(id: number): Promise<void> {
  await http<void>(`/applications/${id}`, { method: "DELETE" });
}

export async function updateStatus(id: number, status: ApplicationStatus): Promise<Application> {
  return http<Application>(`/applications/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
