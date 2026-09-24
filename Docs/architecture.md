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
| PWA-Cache-Strategie für Modell und WASM                   | M6        |
| Statischer Hosting-Anbieter                               | M6        |
