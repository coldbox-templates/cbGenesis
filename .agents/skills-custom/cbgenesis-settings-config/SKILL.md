---
name: cbgenesis-settings-config
description: Use this skill when adding a new configuration value to cbGenesis, or when deciding whether a value belongs in .env / getSystemSetting() versus the DB-backed settings registry. Covers the two distinct configuration systems this app has and when to use each.
---

# Configuration: two systems, not one

cbGenesis has **two** separate configuration mechanisms. Picking the wrong one for a new value is the most common mistake an agent makes here.

## 1. Environment variables - boot-time, ops-owned

Set in `.env` (copy from `.env.example`), read via `getSystemSetting( "VAR_NAME", "default" )` inside `app/config/ColdBox.bx` or `app/config/modules/*.bx`. Use this for:
- Anything that must be known before ColdBox boots (DB connection, session timeout, JWT/encryption secrets).
- Deployment-environment-specific values (API keys, external service URLs) that should never be edited by an admin user through the UI.
- Values a container/CI pipeline injects.

```boxlang
"secretKey": getSystemSetting( "JWT_SECRET", "" ),
```

Changing one of these requires a restart/reinit (`?fwreinit=1` in development) - it is baked into module config at boot.

## 2. DB-backed settings registry - runtime, admin-owned

Managed by `SettingService` (`app/models/system/SettingService.bx`) and the `Setting` entity (`app/models/system/Setting.bx`), backing the Settings → Registry admin screen (`Settings.registry*` actions, `SettingsRegistryForm.js`). Use this for:
- Anything an administrator should be able to change without a deploy or restart (feature flags, branding, rate-limit thresholds, `cbRequirePasskey`).
- Values read inside request-time application code (handlers, services), not module `configure()` blocks - module configuration is fixed at boot and can't read a DB-backed setting that doesn't exist yet at that point.

Read one with:

```boxlang
settingService.getSetting( "cbRequirePasskey", false )
```

`getSetting()` is cached (see `getSettingsCacheKey()`); `flushSettingsCache()` is called after any registry write (`createRegistry`/`updateRegistry`/`deleteRegistry`/`toggleRegistryStatus` in `Settings.bx`) so changes take effect on the next read, not the next boot. `preFlightCheck()` runs at boot to make sure required settings exist with sane defaults - if you add a setting your app logic assumes always exists, register its default there too rather than defensively `?:`-guarding every read site.

## Deciding which one

Ask: "does changing this need a restart, and should only an ops/deploy process be able to change it?" - if yes, environment variable. "Should an admin be able to change this live, from the UI, without touching the server?" - if yes, DB-backed setting. When genuinely unsure, check how the closest existing value of the same kind is handled (a new secret/URL → env var; a new toggle/threshold an admin tunes → registry) rather than defaulting to whichever is more familiar.

## Module configuration files

`app/config/modules/<module>.bx` holds cbSecurity/cbcsrf/cbauth/cbfs/cbmailservices/cbsso/cbstorages/cborm/mementifier configuration. Each returns a `configure()` struct read by that module at boot. When enabling a module feature (e.g. turning on `csrf.enableEndpoint`), check whether the module's own guide (an `mcp__*_Docs` server, or `docs.ortusbooks.com`) documents a safer default before flipping a setting on - these files are shared, boot-time, and mistakes here affect every request.
