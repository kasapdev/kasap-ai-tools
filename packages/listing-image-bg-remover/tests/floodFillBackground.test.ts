import { describe, expect, it } from "vitest";
import { floodFillBackground } from "../src/image/floodFillBackground.js";

const SIZE = 20;
const WHITE: [number, number, number, number] = [255, 255, 255, 255];
const SQUARE: [number, number, number, number] = [200, 50, 50, 255];
const SQUARE_START = 6;
const SQUARE_END = 13; // inclusive

/** Builds a SIZE x SIZE RGBA buffer: solid white background with a solid,
 * distinctly-colored square in the middle. */
function buildFixture(): Buffer {
  const buf = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const offset = (y * SIZE + x) * 4;
      const isSquare =
        x >= SQUARE_START && x <= SQUARE_END && y >= SQUARE_START && y <= SQUARE_END;
      const color = isSquare ? SQUARE : WHITE;
      buf[offset] = color[0];
      buf[offset + 1] = color[1];
      buf[offset + 2] = color[2];
      buf[offset + 3] = color[3];
    }
  }
  return buf;
}

function alphaAt(buf: Buffer, x: number, y: number): number {
  return buf[(y * SIZE + x) * 4 + 3]!;
}

function rgbAt(buf: Buffer, x: number, y: number): [number, number, number] {
  const offset = (y * SIZE + x) * 4;
  return [buf[offset]!, buf[offset + 1]!, buf[offset + 2]!];
}

describe("floodFillBackground", () => {
  it("makes background corners and borders transparent, leaves the square opaque and unchanged", () => {
    const original = buildFixture();
    const originalCopy = Buffer.from(original);

    const result = floodFillBackground(original, SIZE, SIZE, 4, [255, 255, 255], 10);

    expect(alphaAt(result, 0, 0)).toBe(0);
    expect(alphaAt(result, SIZE - 1, 0)).toBe(0);
    expect(alphaAt(result, 0, SIZE - 1)).toBe(0);
    expect(alphaAt(result, SIZE - 1, SIZE - 1)).toBe(0);

    for (let x = 0; x < SIZE; x++) {
      expect(alphaAt(result, x, 0)).toBe(0);
      expect(alphaAt(result, x, SIZE - 1)).toBe(0);
    }
    for (let y = 0; y < SIZE; y++) {
      expect(alphaAt(result, 0, y)).toBe(0);
      expect(alphaAt(result, SIZE - 1, y)).toBe(0);
    }

    for (let y = SQUARE_START; y <= SQUARE_END; y++) {
      for (let x = SQUARE_START; x <= SQUARE_END; x++) {
        expect(alphaAt(result, x, y)).toBe(255);
        expect(rgbAt(result, x, y)).toEqual([SQUARE[0], SQUARE[1], SQUARE[2]]);
      }
    }

    expect(result.length).toBe(original.length);
    expect(original.equals(originalCopy)).toBe(true);
  });

  it("throws when channels !== 4", () => {
    const buf = Buffer.alloc(SIZE * SIZE * 3);
    expect(() => floodFillBackground(buf, SIZE, SIZE, 3, [255, 255, 255], 10)).toThrow();
  });
});
