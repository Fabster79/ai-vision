import { CameraIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { CameraStatus } from '../../hooks/useCamera';

type CameraStageProps = {
  stream: MediaStream | null;
  status: CameraStatus;
  message: string;
  facingMode: 'environment' | 'user';
  onVideoElement?: (video: HTMLVideoElement | null) => void;
};

export function CameraStage({
  stream,
  status,
  message,
  facingMode,
  onVideoElement,
}: CameraStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dimensions, setDimensions] = useState('');
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
    if (!stream) setDimensions('');
    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  const showError = status === 'denied' || status === 'unavailable' || status === 'error';

  return (
    <div className={`camera-stage camera-stage--${status}`} aria-live="polite">
      <video
        ref={setVideoRef}
        className={facingMode === 'user' ? 'mirrored' : undefined}
        autoPlay
        muted
        playsInline
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          setDimensions(`${video.videoWidth} × ${video.videoHeight}`);
          void video.play();
        }}
        aria-label="Live-Kameravorschau"
      />
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
