import { describe, expect, it } from "vitest";
import { myersDiff, type DiffOp } from "../src/diff/myersDiff.js";

function reconstructA(ops: DiffOp[]): string[] {
  return ops.filter((op) => op.type === "equal" || op.type === "remove").map((op) => op.line);
}

function reconstructB(ops: DiffOp[]): string[] {
  return ops.filter((op) => op.type === "equal" || op.type === "add").map((op) => op.line);
}

describe("myersDiff correctness properties", () => {
  const cases: Array<{ name: string; a: string[]; b: string[] }> = [
    { name: "identical arrays", a: ["a", "b", "c"], b: ["a", "b", "c"] },
    { name: "empty vs empty", a: [], b: [] },
    { name: "insert only", a: ["a", "c"], b: ["a", "b", "c"] },
    { name: "delete only", a: ["a", "b", "c"], b: ["a", "c"] },
    { name: "change in the middle", a: ["a", "b", "c"], b: ["a", "x", "c"] },
    { name: "completely disjoint", a: ["a", "b", "c"], b: ["x", "y", "z"] },
    { name: "a empty, b has content", a: [], b: ["a", "b"] },
    { name: "b empty, a has content", a: ["a", "b"], b: [] },
    { name: "longer mixed diff", a: ["1", "2", "3", "4", "5"], b: ["1", "3", "3.5", "4", "6"] },
  ];

  for (const { name, a, b } of cases) {
    it(`reconstructs both a and b for: ${name}`, () => {
      const ops = myersDiff(a, b);
      expect(reconstructA(ops)).toEqual(a);
      expect(reconstructB(ops)).toEqual(b);
    });
  }

  it("produces only equal ops for identical arrays", () => {
    const a = ["a", "b", "c"];
    const ops = myersDiff(a, [...a]);
    expect(ops.every((op) => op.type === "equal")).toBe(true);
    expect(ops.map((op) => op.line)).toEqual(a);
  });
});

describe("myersDiff concrete cases", () => {
  it("flags a single middle-line change as remove+add around equal context", () => {
    const ops = myersDiff(["a", "b", "c"], ["a", "x", "c"]);
    expect(ops).toEqual([
      { type: "equal", line: "a" },
      { type: "remove", line: "b" },
      { type: "add", line: "x" },
      { type: "equal", line: "c" },
    ]);
  });

  it("flags pure insertion correctly", () => {
    const ops = myersDiff(["a", "c"], ["a", "b", "c"]);
    expect(ops).toEqual([
      { type: "equal", line: "a" },
      { type: "add", line: "b" },
      { type: "equal", line: "c" },
    ]);
  });

  it("flags pure deletion correctly", () => {
    const ops = myersDiff(["a", "b", "c"], ["a", "c"]);
    expect(ops).toEqual([
      { type: "equal", line: "a" },
      { type: "remove", line: "b" },
      { type: "equal", line: "c" },
    ]);
  });
});
