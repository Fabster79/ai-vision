import { CameraIcon, LoopIcon, StopIcon, VideoIcon } from '@radix-ui/react-icons';

import type { CameraStatus } from '../../hooks/useCamera';

type CameraControlsProps = {
  status: CameraStatus;
  canSwitch: boolean;
  onStart: () => void;
  onStop: () => void;
  onSwitch: () => void;
};

export function CameraControls({
  status,
  canSwitch,
  onStart,
  onStop,
  onSwitch,
}: CameraControlsProps) {
  const active = status === 'active';
  return (
    <div className="camera-controls" aria-label="Kamerasteuerung">
      {active ? (
        <>
          <button className="control-button" type="button" onClick={onSwitch} disabled={!canSwitch}>
            <LoopIcon /> <span>Wechseln</span>
          </button>
          <button
            className="control-button"
            type="button"
            disabled
            title="Verfügbar mit Objekterkennung"
          >
            <VideoIcon /> <span>Live</span>
          </button>
          <button className="control-button control-button--stop" type="button" onClick={onStop}>
            <StopIcon /> <span>Stoppen</span>
          </button>
        </>
      ) : (
        <button
          className="primary-action"
          type="button"
          onClick={onStart}
          disabled={status === 'requesting'}
        >
          <CameraIcon /> {status === 'requesting' ? 'Kamera startet …' : 'Kamera starten'}{' '}
          <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  );
}
