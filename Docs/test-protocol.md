# Testprotokoll

## M0 – Technische Basis

### Automatisiert

- ESLint über den vollständigen Quellbestand
- TypeScript-Projektbuild im strikten Modus
- Vitest-Komponententests für Status und Datenschutztext; die Suche ist auf `src/` begrenzt
- Vite-Produktionsbuild
- Playwright-Smoke-Test auf emuliertem Android Chrome, iOS Safari und Desktop Chrome
- Prüfung auf horizontalen Overflow in den Playwright-Zielgrößen

### Manuell vor Abschluss

- [ ] 360 × 800 CSS-Pixel: kein horizontales Scrollen
- [ ] Primäre Schaltfläche mindestens 44 × 44 CSS-Pixel
- [ ] Safe-Area-Abstände im iPhone-Simulator plausibel
- [ ] Datenschutztext vor jedem Kamerazugriff sichtbar
- [ ] Layout in Hoch- und Querformat stabil

### Reale Geräte

Ein echter Kamera-Test ist für M0 nicht anwendbar. Ab M1 sind mindestens ein aktuelles Android-Gerät mit Chrome und ein aktuelles iPhone mit Safari verpflichtend. Emulatoren sind nur ergänzend.

## M1 – Kamera-Fundament

### Automatisiert

- Kamera startet erst nach expliziter Nutzeraktion.
- Mobile Constraints bevorzugen die Rückkamera und erzwingen keine Auflösung.
- Stop beendet alle Tracks; verweigerte Berechtigung zeigt einen verständlichen Hilfetext.
- Playwright prüft die aktive Startaktion und horizontalen Overflow.

### Manuell auf realen Geräten

- [ ] Android Chrome: Freigabe, Start, Stop, Front-/Rückkamera und Kamera-Leuchte prüfen.
- [ ] iOS Safari: `playsInline`, Freigabe, Start, Stop, Front-/Rückkamera und Home-Indikator prüfen.
- [ ] Hoch-/Querformat: Preview und Controls layouten ohne Neustart neu.
- [ ] Tab ausblenden und zurückkehren: Stream endet und bleibt bis zum erneuten Tippen aus.
- [ ] Berechtigung verweigern: Hilfetext verweist auf Browser-Einstellungen.

## M6 – Release-Gate

### Automatisiert

- CI prüft Formatierung, ESLint, TypeScript, Unit-Tests und Produktionsbuild.
- Playwright prüft die zentralen Kamera-Zustände in mobilen Chromium-/WebKit-Profilen und Desktop
  Chromium.
- Der Produktionsbuild erzeugt Manifest und Service Worker; alle gebauten lokalen Assets stehen im
  Precache.

### Mobile Abnahme auf realen Geräten

Je ein aktuelles iPhone mit Safari und Android-Smartphone mit Chrome ist verpflichtend. Gerät,
OS-/Browser-Version, Datum und Ergebnis im Release-Ticket festhalten.

- [ ] Kamera erlauben und verweigern; Statusmeldung ist jeweils verständlich.
- [ ] Rück- und Frontkamera starten, wechseln und stoppen; Kameraindikator erlischt beim Stoppen.
- [ ] Hoch- und Querformat ohne Overlay-Versatz oder horizontales Scrollen prüfen.
- [ ] Gerät sperren/entsperren und Tab wechseln; Stream bleibt beendet, bis erneut gestartet wird.
- [ ] Live-Modus mindestens zehn Minuten betreiben; Bedienung bleibt reaktionsfähig und es entsteht
      kein Inferenzstau.
- [ ] Einhändige Bedienung, mindestens 44 px große Touch-Ziele, Safe Areas und Lesbarkeit im Freien
      prüfen. Keine Funktion darf ausschließlich per Hover verfügbar sein.
- [ ] PWA installieren, online einmal vollständig laden und UI anschließend kurzzeitig offline
      öffnen.

### Desktop und Barrierefreiheit

- [ ] Chrome und Edge unter Windows sowie Safari unter macOS: Kamera, Einzelanalyse und Live-Modus.
- [ ] Alle Aktionen per Tastatur erreichbar; sichtbarer Fokus und sinnvolle Tab-Reihenfolge.
- [ ] Statusänderungen sind als Text verständlich und nicht ausschließlich farblich codiert.
- [ ] Browser-Zoom bei 200 % verursacht keinen Funktionsverlust oder horizontalen Seiten-Overflow.
- [ ] Kontraste mit automatisiertem Werkzeug und durch Sichtprüfung kontrollieren.

### Datenschutz und Telemetrie

PocketVision versendet standardmäßig keine Telemetrie. Insbesondere werden Kamera-Frames,
Screenshots, Erkennungsergebnisse und Gerätekennungen weder protokolliert noch übertragen. Bei einer
späteren Fehleranalyse dürfen nur bewusst aktivierte, bildfreie technische Daten erhoben werden;
Zweck, Speicherdauer und Einwilligung sind davor zu dokumentieren.
