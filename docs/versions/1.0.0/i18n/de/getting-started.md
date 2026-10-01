---
title: Erste Schritte
order: 2
icon: phosphor-duotone:rocket-launch
summary: BoxLang installieren, die Vorlage klonen, deine Datenbank konfigurieren und den Login-Bildschirm öffnen.
tags: [guides, setup]
---

# Erste Schritte

## Systemanforderungen

- **Java 21+** (JDK oder JRE)
- **BoxLang 1.17+**
- **CommandBox 7+** (`bx-cli`)
- **Node.js 22+** (für das Vite-Frontend)
- **Eine unterstützte Datenbank**: MySQL 8+ (Standard), MariaDB, PostgreSQL, SQLite, Oracle oder MSSQL
- Ein beliebiges Betriebssystem

## BoxLang installieren

=== "Schnellinstallation"

	### MacOS & Linux

	```bash frame="terminal" title="Terminal"
	# macOS & Linux
	/bin/bash -c "$(curl -fsSL https://install.boxlang.io)"

	# ...with automatic Java 21 installation
	curl -fsSL https://install.boxlang.io | bash -s -- --with-jre
	```

	### Windows

	```powershell frame="terminal" title="PowerShell (Windows)"
	powershell -NoExit -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://install-windows.boxlang.io'))"
	```

=== "BVM (Versionsmanager)"

	Verwende stattdessen [BVM](https://boxlang.ortusbooks.com), wenn du zwischen mehreren BoxLang-Versionen wechseln musst:

	```bash frame="terminal" title="Terminal"
	curl -fsSL https://install-bvm.boxlang.io | bash

	bvm install latest && bvm use latest
	```

	Installation überprüfen:

	```bash frame="terminal" title="Terminal"
	boxlang --version
	```

!!! danger "bx-cli verwenden, nicht das reguläre CommandBox"
    CBGenesis ist eine BoxLang-Vorlage. Installiere nicht die standardmäßige Lucee-basierte CommandBox-Distribution. Installiere nach der BoxLang-Installation mit dem Schnellinstaller oder BVM das BoxLang-native CLI-Modul. Dies ist erforderlich, bevor du `box install`, `box server`, `box migrate` oder `box testbox` ausführst:

    ```bash frame="terminal" title="Terminal"
    install-bx-module bx-cli
    ```

    Überprüfe, dass die BoxLang-CLI aktiv ist:

    ```bash frame="terminal" title="Terminal"
    box version
    ```

    Aktuelle Entwickler, die die Lucee-basierte CommandBox-Distribution verwenden, sollten zwischengespeicherte Artefakte bereinigen, um sicherzustellen, dass sie die neuesten Versionen der erforderlichen Module nutzen:

    ```bash frame="terminal" title="Terminal"
    box artifacts clean
    ```

    Wird `box` nach der Installation nicht gefunden, starte das Terminal neu oder füge das vom Installer gemeldete Verzeichnis zu deinem `PATH` hinzu.

## Deine App aufbauen

Öffne die CommandBox-Shell, indem du zuerst `box` eingibst:

::: stepper
::: step "Die neueste ColdBox-CLI installieren"
```bash frame="terminal" title="Terminal"
install coldbox-cli
```
:::

::: step "Die CBGenesis-App erstellen"
```bash frame="terminal" title="Terminal"
coldbox create app name="my-app" skeleton="cbgenesis"
```
:::

::: step "Node-Abhängigkeiten installieren"
```bash frame="terminal" title="Terminal"
!npm install
```
:::

::: step "Datenbank-Zugangsdaten & Konfiguration aktualisieren"
Öffne die `.env`-Datei in deinem bevorzugten Texteditor und aktualisiere die Datenbank-Zugangsdaten entsprechend. Die Vorlage wird vorkonfiguriert für MySQL ausgeliefert. MySQL, MariaDB, PostgreSQL und MSSQL sind unterstützte und getestete Datenbankziele. `onServerInitialInstall` in `server.json` installiert beim ersten Ausführen von `box server start` das JDBC-Treibermodul passend zu deiner `DB_DRIVER`-Einstellung (`bx-${DB_DRIVER}`, standardmäßig `bx-mysql`). Um eine andere Datenbank zu verwenden, setze `DB_DRIVER` in `.env` **vor** diesem ersten Serverstart
:::

::: step "Migrieren & Seeden"

Sobald deine `.env` gesetzt ist, führe die folgenden Befehle aus, um die Datenbank zu initialisieren und zu seeden. Die benötigten Treiber sollten automatisch heruntergeladen werden, um die CLI mit der konfigurierten Datenbank zu verbinden. Falls es Verbindungsprobleme gibt, stelle sicher, dass der richtige `DB_DRIVER` gesetzt und das entsprechende JDBC-Treibermodul installiert ist.

```bash frame="terminal" title="Terminal"
migrate init
migrate up --seed
```

??? tip "Was erstellt der Seeder?"
    `resources/database/seeds/AdminData.bx` erstellt eine **Admin**-Rolle mit allen 20 eingebauten Berechtigungen sowie einen Admin-Benutzer:

    | Feld | Wert |
    |---|---|
    | E-Mail | `admin@cbgenesis.com` |
    | Passwort | `test` (reset-pending) |

    Dieses Konto wird als reset-pending eingesät, sodass die Anmeldung mit `test` dir keine Session gibt - sie führt dich direkt zum Formular für die Passwort-Zurücksetzung, um ein echtes Passwort zu wählen. Das ist beabsichtigt: Der Bootstrap-Hash wird in diesem Repository mitgeliefert und ist öffentlich. Siehe die [Produktions-Checkliste](deployment.md#production-checklist).

:::

::: step "Deine KI-Skills aktualisieren"

CBGenesis liefert vorkonfigurierte KI-Guidelines, Skills und Agentendateien in `.agents/` mit, sodass Assistenten wie GitHub Copilot, Cursor und Claude Code korrekten ColdBox- und BoxLang-Kontext erhalten. Sie werden vom `coldbox-cli`-Modul erzeugt, das du im Scaffold-Schritt installiert hast. Aktualisiere sie nach dem Scaffolding, damit die Guidelines und Skills zu deinen installierten Modulen passen:

```bash frame="terminal" title="Terminal"
coldbox ai refresh
```

Führe `coldbox ai refresh` erneut aus, wann immer du CommandBox-Module installierst, aktualisierst oder entfernst, damit modulspezifische Guidelines und Skills übernommen werden.

??? tip "Deine KI-Integrationen entdecken und verwalten"
    ```bash frame="terminal" title="Terminal"
    coldbox ai --help         # Discover the available AI commands
    coldbox ai info           # Show installed guidelines, skills, agents, and MCP servers
    coldbox ai skills list    # List the available skills
    coldbox ai agents --help  # Add, update, or remove AI agent configuration files
    ```
:::

::: step "Den Server starten" color="success"

```bash frame="terminal" title="Terminal"
server start
```

Dies ist der BoxLang-CLI-Serverbefehl. Beim ersten Ausführen werden die in `server.json` gelisteten BoxLang-Module installiert (`bx-esapi`, `bx-password-encrypt`, `bx-mail`, `bx-orm`, der durch `DB_DRIVER` ausgewählte JDBC-Treiber sowie `bx-image`).

??? tip "Treiber wechseln, nachdem der Server bereits einmal gestartet wurde"
    `onServerInitialInstall` feuert nur beim allerersten Start eines Servers, sodass eine spätere Änderung von `DB_DRIVER` den Treiber nicht von selbst neu installiert. Führe `server forget` aus (das den Installationsstatus des Servers löscht), bevor du ihn erneut startest, damit der neue Treiber installiert wird:

    ```bash frame="terminal" title="Terminal"
    server forget
    server start
    ```
:::
::: step "Vite starten (in einem zweiten Terminal)" color="success"
```bash frame="terminal" title="Terminal"
npm run dev
```
:::
:::

## Die App öffnen

Besuche **[http://127.0.0.1:8080](http://127.0.0.1:8080)** - du landest auf der Login-Seite. Melde dich mit den oben eingesäten Admin-Zugangsdaten an.

<figure>
	<img src="assets/screenshots/login.png" alt="The login screen, using the default AuthSplit layout">
	<figcaption>Der Login-Bildschirm mit dem Standard-Layout <code>AuthSplit</code>.</figcaption>
</figure>

Sobald du angemeldet bist, landest du auf dem Dashboard, mit der Admin-Seitenleiste bereit für Benutzer, Rollen, Berechtigungen, Audit-Log und Einstellungen:

<figure>
	<img src="assets/screenshots/dashboard.png" alt="The admin dashboard after signing in">
	<figcaption>Das Admin-Dashboard nach der Anmeldung.</figcaption>
</figure>

::: cards
::: card title="Architektur" icon="phosphor-duotone:tree-structure" href="architecture.md"
Sieh, wie `public/`, `app/`, `resources/` und `lib/` zusammenpassen, und geh den Request-Lebenszyklus durch.
:::
::: card title="Sicherheit & Berechtigungen" icon="phosphor-duotone:shield-check" href="guides/security.md"
Verstehe den Login-Ablauf und das `resource:action`-Berechtigungsmodell, bevor du deine erste geschützte Seite hinzufügst.
:::
::: card title="Die App erweitern" icon="phosphor-duotone:puzzle-piece" href="guides/extending.md"
Bereit zu bauen? Starte hier für die genauen Schritte, um ein neues CRUD-Modul hinzuzufügen.
:::
:::
