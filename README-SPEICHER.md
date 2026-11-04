# Kfz Lerntrainer – Regeln für Speicherstand und Updates

Diese Regeln sorgen dafür, dass der Lernstand bei jedem Update erhalten bleibt.

## Daten (www/data.js, www/data2.js)
- Jede Frage hat ein festes Feld `id` (Zahl). Der Fortschritt (`res`, `quiz.o`) hängt NUR an dieser `id`.
- Vorhandene IDs NIE ändern, NIE neu nummerieren, NIE wiederverwenden.
- Neue Fragen: immer ANHÄNGEN mit `id = (höchste vorhandene id) + 1`. Die Position im Array ist egal.
- Texte/Antworten/Erklärungen einer Frage dürfen korrigiert werden; die `id` bleibt.
- Frage entfernen: einfach löschen; gespeicherte Ergebnisse dieser id werden ignoriert. Die id nicht neu vergeben.
- Zuordnung der Bestands-IDs: id 0–215 == Array-Index der Versionen bis 4.11.2026 (Schema 1). Dadurch passen alte Stände 1:1.

## Speicher (www/app.js)
- Schlüssel `kfz-lerntrainer-v1` (localStorage) und IndexedDB `kfz-lerntrainer`/`kv` NIE umbenennen oder löschen.
- Formatänderungen: `SCHEMA` erhöhen und in `migrate()` eine Umwandlung vom alten Format ergänzen. Nie Daten verwerfen.
- Beim Start: fehlt localStorage, wird aus IndexedDB wiederhergestellt.
- Backup: „Stand sichern“ / „Stand wiederherstellen“ (JSON).

## Website (www/sw.js)
- Bei jeder Änderung Cache-Name `kfz-vN` erhöhen. Der Service Worker löscht nur eigene Caches, nie localStorage/IndexedDB.

## Android
- Paketname `de.loewe.kfzlerntrainer` nie ändern.
- Immer mit `keystore/kfz-debug.keystore` signieren (Alias `androiddebugkey`, Standard-Debug-Passwörter `android`). Datei sichern!
- `versionCode` in android/app/build.gradle bei jeder neuen APK erhöhen. `allowBackup=true` bleibt.
