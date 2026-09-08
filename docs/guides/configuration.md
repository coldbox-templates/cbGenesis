---
title: Configuration
order: 7
icon: phosphor-duotone:gear-six
summary: Environment variables, framework settings, and per-module configuration.
tags: [guides, configuration]
---

# Configuration

## Environment variables

Copy `.env.example` to `.env` and fill in your own values - read anywhere in the app via `getSystemSetting( "VAR_NAME", "default" )`:

| Variable | Purpose |
|---|---|
| `APPNAME` | Application display name |
| `ENVIRONMENT` | `development` or `production` |
| `ASSET_URL` | Public URL prefix for Vite production assets (defaults to `/includes`) |
| `BOXLANG_DEBUG` | Enable BoxLang debug output |
| `DB_CONNECTIONSTRING` | Full JDBC connection string |
| `DB_DRIVER` | Database driver (`MySQL`, `PostgreSQL`, ...) |
| `DB_HOST` / `DB_PORT` / `DB_DATABASE` | Database connection details |
| `DB_SCHEMA` | Schema the migration runner targets (`.cbmigrations.json`); leave blank for engines without one |
| `DB_USER` / `DB_PASSWORD` | Database credentials |
| `JWT_SECRET` | Signing key for `cbsecurity`'s JWT support |
| `CBFS_ASSETS_DISK_PATH` | Filesystem path for the cbfs `assets` disk that stores avatars and the branding logo (defaults to `resources/uploads`) |
| `COLDBOX_REINIT_PASSWORD` | Password required by `?fwreinit`. Unset means a fresh random value per boot, so reinit is closed - see [Deployment](../deployment.md#production-checklist) |

## Framework settings (`app/config/Coldbox.bx`)

| Setting | Value |
|---|---|
| `defaultEvent` | `Auth.login` — unauthenticated visitors land on the login page |
| `requestStartHandler` | `Main.onRequestStart` |
| `applicationStartHandler` | `Main.onAppInit` |
| `exceptionHandler` | `Main.onException` |
| `modulesExternalLocation` | `["/modules"]` |
| `autoMapModels` | `true` |
| `jsonPayloadToRC` | `true` |
| `reinitPassword` | `COLDBOX_REINIT_PASSWORD`, or a fresh random UUID per boot when that is unset |

A `development()` environment override enables the Whoops error template, WireBox singleton reload, ColdBox debug mode, and clears `reinitPassword` so `?fwreinit=1` works locally without one. LogBox is configured with a console appender plus a rolling file appender writing to `app/logs`.

## App settings vs. framework config

Two different things both live under `app/config/`, and it's easy to conflate them:

::: columns
::: column
**Framework config** (`Coldbox.bx`, `Router.bx`, `WireBox.bx`, `CacheBox.bx`, `Scheduler.bx`) is static, file-based, and changes take effect on the next `?fwreinit`.
:::
::: column
**App settings** (`cbAppName`, `cbAllowRegistration`, `cbMinPasswordLength`, ...) are DB-backed, admin-editable at `/settings`, defined in `SettingService.static.DEFAULTS`, and cached with a 2-hour TTL.
:::
:::

`SettingService.preFlightCheck()` (called from `Main.onAppInit`) seeds any missing default into the database on boot, so adding a new key to `DEFAULTS` is enough to make it show up. A setting can also be overridden two other ways, both read by `loadConfigOverrides()`/`loadEnvironmentOverrides()`:

- Any `cb*`-prefixed key placed in `Coldbox.bx`'s `variables.settings`
- Any `genesis_*`-prefixed environment variable

## Module configuration

Each installed module has its own settings file under `app/config/modules/`:

| Module | Key settings |
|---|---|
| **cbsecurity** | cbauth provider, CSRF (rotating, 30 min), firewall with `@secured` annotation scanning, security headers, JWT (AES-256, HS512, 60 min) — see [Security & Permissions](security.md) |
| **cbauth** | `UserService` as the identity provider, cache-based session storage |
| **cbmailservices** | BXMail protocol in production, files protocol in development — see [Email](email.md) |
| **cborm** | Entity injection enabled, pagination `maxRows: 25` / `maxRowsLimit: 500` |
| **cbfs** | `assets` disk (`Local` provider by default, path from `CBFS_ASSETS_DISK_PATH`, `visibility: "private"`) - stores avatars and the branding logo, streamed out by `Assets.bx` — see [Frontend](frontend.md#avatars-branding-logo) |
| **cbstorages** | Cache storage (sessions cache, 60 min TTL), AES-encrypted cookie storage |
| **mementifier** | ISO8601 dates, ORM auto-includes, UTC conversion |

::: cards
::: card title="Security & Permissions" icon="phosphor-duotone:shield-check" href="security.md"
The full cbsecurity firewall configuration, in context.
:::
::: card title="Deployment" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Which of these settings actually matter for a production go-live.
:::
:::
