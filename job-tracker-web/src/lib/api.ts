import axios from "axios";
import { notifyUnauthorizedFromStatus } from "./auth";

export const api = axios.create({
  baseURL: "/api", // usa o proxy do Vite -> http://localhost:8080
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (typeof status === "number") {
      notifyUnauthorizedFromStatus(status);
    }
    return Promise.reject(error);
  }
);
