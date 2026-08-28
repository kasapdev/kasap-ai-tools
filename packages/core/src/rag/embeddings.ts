import { getCoreConfig } from "../config.js";
import type { EmbeddingProvider } from "./types.js";

/**
 * Voyage AI embedding provider. Not a hard dependency of @kasap/core - install
 * it only when you actually activate RAG:
 *
 *   pnpm add voyageai --filter @kasap/core
 *
 * and set VOYAGE_API_KEY in the consuming project's .env.
 */
interface VoyageEmbedResponse {
  data?: { embedding?: number[] }[];
}

export class VoyageEmbeddingProvider implements EmbeddingProvider {
  async embed(texts: string[]): Promise<number[][]> {
    const config = getCoreConfig();
    if (!config.voyageApiKey) {
      throw new Error(
        "VOYAGE_API_KEY tanımlı değil. RAG'i aktifleştirmek için .env dosyasına ekleyin.",
      );
    }

    // Not a package.json dependency - RAG is optional and this stays uninstalled
    // until activated. A non-literal specifier keeps tsc from requiring the
    // module (and its types) to be resolvable at build time.
    const moduleName = "voyageai";
    let voyageModule: { VoyageAIClient: new (args: { apiKey: string }) => {
      embed(args: { input: string[]; model: string }): Promise<VoyageEmbedResponse>;
    } };
    try {
      voyageModule = await import(moduleName);
    } catch {
      throw new Error(
        "'voyageai' paketi kurulu değil. RAG'i aktifleştirmek için: pnpm add voyageai --filter @kasap/core",
      );
    }

    const client = new voyageModule.VoyageAIClient({ apiKey: config.voyageApiKey });
    const response = await client.embed({ input: texts, model: config.voyageModel });
    return (response.data ?? []).map((item) => item.embedding ?? []);
  }
}
