import axios from "axios";

export const api = axios.create({
  baseURL: "/api", // usa o proxy do Vite -> http://localhost:8080
  headers: { "Content-Type": "application/json" },
});