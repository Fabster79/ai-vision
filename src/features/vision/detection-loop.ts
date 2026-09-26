export type DetectionPerformance = {
  inferenceMs: number;
  analysisFps: number;
  objectCount: number;
};

export type DetectionLoopOptions<T> = {
  video: HTMLVideoElement;
  detect: (timestampMs: number) => Promise<readonly T[]>;
  onResult: (results: readonly T[], capturedAt: Date) => void;
  onPerformance?: (performance: DetectionPerformance) => void;
  targetFps: number;
  now?: () => number;
  visibilityDocument?: Pick<Document, 'hidden' | 'addEventListener' | 'removeEventListener'>;
};

export type DetectionLoop = { start: () => void; stop: () => void; running: () => boolean };

/**
 * Schedules exactly one inference at a time. Video-frame callbacks are used when
 * available; animation frames are the compatibility fallback for older Safari.
 */
export function createDetectionLoop<T>(options: DetectionLoopOptions<T>): DetectionLoop {
  const now = options.now ?? (() => performance.now());
  const visibilityDocument = options.visibilityDocument ?? document;
  const minimumInterval = 1000 / Math.max(0.1, options.targetFps);
  let active = false;
  let callbackId: number | null = null;
  let callbackKind: 'video' | 'animation' | null = null;
  let lastStartedAt = Number.NEGATIVE_INFINITY;

  const cancelScheduled = () => {
    if (callbackId === null) return;
    if (callbackKind === 'video') options.video.cancelVideoFrameCallback?.(callbackId);
    else cancelAnimationFrame(callbackId);
    callbackId = null;
    callbackKind = null;
  };

  const schedule = () => {
    if (!active || visibilityDocument.hidden || callbackId !== null) return;
    if (typeof options.video.requestVideoFrameCallback === 'function') {
      callbackKind = 'video';
      callbackId = options.video.requestVideoFrameCallback(() => {
        callbackId = null;
        callbackKind = null;
        void tick();
      });
    } else {
      callbackKind = 'animation';
      callbackId = requestAnimationFrame(() => {
        callbackId = null;
        callbackKind = null;
        void tick();
      });
    }
  };

  const tick = async () => {
    if (!active || visibilityDocument.hidden) return;
    const startedAt = now();
    if (startedAt - lastStartedAt < minimumInterval) {
      schedule();
      return;
    }
    const interval = startedAt - lastStartedAt;
    lastStartedAt = startedAt;
    try {
      const results = await options.detect(startedAt);
      if (!active) return;
      const inferenceMs = Math.max(0, now() - startedAt);
      options.onResult(results, new Date());
      options.onPerformance?.({
        inferenceMs,
        analysisFps: Number.isFinite(interval) && interval > 0 ? 1000 / interval : 0,
        objectCount: results.length,
      });
    } finally {
      schedule();
    }
  };

  const onVisibilityChange = () => {
    if (visibilityDocument.hidden) cancelScheduled();
    else schedule();
  };

  return {
    start() {
      if (active) return;
      active = true;
      visibilityDocument.addEventListener('visibilitychange', onVisibilityChange);
      schedule();
    },
    stop() {
      if (!active) return;
      active = false;
      cancelScheduled();
      visibilityDocument.removeEventListener('visibilitychange', onVisibilityChange);
    },
    running: () => active,
  };
}
