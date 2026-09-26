import { createDetectionLoop } from './detection-loop';

describe('createDetectionLoop', () => {
  it('never overlaps inference and schedules the next frame after completion', async () => {
    let frameCallback: VideoFrameRequestCallback | undefined;
    let resolveDetection: ((value: readonly number[]) => void) | undefined;
    const requestVideoFrameCallback = vi.fn((callback: VideoFrameRequestCallback) => {
      frameCallback = callback;
      return 1;
    });
    const cancelVideoFrameCallback = vi.fn();
    const video = {
      requestVideoFrameCallback,
      cancelVideoFrameCallback,
    } as unknown as HTMLVideoElement;
    const detect = vi.fn(
      () => new Promise<readonly number[]>((resolve) => (resolveDetection = resolve)),
    );
    const loop = createDetectionLoop({ video, detect, onResult: vi.fn(), targetFps: 3 });

    loop.start();
    expect(requestVideoFrameCallback).toHaveBeenCalledTimes(1);
    frameCallback?.(1000, {} as VideoFrameCallbackMetadata);
    expect(detect).toHaveBeenCalledTimes(1);
    expect(requestVideoFrameCallback).toHaveBeenCalledTimes(1);

    resolveDetection?.([]);
    await Promise.resolve();
    await Promise.resolve();
    expect(requestVideoFrameCallback).toHaveBeenCalledTimes(2);
  });

  it('cancels a pending callback when stopped', () => {
    const cancelVideoFrameCallback = vi.fn();
    const video = {
      requestVideoFrameCallback: vi.fn(() => 42),
      cancelVideoFrameCallback,
    } as unknown as HTMLVideoElement;
    const loop = createDetectionLoop({
      video,
      detect: vi.fn().mockResolvedValue([]),
      onResult: vi.fn(),
      targetFps: 1,
    });

    loop.start();
    loop.stop();
    expect(cancelVideoFrameCallback).toHaveBeenCalledWith(42);
    expect(loop.running()).toBe(false);
  });
});
