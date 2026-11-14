export const SESSION_CODE_LENGTH = 10;
export const SESSION_CODE_PATTERN = /^[A-Z0-9]{10}$/;

export type SessionState = "waiting" | "streaming" | "paused" | "ended";
export type IceCandidatePayload = RTCIceCandidateInit;

export interface PublicSession {
  code: string;
  state: SessionState;
  viewerCount: number;
  expiresAt: string;
}

export interface ServerToClientEvents {
  "viewer:joined": (viewerSocketId: string) => void;
  "session:state": (session: PublicSession) => void;
  "session:viewers": (viewerCount: number) => void;
  "session:ended": (reason: "presenter" | "expired") => void;
  "stream:stopped": () => void;
  "webrtc:offer": (fromSocketId: string, description: RTCSessionDescriptionInit) => void;
  "webrtc:answer": (fromSocketId: string, description: RTCSessionDescriptionInit) => void;
  "webrtc:ice-candidate": (fromSocketId: string, candidate: IceCandidatePayload) => void;
  "server:error": (message: string) => void;
}

export interface ClientToServerEvents {
  "session:join": (code: string, callback: (result: { ok: boolean; session?: PublicSession; error?: string }) => void) => void;
  "stream:start": (callback: (result: { ok: boolean; error?: string }) => void) => void;
  "stream:stop": () => void;
  "session:end": () => void;
  "webrtc:offer": (targetSocketId: string, description: RTCSessionDescriptionInit) => void;
  "webrtc:answer": (targetSocketId: string, description: RTCSessionDescriptionInit) => void;
  "webrtc:ice-candidate": (targetSocketId: string, candidate: IceCandidatePayload) => void;
}

export function normalizeSessionCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, SESSION_CODE_LENGTH);
}

export function isSessionCode(value: string): boolean {
  return SESSION_CODE_PATTERN.test(value);
}
