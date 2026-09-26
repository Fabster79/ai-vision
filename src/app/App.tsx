import { LockClosedIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

import { CameraControls } from '../components/camera/CameraControls';
import { CameraStage } from '../components/camera/CameraStage';
import { DetectionPanel } from '../components/detection/DetectionPanel';
import { useCamera } from '../hooks/useCamera';
import { useDetectionEngine } from '../hooks/useDetectionEngine';

export function App() {
  const camera = useCamera();
  const detection = useDetectionEngine();
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);

  return (
    <main className="app-shell">
      <header className="app-header">
        <a className="brand" href="#top" aria-label="PocketVision Startseite">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>PocketVision</span>
        </a>
        <span className="status-pill">
          <span aria-hidden="true" /> Lokal &amp; privat
        </span>
      </header>

      <section className="camera-workspace" id="top">
        <div className="camera-copy">
          <div className="eyebrow">
            <span /> Kamera-Fundament
          </div>
          <h1>
            Deine Sicht.
            <br />
            <em>Deine Kamera.</em>
          </h1>
          <p className="intro">
            Starte die Kamera bewusst und wechsle bei Bedarf die Perspektive. Das Bild bleibt dabei
            vollständig auf deinem Gerät.
          </p>
          <div className="camera-status" data-status={camera.status}>
            <span aria-hidden="true" />
            <div>
              <b>{camera.status === 'active' ? 'Kamera aktiv' : 'Kamerastatus'}</b>
              <p>{camera.message}</p>
            </div>
          </div>
        </div>

        <div className="camera-output">
          <div className="camera-panel">
            <CameraStage
              stream={camera.stream}
              status={camera.status}
              message={camera.message}
              facingMode={camera.facingMode}
              detections={detection.detections}
              onVideoElement={setVideo}
            />
            <CameraControls
              status={camera.status}
              canSwitch={camera.canSwitch}
              onStart={() => void camera.start()}
              onStop={() => camera.stop('Kamera wurde gestoppt.')}
              onSwitch={() => void camera.switchCamera()}
            />
            <p className="privacy-note">
              <LockClosedIcon /> Kameraaufnahmen werden weder hochgeladen noch gespeichert.
            </p>
          </div>

          <DetectionPanel
            status={detection.status}
            message={detection.message}
            cameraActive={camera.status === 'active'}
            isDetecting={detection.isDetecting}
            detections={detection.detections}
            onAnalyze={() => void detection.analyze(video)}
            onRetry={() => void detection.retry()}
            onClear={detection.clear}
          />
        </div>
      </section>

      <section className="camera-facts" aria-label="Hinweise zur Kamera">
        <article>
          <span>01</span>
          <div>
            <h2>Du entscheidest</h2>
            <p>Die Kamera startet erst nach deinem Tippen und kann jederzeit beendet werden.</p>
          </div>
        </article>
        <article>
          <span>02</span>
          <div>
            <h2>Automatisch sicher</h2>
            <p>Beim Verlassen oder Ausblenden der Seite wird der laufende Stream beendet.</p>
          </div>
        </article>
        <article>
          <span>03</span>
          <div>
            <h2>Mobil gedacht</h2>
            <p>Rückkamera zuerst, große Touch-Ziele und Platz für die Safe Area.</p>
          </div>
        </article>
      </section>

      <footer>Objekterkennung lokal auf deinem Gerät – ohne Upload.</footer>
    </main>
  );
}
