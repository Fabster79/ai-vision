import { CameraIcon, LockClosedIcon } from '@radix-ui/react-icons';

const roadmap = [
  { label: 'Technische Basis', state: 'Bereit' },
  { label: 'Kamera-Fundament', state: 'Als Nächstes' },
  { label: 'Objekterkennung', state: 'Geplant' },
];

export function App() {
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

      <section className="hero" id="top">
        <div className="eyebrow">
          <span /> Mobile Objekterkennung
        </div>
        <h1>
          Sieh, was deine
          <br />
          <em>Kamera sieht.</em>
        </h1>
        <p className="intro">
          Objekte und Farben direkt im Browser erkennen – schnell, verständlich und ohne Upload.
        </p>

        <div className="camera-preview" aria-label="Kamera-Vorschau noch nicht aktiv">
          <div className="viewfinder" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="preview-center">
            <span className="camera-icon">
              <CameraIcon />
            </span>
            <strong>Kamera bereit</strong>
            <small>Im nächsten Schritt aktivierbar</small>
          </div>
          <div className="preview-grid" aria-hidden="true" />
        </div>

        <button className="primary-action" type="button" disabled>
          <CameraIcon /> Kamera starten <span aria-hidden="true">→</span>
        </button>
        <p className="privacy-note">
          <LockClosedIcon /> Bilder bleiben auf diesem Gerät.
        </p>
      </section>

      <section className="roadmap" aria-labelledby="roadmap-title">
        <div className="section-heading">
          <div>
            <span>Projektstatus</span>
            <h2 id="roadmap-title">Unser Weg zur Live-Erkennung</h2>
          </div>
          <b>1 / 3</b>
        </div>
        <div className="roadmap-list">
          {roadmap.map((item, index) => (
            <article className={index === 0 ? 'active' : ''} key={item.label}>
              <span className="step-number">0{index + 1}</span>
              <div>
                <h3>{item.label}</h3>
                <p>{item.state}</p>
              </div>
              <span className="step-state" aria-label={item.state}>
                {index === 0 ? '✓' : '·'}
              </span>
            </article>
          ))}
        </div>
      </section>

      <footer>Entwickelt für moderne mobile Browser.</footer>
    </main>
  );
}
