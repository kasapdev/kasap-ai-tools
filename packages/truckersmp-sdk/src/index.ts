export { TruckersMpClient } from "./client.js";
export type { TruckersMpClientOptions } from "./client.js";

export {
  TruckersMpApiError,
  TruckersMpNotFoundError,
  TruckersMpHttpError,
  TruckersMpTimeoutError,
  TruckersMpNetworkError,
} from "./errors.js";
export type { TruckersMpErrorContext } from "./errors.js";

export type {
  TruckersMpServer,
  TruckersMpPlayer,
  TruckersMpBan,
  TruckersMpVtc,
  TruckersMpVersion,
  TruckersMpEvent,
  TruckersMpEventIndex,
  TruckersMpEventsIndexResponse,
} from "./types.js";

export { askApiDocs, indexApiDocs } from "./docs/askApiDocs.js";
export { API_REFERENCE, formatApiReferenceAsText } from "./docs/apiReference.js";
export type { ApiReferenceEntry } from "./docs/apiReference.js";
