import { describe, expect, it } from 'vitest';

import { analyzeColor, centralRoi, defaultColorAnalysisConfig } from './color-analysis';

function solidFixture(red: number, green: number, blue: number, size = 8): ImageData {
  const data = new Uint8ClampedArray(size * size * 4);
  for (let offset = 0; offset < data.length; offset += 4) {
    data.set([red, green, blue, 255], offset);
  }
  return { data, width: size, height: size, colorSpace: 'srgb' } as ImageData;
}

describe('color fixture suite', () => {
  const fixtures = [
    { name: 'roter Gegenstand', rgb: [210, 48, 48], expected: 'Rot' },
    { name: 'grüner Gegenstand', rgb: [42, 145, 70], expected: 'Grün' },
    { name: 'blauer Gegenstand', rgb: [48, 101, 205], expected: 'Blau' },
    { name: 'schwarzer Gegenstand', rgb: [18, 18, 18], expected: 'Schwarz' },
    { name: 'weißer Gegenstand', rgb: [242, 242, 238], expected: 'Weiß' },
  ] as const;

  it.each(fixtures)('classifies $name', ({ rgb, expected }) => {
    expect(analyzeColor(solidFixture(rgb[0], rgb[1], rgb[2])).displayName).toBe(expected);
  });

  it('uses a median so a few bright background pixels do not dominate', () => {
    const fixture = solidFixture(205, 45, 45);
    for (let offset = 0; offset < 32; offset += 4) fixture.data.set([255, 255, 255, 255], offset);
    const result = analyzeColor(fixture);
    expect(result.displayName).toBe('Rot');
    expect(result.hex).toBe('#cd2d2d');
  });

  it('rejects transparent fixtures with too few valid samples', () => {
    const fixture = solidFixture(210, 48, 48, 2);
    fixture.data.fill(0);
    expect(analyzeColor(fixture)).toEqual({
      hex: '#808080',
      displayName: 'Nicht bestimmbar',
      confidence: 'low',
    });
  });

  it('allows filtering bounds to be configured', () => {
    const result = analyzeColor(solidFixture(210, 48, 48), {
      ...defaultColorAnalysisConfig,
      minimumAlpha: 256,
    });
    expect(result.displayName).toBe('Nicht bestimmbar');
  });
});

describe('centralRoi', () => {
  it('keeps the center and reduces both dimensions to 70 percent', () => {
    expect(centralRoi({ x: 10, y: 20, width: 100, height: 200 })).toEqual({
      x: 25,
      y: 50,
      width: 70,
      height: 140,
    });
  });
});
