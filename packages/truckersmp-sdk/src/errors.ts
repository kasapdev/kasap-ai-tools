export interface TruckersMpErrorContext {
  endpoint: string;
  status?: number;
  descriptor?: string;
  timeoutMs?: number;
  cause?: unknown;
}

export class TruckersMpApiError extends Error {
  readonly endpoint: string;
  readonly context: TruckersMpErrorContext;

  constructor(message: string, context: TruckersMpErrorContext) {
    super(message);
    this.name = "TruckersMpApiError";
    this.endpoint = context.endpoint;
    this.context = context;
  }
}

/** The API returned HTTP 200 with `{ error: true, descriptor }` in the body -
 * TruckersMP's documented way of signalling "not found" for player/VTC/ban
 * lookups (a plain HTTP-status check would silently treat this as success). */
export class TruckersMpNotFoundError extends TruckersMpApiError {
  constructor(message: string, context: TruckersMpErrorContext) {
    super(message, context);
    this.name = "TruckersMpNotFoundError";
  }
}

export class TruckersMpHttpError extends TruckersMpApiError {
  readonly status: number;

  constructor(message: string, context: TruckersMpErrorContext & { status: number }) {
    super(message, context);
    this.name = "TruckersMpHttpError";
    this.status = context.status;
  }
}

export class TruckersMpTimeoutError extends TruckersMpApiError {
  constructor(message: string, context: TruckersMpErrorContext) {
    super(message, context);
    this.name = "TruckersMpTimeoutError";
  }
}

export class TruckersMpNetworkError extends TruckersMpApiError {
  constructor(message: string, context: TruckersMpErrorContext) {
    super(message, context);
    this.name = "TruckersMpNetworkError";
  }
}
