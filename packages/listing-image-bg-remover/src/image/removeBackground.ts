import sharp from "sharp";
import { detectBackgroundColor } from "./detectBackgroundColor.js";
import { floodFillBackground } from "./floodFillBackground.js";

export const DEFAULT_TOLERANCE = 24;

export interface RemoveBackgroundResult {
  width: number;
  height: number;
  transparentPixelCount: number;
}

/** Reads `inputPath`, flood-fills its detected background to transparent,
 * and writes the result as a PNG to `outputPath`. Works well for photos on a
 * plain/uniform background - see README for limitations. */
export async function removeBackground(
  inputPath: string,
  outputPath: string,
  options: { tolerance?: number } = {},
): Promise<RemoveBackgroundResult> {
  const tolerance = options.tolerance ?? DEFAULT_TOLERANCE;

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const bgColor = detectBackgroundColor(data, width, height, channels);
  const result = floodFillBackground(data, width, height, channels, bgColor, tolerance);

  await sharp(result, { raw: { width, height, channels: 4 } }).png().toFile(outputPath);

  let transparentPixelCount = 0;
  for (let i = 3; i < result.length; i += 4) {
    if (result[i] === 0) transparentPixelCount++;
  }

  return { width, height, transparentPixelCount };
}
