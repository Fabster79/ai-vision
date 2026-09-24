# Testprotokoll

## M0 – Technische Basis

### Automatisiert

- ESLint über den vollständigen Quellbestand
- TypeScript-Projektbuild im strikten Modus
- Vitest-Komponententests für Status und Datenschutztext
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
