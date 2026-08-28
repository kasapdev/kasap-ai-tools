export { generateListing } from "./seo/generateListing.js";
export { formatListing } from "./seo/formatListing.js";
export { PLATFORM_SPECS, getPlatformSpec, enforceTitleLength } from "./seo/platforms.js";
export type { Platform, PlatformSpec } from "./seo/platforms.js";
export { ListingOptimizationSchema } from "./seo/schema.js";
export type { ListingOptimization } from "./seo/schema.js";

export { scrapeListing } from "./scraping/priceScraper.js";
export type { ScrapeTarget, ScrapedListing, ScrapeOptions } from "./scraping/priceScraper.js";
export { HostRateLimiter } from "./scraping/rateLimiter.js";
export { isPathAllowed, fetchRobotsTxt } from "./scraping/robotsCheck.js";
export type { RobotsDecision } from "./scraping/robotsCheck.js";

export { parsePriceText, compareToCompetitors } from "./pricing/comparePrices.js";
export type { PriceComparison, PricePosition } from "./pricing/comparePrices.js";
