import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { removeBackground } from "../src/image/removeBackground.js";

let dir: string;
let inputPath: string;
let outputPath: string;

const SIZE = 16;
const SQUARE_START = 5;
const SQUARE_END = 10;

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "bg-remover-test-"));
  inputPath = join(dir, "input.png");
  outputPath = join(dir, "output.png");

  const raw = Buffer.alloc(SIZE * SIZE * 3);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const offset = (y * SIZE + x) * 3;
      const isSquare =
        x >= SQUARE_START && x <= SQUARE_END && y >= SQUARE_START && y <= SQUARE_END;
      const [r, g, b] = isSquare ? [30, 120, 200] : [255, 255, 255];
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
    }
  }

  await sharp(raw, { raw: { width: SIZE, height: SIZE, channels: 3 } })
    .png()
    .toFile(inputPath);
});

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("removeBackground (end-to-end via sharp)", () => {
  it("writes a PNG with a transparent uniform background and an opaque square", async () => {
    const result = await removeBackground(inputPath, outputPath, { tolerance: 10 });
    expect(result.width).toBe(SIZE);
    expect(result.height).toBe(SIZE);
    expect(result.transparentPixelCount).toBeGreaterThan(0);

    const { data, info } = await sharp(outputPath).raw().toBuffer({ resolveWithObject: true });
    expect(info.channels).toBe(4);

    const alphaAt = (x: number, y: number) => data[(y * SIZE + x) * 4 + 3]!;
    expect(alphaAt(0, 0)).toBe(0);
    expect(alphaAt(SIZE - 1, SIZE - 1)).toBe(0);

    const midX = Math.floor((SQUARE_START + SQUARE_END) / 2);
    const midY = midX;
    expect(alphaAt(midX, midY)).toBe(255);
  });
});
