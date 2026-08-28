import * as cheerio from "cheerio";
import { fetchRobotsTxt, isPathAllowed } from "./robotsCheck.js";
import { HostRateLimiter } from "./rateLimiter.js";

export interface ScrapeTarget {
  url: string;
  /** CSS selector pointing at the price element on this specific page - this
   * module has no built-in knowledge of any site's markup, you supply it. */
  priceSelector: string;
  titleSelector?: string;
}

export interface ScrapedListing {
  url: string;
  title?: string;
  priceText: string;
}

export interface ScrapeOptions {
  userAgent?: string;
  rateLimiter?: HostRateLimiter;
}

const DEFAULT_USER_AGENT = "KasapListingOptimizerBot/0.1 (+https://github.com/kasapdev/kasap-ai-tools)";
const sharedRateLimiter = new HostRateLimiter();

/**
 * Fetches one page and pulls text out of the given CSS selectors.
 *
 * This is a generic, well-behaved fetch-and-extract primitive, not a scraper
 * pre-built for any named marketplace: it has no built-in knowledge of
 * Trendyol/N11/Hepsiburada/eBay's markup or terms of service. You supply the
 * URL and selectors, and you're responsible for confirming that scraping
 * that specific page is permitted before pointing this at it.
 *
 * Two things it enforces itself, unconditionally:
 * - robots.txt: refuses to proceed if the path is disallowed for our
 *   user-agent, and FAILS CLOSED (also refuses) if robots.txt couldn't be
 *   fetched/verified at all - it never treats "couldn't check" as "allowed".
 * - Rate limiting: at most one request per host per `rateLimiter` interval
 *   (shared across calls by default) so a batch of lookups never hammers one site.
 */
export async function scrapeListing(
  target: ScrapeTarget,
  options: ScrapeOptions = {},
): Promise<ScrapedListing> {
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  const rateLimiter = options.rateLimiter ?? sharedRateLimiter;
  const url = new URL(target.url);

  const robotsTxt = await fetchRobotsTxt(url.origin);
  if (robotsTxt === null) {
    throw new Error(
      `${url.origin}/robots.txt alınamadı/doğrulanamadı - izin belirsizken taramaya devam edilmiyor.`,
    );
  }

  const decision = isPathAllowed(robotsTxt, userAgent, url.pathname);
  if (!decision.allowed) {
    throw new Error(
      `${url.origin} "${url.pathname}" yolunun taranmasına robots.txt ile izin vermiyor` +
        `${decision.matchedRule ? ` (${decision.matchedRule})` : ""}.`,
    );
  }

  await rateLimiter.wait(url.host);

  const res = await fetch(target.url, { headers: { "User-Agent": userAgent } });
  if (!res.ok) {
    throw new Error(`${target.url} adresinden ${res.status} ${res.statusText} döndü.`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const priceText = $(target.priceSelector).first().text().trim();
  if (!priceText) {
    throw new Error(
      `"${target.priceSelector}" seçicisiyle ${target.url} üzerinde fiyat metni bulunamadı - sayfa yapısı değişmiş olabilir.`,
    );
  }

  const title = target.titleSelector
    ? $(target.titleSelector).first().text().trim() || undefined
    : undefined;

  return { url: target.url, title, priceText };
}
