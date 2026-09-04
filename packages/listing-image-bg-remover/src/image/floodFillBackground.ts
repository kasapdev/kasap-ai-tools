import { colorDistance, type Rgb } from "./colorDistance.js";

/**
 * Flood-fills near-uniform background pixels to transparent, starting from
 * every border pixel that's within `tolerance` of `bgColor`. Explicit stack
 * (not recursion) to stay safe on large images. Requires RGBA (channels=4)
 * since it writes the alpha byte.
 */
export function floodFillBackground(
  pixels: Buffer,
  width: number,
  height: number,
  channels: number,
  bgColor: Rgb,
  tolerance: number,
): Buffer {
  if (channels !== 4) {
    throw new Error(
      `floodFillBackground RGBA (channels=4) bekliyor, alındı: channels=${channels}. Önce sharp'ın ensureAlpha()'sını kullanın.`,
    );
  }

  const result = Buffer.from(pixels);
  const visited = new Uint8Array(width * height);
  const stack: number[] = [];

  const colorAt = (x: number, y: number): Rgb => {
    const offset = (y * width + x) * channels;
    return [result[offset]!, result[offset + 1]!, result[offset + 2]!];
  };

  const isBackground = (x: number, y: number): boolean =>
    colorDistance(colorAt(x, y), bgColor) <= tolerance;

  const seedIfBackground = (x: number, y: number): void => {
    const idx = y * width + x;
    if (visited[idx]) return;
    if (!isBackground(x, y)) return;
    visited[idx] = 1;
    stack.push(idx);
  };

  for (let x = 0; x < width; x++) {
    seedIfBackground(x, 0);
    seedIfBackground(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    seedIfBackground(0, y);
    seedIfBackground(width - 1, y);
  }

  while (stack.length > 0) {
    const idx = stack.pop()!;
    const x = idx % width;
    const y = Math.floor(idx / width);

    const offset = idx * channels;
    result[offset + 3] = 0;

    const neighbors: Array<[number, number]> = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      const nIdx = ny * width + nx;
      if (visited[nIdx]) continue;
      if (!isBackground(nx, ny)) continue;
      visited[nIdx] = 1;
      stack.push(nIdx);
    }
  }

  return result;
}
