import { describe, expect, it } from 'vitest';

import { MediapipeDetectionEngine, normalizeDetections } from './mediapipe-engine';

const raw = (label: string, score: number) => ({
  categories: [{ categoryName: label, score }],
  boundingBox: { originX: 12, originY: 24, width: 80, height: 60 },
});

describe('normalizeDetections', () => {
  it('normalizes boxes and sorts results by score', () => {
    const result = normalizeDetections([raw('cat', 0.7), raw('dog', 0.9)], {
      scoreThreshold: 0.5,
      maxResults: 5,
    });
    expect(result.map(({ label }) => label)).toEqual(['dog', 'cat']);
    expect(result[0]?.boundingBox).toEqual({ x: 12, y: 24, width: 80, height: 60 });
  });

  it('applies threshold, maximum count and case-insensitive allowlist', () => {
    const result = normalizeDetections([raw('Cat', 0.91), raw('dog', 0.89), raw('cat', 0.3)], {
      scoreThreshold: 0.5,
      maxResults: 1,
      labelAllowlist: ['cat'],
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.label).toBe('Cat');
  });
});

describe('MediapipeDetectionEngine configuration', () => {
  it('rejects invalid thresholds and result limits', () => {
    expect(() => new MediapipeDetectionEngine({ scoreThreshold: 1.1 })).toThrow(RangeError);
    expect(() => new MediapipeDetectionEngine({ maxResults: 0 })).toThrow(RangeError);
  });
});
