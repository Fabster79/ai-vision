import type { DetectionEngine } from './detection-types';

export type DetectionEngineConfig = {
  scoreThreshold: number;
  maxResults: number;
  labelAllowlist?: readonly string[];
  moduleAssetPath: string;
  modelAssetPath: string;
  wasmAssetPath: string;
  mobileInferenceMaxDimension: number;
};

export const defaultDetectionConfig: DetectionEngineConfig = {
  // EfficientDet often scores smaller COCO objects (for example a book held
  // in front of a person) below 0.5. This deliberately moderate threshold
  // keeps those candidates without making very weak guesses visible.
  scoreThreshold: 0.35,
  maxResults: 8,
  moduleAssetPath:
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/vision_bundle.mjs',
  modelAssetPath:
    'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/1/efficientdet_lite0.tflite',
  wasmAssetPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm',
  mobileInferenceMaxDimension: 640,
};

export type DetectionEngineFactory = (config?: Partial<DetectionEngineConfig>) => DetectionEngine;
