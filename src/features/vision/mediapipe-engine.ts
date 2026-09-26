import { defaultDetectionConfig, type DetectionEngineConfig } from './detection-engine';
import type { Detection, DetectionEngine } from './detection-types';
import { analyzeDetectionColors } from './color-analysis';

type RawDetection = {
  boundingBox?: { originX?: number; originY?: number; width?: number; height?: number };
  categories?: Array<{ categoryName?: string; displayName?: string; score?: number }>;
};

type MediaPipeDetector = {
  detectForVideo(video: HTMLVideoElement, timestampMs: number): { detections?: RawDetection[] };
  close(): void;
};

type MediaPipeModule = {
  FilesetResolver: { forVisionTasks(path: string): Promise<unknown> };
  ObjectDetector: {
    createFromOptions(fileset: unknown, options: Record<string, unknown>): Promise<unknown>;
  };
};

const emptyColor: Detection['color'] = {
  hex: '#000000',
  displayName: 'Noch nicht analysiert',
  confidence: 'low',
};

export function normalizeDetections(
  rawDetections: readonly RawDetection[],
  config: Pick<DetectionEngineConfig, 'scoreThreshold' | 'maxResults' | 'labelAllowlist'>,
): Detection[] {
  const allowed = config.labelAllowlist
    ? new Set(config.labelAllowlist.map((label) => label.toLocaleLowerCase()))
    : undefined;

  return rawDetections
    .flatMap((raw, rawIndex) => {
      const category = raw.categories?.[0];
      const box = raw.boundingBox;
      const label = category?.categoryName || category?.displayName;
      const score = category?.score;
      if (
        !box ||
        !label ||
        score === undefined ||
        score < config.scoreThreshold ||
        (allowed && !allowed.has(label.toLocaleLowerCase()))
      ) {
        return [];
      }
      return [
        {
          id: `${label}-${rawIndex}-${Math.round(score * 1000)}`,
          label,
          score,
          boundingBox: {
            x: box.originX ?? 0,
            y: box.originY ?? 0,
            width: box.width ?? 0,
            height: box.height ?? 0,
          },
          color: emptyColor,
        },
      ];
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, config.maxResults);
}

export class MediapipeDetectionEngine implements DetectionEngine {
  private readonly config: DetectionEngineConfig;
  private detector: MediaPipeDetector | null = null;
  private loading: Promise<void> | null = null;
  private frameCanvas: HTMLCanvasElement | null = null;

  constructor(config: Partial<DetectionEngineConfig> = {}) {
    this.config = { ...defaultDetectionConfig, ...config };
    if (this.config.scoreThreshold < 0 || this.config.scoreThreshold > 1) {
      throw new RangeError('scoreThreshold muss zwischen 0 und 1 liegen.');
    }
    if (!Number.isInteger(this.config.maxResults) || this.config.maxResults < 1) {
      throw new RangeError('maxResults muss eine positive ganze Zahl sein.');
    }
  }

  load(): Promise<void> {
    if (this.detector) return Promise.resolve();
    if (this.loading) return this.loading;
    this.loading = this.createDetector().catch((error: unknown) => {
      this.loading = null;
      throw error;
    });
    return this.loading;
  }

  private async createDetector() {
    // MediaPipe remains lazy so a network/model failure never blocks the camera UI.
    const vision = (await import(
      /* @vite-ignore */ this.config.moduleAssetPath
    )) as MediaPipeModule;
    const fileset = await vision.FilesetResolver.forVisionTasks(this.config.wasmAssetPath);
    this.detector = (await vision.ObjectDetector.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: this.config.modelAssetPath },
      runningMode: 'VIDEO',
      scoreThreshold: this.config.scoreThreshold,
      maxResults: this.config.maxResults,
      categoryAllowlist: this.config.labelAllowlist ? [...this.config.labelAllowlist] : undefined,
    })) as MediaPipeDetector;
  }

  async detect(video: HTMLVideoElement, timestampMs: number): Promise<Detection[]> {
    await this.load();
    if (!this.detector) throw new Error('Objekterkennung ist nicht bereit.');
    const result = this.detector.detectForVideo(video, timestampMs);
    const detections = normalizeDetections(result.detections ?? [], this.config);
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height || detections.length === 0) return detections;

    this.frameCanvas ??= document.createElement('canvas');
    this.frameCanvas.width = width;
    this.frameCanvas.height = height;
    const context = this.frameCanvas.getContext('2d', { willReadFrequently: true });
    if (!context) return detections;
    context.drawImage(video, 0, 0, width, height);
    return analyzeDetectionColors(context, detections, width, height);
  }

  dispose() {
    this.detector?.close();
    this.detector = null;
    this.loading = null;
    this.frameCanvas = null;
  }
}
