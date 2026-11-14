import { describe, expect, it } from "vitest";
import { generateSessionCode, SessionStore } from "./session-store.js";
describe("SessionStore", () => {
  it("creates unique 10-character public codes", () => { const codes = new Set(Array.from({ length: 500 }, generateSessionCode)); expect(codes.size).toBe(500); for (const code of codes) expect(code).toMatch(/^[A-Z0-9]{10}$/); });
  it("keeps presenter token private while exposing session", () => { const store = new SessionStore(); const created = store.create(); const session = store.validate(created.code); expect(session?.code).toBe(created.code); expect(JSON.stringify(session)).not.toContain(created.presenterToken); });
  it("rejects an incorrect presenter token", () => { const store = new SessionStore(); const created = store.create(); expect(store.authenticatePresenter(created.code, "nope")).toBeUndefined(); expect(store.authenticatePresenter(created.code, created.presenterToken)).toBeDefined(); });
  it("does not expose ended sessions", () => { const store = new SessionStore(); const created = store.create(); const record = store.authenticatePresenter(created.code, created.presenterToken)!; store.end(record); expect(store.validate(created.code)).toBeUndefined(); });
});
