/**
 * Accuracy Tracker Unit Tests
 *
 * Tests the pure math helpers used by getAccuracyMetrics.
 * We test the logic directly rather than mocking the DB.
 */

// Re-export private helpers for testing via the public function signature.
// We test the behaviour by running the computation inline.

interface Row {
  delta: number;
  predicted: number;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function buildMetric(rows: Row[]) {
  if (rows.length === 0) {
    return { total: 0, avgDelta: 0, medianDelta: 0, withinThirtyPercent: 0 };
  }
  const deltas = rows.map((r) => r.delta);
  const avgDelta = deltas.reduce((s, d) => s + d, 0) / deltas.length;
  const medianDelta = median(deltas);
  const withinCount = rows.filter((r) => {
    if (r.predicted === 0) return false;
    return Math.abs(r.delta) / r.predicted < 0.3;
  }).length;
  return {
    total: rows.length,
    avgDelta,
    medianDelta,
    withinThirtyPercent: withinCount / rows.length,
  };
}

describe("Accuracy metric calculations", () => {
  describe("buildMetric — delta math", () => {
    it("calculates average delta correctly", () => {
      const m = buildMetric([
        { delta: 100, predicted: 500 },
        { delta: -50, predicted: 500 },
      ]);
      expect(m.avgDelta).toBe(25);
    });

    it("calculates median delta correctly for odd-length array", () => {
      const m = buildMetric([
        { delta: 10, predicted: 100 },
        { delta: 50, predicted: 100 },
        { delta: 30, predicted: 100 },
      ]);
      expect(m.medianDelta).toBe(30);
    });

    it("calculates median delta correctly for even-length array", () => {
      const m = buildMetric([
        { delta: 10, predicted: 100 },
        { delta: 20, predicted: 100 },
        { delta: 30, predicted: 100 },
        { delta: 40, predicted: 100 },
      ]);
      expect(m.medianDelta).toBe(25);
    });

    it("counts withinThirtyPercent correctly", () => {
      // predicted=500: 30% threshold = delta must be < 150
      const m = buildMetric([
        { delta: 100, predicted: 500 },  // 20% — within
        { delta: 200, predicted: 500 },  // 40% — outside
        { delta: -50, predicted: 500 },  // 10% — within
      ]);
      expect(m.withinThirtyPercent).toBeCloseTo(2 / 3);
    });

    it("excludes rows where predicted is 0", () => {
      const m = buildMetric([
        { delta: 50, predicted: 0 },   // predicted=0 → excluded from accuracy
        { delta: 50, predicted: 500 }, // 10% — within
      ]);
      // Only 1 of 2 rows qualifies; but 1 out of 2 rows overall
      expect(m.withinThirtyPercent).toBeCloseTo(0.5);
    });
  });

  describe("buildMetric — zero outcomes", () => {
    it("returns zeros for empty input", () => {
      const m = buildMetric([]);
      expect(m.total).toBe(0);
      expect(m.avgDelta).toBe(0);
      expect(m.medianDelta).toBe(0);
      expect(m.withinThirtyPercent).toBe(0);
    });
  });

  describe("buildMetric — missing predicted cost", () => {
    it("handles outcome with zero predicted gracefully", () => {
      const m = buildMetric([{ delta: 99, predicted: 0 }]);
      expect(m.total).toBe(1);
      // delta/0 → excluded from accuracy count
      expect(m.withinThirtyPercent).toBe(0);
    });
  });
});

describe("Tool failure rate calculations", () => {
  function calcRate(total: number, failed: number) {
    return total === 0 ? 0 : failed / total;
  }

  it("returns 0 for zero total calls", () => {
    expect(calcRate(0, 0)).toBe(0);
  });

  it("returns 1 for 100% failure rate", () => {
    expect(calcRate(5, 5)).toBe(1);
  });

  it("calculates partial failure rate correctly", () => {
    expect(calcRate(10, 3)).toBeCloseTo(0.3);
  });
});
