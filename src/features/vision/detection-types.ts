export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Detection = {
  id: string;
  label: string;
  score: number;
  boundingBox: BoundingBox;
  color: {
    hex: string;
    displayName: string;
    confidence: 'high' | 'medium' | 'low';
  };
};

export interface DetectionEngine {
  load(): Promise<void>;
  detect(video: HTMLVideoElement, timestampMs: number): Promise<Detection[]>;
  dispose(): void;
}
