import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@screenshare/shared";
export const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "/api" : "http://localhost:3001");
export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
export function apiPath(path: string): string { return API_URL.startsWith("/") ? `${API_URL}${path}` : `${API_URL}/api${path}`; }
export function connectSocket(code: string, presenterToken?: string): AppSocket {
  const isRelativeApi = API_URL.startsWith("/");
  return io(isRelativeApi ? window.location.origin : API_URL, {
    auth: { code, presenterToken },
    path: isRelativeApi ? `${API_URL}/socket.io` : "/socket.io",
    transports: ["websocket"]
  });
}
