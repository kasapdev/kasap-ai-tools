/** Ensures at least `minIntervalMs` passes between requests to the same host,
 * so a batch of competitor lookups never hammers one site. */
export class HostRateLimiter {
  private readonly minIntervalMs: number;
  private readonly lastRequestAt = new Map<string, number>();

  constructor(minIntervalMs = 2000) {
    this.minIntervalMs = minIntervalMs;
  }

  async wait(host: string): Promise<void> {
    const last = this.lastRequestAt.get(host);
    if (last !== undefined) {
      const remaining = this.minIntervalMs - (Date.now() - last);
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
    }
    this.lastRequestAt.set(host, Date.now());
  }
}
