# Architektur und Entscheidungslog

## Kontext

PocketVision soll als eigenständige, mobile-first Browseranwendung Live-Objekte und ihre geschätzte Hauptfarbe erkennen. Bilddaten dürfen das Gerät nicht verlassen. Dieses Dokument hält die technischen Entscheidungen fest und wird pro Meilenstein erweitert.

## M0 – Technische Basis (20. September 2026)

### Entscheidung 001: React, TypeScript und Vite

**Status:** angenommen

React bildet die UI, TypeScript läuft im strikten Modus und Vite übernimmt Entwicklung und statischen Produktionsbuild. Die Kombination hält die Anwendung unabhängig von Backend- und Plattformdiensten und erlaubt eine statische HTTPS-Auslieferung.

### Entscheidung 002: Mobile-first und Safe Areas ab dem ersten Layout

**Status:** angenommen

Die kleinste unterstützte Breite beträgt 360 CSS-Pixel. Das Layout nutzt `100dvh`, `viewport-fit=cover`, CSS-Variablen auf Basis von `env(safe-area-inset-*)` und Touch-Ziele ab 44 Pixeln. Android Chrome und iOS Safari sind primäre Zielbrowser; Desktop ist sekundär.

### Entscheidung 003: Lokale Inferenz hinter einer Engine-Schnittstelle

**Status:** angenommen, Umsetzung ab M2

MediaPipe Tasks Vision mit lokal versioniertem EfficientDet Lite0 wird die erste Engine. UI und fachliches Datenmodell dürfen MediaPipe nicht kennen. Eine `DetectionEngine`-Schnittstelle ermöglicht später alternative ONNX-/WebGPU-Engines ohne Umbau der Oberfläche.

### Entscheidung 004: Qualitätssicherung

**Status:** angenommen

ESLint und Prettier sichern statische Qualität und Formatierung. Vitest mit React Testing Library prüft Fachlogik und Komponenten. Playwright prüft mobile und Desktop-Browser-Flows. CI führt Formatprüfung, Lint, Typecheck, Unit Tests und Produktionsbuild aus.

### Entscheidung 005: Kein Kamerazugriff in M0

**Status:** angenommen

M0 liefert bewusst nur das bedienbare, responsive Grundgerüst. Der deaktivierte Kamera-Button kündigt M1 an und fordert noch keine Berechtigung an. Stream-Lifecycle, Fehlerzustände und Gerätewechsel werden geschlossen in M1 umgesetzt, statt unvollständigen Kameracode vorzeitig auszuliefern.

## Leitplanken

- Kritische Runtime-Assets werden lokal ausgeliefert.
- Kamera-Frames, Analyseergebnisse und Bilder werden standardmäßig weder hochgeladen noch gespeichert.
- Kamera- und Erkennungszustände erhalten verständliche sichtbare Rückmeldungen.
- Inferenzläufe dürfen niemals parallel aufgestaut werden.
- Echte iOS- und Android-Geräte bleiben ein manuelles Abnahme-Gate.

## Offene Entscheidungen

| Thema                                                     | Zeitpunkt |
| --------------------------------------------------------- | --------- |
| Konkrete MediaPipe- und Modellversion samt Lizenznachweis | M2        |
| Grenzwerte und Palette der Farbanalyse                    | M4        |

## M1 – Kamera-Fundament (26. September 2026)

### Entscheidung 006: Expliziter, defensiver Kamera-Lifecycle

**Status:** angenommen

Die Kamera startet ausschließlich nach einer Nutzeraktion. Der Hook `useCamera` kapselt Stream, Zustände, Geräteauswahl und Fehlerübersetzung. Jeder Wechsel stoppt zuerst den bestehenden Stream; auch Stop, Komponentenabbau, `pagehide` und das Ausblenden des Tabs beenden alle Tracks. Ein ausgeblendeter Tab startet die Kamera aus Datenschutzgründen nicht automatisch neu.

### Entscheidung 007: Mobile Facing-Mode, Desktop Device-ID

**Status:** angenommen

Auf Geräten mit grobem Zeiger wird zunächst `facingMode: environment` angefordert und beim Wechsel zwischen Rück- und Frontkamera umgeschaltet. Desktop verwendet nach der Freigabe die ermittelten `deviceId`s. Breite und Höhe sind mit 1280 × 720 nur Idealwerte, damit der Browser eine passende Kameraauflösung wählen kann.

## M6 – PWA und Veröffentlichung (26. September 2026)

### Entscheidung 008: Generierter Service Worker ohne Build-Plugin

**Status:** angenommen

Ein kleines Build-Skript erzeugt nach dem Vite-Build einen versionsgebundenen Service Worker und
nimmt alle lokalen Produktionsdateien in den Precache auf. Große Vision-Ressourcen (`mjs`, `wasm`,
`tflite`) werden Cache-first gespeichert, sobald sie erstmals benötigt werden. Dadurch kostet die
App-Hülle keinen weiteren Runtime-Download und das Modell wird nicht ungefragt vor der ersten
Analyse geladen. Es werden keine Kamera- oder Ergebnisdaten im Cache abgelegt.

### Entscheidung 009: GitHub Pages als statisches Hosting

**Status:** angenommen

GitHub Pages stellt die App per HTTPS bereit. Ein separater Actions-Workflow führt vor dem
Deployment die Qualitätsprüfungen aus und veröffentlicht ausschließlich `dist/`. Vite ermittelt im
CI-Build den Projekt-Unterpfad aus `GITHUB_REPOSITORY`; lokale Entwicklung und Domain-Hosting
bleiben unter `/` nutzbar.
