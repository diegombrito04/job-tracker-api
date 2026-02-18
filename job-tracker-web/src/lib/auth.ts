export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";

let unauthorizedEventQueued = false;

function dispatchUnauthorizedEvent() {
  if (typeof window === "undefined") return;
  if (unauthorizedEventQueued) return;

  unauthorizedEventQueued = true;
  window.setTimeout(() => {
    unauthorizedEventQueued = false;
    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
  }, 0);
}

export function notifyUnauthorizedFromStatus(status: number) {
  if (status === 401 || status === 403) {
    dispatchUnauthorizedEvent();
  }
}

export function buildAuthJsonHeaders(extraHeaders?: HeadersInit): Headers {
  const headers = new Headers(extraHeaders);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}
