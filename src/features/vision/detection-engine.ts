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
  moduleAssetPath: '/mediapipe/vision_bundle.mjs',
  modelAssetPath: '/models/efficientdet_lite0.tflite',
  wasmAssetPath: '/mediapipe/wasm',
};

export type DetectionEngineFactory = (config?: Partial<DetectionEngineConfig>) => DetectionEngine;
