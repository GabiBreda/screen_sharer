export class RateLimiter {
  private readonly attempts = new Map<string, number[]>();
  constructor(private readonly limit = 12, private readonly windowMs = 60_000) {}
  allow(key: string, now = Date.now()): boolean {
    const valid = (this.attempts.get(key) ?? []).filter((time) => time > now - this.windowMs);
    if (valid.length >= this.limit) { this.attempts.set(key, valid); return false; }
    valid.push(now); this.attempts.set(key, valid); return true;
  }
}
