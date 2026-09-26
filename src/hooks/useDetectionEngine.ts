import { useCallback, useEffect, useRef, useState } from 'react';

import type { DetectionEngineFactory } from '../features/vision/detection-engine';
import { MediapipeDetectionEngine } from '../features/vision/mediapipe-engine';
import type { Detection } from '../features/vision/detection-types';
import {
  createDetectionLoop,
  type DetectionLoop,
  type DetectionPerformance,
} from '../features/vision/detection-loop';

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
  const [isLive, setIsLive] = useState(false);
  const [batterySaver, setBatterySaver] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<DetectionPerformance | null>(null);
  const loopRef = useRef<DetectionLoop | null>(null);

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
        setLastUpdated(new Date());
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

  const stopLive = useCallback(() => {
    loopRef.current?.stop();
    loopRef.current = null;
    setIsLive(false);
    setIsDetecting(false);
  }, []);

  const startLive = useCallback(
    (video: HTMLVideoElement | null) => {
      if (!video || status !== 'ready' || loopRef.current) return;
      const mobile = window.matchMedia('(max-width: 759px)').matches;
      const targetFps = batterySaver ? 1 : mobile ? 3 : 5;
      const loop = createDetectionLoop<Detection>({
        video,
        targetFps,
        detect: async (timestampMs) => {
          setIsDetecting(true);
          try {
            return await engineRef.current.detect(video, timestampMs);
          } catch (error) {
            console.error('[PocketVision] Live-Erkennung fehlgeschlagen.', error);
            setMessage('Die Live-Erkennung wurde wegen eines Fehlers beendet.');
            stopLive();
            return [];
          } finally {
            setIsDetecting(false);
          }
        },
        onResult: (results, capturedAt) => {
          setDetections([...results].sort((a, b) => b.score - a.score));
          setLastUpdated(capturedAt);
        },
        onPerformance: setPerformanceMetrics,
      });
      loopRef.current = loop;
      setIsLive(true);
      loop.start();
    },
    [batterySaver, status, stopLive],
  );

  useEffect(() => stopLive, [stopLive]);

  const toggleBatterySaver = useCallback(() => {
    // A running loop keeps its cadence stable; the new setting applies on its next start.
    setBatterySaver((enabled) => !enabled);
  }, []);

  return {
    status,
    message,
    detections,
    isDetecting,
    isLive,
    batterySaver,
    lastUpdated,
    performanceMetrics,
    analyze,
    startLive,
    stopLive,
    toggleBatterySaver,
    retry: load,
    clear,
  };
}
