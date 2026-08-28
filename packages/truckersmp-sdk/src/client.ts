import {
  TruckersMpApiError,
  TruckersMpHttpError,
  TruckersMpNetworkError,
  TruckersMpNotFoundError,
  TruckersMpTimeoutError,
} from "./errors.js";
import type {
  TruckersMpBan,
  TruckersMpEvent,
  TruckersMpEventsIndexResponse,
  TruckersMpPlayer,
  TruckersMpServer,
  TruckersMpVersion,
  TruckersMpVtc,
} from "./types.js";

export interface TruckersMpClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
  retryBaseDelayMs?: number;
}

const DEFAULT_BASE_URL = "https://api.truckersmp.com/v2";
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_BASE_DELAY_MS = 300;

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isErrorBody(body: unknown): body is { error: true; descriptor?: string } {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    (body as { error: unknown }).error === true
  );
}

/**
 * Type-safe client for the TruckersMP Web API (https://docs.truckersmp.com/web-api/).
 *
 * Every request gets a timeout (AbortController) and retries with exponential
 * backoff on network failures and retryable HTTP statuses (429/5xx) - built
 * this way after Sadakat Logistics' past "universal endpoint connectivity"
 * problems, where a single flaky request with no timeout/retry took down a
 * whole pipeline run. Errors are always thrown as one of the typed
 * TruckersMp*Error classes with an actionable, endpoint-scoped message -
 * never a bare fetch/JSON exception.
 *
 * Note on the API's own quirk: not-found lookups (player/VTC/ban) come back
 * as HTTP 200 with `{ error: true, descriptor }` in the body, not a 404 -
 * this client checks for that on every response and raises
 * TruckersMpNotFoundError instead of silently returning the error body as data.
 */
export class TruckersMpClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryBaseDelayMs: number;

  constructor(options: TruckersMpClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.retryBaseDelayMs = options.retryBaseDelayMs ?? DEFAULT_RETRY_BASE_DELAY_MS;
  }

  private async requestRaw(path: string): Promise<unknown> {
    const url = `${this.baseUrl}${path}`;
    let lastError: TruckersMpApiError | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const res = await fetch(url, { signal: controller.signal });

        if (isRetryableStatus(res.status) && attempt < this.maxRetries) {
          await sleep(this.retryBaseDelayMs * 2 ** attempt);
          continue;
        }

        if (!res.ok) {
          throw new TruckersMpHttpError(
            `TruckersMP API "${path}" ${res.status} ${res.statusText} döndürdü.`,
            { endpoint: path, status: res.status },
          );
        }

        const body: unknown = await res.json();

        if (isErrorBody(body)) {
          throw new TruckersMpNotFoundError(
            `TruckersMP API "${path}" bir hata döndürdü: ${body.descriptor ?? "bilinmeyen hata"}`,
            { endpoint: path, descriptor: body.descriptor },
          );
        }

        return body;
      } catch (error) {
        if (error instanceof TruckersMpApiError) throw error;

        lastError =
          error instanceof Error && error.name === "AbortError"
            ? new TruckersMpTimeoutError(
                `TruckersMP API "${path}" isteği ${this.timeoutMs}ms içinde zaman aşımına uğradı.`,
                { endpoint: path, timeoutMs: this.timeoutMs },
              )
            : new TruckersMpNetworkError(
                `TruckersMP API "${path}" adresine bağlanılamadı: ${
                  error instanceof Error ? error.message : String(error)
                }`,
                { endpoint: path, cause: error },
              );

        if (attempt < this.maxRetries) {
          await sleep(this.retryBaseDelayMs * 2 ** attempt);
          continue;
        }
      } finally {
        clearTimeout(timeoutHandle);
      }
    }

    throw lastError;
  }

  async getServers(): Promise<TruckersMpServer[]> {
    const body = (await this.requestRaw("/servers")) as { response: TruckersMpServer[] };
    return body.response;
  }

  /** `id` must be a string - a SteamID64 exceeds Number.MAX_SAFE_INTEGER and
   * silently loses precision as a JS `number`. */
  async getPlayer(id: string): Promise<TruckersMpPlayer> {
    const body = (await this.requestRaw(`/player/${id}`)) as { response: TruckersMpPlayer };
    return body.response;
  }

  async getPlayerBans(id: string): Promise<TruckersMpBan[]> {
    const body = (await this.requestRaw(`/bans/${id}`)) as { response: TruckersMpBan[] };
    return body.response;
  }

  async getVtc(id: string): Promise<TruckersMpVtc> {
    const body = (await this.requestRaw(`/vtc/${id}`)) as { response: TruckersMpVtc };
    return body.response;
  }

  async getGameTime(): Promise<number> {
    const body = (await this.requestRaw("/game_time")) as { game_time: number };
    return body.game_time;
  }

  async getVersion(): Promise<TruckersMpVersion> {
    return (await this.requestRaw("/version")) as TruckersMpVersion;
  }

  async getEvents(): Promise<TruckersMpEventsIndexResponse> {
    const body = (await this.requestRaw("/events")) as { response: TruckersMpEventsIndexResponse };
    return body.response;
  }

  async getEvent(id: string): Promise<TruckersMpEvent> {
    const body = (await this.requestRaw(`/events/${id}`)) as { response: TruckersMpEvent };
    return body.response;
  }
}
