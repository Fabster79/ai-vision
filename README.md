# PocketVision

Mobile-first Webanwendung für lokale Objekt- und Farberkennung über die Gerätekamera. Das Projekt befindet sich nach **M0** in der technischen Grundphase; Kamerazugriff und Erkennung folgen in den nächsten Meilensteinen.

## Datenschutz

Die geplante Bildanalyse läuft vollständig im Browser. Kamera-Frames werden nicht hochgeladen, nicht gespeichert und nicht an einen serverseitigen KI-Dienst übertragen. Die Anwendung benötigt weder Konto noch API-Schlüssel.

## Voraussetzungen

- Node.js 20.19 oder neuer
- npm 10 oder neuer
- Für den späteren Kamerazugriff: `localhost` oder eine HTTPS-Verbindung

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
- **M1 – Kamera-Fundament:** als Nächstes
- M2–M6: geplant

Der vollständige, verbindliche Ablauf steht im [Codex-Projektplan](Docs/ai-vision-object-detection-codex-plan.md).
