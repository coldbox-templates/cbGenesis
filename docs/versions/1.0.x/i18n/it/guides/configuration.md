---
title: Configurazione
order: 7
icon: phosphor-duotone:gear-six
summary: Variabili d'ambiente, impostazioni del framework e configurazione per modulo.
tags: [guides, configuration]
---

# Configurazione

## Variabili d'ambiente

Copia `.env.example` in `.env` e inserisci i tuoi valori - letti ovunque nell'app tramite `getSystemSetting( "VAR_NAME", "default" )`:

| Variabile | Scopo |
|---|---|
| `APPNAME` | Nome visualizzato dell'applicazione |
| `ENVIRONMENT` | `development` o `production` |
| `ASSET_URL` | Prefisso URL pubblico per gli asset di produzione Vite (default `/includes`) |
| `BOXLANG_DEBUG` | Abilita l'output di debug di BoxLang |
| `DB_CONNECTIONSTRING` | Stringa di connessione JDBC completa |
| `DB_DRIVER` | Driver del database, minuscolo, corrispondente a un modulo driver JDBC `bx-*` (`mysql` per MySQL o MariaDB, `mssql`, `postgresql`, `h2`, `oracle`, `sqlite`) - `onServerInitialInstall` di `server.json` installa `bx-${DB_DRIVER}` al primo avvio del server |
| `DB_HOST` / `DB_PORT` / `DB_DATABASE` | Dettagli di connessione al database |
| `DB_SCHEMA` | Schema a cui punta il runner delle migrazioni (`.cbmigrations.json`); lascia vuoto per motori senza schema |
| `DB_USER` / `DB_PASSWORD` | Credenziali del database |
| `JWT_SECRET` | Chiave di firma per il supporto JWT di `cbsecurity` |
| `COOKIE_ENCRYPTION_KEY` | Chiave di crittografia per lo storage cookie di `cbstorages`. Conta solo una volta che `useEncryption` è attivato (disattivato per default) - impostala prima di farlo, altrimenti la chiave si rigenera a ogni avvio e invalida silenziosamente i cookie precedentemente cifrati |
| `CBFS_ASSETS_DISK_PATH` | Percorso del filesystem per il disco cbfs `assets` che memorizza gli avatar e il logo del branding (default `<app-root>/.cbfs`) |
| `COLDBOX_REINIT_PASSWORD` | Password richiesta da `?fwreinit`. Non impostata significa un nuovo valore casuale a ogni avvio, quindi il reinit è chiuso - vedi [Deployment](../deployment.md#production-checklist) |
| `COLDBOX_SESSION_TIMEOUT` | Timeout della cache di sessione, in minuti, per lo storage di sessione di `cbstorages` (default `60`) |

## Impostazioni del framework (`app/config/Coldbox.bx`)

| Impostazione | Valore |
|---|---|
| `defaultEvent` | `Auth.login` — i visitatori non autenticati atterrano sulla pagina di login |
| `requestStartHandler` | `Main.onRequestStart` |
| `applicationStartHandler` | `Main.onAppInit` |
| `exceptionHandler` | `Main.onException` |
| `modulesExternalLocation` | `["/modules"]` |
| `autoMapModels` | `true` |
| `jsonPayloadToRC` | `true` |
| `reinitPassword` | `COLDBOX_REINIT_PASSWORD`, oppure un nuovo UUID casuale a ogni avvio quando non è impostato |

Un override dell'ambiente `development()` abilita il template di errore Whoops, il ricaricamento dei singleton WireBox, la modalità debug di ColdBox e cancella `reinitPassword` in modo che `?fwreinit=1` funzioni localmente senza uno. LogBox è configurato con un appender console più un appender di file a rotazione che scrive in `app/logs`.

## Impostazioni dell'app vs. configurazione del framework

Due cose diverse vivono entrambe sotto `app/config/`, ed è facile confonderle:

::: columns
::: column
**La configurazione del framework** (`Coldbox.bx`, `Router.bx`, `WireBox.bx`, `CacheBox.bx`, `Scheduler.bx`) è statica, basata su file, e le modifiche hanno effetto al prossimo `?fwreinit`.
:::
::: column
**Le impostazioni dell'app** (`cbAppName`, `cbAllowRegistration`, `cbMinPasswordLength`, ...) sono basate su DB, modificabili dall'admin in `/settings`, definite in `SettingService.static.DEFAULTS`, e messe in cache con un TTL di 2 ore.
:::
:::

`SettingService.preFlightCheck()` (chiamato da `Main.onAppInit`) semina all'avvio ogni valore predefinito mancante nel database, quindi aggiungere una nuova chiave a `DEFAULTS` è sufficiente per farla comparire. Un'impostazione può anche essere sovrascritta in altri due modi, entrambi letti da `loadConfigOverrides()`/`loadEnvironmentOverrides()`:

- Qualsiasi chiave con prefisso `cb*` inserita in `variables.settings` di `Coldbox.bx`
- Qualsiasi variabile d'ambiente con prefisso `genesis_*`

## Configurazione dei moduli

Ogni modulo installato ha il proprio file di impostazioni sotto `app/config/modules/`:

| Modulo | Impostazioni chiave |
|---|---|
| **cbsecurity** | Provider cbauth, CSRF (rotante, 30 min), firewall con scansione delle annotazioni `@secured`, header di sicurezza, JWT (HS512, 60 min) — vedi [Sicurezza e permessi](security.md) |
| **cbauth** | `UserService` come provider di identità, storage di sessione basato su cache |
| **cbmailservices** | Protocollo BXMail in produzione, protocollo file in sviluppo — vedi [Email](email.md) |
| **cborm** | Iniezione delle entità abilitata, paginazione `maxRows: 25` / `maxRowsLimit: 500` |
| **cbfs** | Disco `assets` (provider `Local` per default, percorso da `CBFS_ASSETS_DISK_PATH`) - memorizza gli avatar e il logo del branding, distribuiti in streaming da `Assets.bx` — vedi [Frontend](frontend.md#avatars-branding-logo) |
| **cbstorages** | Storage cache (cache di sessione, timeout da `COLDBOX_SESSION_TIMEOUT`, default 60 min), storage cookie (crittografia disattivata per default) |
| **cbsecurity-passkeys** | Configurazione relying-party WebAuthn per l'accesso con passkey - `relyingPartyId`/`allowedOrigins` sono valori segnaposto `localhost` che **devi** cambiare prima della produzione, vedi [Deployment](../deployment.md#production-checklist) |
| **mementifier** | Date ISO8601, auto-include ORM, conversione UTC |

::: cards
::: card title="Sicurezza e permessi" icon="phosphor-duotone:shield-check" href="security.md"
La configurazione completa del firewall cbsecurity, nel contesto.
:::
::: card title="Deployment" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Quali di queste impostazioni contano davvero per un go-live in produzione.
:::
:::
