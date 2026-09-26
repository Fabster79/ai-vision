import { useCallback, useEffect, useRef, useState } from 'react';

import type { DetectionEngineFactory } from '../features/vision/detection-engine';
import { MediapipeDetectionEngine } from '../features/vision/mediapipe-engine';
import type { Detection } from '../features/vision/detection-types';

export type DetectionEngineStatus = 'loading' | 'ready' | 'error';

const createDefaultEngine: DetectionEngineFactory = (config) =>
  new MediapipeDetectionEngine(config);

let sharedEngine: ReturnType<DetectionEngineFactory> | null = null;

function getSharedEngine(factory: DetectionEngineFactory) {
  sharedEngine ??= factory();
  return sharedEngine;
}

export function useDetectionEngine(factory: DetectionEngineFactory = createDefaultEngine) {
  const engineRef = useRef(getSharedEngine(factory));
  const initialLoadStartedRef = useRef(false);
  const [status, setStatus] = useState<DetectionEngineStatus>('loading');
  const [message, setMessage] = useState('KI-Modell wird geladen …');
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  const load = useCallback(async () => {
    setStatus('loading');
    setMessage('KI-Modell wird geladen …');
    try {
      await engineRef.current.load();
      setStatus('ready');
      setMessage('KI bereit');
    } catch (error) {
      console.error('[PocketVision] KI-Modell konnte nicht geladen werden.', error);
      setStatus('error');
      setMessage('KI-Modell konnte nicht geladen werden. Die Kamera bleibt weiterhin nutzbar.');
    }
  }, []);

  useEffect(() => {
    // React StrictMode runs effects twice in development. Do not start a second
    // observer for the same load promise or report the same failure twice.
    if (initialLoadStartedRef.current) return;
    initialLoadStartedRef.current = true;
    void load();
  }, [load]);

  const analyze = useCallback(
    async (video: HTMLVideoElement | null) => {
      if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || isDetecting) return;
      setIsDetecting(true);
      try {
        const nextDetections = await engineRef.current.detect(video, performance.now());
        setDetections([...nextDetections].sort((a, b) => b.score - a.score));
      } catch (error) {
        console.error('[PocketVision] Einzelanalyse fehlgeschlagen.', error);
        setStatus('error');
        setMessage('Die Einzelanalyse ist fehlgeschlagen. Bitte versuche es erneut.');
      } finally {
        setIsDetecting(false);
      }
    },
    [isDetecting],
  );

  const clear = useCallback(() => setDetections([]), []);

  return { status, message, detections, isDetecting, analyze, retry: load, clear };
}
