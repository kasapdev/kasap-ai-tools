import type { Rgb } from "./colorDistance.js";

function pixelAt(pixels: Buffer, width: number, channels: number, x: number, y: number): Rgb {
  const offset = (y * width + x) * channels;
  return [pixels[offset]!, pixels[offset + 1]!, pixels[offset + 2]!];
}

/** Samples the 4 corners plus the 4 edge midpoints and returns their average
 * RGB as the detected background color - a cheap, effective heuristic for
 * product photos shot against a single plain backdrop. */
export function detectBackgroundColor(
  pixels: Buffer,
  width: number,
  height: number,
  channels: number,
): Rgb {
  const maxX = width - 1;
  const maxY = height - 1;
  const samples: Rgb[] = [
    pixelAt(pixels, width, channels, 0, 0),
    pixelAt(pixels, width, channels, maxX, 0),
    pixelAt(pixels, width, channels, 0, maxY),
    pixelAt(pixels, width, channels, maxX, maxY),
    pixelAt(pixels, width, channels, Math.floor(maxX / 2), 0),
    pixelAt(pixels, width, channels, Math.floor(maxX / 2), maxY),
    pixelAt(pixels, width, channels, 0, Math.floor(maxY / 2)),
    pixelAt(pixels, width, channels, maxX, Math.floor(maxY / 2)),
  ];

  const sum = samples.reduce<Rgb>(
    (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
    [0, 0, 0],
  );
  const n = samples.length;
  return [Math.round(sum[0] / n), Math.round(sum[1] / n), Math.round(sum[2] / n)];
}
