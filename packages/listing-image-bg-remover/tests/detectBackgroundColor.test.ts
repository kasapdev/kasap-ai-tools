import { describe, expect, it } from "vitest";
import { detectBackgroundColor } from "../src/image/detectBackgroundColor.js";

/** Builds a 4x4 RGBA buffer, all pixels set to `fill`, except the given
 * overrides at {x,y}. */
function buildBuffer(
  width: number,
  height: number,
  fill: [number, number, number, number],
  overrides: Array<{ x: number; y: number; rgba: [number, number, number, number] }> = [],
): Buffer {
  const buf = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    buf[i * 4] = fill[0];
    buf[i * 4 + 1] = fill[1];
    buf[i * 4 + 2] = fill[2];
    buf[i * 4 + 3] = fill[3];
  }
  for (const { x, y, rgba } of overrides) {
    const offset = (y * width + x) * 4;
    buf[offset] = rgba[0];
    buf[offset + 1] = rgba[1];
    buf[offset + 2] = rgba[2];
    buf[offset + 3] = rgba[3];
  }
  return buf;
}

describe("detectBackgroundColor", () => {
  it("returns the uniform color when every sampled pixel matches", () => {
    const buf = buildBuffer(4, 4, [200, 200, 200, 255]);
    expect(detectBackgroundColor(buf, 4, 4, 4)).toEqual([200, 200, 200]);
  });

  it("averages differing corner colors", () => {
    // Corners: (0,0) black, (3,0) white, (0,3) white, (3,3) black - edge
    // midpoints also default to the white fill, so the average leans white.
    const buf = buildBuffer(4, 4, [255, 255, 255, 255], [
      { x: 0, y: 0, rgba: [0, 0, 0, 255] },
      { x: 3, y: 3, rgba: [0, 0, 0, 255] },
    ]);
    const [r, g, b] = detectBackgroundColor(buf, 4, 4, 4);
    // 6 of 8 samples are white, 2 are black -> average = 255 * 6/8 = 191.25 -> rounds to 191.
    expect(r).toBe(191);
    expect(g).toBe(191);
    expect(b).toBe(191);
  });
});
