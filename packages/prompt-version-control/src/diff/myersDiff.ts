export type DiffOp = { type: "equal" | "add" | "remove"; line: string };

/** Real Myers O(ND) shortest-edit-script diff for two line arrays (not a
 * naive line-by-line comparison) - greedy forward search building a trace of
 * furthest-reaching x per diagonal k for each edit distance d, then a
 * backtrack pass reconstructs the actual edit script from that trace. */
export function myersDiff(a: string[], b: string[]): DiffOp[] {
  const N = a.length;
  const M = b.length;
  const max = N + M;
  const trace: Map<number, number>[] = [];
  const v = new Map<number, number>([[1, 0]]);

  outer: for (let d = 0; d <= max; d++) {
    trace.push(new Map(v));
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      const vkMinus1 = v.get(k - 1) ?? -Infinity;
      const vkPlus1 = v.get(k + 1) ?? -Infinity;
      if (k === -d || (k !== d && vkMinus1 < vkPlus1)) {
        x = vkPlus1;
      } else {
        x = vkMinus1 + 1;
      }
      let y = x - k;
      while (x < N && y < M && a[x] === b[y]) {
        x++;
        y++;
      }
      v.set(k, x);
      if (x >= N && y >= M) {
        break outer;
      }
    }
  }

  const ops: DiffOp[] = [];
  let x = N;
  let y = M;
  for (let d = trace.length - 1; d >= 0; d--) {
    const vPrev = trace[d]!;
    const k = x - y;
    const vkMinus1 = vPrev.get(k - 1) ?? -Infinity;
    const vkPlus1 = vPrev.get(k + 1) ?? -Infinity;
    const prevK = k === -d || (k !== d && vkMinus1 < vkPlus1) ? k + 1 : k - 1;
    const prevX = vPrev.get(prevK) ?? 0;
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) {
      ops.push({ type: "equal", line: a[x - 1]! });
      x--;
      y--;
    }
    if (d > 0) {
      if (x === prevX) {
        ops.push({ type: "add", line: b[y - 1]! });
      } else {
        ops.push({ type: "remove", line: a[x - 1]! });
      }
      x = prevX;
      y = prevY;
    }
  }
  return ops.reverse();
}
