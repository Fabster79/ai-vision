# AI Vision Object Detection – Projektplan für Codex

## 1. Zielbild

Eine eigenständige, **mobile-first** browserbasierte Anwendung zur **Live-Objekt- und Farberkennung** über die Smartphone-Kamera. Desktop-Browser werden unterstützt, Smartphones mit Android Chrome und iOS Safari sind jedoch die primären Zielgeräte. Die App wird ohne Lovable, Supabase oder serverseitigen KI-Dienst betrieben: Kamera-Frames und Inferenz bleiben im Browser des Nutzers.

Der Prototyp soll funktional dem bestehenden Lovable-Projekt entsprechen, aber sauber neu aufgebaut werden:

- Kamera auswählen, starten und stoppen
- Einzelanalyse und kontinuierliche Live-Erkennung
- erkannte Objekte mit Bounding Box, Label und Konfidenz im Bild markieren
- pro Erkennung eine dominante Objektfarbe inklusive verständlichem Farbnamen ausgeben
- Ergebnisse auf Smartphones direkt unter dem Kamerabild, auf Desktop optional daneben darstellen
- im Hochformat als bevorzugtem Smartphone-Modus und auf Desktop zuverlässig nutzbar sein

Nicht Bestandteil des MVPs sind Login, Datenbank, Cloud-API, Bildspeicherung oder individuelles Modelltraining.

## 2. Ausgangspunkt und bewusste Abweichungen

Der vorhandene Prototyp nutzt React, TensorFlow.js und COCO-SSD. Die Datei heißt zwar `yoloUtils.ts`, tatsächlich wird aber kein YOLO-Modell verwendet.

Für den Neubau wird **MediaPipe Tasks Vision** mit dem Object Detector vorgeschlagen. Dafür gibt es eine fertige Web-API für Bild- und Video-Inferenz sowie ein leichtgewichtiges, lokal auslieferbares EfficientDet-Lite-Modell. Das reduziert eigenen Tensor-/Preprocessing-Code deutlich und ist für einen browserbasierten MVP robuster als das direkte Zusammensetzen von TensorFlow.js-Details.

Die Browser-Inferenz erfolgt weiterhin vollständig clientseitig. Das ist für eine Kamera-Demo wichtig: kein Upload, keine API-Schlüssel, keine laufenden KI- oder Hostingkosten außerhalb des normalen Webhostings.

## 3. Architekturentscheidung

### Empfohlener Stack

| Bereich | Auswahl | Begründung |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite | Solider, gut testbarer Web-Stack mit schnellem lokalen Start und einfacher statischer Auslieferung. |
| UI | Tailwind CSS + Radix UI Primitives | Schnelles, responsives Styling; Radix liefert barrierearme Dialoge, Buttons und Tooltips ohne Lovable-Abhängigkeit. |
| Computer Vision | `@mediapipe/tasks-vision` | Fertige Object-Detector-API, TFLite/WASM-basiert und für Video-Frames vorgesehen. |
| Modell | EfficientDet Lite0, als lokale `.tflite`-Datei im Repository | Reproduzierbar, offline-cachebar und ohne Abhängigkeit von einer externen Modell-URL zur Laufzeit. |
| Bildverarbeitung | Browser Canvas 2D, optional `colorjs.io` | Bounding-Box-ROI auslesen, Farben in perceptualem Farbraum klassifizieren. |
| Zustandsverwaltung | React State + kleine Hooks | Für den MVP ausreichend; kein Redux/Zustandsframework nötig. |
| Tests | Vitest + React Testing Library + Playwright | Fachlogik schnell testen, Kamera-Flow und Layout in echten Browsern absichern. |
| Qualität | ESLint, Prettier, TypeScript strict, GitHub Actions | Reproduzierbare Builds und Prüfungen bei jedem Push. |
| Auslieferung | Statisches Hosting, z. B. GitHub Pages oder Netlify | Keine Backend-Infrastruktur nötig; HTTPS ist für Kamera-Zugriff erforderlich. |

### Bewusst nicht für den MVP

| Option | Warum nicht als Startpunkt |
| --- | --- |
| ONNX Runtime Web + YOLO | Leistungsfähig und später sinnvoll, benötigt aber Modell-Auswahl, Pre-/Postprocessing und Non-Maximum Suppression in eigener Verantwortung. Das erhöht die erste Umsetzung deutlich. |
| Transformers.js | Gut für viele Modelltypen, aber für eine kleine Echtzeit-Kamera-App unnötig schwer und mit längeren Modell-Ladezeiten verbunden. |
| Python/FastAPI-Backend | Würde Kamera-Bilder übertragen, Hosting und Datenschutz komplizierter machen. Erst bei serverseitiger Batch-Verarbeitung oder speziellen Modellen sinnvoll. |
| Supabase | Im MVP gibt es keine persistenten Geschäftsdaten. Erst nötig für Sessions, Bilder, Historie oder Nutzerverwaltung. |

### Erweiterungspfad

Der Code kapselt die Erkennung hinter einem `DetectionEngine`-Interface. Dadurch kann später eine zweite Engine auf Basis von ONNX Runtime Web mit einem ONNX-Modell ergänzt werden. WebGPU kann dann auf geeigneten Chromium-Browsern als Beschleunigung dienen, während die MediaPipe-Variante der kompatible Standard bleibt.

## 4. Fachliche und technische Leitplanken

### Mobile-first als Produktvorgabe

Mobile ist keine nachträgliche Responsive-Variante, sondern die Referenz für Umsetzung und Abnahme. Entscheidungen werden zuerst auf einem echten Smartphone validiert; Desktop ist der erweiterte Darstellungsmodus.

| Bereich | Verbindliche Vorgabe |
| --- | --- |
| Zielbrowser | Aktuelles Android Chrome und iOS Safari zuerst; Desktop Chrome/Edge/Safari als sekundäre Zielumgebung. |
| Layout | Hochformat ab 360 CSS-Pixel Breite; einspaltig, Kamera zuerst, Ergebnisse darunter. Kein horizontales Scrollen. |
| Interaktion | Alle zentralen Touch-Ziele mindestens 44 × 44 CSS-Pixel; keine Funktion darf ausschließlich per Hover erreichbar sein. |
| Viewport | `100dvh` statt `100vh`, `viewport-fit=cover` und Safe-Area-Abstände mit `env(safe-area-inset-*)`, damit Browserleisten und Notch keine Bedienelemente verdecken. |
| Kamera | Rückkamera (`facingMode: environment`) als Standard; Frontkamera optional. Kamera startet ausschließlich nach einem expliziten Tap. |
| Live-Modus | Mobil standardmäßig energiesparend: Ziel 1–3 Inferenzläufe/Sekunde und reduzierte Inferenzauflösung; höhere Rate nur auf ausdrücklichen Nutzerwunsch. |
| Ergebnisse | Über dem Preview nur kompakte Boxen; ausführliche Karten unter dem Bild. Dies vermeidet verdeckte Bedienelemente und zu kleine Labels. |
| Orientierung | Hochformat ist vollständig; Querformat wird unterstützt, aber nicht erzwungen. Bei Drehung müssen Video, Overlay und Controls ohne Neustart korrekt neu layouten. |
| Berechtigungen | Hilfetexte und Fehlerfälle speziell für mobile Browser formulieren: HTTPS, Kamera-Freigabe, Safari/Chrome-Einstellungen. |

### Zielwerte für die mobile Nutzung

- Erstes bedienbares UI vor Modell-Download; Modellstatus sichtbar und nicht blockierend.
- Kamerabild startet nach Freigabe innerhalb von drei Sekunden auf einem aktuellen Mittelklasse-Smartphone unter normaler Netzverbindung.
- Im Standard-Live-Modus bleibt die Bedienung flüssig und der Akkuverbrauch kontrollierbar; keine gleichzeitigen Inferenzläufe.
- Die App bleibt mit einer Hand nutzbar: primäre Aktion „Kamera starten“ bzw. „Live starten/stoppen“ im unteren, gut erreichbaren Bereich.
- Texte, Labels und Konfidenzen sind auch bei Sonnenlicht lesbar: hoher Kontrast, große Schrift und keine ausschließlich farbliche Kodierung.

### Prioritäten

1. **Mobile Zuverlässigkeit**: klare Zustände, gute Fehlermeldungen, sauberes Starten/Stoppen der Kamera auf iOS und Android.
2. **Datenschutz**: keine Bildübertragung im MVP; sichtbar kommunizieren.
3. **Flüssige Bedienung**: nur eine Inferenz gleichzeitig; Bilddarstellung darf nicht ruckeln oder das Smartphone unnötig erhitzen.
4. **Nachvollziehbare Erkennung**: Label, Konfidenz, Box und Farbe bleiben konsistent zusammen.
5. **Unabhängigkeit**: alle zentralen Assets und Konfigurationen im eigenen Repository.

### Wichtige Einschränkung: „Objektfarbe“

Die dominante Farbe einer Bounding Box ist zunächst die dominante Farbe **im Bildausschnitt**, nicht zwingend des physischen Objekts. Hintergrund, Schatten und Reflexionen können das Ergebnis verfälschen.

Der MVP nutzt deshalb einen mittig verkleinerten ROI innerhalb der Bounding Box, ignoriert sehr dunkle/helle Pixel und klassifiziert den verbleibenden Median-Farbwert. Eine spätere Option ist eine Segmentierungsmaske pro Objekt; diese gehört ausdrücklich nicht in den ersten Meilenstein.

## 5. Zielstruktur des Repositories

```text
ai-vision-object-detection/
├── public/
│   └── models/
│       └── efficientdet_lite0.tflite
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── routes.tsx
│   ├── components/
│   │   ├── camera/
│   │   │   ├── CameraStage.tsx
│   │   │   ├── CameraControls.tsx
│   │   │   ├── MobileCameraToolbar.tsx
│   │   │   └── DetectionOverlay.tsx
│   │   ├── detection/
│   │   │   ├── DetectionList.tsx
│   │   │   └── DetectionCard.tsx
│   │   ├── ui/
│   │   └── AppHeader.tsx
│   ├── features/
│   │   └── vision/
│   │       ├── detection-engine.ts
│   │       ├── mediapipe-engine.ts
│   │       ├── detection-loop.ts
│   │       ├── detection-types.ts
│   │       └── color-analysis.ts
│   ├── hooks/
│   │   ├── useCamera.ts
│   │   ├── useDetectionEngine.ts
│   │   └── useMediaQuery.ts
│   ├── lib/
│   │   ├── geometry.ts
│   │   └── format.ts
│   ├── test/
│   │   └── setup.ts
│   ├── styles/
│   │   └── globals.css
│   └── main.tsx
├── e2e/
├── docs/
│   ├── architecture.md
│   ├── model-attribution.md
│   └── test-protocol.md
├── .github/workflows/ci.yml
├── package.json
└── README.md
```

## 6. Kern-Datenmodell

```ts
export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Detection = {
  id: string;
  label: string;
  score: number;
  boundingBox: BoundingBox;
  color: {
    hex: string;
    displayName: string;
    confidence: 'high' | 'medium' | 'low';
  };
};

export interface DetectionEngine {
  load(): Promise<void>;
  detect(video: HTMLVideoElement, timestampMs: number): Promise<Detection[]>;
  dispose(): void;
}
```

Die UI kennt nur `Detection` und das `DetectionEngine`-Interface. Details des MediaPipe-Modells bleiben in `mediapipe-engine.ts` gekapselt.

## 7. Meilensteine

### M0 – Technische Basis und Entscheidungsprotokoll

**Ziel:** Ein sauberes, unabhängiges Repository mit dokumentierten Entscheidungen.

**Aufgaben**

- Neues GitHub-Repository oder separaten Branch anlegen; keine Lovable-spezifischen Dateien übernehmen.
- React/TypeScript/Vite mit `strict: true` initialisieren.
- Tailwind, ESLint, Prettier, Vitest und Playwright konfigurieren.
- `README.md` mit Setup, Browser-Voraussetzungen und Privacy-Hinweis schreiben.
- Mobile Zielgeräte und verbindliche Testmatrix (Android Chrome, iOS Safari) im README festlegen.
- Globale CSS-Basis mit `viewport-fit=cover`, Safe-Area-Variablen und einem mobilen Layout ab 360 px anlegen.
- `docs/architecture.md` mit dieser Architekturentscheidung und Entscheidungslog ergänzen.
- CI anlegen: `lint`, Typecheck, Unit Tests, Produktionsbuild.

**Abnahme**

- `npm run lint`, `npm run test`, `npm run build` laufen lokal und in GitHub Actions grün.
- Eine leere, mobile-first App ist unter lokaler Entwicklungs-URL erreichbar und bei 360 px Breite ohne horizontales Scrollen bedienbar.

### M1 – Kamera-Fundament

**Ziel:** Die Kamera wird stabil und nachvollziehbar bedient.

**Aufgaben**

- `useCamera` implementieren: Berechtigungsstatus, Geräte ermitteln, Stream starten, Stream beenden, Kamera wechseln und auf App-/Tab-Sichtbarkeit reagieren.
- `CameraStage` mit korrektem `playsInline`, `muted`, Hochformat-Layout und dynamischer Neuvermessung nach Geräte-Drehung bauen.
- Zustände umsetzen: noch keine Freigabe, Berechtigung verweigert, keine Kamera, startet, aktiv, Fehler.
- Beim Gerätewechsel und Unmount garantiert alle Tracks stoppen.
- Bei Mobilgeräten primär `facingMode: environment/user`, auf Desktop `deviceId` verwenden; Rückkamera als Startwert wählen.
- Mobil sinnvolle Default-Constraints verwenden (z. B. `width/height: ideal 1280×720`, aber keine erzwungene Maximalauflösung) und tatsächliche Stream-Dimensionen protokollierbar machen.
- Touch-optimierte Toolbar mit mindestens 44 px großen Start-, Stop-, Wechsel- und Live-Buttons umsetzen; primäre Aktion am unteren Bildschirmrand anordnen.
- Safe-Area-Inset in der Toolbar berücksichtigen und keine Controls über dem unteren iOS-Browserbereich platzieren.
- Hinweis anzeigen, dass die Kamera nur im Browser verarbeitet wird.

**Abnahme**

- Start/Stop funktionieren auf Android Chrome und iOS Safari; Desktop Chrome/Edge/Safari folgen als Kompatibilitätscheck.
- Kamera-Leuchte und Stream enden beim Stoppen, Seitenwechsel und Tab-Schließen.
- Bei Front- und Rückkamera lässt sich das Gerät wechseln; eine Kameradrehung aktualisiert Preview und Overlay ohne Neustart.

### M2 – Objekt-Erkennung als isolierte Engine

**Ziel:** Das Modell lädt kontrolliert und erkennt Objekte aus einem Video-Frame.

**Aufgaben**

- `@mediapipe/tasks-vision` integrieren und das Modell lokal aus `public/models` laden.
- `DetectionEngine` und `MediapipeDetectionEngine` implementieren.
- `scoreThreshold`, `maxResults` und optionale Label-Allowlist zentral konfigurierbar machen.
- Ladefortschritt, Ladefehler und „KI bereit“-Status in der Oberfläche abbilden.
- Einzelanalyse-Button implementieren; während einer Inferenz sperren.
- Rohergebnisse des Modells in das eigene `Detection`-Datenmodell normalisieren.
- Unit Tests für Normalisierung, Threshold und Konfigurationslogik schreiben.

**Abnahme**

- Das Modell wird einmalig geladen und keine zweite Instanz entsteht.
- Eine Einzelanalyse liefert Box, Label und Score für erkennbare COCO-Objekte.
- Bei Modellfehler bleibt die Kamera nutzbar und die App erklärt den Fehler verständlich.

### M3 – Präzises Overlay und Ergebnisliste

**Ziel:** Ergebnisse sind im Live-Bild und als Liste konsistent sichtbar.

**Aufgaben**

- `DetectionOverlay` über dem Video mit CSS-Positionierung bauen.
- Umrechnung von Modellkoordinaten auf die tatsächlich sichtbare, per `object-fit: cover` beschnittene Video-Fläche korrekt implementieren.
- Boxen, Label und Konfidenz mit kontrastreichem und konsistentem Stil darstellen.
- Ergebnisbereich unter dem Video als Standard implementieren; rechte Seitenleiste erst ab einem großzügigen Desktop-Breakpoint ergänzen.
- Overlay-Labels auf Mobilgeräten kurz halten, gegen helle und dunkle Szenen absichern und nicht über die unteren Controls legen.
- Erkennungen sortiert nach Konfidenz anzeigen; „Ergebnisse löschen“ ergänzen.
- Snapshot-Tests der Geometrie für verschiedene Seitenverhältnisse schreiben.

**Abnahme**

- Overlays liegen bei 16:9, 4:3 und Smartphone-Hochformat sichtbar über dem richtigen Objekt – auch nach einer Drehung.
- Die Liste und die Boxen zeigen dieselben Labels, Scores und Reihenfolgen.

### M4 – Farb-Analyse mit sinnvollen Grenzen

**Ziel:** Jede Objektkarte erhält eine brauchbare, erklärbare Farb-Angabe.

**Aufgaben**

- Video-Frame bei der Inferenz in ein Offscreen-Canvas zeichnen.
- Bounding Box auf einen zentralen ROI (z. B. 70 % Breite/Höhe) reduzieren, um Rand/Hintergrund zu minimieren.
- Transparente, nahezu weiße und nahezu schwarze Pixel nach definierbaren Regeln filtern.
- Farbwert robust bestimmen: Median oder gewichteter Cluster statt „häufigster RGB-Wert“.
- Farbwert nach OKLCH/Delta-E einer kuratierten Palette zuordnen, z. B. Rot, Orange, Gelb, Grün, Blau, Violett, Rosa, Braun, Grau, Schwarz, Weiß.
- Farbfeld, Hex-Wert, deutscher Anzeigename und Vertrauensstufe ausgeben.
- Testbilder mit bekannten Objekten und erwarteten Farbklassen als Fixture-Suite ablegen.

**Abnahme**

- Farbwerte sind bei gleicher Szene stabil und nicht zufällig.
- Offensichtliche Hintergrunddominanz ist bei zentral platzierten Objekten deutlich reduziert.
- Die UI kommuniziert die Farbe als geschätzte Hauptfarbe, nicht als absolute Wahrheit.

### M5 – Kontinuierliche Erkennung und Performance

**Ziel:** Live-Modus arbeitet kontrolliert, ohne die Bedienung zu blockieren.

**Aufgaben**

- `detection-loop.ts` mit `requestVideoFrameCallback` (Fallback: `requestAnimationFrame`) implementieren.
- Adaptive Drosselung statt starrem Intervall: neue Inferenz erst nach Abschluss der vorherigen; auf Mobilgeräten initial 1–3 Analysen/Sekunde, auf Desktop 2–5.
- Letzte gültige Ergebnisse sichtbar halten und mit Zeitstempel versehen.
- Profiling-Anzeige im Entwicklungsmodus: Inferenzzeit, FPS, Anzahl Objekte.
- Bei Mobilgeräten standardmäßig ein verkleinertes Offscreen-Frame für die Modellinferenz verwenden; Videoanzeige selbst bleibt hochwertig.
- Bei langsamen Geräten Auflösung und Bildrate weiter reduzieren, Videoanzeige aber beibehalten; bei thermischer Drosselung oder längerer Hintergrundphase Live-Modus pausieren.
- Option „Batteriesparmodus“ mit niedrigerer Analysefrequenz ergänzen.

**Abnahme**

- Kein paralleler Inferenzstau und kein Memory Leak nach mehrfachem Start/Stop.
- Die Steuerung bleibt während der Live-Erkennung bedienbar.
- Leistungsprofil und Fallback-Verhalten sind dokumentiert.

### M6 – Qualitätsabsicherung, PWA und Veröffentlichung

**Ziel:** Eine veröffentlichbare Demo mit reproduzierbarer Qualität.

**Aufgaben**

- E2E-Tests mit gemocktem Kamera-Stream für Start, Fehlerfall, Einzelanalyse und Live-Modus erstellen.
- Mobile Testprotokoll als Abnahme-Gate schreiben: mindestens ein aktuelles iPhone mit Safari sowie ein Android-Smartphone mit Chrome; jeweils Kamera-Freigabe, Rückkamera, Vorderkamera, Hoch-/Querformat, Sperren/Entsperren und längerer Live-Modus.
- Cross-Browser-Testprotokoll für Desktop Chrome/Edge und Safari ergänzen.
- Barrierefreiheit prüfen: Tastaturbedienung, Fokus, Kontraste, verständliche Statusmeldungen.
- Mobile Usability prüfen: einhändige Bedienung, Touch-Zielgrößen, Safe Areas, bei Sonnenlicht lesbare Overlays und keine benötigte Hover-Interaktion.
- PWA-Manifest und Service Worker ergänzen; Modell und WASM bewusst cachebar machen.
- Fehler-/Telemetrie-Konzept: standardmäßig keine Bilddaten loggen oder versenden.
- GitHub Pages oder Netlify Deployment einrichten; HTTPS und Cache-Header prüfen.
- README finalisieren: Architektur, lokale Einrichtung, Modellquelle/Lizenz, bekannte Einschränkungen.

**Abnahme**

- Öffentliche Demo läuft über HTTPS und fordert nur die erforderliche Kamera-Berechtigung an; der mobile Startweg ist der primäre getestete Nutzungsweg.
- App funktioniert nach dem ersten Laden zumindest für UI und lokal vorhandene Assets auch bei kurzzeitig fehlender Verbindung.
- CI, Deployment und README sind vollständig.

## 8. Umsetzungshinweise für Codex

1. **Keine Big-Bang-Implementierung.** Genau einen Meilenstein pro Pull Request oder Commit-Serie abschließen.
2. **Vor jedem Modellwechsel einen Vergleichs-Commit erstellen.** UI und Datenmodell dürfen nicht an eine Modellbibliothek gekoppelt werden.
3. **Keine externen Runtime-URLs für kritische Assets.** Modell und MediaPipe/WASM-Pfade versioniert behandeln; externe Quellen nur mit klarer Fallback-Strategie.
4. **Kamera nie in Utility-Dateien verstecken.** Stream-Lifecycle gehört in `useCamera`, damit Tracks zuverlässig beendet werden.
5. **Keine zufälligen Box-Farben.** Dieselbe Label-Klasse soll eine stabile Overlay-Farbe erhalten; die dominante Objektfarbe bleibt eine getrennte Information.
6. **Typen vor UI.** Erst `Detection` und Geometrie testen, dann Komponenten bauen.
7. **Datenschutz als Feature behandeln.** Im Interface klar ausweisen: „Die Analyse läuft auf diesem Gerät; Bilder werden nicht hochgeladen.“
8. **Mobile zuerst prüfen.** Jede neue UI- oder Kamera-Funktion zuerst bei 360 px Breite und auf mindestens einem realen iOS- und Android-Gerät validieren, bevor sie als fertig gilt.

## 9. Risiko- und Entscheidungslog

| Risiko / Frage | Umgang im Projekt |
| --- | --- |
| Modellgröße verlangsamt ersten Start | Ladeanzeige, lokale Caches, Modellgröße im M2 messen; bei Bedarf kleineres kompatibles Modell evaluieren. |
| Safari-/iOS-Unterschiede beim Kamera-Zugriff | M1 früh auf realem iPhone testen; `playsInline` und Nutzerinteraktion vor `play()` strikt berücksichtigen. |
| Browserleisten, Notch oder Gestenbereich verdecken Controls | Dynamische Viewport-Einheiten und Safe-Area-Insets von Beginn an verwenden; primäre Controls nie am ungeschützten unteren Rand platzieren. |
| Live-Modus belastet Akku oder erwärmt das Gerät | Konservativer mobiler Standard von 1–3 Inferenzläufen/Sekunde, adaptive Drosselung, sichtbarer Stop-Button und Batteriesparmodus. |
| Rückkamera liefert andere Bildausrichtung oder Crop | Preview-/Overlay-Geometrie nach `loadedmetadata` und jeder Orientierungänderung neu berechnen; Tests auf realen Geräten durchführen. |
| Synchronous Video-Inferenz blockiert UI | M5 mit Drosselung; falls Messung es erfordert, Worker-/OffscreenCanvas-Variante als Spike umsetzen. |
| Farbe entspricht dem Hintergrund | Zentralen ROI und Pixel-Filter im MVP nutzen; Segmentierung erst als separat bewertete Erweiterung. |
| COCO-Labels sind zu generisch oder englisch | Label-Mapping für deutsche UI einführen; domänenspezifische Objekte später über eigenes Modell oder ONNX-Engine ergänzen. |
| Kommerzielle Modelllizenz | Modelllizenz vor Veröffentlichung in `docs/model-attribution.md` festhalten; keine YOLO-Variante ohne vorherige Lizenzentscheidung einbauen. |

## 10. Definition of Done für den MVP

Der MVP ist fertig, wenn er als statische HTTPS-Webseite veröffentlicht ist und ein Nutzer ohne Login:

1. auf einem Smartphone die Rückkamera starten und zwischen verfügbaren Kameras wechseln kann,
2. ein Modell lokal laden kann,
3. in Einzel- und Live-Modus Objekte mit Label, Score und passender Box sieht,
4. pro Objekt eine nachvollziehbare geschätzte Hauptfarbe erhält,
5. die Kamera zuverlässig stoppen kann und
6. nachvollziehen kann, dass Bilder das Gerät nicht verlassen, und
7. in Hochformat mit großen Touch-Zielen, sichtbaren Controls und ohne Layoutbruch bedienbar bleibt.

## 11. Sinnvolle Weiterentwicklungen nach dem MVP

- Foto-Upload und Analyse gespeicherter Einzelbilder
- Screenshot-Export mit gerenderten Boxen und Ergebnisliste
- Objekt-Tracking über mehrere Frames und stabile IDs
- Segmentierungsbasierte Farbextraktion
- Domänenspezifisches Modell, z. B. für Industrieobjekte, Werkzeuge oder Verpackungen
- ONNX-Runtime-Engine mit WebGPU als Performance-/Genauigkeitsoption
- Lokale Session-Historie im Browser (IndexedDB), ohne Cloud
- Mehrsprachige UI und konfigurierbare Label-Übersetzungen

## 12. Technische Referenzen

- [MediaPipe Object Detector for Web](https://developers.google.com/edge/mediapipe/solutions/vision/object_detector/web_js): Browser-API, Video-Modus und Konfigurationsoptionen.
- [ONNX Runtime Web](https://onnxruntime.ai/docs/get-started/with-javascript/web.html): späterer Erweiterungspfad für ONNX-Modelle und WebGPU.
- [Transformers.js](https://huggingface.co/docs/transformers.js/en/index): Alternative für spätere multimodale bzw. Transformer-basierte Features, nicht Teil des MVP.
