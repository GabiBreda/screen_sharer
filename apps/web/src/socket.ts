import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@screenshare/shared";
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
export function connectSocket(code: string, presenterToken?: string): AppSocket { return io(API_URL, { auth: { code, presenterToken }, transports: ["websocket"] }); }
