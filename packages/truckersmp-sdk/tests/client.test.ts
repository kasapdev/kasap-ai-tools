import { afterEach, describe, expect, it, vi } from "vitest";
import { TruckersMpClient } from "../src/client.js";
import {
  TruckersMpHttpError,
  TruckersMpNetworkError,
  TruckersMpNotFoundError,
  TruckersMpTimeoutError,
} from "../src/errors.js";

function fakeResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: `status-${status}`,
    json: async () => body,
  } as Response;
}

function newClient(overrides: Partial<ConstructorParameters<typeof TruckersMpClient>[0]> = {}) {
  return new TruckersMpClient({ retryBaseDelayMs: 1, maxRetries: 2, ...overrides });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TruckersMpClient", () => {
  it("returns parsed data on a successful call", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      fakeResponse(200, { error: false, response: [{ id: 1, name: "EU2" }] }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const servers = await newClient().getServers();
    expect(servers).toEqual([{ id: 1, name: "EU2" }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws TruckersMpNotFoundError when the body is {error: true}", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(fakeResponse(200, { error: true, descriptor: "Player not found" })),
    );

    await expect(newClient().getPlayer("123")).rejects.toThrow(TruckersMpNotFoundError);
    await expect(newClient().getPlayer("123")).rejects.toThrow(/Player not found/);
  });

  it("does not retry a non-retryable HTTP error (e.g. 400)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(fakeResponse(400, { error: true }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(newClient().getServers()).rejects.toThrow(TruckersMpHttpError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries a retryable status (500) and succeeds once the server recovers", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(fakeResponse(500, {}))
      .mockResolvedValueOnce(fakeResponse(200, { error: false, game_time: 42 }));
    vi.stubGlobal("fetch", fetchMock);

    const gameTime = await newClient().getGameTime();
    expect(gameTime).toBe(42);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws TruckersMpHttpError after exhausting retries on a persistent 500", async () => {
    const fetchMock = vi.fn().mockResolvedValue(fakeResponse(500, {}));
    vi.stubGlobal("fetch", fetchMock);

    const client = newClient({ maxRetries: 2 });
    await expect(client.getServers()).rejects.toThrow(TruckersMpHttpError);
    expect(fetchMock).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it("wraps a network failure as TruckersMpNetworkError after retries", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("getaddrinfo ENOTFOUND"));
    vi.stubGlobal("fetch", fetchMock);

    const client = newClient({ maxRetries: 1 });
    await expect(client.getServers()).rejects.toThrow(TruckersMpNetworkError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("wraps an abort/timeout as TruckersMpTimeoutError", async () => {
    const abortError = Object.assign(new Error("This operation was aborted"), { name: "AbortError" });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abortError));

    const client = newClient({ maxRetries: 0 });
    await expect(client.getServers()).rejects.toThrow(TruckersMpTimeoutError);
  });
});
