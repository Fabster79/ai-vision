# Veröffentlichung auf GitHub Pages

PocketVision wird als statische Vite-Anwendung über GitHub Actions veröffentlicht. Der Workflow
setzt den Vite-Basispfad automatisch auf den Repository-Namen, baut die PWA und überträgt den
Inhalt von `dist/` an GitHub Pages. HTTPS ist bei GitHub Pages standardmäßig aktiv und ist für den
Kamerazugriff erforderlich.

## Einmalige Einrichtung

1. Das Repository auf GitHub öffnen und **Settings → Pages** auswählen.
2. Unter **Build and deployment** als Quelle **GitHub Actions** einstellen.
3. Prüfen, dass der produktive Branch `main` heißt. Falls ein anderer Branch verwendet wird, den
   Eintrag `branches: [main]` in `.github/workflows/deploy-pages.yml` anpassen.
4. Die Änderungen nach `main` pushen oder unter **Actions → Deploy GitHub Pages → Run workflow**
   den ersten Lauf manuell starten.
5. Nach erfolgreichem Lauf steht die URL in der Deployment-Zusammenfassung. Für ein Projekt-Repo
   lautet sie normalerweise `https://<benutzer>.github.io/<repository>/`.

Der Workflow führt vor jeder Veröffentlichung Linting, Typecheck, Unit-Tests und den
Produktionsbuild aus. Nur ein vollständig erfolgreicher Lauf wird veröffentlicht.

## Veröffentlichung aktualisieren

Jeder Push auf `main` startet automatisch eine neue Veröffentlichung. Lokal kann exakt der
relevante Build geprüft werden:

```bash
GITHUB_ACTIONS=true GITHUB_REPOSITORY=<benutzer>/<repository> npm run build
npx vite preview --base /<repository>/
```

`npm run build` erstellt neben den gebündelten Dateien auch den Service Worker. Dessen Precache
enthält alle Dateien aus `dist/`; Vision-Modul, Modell- und WASM-Dateien werden beim ersten Abruf
zusätzlich im Runtime-Cache abgelegt. Eine vorhandene Installation sollte nach einem Update einmal
online geöffnet werden, damit der neue Cache vollständig aufgebaut wird.

## Abnahme nach dem Deployment

- [ ] Actions-Lauf **Deploy GitHub Pages** ist grün.
- [ ] Die öffentliche URL lädt direkt und nach einem Reload ohne 404.
- [ ] DevTools → Application zeigt Manifest und aktiven Service Worker ohne Fehler.
- [ ] Nach einem vollständigen Online-Aufruf lädt die Oberfläche kurzzeitig auch offline neu.
- [ ] Kamera-Freigabe, Start/Stop, Front-/Rückkamera und Einzel-/Live-Erkennung funktionieren über
      HTTPS auf mindestens einem aktuellen Android-Gerät und einem iPhone.
- [ ] Es werden keine Kamera-Frames oder Bilder in den Network-Requests übertragen.

## Fehlerbehebung

| Problem                                   | Lösung                                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Seite bleibt leer oder Assets liefern 404 | Repository-Name und `GITHUB_REPOSITORY` im Build prüfen; der Workflow setzt daraus den Vite-Basispfad.                   |
| Workflow darf nicht deployen              | In **Settings → Pages** die Quelle GitHub Actions wählen und unter **Actions → General** Workflow-Berechtigungen prüfen. |
| Alte Version bleibt sichtbar              | Seite online neu laden; bei Bedarf in DevTools den alten Service Worker abmelden und den Site-Cache löschen.             |
| Kamera ist nicht verfügbar                | Die Pages-URL muss per HTTPS geöffnet sein; Browser-Berechtigung und Kamera-Nutzung durch andere Apps prüfen.            |
| Modell funktioniert offline nicht         | App zuerst einmal mit Verbindung öffnen und eine Analyse starten, damit Modell und WASM im Cache liegen.                 |

Bei einer eigenen Domain wird diese unter **Settings → Pages → Custom domain** eingetragen. Danach
**Enforce HTTPS** aktiv lassen und alle oben genannten Prüfungen unter der eigenen Domain
wiederholen.
