import type { DetectionEngine } from './detection-types';

export type DetectionEngineConfig = {
  scoreThreshold: number;
  maxResults: number;
  labelAllowlist?: readonly string[];
  moduleAssetPath: string;
  modelAssetPath: string;
  wasmAssetPath: string;
};

export const defaultDetectionConfig: DetectionEngineConfig = {
  scoreThreshold: 0.5,
  maxResults: 5,
  moduleAssetPath:
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/vision_bundle.mjs',
  modelAssetPath:
    'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/1/efficientdet_lite0.tflite',
  wasmAssetPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm',
};

export type DetectionEngineFactory = (config?: Partial<DetectionEngineConfig>) => DetectionEngine;
