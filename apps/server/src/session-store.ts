import { randomBytes } from "node:crypto";
import { isSessionCode, type PublicSession, type SessionState } from "@screenshare/shared";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS ?? 60 * 60 * 1000);
export const RECONNECT_GRACE_MS = Number(process.env.RECONNECT_GRACE_MS ?? 30_000);
export const MAX_VIEWERS = Number(process.env.MAX_VIEWERS ?? 20);

export interface SessionRecord {
  code: string;
  presenterToken: string;
  presenterSocketId?: string;
  viewerSocketIds: Set<string>;
  state: SessionState;
  expiresAt: number;
  presenterHasConnected: boolean;
  presenterDisconnectedAt?: number;
}

export interface CreatedSession { code: string; presenterToken: string; expiresAt: string; }

export class SessionStore {
  private readonly sessions = new Map<string, SessionRecord>();

  create(): CreatedSession {
    let code = "";
    do { code = generateSessionCode(); } while (this.sessions.has(code));
    const record: SessionRecord = { code, presenterToken: randomBytes(32).toString("base64url"), viewerSocketIds: new Set(), state: "waiting", expiresAt: Date.now() + SESSION_TTL_MS, presenterHasConnected: false };
    this.sessions.set(code, record);
    return { code, presenterToken: record.presenterToken, expiresAt: new Date(record.expiresAt).toISOString() };
  }

  get(code: string): SessionRecord | undefined {
    const session = this.sessions.get(code);
    if (!session) return undefined;
    const presenterGoneTooLong = session.presenterHasConnected && session.presenterDisconnectedAt && Date.now() - session.presenterDisconnectedAt > RECONNECT_GRACE_MS;
    const abandonedBeforeStart = !session.presenterHasConnected && session.expiresAt <= Date.now();
    return session.state === "ended" || abandonedBeforeStart || presenterGoneTooLong ? undefined : session;
  }
  validate(code: string): PublicSession | undefined { const session = this.get(code); return session && session.state !== "ended" ? this.public(session) : undefined; }
  authenticatePresenter(code: string, token: string): SessionRecord | undefined { const session = this.get(code); return session?.presenterToken === token && session.state !== "ended" ? session : undefined; }
  public(session: SessionRecord): PublicSession { return { code: session.code, state: session.state, viewerCount: session.viewerSocketIds.size, expiresAt: new Date(session.expiresAt).toISOString() }; }
  end(session: SessionRecord): void { session.state = "ended"; session.expiresAt = Date.now(); }
  prune(now = Date.now()): string[] {
    const expired: string[] = [];
    for (const [code, session] of this.sessions) {
      const presenterGoneTooLong = session.presenterHasConnected && session.presenterDisconnectedAt && now - session.presenterDisconnectedAt > RECONNECT_GRACE_MS;
      const abandonedBeforeStart = !session.presenterHasConnected && session.expiresAt <= now;
      if (session.state === "ended" || abandonedBeforeStart || presenterGoneTooLong) { this.sessions.delete(code); expired.push(code); }
    }
    return expired;
  }
}

export function generateSessionCode(): string {
  let value = "";
  while (value.length < 10) for (const byte of randomBytes(16)) {
    if (byte < 252) value += ALPHABET[byte % ALPHABET.length];
    if (value.length === 10) break;
  }
  return value;
}

export function assertCode(code: string): boolean { return isSessionCode(code); }
