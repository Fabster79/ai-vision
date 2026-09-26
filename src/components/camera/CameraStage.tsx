import { CameraIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { Detection } from '../../features/vision/detection-types';
import type { CameraStatus } from '../../hooks/useCamera';
import { DetectionOverlay } from './DetectionOverlay';

type CameraStageProps = {
  stream: MediaStream | null;
  status: CameraStatus;
  message: string;
  facingMode: 'environment' | 'user';
  detections: Detection[];
  onVideoElement?: (video: HTMLVideoElement | null) => void;
};

export function CameraStage({
  stream,
  status,
  message,
  facingMode,
  detections,
  onVideoElement,
}: CameraStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState('');
  const [sourceSize, setSourceSize] = useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const setVideoRef = useCallback(
    (video: HTMLVideoElement | null) => {
      videoRef.current = video;
      onVideoElement?.(video);
    },
    [onVideoElement],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    if (!stream) {
      setDimensions('');
      setSourceSize({ width: 0, height: 0 });
    }
    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const updateSize = () =>
      setViewportSize({ width: stage.clientWidth, height: stage.clientHeight });
    updateSize();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateSize);
      observer.observe(stage);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const showError = status === 'denied' || status === 'unavailable' || status === 'error';

  return (
    <div ref={stageRef} className={`camera-stage camera-stage--${status}`} aria-live="polite">
      <video
        ref={setVideoRef}
        className={facingMode === 'user' ? 'mirrored' : undefined}
        autoPlay
        muted
        playsInline
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          setDimensions(`${video.videoWidth} × ${video.videoHeight}`);
          setSourceSize({ width: video.videoWidth, height: video.videoHeight });
          void video.play();
        }}
        aria-label="Live-Kameravorschau"
      />
      {status === 'active' && (
        <DetectionOverlay
          detections={detections}
          sourceSize={sourceSize}
          viewportSize={viewportSize}
          mirrored={facingMode === 'user'}
        />
      )}
      {status !== 'active' && (
        <div className="stage-message">
          <span className="camera-icon" aria-hidden="true">
            {showError ? <ExclamationTriangleIcon /> : <CameraIcon />}
          </span>
          <strong>
            {status === 'requesting'
              ? 'Einen Moment …'
              : showError
                ? 'Kamera nicht verfügbar'
                : 'Kamera bereit'}
          </strong>
          <small>{message}</small>
        </div>
      )}
      <div className="viewfinder" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      {status === 'active' && dimensions && <span className="stream-dimensions">{dimensions}</span>}
    </div>
  );
}
