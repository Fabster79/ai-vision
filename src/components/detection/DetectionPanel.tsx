import { Cross2Icon, MagnifyingGlassIcon, ReloadIcon } from '@radix-ui/react-icons';

import type { DetectionEngineStatus } from '../../hooks/useDetectionEngine';
import type { Detection } from '../../features/vision/detection-types';

type DetectionPanelProps = {
  status: DetectionEngineStatus;
  message: string;
  cameraActive: boolean;
  isDetecting: boolean;
  detections: Detection[];
  onAnalyze: () => void;
  onRetry: () => void;
  onClear: () => void;
};

export function DetectionPanel(props: DetectionPanelProps) {
  const canAnalyze = props.status === 'ready' && props.cameraActive && !props.isDetecting;
  return (
    <section className="detection-panel" aria-labelledby="detection-title">
      <div className="detection-heading">
        <div>
          <span className={`ai-status ai-status--${props.status}`} role="status">
            <i aria-hidden="true" /> {props.message}
          </span>
          <h2 id="detection-title">Objekte im Bild</h2>
        </div>
        {props.status === 'error' ? (
          <button className="secondary-action" type="button" onClick={props.onRetry}>
            <ReloadIcon /> Erneut laden
          </button>
        ) : (
          <button
            className="analyze-action"
            type="button"
            disabled={!canAnalyze}
            onClick={props.onAnalyze}
          >
            <MagnifyingGlassIcon /> {props.isDetecting ? 'Analysiert …' : 'Einzelanalyse'}
          </button>
        )}
      </div>
      {props.detections.length > 0 && (
        <div className="detection-summary">
          <span>{props.detections.length} Objekte erkannt</span>
          <button type="button" onClick={props.onClear}>
            <Cross2Icon /> Ergebnisse löschen
          </button>
        </div>
      )}
      {props.detections.length === 0 ? (
        <p className="empty-detections">
          {props.cameraActive ? 'Noch keine Objekte analysiert.' : 'Starte zuerst die Kamera.'}
        </p>
      ) : (
        <ol className="detection-list">
          {props.detections.map((detection, index) => (
            <li key={detection.id}>
              <span className="detection-rank" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <strong>{detection.label}</strong>
                <small>Konfidenz</small>
              </div>
              <span className="detection-score">{Math.round(detection.score * 100)} %</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
