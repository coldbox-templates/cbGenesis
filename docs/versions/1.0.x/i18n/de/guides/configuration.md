---
title: Konfiguration
order: 7
icon: phosphor-duotone:gear-six
summary: Umgebungsvariablen, Framework-Einstellungen und modulspezifische Konfiguration.
tags: [guides, configuration]
---

# Konfiguration

## Umgebungsvariablen

Kopiere `.env.example` nach `.env` und trage deine eigenen Werte ein - überall in der App abrufbar über `getSystemSetting( "VAR_NAME", "default" )`:

| Variable | Zweck |
|---|---|
| `APPNAME` | Anzeigename der Anwendung |
| `ENVIRONMENT` | `development` oder `production` |
| `ASSET_URL` | Öffentliches URL-Präfix für Vite-Produktions-Assets (Standard `/includes`) |
| `BOXLANG_DEBUG` | Aktiviert die BoxLang-Debug-Ausgabe |
| `DB_CONNECTIONSTRING` | Vollständiger JDBC-Connection-String |
| `DB_DRIVER` | Datenbanktreiber, klein geschrieben, passend zu einem `bx-*`-JDBC-Treibermodul (`mysql` für MySQL oder MariaDB, `mssql`, `postgresql`, `h2`, `oracle`, `sqlite`) - `onServerInitialInstall` in `server.json` installiert `bx-${DB_DRIVER}` beim ersten Serverstart |
| `DB_HOST` / `DB_PORT` / `DB_DATABASE` | Datenbankverbindungsdetails |
| `DB_SCHEMA` | Schema, das der Migrations-Runner anzielt (`.cbmigrations.json`); bei Engines ohne Schema leer lassen |
| `DB_USER` / `DB_PASSWORD` | Datenbank-Zugangsdaten |
| `JWT_SECRET` | Signierschlüssel für cbsecuritys JWT-Unterstützung |
| `COOKIE_ENCRYPTION_KEY` | Verschlüsselungsschlüssel für cbstorages' Cookie-Speicher. Spielt erst eine Rolle, sobald `useEncryption` aktiviert wird (standardmäßig aus) - setze ihn, bevor du das tust, sonst wird der Schlüssel bei jedem Boot neu generiert und macht zuvor verschlüsselte Cookies stillschweigend ungültig |
| `CBFS_ASSETS_DISK_PATH` | Dateisystempfad für die cbfs-`assets`-Disk, die Avatare und das Branding-Logo speichert (Standard `<app-root>/.cbfs`) |
| `COLDBOX_REINIT_PASSWORD` | Passwort, das `?fwreinit` erfordert. Nicht gesetzt bedeutet ein frischer zufälliger Wert pro Boot, sodass die Reinitialisierung geschlossen ist - siehe [Deployment](../deployment.md#production-checklist) |
| `COLDBOX_SESSION_TIMEOUT` | Session-Cache-Timeout in Minuten für cbstorages' Session-Speicher (Standard `60`) |

## Framework-Einstellungen (`app/config/Coldbox.bx`)

| Einstellung | Wert |
|---|---|
| `defaultEvent` | `Auth.login` — nicht authentifizierte Besucher landen auf der Login-Seite |
| `requestStartHandler` | `Main.onRequestStart` |
| `applicationStartHandler` | `Main.onAppInit` |
| `exceptionHandler` | `Main.onException` |
| `modulesExternalLocation` | `["/modules"]` |
| `autoMapModels` | `true` |
| `jsonPayloadToRC` | `true` |
| `reinitPassword` | `COLDBOX_REINIT_PASSWORD`, oder eine frische zufällige UUID pro Boot, wenn das nicht gesetzt ist |

Eine `development()`-Umgebungs-Override aktiviert das Whoops-Fehler-Template, den WireBox-Singleton-Reload, den ColdBox-Debug-Modus und leert `reinitPassword`, sodass `?fwreinit=1` lokal ohne eines funktioniert. LogBox ist mit einem Konsolen-Appender plus einem rollierenden Datei-Appender konfiguriert, der nach `app/logs` schreibt.

## App-Einstellungen vs. Framework-Konfiguration

Zwei verschiedene Dinge liegen beide unter `app/config/`, und es ist leicht, sie zu verwechseln:

::: columns
::: column
**Framework-Konfiguration** (`Coldbox.bx`, `Router.bx`, `WireBox.bx`, `CacheBox.bx`, `Scheduler.bx`) ist statisch, dateibasiert, und Änderungen wirken beim nächsten `?fwreinit`.
:::
::: column
**App-Einstellungen** (`cbAppName`, `cbAllowRegistration`, `cbMinPasswordLength`, ...) sind DB-gestützt, admin-editierbar unter `/settings`, definiert in `SettingService.static.DEFAULTS`, und mit einer TTL von 2 Stunden gecacht.
:::
:::

`SettingService.preFlightCheck()` (aufgerufen aus `Main.onAppInit`) sät beim Boot jeden fehlenden Standardwert in die Datenbank, sodass es genügt, einen neuen Schlüssel zu `DEFAULTS` hinzuzufügen, damit er erscheint. Eine Einstellung kann auch auf zwei weitere Arten überschrieben werden, beide gelesen von `loadConfigOverrides()`/`loadEnvironmentOverrides()`:

- Jeder mit `cb*` präfixierte Schlüssel in `Coldbox.bx`s `variables.settings`
- Jede mit `genesis_*` präfixierte Umgebungsvariable

## Modulkonfiguration

Jedes installierte Modul hat seine eigene Einstellungsdatei unter `app/config/modules/`:

| Modul | Wichtige Einstellungen |
|---|---|
| **cbsecurity** | cbauth-Provider, CSRF (rotierend, 30 Min), Firewall mit `@secured`-Annotation-Scanning, Sicherheits-Header, JWT (HS512, 60 Min) — siehe [Sicherheit & Berechtigungen](security.md) |
| **cbauth** | `UserService` als Identity-Provider, cachebasierter Session-Speicher |
| **cbmailservices** | BXMail-Protokoll in der Produktion, Files-Protokoll in der Entwicklung — siehe [E-Mail](email.md) |
| **cborm** | Entity-Injection aktiviert, Pagination `maxRows: 25` / `maxRowsLimit: 500` |
| **cbfs** | `assets`-Disk (`Local`-Provider standardmäßig, Pfad aus `CBFS_ASSETS_DISK_PATH`) - speichert Avatare und das Branding-Logo, ausgeliefert von `Assets.bx` — siehe [Frontend](frontend.md#avatars-branding-logo) |
| **cbstorages** | Cache-Speicher (Sessions-Cache, Timeout aus `COLDBOX_SESSION_TIMEOUT`, Standard 60 Min), Cookie-Speicher (Verschlüsselung standardmäßig aus) |
| **cbsecurity-passkeys** | WebAuthn-Relying-Party-Konfiguration für die Passkey-Anmeldung - `relyingPartyId`/`allowedOrigins` sind Platzhalterwerte `localhost`, die du vor der Produktion **ändern musst**, siehe [Deployment](../deployment.md#production-checklist) |
| **mementifier** | ISO8601-Daten, ORM-Auto-Includes, UTC-Konvertierung |

::: cards
::: card title="Sicherheit & Berechtigungen" icon="phosphor-duotone:shield-check" href="security.md"
Die vollständige cbsecurity-Firewall-Konfiguration, im Kontext.
:::
::: card title="Deployment" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Welche dieser Einstellungen für einen Produktions-Go-Live tatsächlich wichtig sind.
:::
:::
