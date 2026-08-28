export interface RobuxEconomyConfig {
  /** Marketplace'in geliştirici ürünlerinden/game pass'lerden aldığı pay (%). */
  marketplaceCutPercent: number;
  /** DevEx: 1 Robux'un yaklaşık kaç USD'ye çevrildiği. */
  devExRatePerRobux: number;
}

/**
 * Roblox'un genel bilinen oranlarına dayalı varsayılan değerler (%30 marketplace payı,
 * ~$0.0035/Robux DevEx oranı). Roblox bu oranları zaman zaman günceller - üretimde
 * kullanmadan önce https://create.roblox.com/docs/production/monetization üzerinden
 * güncel değerleri doğrulayın ve gerekirse bu sabitleri (ya da CLI'daki --cut/--rate
 * bayraklarını) güncelleyin.
 */
export const DEFAULT_ROBUX_ECONOMY_CONFIG: RobuxEconomyConfig = {
  marketplaceCutPercent: 30,
  devExRatePerRobux: 0.0035,
};

export interface RobuxPriceBreakdown {
  listedPriceRobux: number;
  marketplaceCutRobux: number;
  developerShareRobux: number;
  developerShareUsdViaDevEx: number;
}

function assertPositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} pozitif bir sayı olmalı.`);
  }
}

/** Bir Robux liste fiyatının marketplace payı sonrası geliştiriciye kalan kısmını hesaplar. */
export function calculatePriceBreakdown(
  listedPriceRobux: number,
  config: RobuxEconomyConfig = DEFAULT_ROBUX_ECONOMY_CONFIG,
): RobuxPriceBreakdown {
  assertPositive(listedPriceRobux, "listedPriceRobux");

  const marketplaceCutRobux = Math.round(listedPriceRobux * (config.marketplaceCutPercent / 100));
  const developerShareRobux = listedPriceRobux - marketplaceCutRobux;
  const developerShareUsdViaDevEx = developerShareRobux * config.devExRatePerRobux;

  return { listedPriceRobux, marketplaceCutRobux, developerShareRobux, developerShareUsdViaDevEx };
}

/** Hedeflenen geliştirici kazancına (USD) ulaşmak için gereken liste fiyatını (Robux) önerir. */
export function suggestPriceForTargetUsd(
  targetDeveloperUsd: number,
  config: RobuxEconomyConfig = DEFAULT_ROBUX_ECONOMY_CONFIG,
): number {
  assertPositive(targetDeveloperUsd, "targetDeveloperUsd");

  const developerShareRatio = 1 - config.marketplaceCutPercent / 100;
  const requiredDeveloperRobux = targetDeveloperUsd / config.devExRatePerRobux;
  let price = Math.ceil(requiredDeveloperRobux / developerShareRatio);

  // calculatePriceBreakdown() rounds the marketplace cut to a whole Robux,
  // which can shave a fraction more off the developer's share than this
  // linear estimate assumes - nudge up until the real breakdown clears the target.
  while (calculatePriceBreakdown(price, config).developerShareUsdViaDevEx < targetDeveloperUsd) {
    price += 1;
  }
  return price;
}

/** Bir taban fiyattan başlayarak kademeli (küçük/orta/büyük paket tarzı) bir
 * fiyatlandırma merdiveni üretir - her kademe bir öncekinin `multiplier` katı. */
export function buildPriceTier(
  basePriceRobux: number,
  steps = 4,
  multiplier = 2.2,
): number[] {
  assertPositive(basePriceRobux, "basePriceRobux");
  if (!Number.isInteger(steps) || steps < 1) {
    throw new Error("steps 1 veya daha büyük bir tam sayı olmalı.");
  }
  assertPositive(multiplier, "multiplier");

  const tiers: number[] = [Math.round(basePriceRobux)];
  for (let i = 1; i < steps; i++) {
    const previous = tiers[i - 1] ?? basePriceRobux;
    tiers.push(Math.round(previous * multiplier));
  }
  return tiers;
}
