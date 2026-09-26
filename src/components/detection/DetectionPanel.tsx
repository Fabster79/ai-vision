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
  isLive: boolean;
  batterySaver: boolean;
  lastUpdated: Date | null;
  performanceMetrics: { inferenceMs: number; analysisFps: number; objectCount: number } | null;
  onToggleBatterySaver: () => void;
};

export function DetectionPanel(props: DetectionPanelProps) {
  const canAnalyze = props.status === 'ready' && props.cameraActive && !props.isDetecting;
  const confidenceLabels = { high: 'hoch', medium: 'mittel', low: 'niedrig' } as const;
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
      <div className="live-options">
        <label>
          <input
            type="checkbox"
            checked={props.batterySaver}
            onChange={props.onToggleBatterySaver}
            disabled={props.isLive}
          />
          Batteriesparmodus (1 Analyse/Sek.)
        </label>
        {props.isLive && <span className="live-indicator">● Live-Erkennung aktiv</span>}
      </div>
      {props.lastUpdated && (
        <p className="result-timestamp">
          Letzte gültige Analyse: {props.lastUpdated.toLocaleTimeString('de-DE')}
        </p>
      )}
      {import.meta.env.DEV && props.performanceMetrics && (
        <output className="performance-profile" aria-label="Performance-Profil">
          {Math.round(props.performanceMetrics.inferenceMs)} ms ·{' '}
          {props.performanceMetrics.analysisFps.toFixed(1)} FPS ·{' '}
          {props.performanceMetrics.objectCount} Objekte
        </output>
      )}
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
                <small>Objekt-Konfidenz</small>
              </div>
              <span className="detection-score">{Math.round(detection.score * 100)} %</span>
              <div className="detection-color">
                <span
                  className="color-swatch"
                  style={{ backgroundColor: detection.color.hex }}
                  aria-hidden="true"
                />
                <span>
                  <b>Geschätzte Hauptfarbe: {detection.color.displayName}</b>
                  <small>
                    {detection.color.hex.toUpperCase()} · Sicherheit{' '}
                    {confidenceLabels[detection.color.confidence]}
                  </small>
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
