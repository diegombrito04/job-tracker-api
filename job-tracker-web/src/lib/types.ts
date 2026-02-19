export type ApplicationStatus = "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
export type ApplicationPriority = "LOW" | "MEDIUM" | "HIGH";

export type Application = {
  id: number;
  company: string;
  role: string;
  status: ApplicationStatus;
  priority?: ApplicationPriority | null;
  appliedDate: string; // yyyy-mm-dd
  followUpDate?: string | null;
  notes?: string | null;
  jobUrl?: string | null;
  salary?: string | null;
  updatedAt?: string | null;
};

export type StatusHistoryEntry = {
  id: number;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedAt: string;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página atual (0-based)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  language: "pt" | "en";
  theme: "light" | "dark";
  sidebarVisible: boolean;
};

export type AuthResponse = {
  user: AuthUser;
};
