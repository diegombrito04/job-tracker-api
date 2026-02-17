export type ApplicationStatus = "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

export type Application = {
  id: number;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: string; // yyyy-mm-dd
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