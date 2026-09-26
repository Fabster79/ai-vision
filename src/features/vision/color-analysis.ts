import type { BoundingBox, Detection } from './detection-types';

export type ColorAnalysisConfig = {
  roiScale: number;
  minimumAlpha: number;
  nearBlackLightness: number;
  nearWhiteLightness: number;
  minimumSamples: number;
  sampleStride: number;
};

export const defaultColorAnalysisConfig: ColorAnalysisConfig = {
  roiScale: 0.7,
  minimumAlpha: 128,
  nearBlackLightness: 0.055,
  nearWhiteLightness: 0.94,
  minimumSamples: 12,
  sampleStride: 2,
};

type Oklab = { l: number; a: number; b: number };
type PaletteColor = Oklab & { hex: string; displayName: string };

const paletteSource = [
  ['#d93636', 'Rot'],
  ['#e87924', 'Orange'],
  ['#e2bf2f', 'Gelb'],
  ['#3b9b55', 'Grün'],
  ['#3976d3', 'Blau'],
  ['#7a4dbc', 'Violett'],
  ['#d85c91', 'Rosa'],
  ['#79513a', 'Braun'],
  ['#808080', 'Grau'],
  ['#151515', 'Schwarz'],
  ['#eeeeea', 'Weiß'],
] as const;

const fallbackColor: Detection['color'] = {
  hex: '#808080',
  displayName: 'Nicht bestimmbar',
  confidence: 'low',
};

function srgbChannel(value: number) {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function rgbToOklab(red: number, green: number, blue: number): Oklab {
  const r = srgbChannel(red);
  const g = srgbChannel(green);
  const b = srgbChannel(blue);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);
  return {
    l: 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot,
    a: 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot,
    b: 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot,
  };
}

function hexToRgb(hex: string) {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

const palette: PaletteColor[] = paletteSource.map(([hex, displayName]) => {
  const [red = 0, green = 0, blue = 0] = hexToRgb(hex);
  return { hex, displayName, ...rgbToOklab(red, green, blue) };
});

function median(values: number[]) {
  values.sort((a, b) => a - b);
  const middle = Math.floor(values.length / 2);
  return values.length % 2 === 0
    ? ((values[middle - 1] ?? 0) + (values[middle] ?? 0)) / 2
    : (values[middle] ?? 0);
}

function distance(first: Oklab, second: Oklab) {
  return Math.hypot(first.l - second.l, first.a - second.a, first.b - second.b);
}

function toHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue]
    .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}

/** Analyzes a previously cropped ROI. Extreme pixels are ignored only when
 * enough mid-tone pixels exist, so genuinely black or white objects remain classifiable. */
export function analyzeColor(
  imageData: ImageData,
  config: ColorAnalysisConfig = defaultColorAnalysisConfig,
): Detection['color'] {
  const regular: number[][] = [];
  const extremes: number[][] = [];
  const stride = Math.max(1, Math.floor(config.sampleStride));

  for (let pixel = 0; pixel < imageData.width * imageData.height; pixel += stride) {
    const offset = pixel * 4;
    const alpha = imageData.data[offset + 3] ?? 0;
    if (alpha < config.minimumAlpha) continue;
    const sample = [
      imageData.data[offset] ?? 0,
      imageData.data[offset + 1] ?? 0,
      imageData.data[offset + 2] ?? 0,
    ];
    const lightness = rgbToOklab(sample[0]!, sample[1]!, sample[2]!).l;
    (lightness <= config.nearBlackLightness || lightness >= config.nearWhiteLightness
      ? extremes
      : regular
    ).push(sample);
  }

  const samples = regular.length >= config.minimumSamples ? regular : [...regular, ...extremes];
  if (samples.length < config.minimumSamples) return { ...fallbackColor };

  const red = median(samples.map((sample) => sample[0]!));
  const green = median(samples.map((sample) => sample[1]!));
  const blue = median(samples.map((sample) => sample[2]!));
  const measured = rgbToOklab(red, green, blue);
  const ranked = palette
    .map((color) => ({ color, distance: distance(measured, color) }))
    .sort((a, b) => a.distance - b.distance);
  const best = ranked[0]!;
  const separation = (ranked[1]?.distance ?? 1) - best.distance;
  const confidence =
    best.distance < 0.1 && separation > 0.035
      ? 'high'
      : best.distance < 0.2 && separation > 0.012
        ? 'medium'
        : 'low';

  return { hex: toHex(red, green, blue), displayName: best.color.displayName, confidence };
}

export function centralRoi(box: BoundingBox, scale = defaultColorAnalysisConfig.roiScale) {
  const safeScale = Math.min(1, Math.max(0.1, scale));
  const width = box.width * safeScale;
  const height = box.height * safeScale;
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + (box.height - height) / 2,
    width,
    height,
  };
}

export function analyzeDetectionColors(
  context: CanvasRenderingContext2D,
  detections: Detection[],
  frameWidth: number,
  frameHeight: number,
  config: ColorAnalysisConfig = defaultColorAnalysisConfig,
) {
  return detections.map((detection) => {
    const roi = centralRoi(detection.boundingBox, config.roiScale);
    const x = Math.max(0, Math.floor(roi.x));
    const y = Math.max(0, Math.floor(roi.y));
    const width = Math.min(frameWidth - x, Math.max(1, Math.ceil(roi.width)));
    const height = Math.min(frameHeight - y, Math.max(1, Math.ceil(roi.height)));
    if (width <= 0 || height <= 0) return { ...detection, color: { ...fallbackColor } };
    try {
      return {
        ...detection,
        color: analyzeColor(context.getImageData(x, y, width, height), config),
      };
    } catch {
      return { ...detection, color: { ...fallbackColor } };
    }
  });
}
