# PocketVision

Mobile-first Webanwendung für lokale Objekt- und Farberkennung über die Gerätekamera. Objektboxen und eine robuste Schätzung der Hauptfarbe werden vollständig lokal ermittelt.

## Datenschutz

Die geplante Bildanalyse läuft vollständig im Browser. Kamera-Frames werden nicht hochgeladen, nicht gespeichert und nicht an einen serverseitigen KI-Dienst übertragen. Die Anwendung benötigt weder Konto noch API-Schlüssel.

## Voraussetzungen

- Node.js 20.19 oder neuer
- npm 10 oder neuer
- Für den Kamerazugriff: `localhost` oder eine HTTPS-Verbindung und eine erteilte Browser-Berechtigung

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Vite zeigt anschließend die lokale URL an. Die weiteren Qualitätsprüfungen stehen als einzelne Skripte bereit:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Für E2E-Tests müssen einmalig die Playwright-Browser installiert werden (`npx playwright install`).

## Browser- und Gerätetestmatrix

Mobile Geräte sind die Referenz und werden vor Desktop freigegeben.

| Priorität | Plattform                    | Browser       | Verbindliche Prüfung                                                                  |
| --------- | ---------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| Primär    | aktuelles Android-Smartphone | Chrome        | 360+ CSS-Pixel, Hoch-/Querformat, Safe Areas, Touch-Ziele, Kamera-Lifecycle           |
| Primär    | aktuelles iPhone             | Safari        | Hoch-/Querformat, Notch/Home-Indikator, Berechtigung, `playsInline`, Kamera-Lifecycle |
| Sekundär  | Desktop                      | Chrome / Edge | Responsives Layout und Kamera-Kompatibilität                                          |
| Sekundär  | macOS                        | Safari        | Responsives Layout und Kamera-Kompatibilität                                          |

Automatisierte Browser-Emulation ergänzt die Tests auf echten Geräten, ersetzt sie jedoch nicht. Das manuelle Abnahmeprotokoll wird mit dem Kamera-Meilenstein erweitert.

## Projektstruktur

- `src/app`: App-Einstieg und Seitenaufbau
- `src/styles`: globale mobile-first Styles und Safe-Area-Grundlage
- `src/test`: Test-Setup
- `e2e`: Browser- und Layouttests
- `Docs`: Projektplan, archivierter Auftrag und Architekturentscheidungen
- `.github/workflows`: automatisierte Qualitätsprüfungen

## Projektstatus

- **M0 – Technische Basis:** umgesetzt
- **M1 – Kamera-Fundament:** umgesetzt
- **M2 – Objekterkennung:** umgesetzt
- **M3 – Overlay und Ergebnisliste:** umgesetzt
- **M4 – Farb-Analyse:** umgesetzt
- M5–M6: geplant

Der vollständige, verbindliche Ablauf steht im [Codex-Projektplan](Docs/ai-vision-object-detection-codex-plan.md).

## Erkennungsgrenzen

Das verwendete EfficientDet-Lite0-Modell kennt die COCO-Klasse `book`. Kleinere Objekte erhalten
jedoch häufig eine niedrigere Konfidenz als große, bildfüllende Objekte wie eine Person. Der
Standard-Schwellwert ist deshalb auf einen moderaten Wert von `0.35` eingestellt und es werden bis
zu acht Ergebnisse berücksichtigt. Das verbessert beispielsweise die Chance, ein deutlich vor die
Kamera gehaltenes Buch zusätzlich zur Person zu erkennen, kann aber gelegentlich auch eine falsche
Erkennung anzeigen.

Ein niedrigerer Schwellwert kann keine Erkennung erzwingen: Perspektive, Beleuchtung, Verdeckung und
die Grenzen des vortrainierten Modells bleiben maßgeblich. Ein Modellwechsel oder objektspezifisches
Training ist dafür nicht Teil von M4; das sollte erst nach Messungen mit mehreren repräsentativen
Testmotiven als eigener Qualitätsschritt bewertet werden.
