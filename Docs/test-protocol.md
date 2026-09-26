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
