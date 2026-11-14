---
title: BoxLang CLI
order: 0
icon: phosphor-duotone:terminal-window
summary: BoxLang installieren und den BoxLang-nativen bx-cli-Workflow für Abhängigkeiten, Server, Migrationen und Tests verwenden.
tags: [guides, setup, cli, boxlang]
---

# BoxLang CLI

CBGenesis ist eine BoxLang-Anwendung. Ihre `box`-Befehle müssen vom BoxLang-nativen `bx-cli`-Modul bereitgestellt werden. Die reguläre Lucee-basierte CommandBox-Distribution wird für diese Vorlage nicht unterstützt.

## Erforderliche Installation

Installiere BoxLang entweder mit dem Schnellinstaller oder BVM, und installiere dann `bx-cli`:

=== "Schnellinstallation"
    ```bash linenums="1"
    /bin/bash -c "$(curl -fsSL https://install.boxlang.io)"
    ```

    Um mit einer Java-21-Laufzeitumgebung zu installieren, wenn Java noch nicht verfügbar ist:

    ```bash linenums="1"
    curl -fsSL https://install.boxlang.io | bash -s -- --with-jre
    ```

=== "BVM"
    ```bash linenums="1"
    curl -fsSL https://install-bvm.boxlang.io | bash
    bvm install latest
    bvm use latest
    ```

Sobald BoxLang verfügbar ist, installiere das CLI-Modul:

```bash linenums="1"
install-bx-module bx-cli
box version
```

Starte das Terminal neu, falls `box` nach der Installation nicht sofort gefunden wird. Installiere nicht die standardmäßige Lucee-CommandBox-Ausführbare Datei parallel zu diesem Workflow; sie kann dazu führen, dass die falsche Laufzeit und die falschen Befehlsmodule ausgewählt werden.

## Tägliche Befehle

Führe diese vom Projekt-Root aus aus. Sie werden alle von `bx-cli` ausgeführt:

| Befehl | Zweck |
|---|---|
| `box install` | Installiert `box.json`-Abhängigkeiten in `lib/` |
| `box server start` | Startet den BoxLang-Webserver auf Port `8080` |
| `box server stop` | Stoppt den Projektserver |
| `box migrate up` | Wendet ausstehende Datenbankmigrationen an |
| `box migrate down` | Macht den letzten Migrations-Batch rückgängig |
| `box migrate reset` | Macht alle Migrationen rückgängig und wendet sie erneut an |
| `box migrate seed run` | Führt Seed-Daten aus: die `Admin`-Rolle, ihre 20 Berechtigungen und den reset-pending Admin-Benutzer |
| `box testbox run` | Führt die TestBox-Suite aus - siehe [Testing](testing.md#running-tests) zum Filtern |
| `box task run path/to/task.cfc` | Führt eine CommandBox-Task über `bx-cli` aus |
| `box coldbox ai refresh` | Synchronisiert KI-Guidelines und Skills in `.agents/` mit deinen installierten Modulen |
| `box run-script format` | Formatiert BoxLang-Quellcode (`app/`, `tests/specs/`, Root-`*.bx`) |
| `box run-script format:check` | Überprüft die Formatierung, ohne Änderungen zu schreiben |

Das Frontend verwendet Node.js separat:

```bash linenums="1"
npm install
npm run dev
npm run build
npm run lint
npm run lint:scss
```

## Ablauf beim ersten Ausführen

```bash linenums="1"
install-bx-module bx-cli
box install
npm install
cp .env.example .env
box migrate up
box migrate seed run
box server start
npm run dev
```

Der Server verwendet `server.json`, um `boxlang@1`, den `public/`-Webroot, Port `8080` und die beim ersten Start installierten BoxLang-Module auszuwählen. Siehe [Erste Schritte](../getting-started.md) für die Datenbankeinrichtung und [Konfiguration](configuration.md) für Umgebungsvariablen.

## Fehlerbehebung

- **`box: command not found`**: Bestätige, dass BoxLang installiert ist, starte das Terminal neu und stelle sicher, dass das Installationsverzeichnis im `PATH` liegt.
- **Lucee- oder CFML-Engine-Meldungen**: Die reguläre CommandBox-Ausführbare Datei wird verwendet. Entferne sie aus dem `PATH`, installiere BoxLang neu und führe `install-bx-module bx-cli` aus.
- **Fehlende Projektbefehle**: Führe `box version` vom Projekt-Root aus und dann `box install` aus, damit die Abhängigkeiten in `box.json` verfügbar sind.
- **Datenbankverbindungsfehler**: Überprüfe `.env`, stelle sicher, dass die Datenbank existiert, und installiere/starte den JDBC-Treiber über die BoxLang-Serverkonfiguration.
