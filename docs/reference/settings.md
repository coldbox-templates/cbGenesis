---
title: App Settings
order: 2
icon: phosphor-duotone:sliders
summary: The DB-backed, admin-editable settings defined in SettingService.static.DEFAULTS.
tags: [reference, configuration, settings]
---

# App Settings

These live in `SettingService.static.DEFAULTS`, are seeded on boot by `preFlightCheck()`, cached with a 2-hour TTL, and editable at `/settings` by anyone with the `settings:write` (or `settings:admin`) permission — see [Configuration](../guides/configuration.md#app-settings-vs-framework-config).

## Authentication & registration

| Setting | Purpose |
|---|---|
| `cbLoginLayout` | Layout used for auth pages (`AuthSplit` by default) |
| `cbAllowRegistration` | Enables/disables self-service registration |
| `cbAllowForgotPassword` | Enables/disables the forgot-password flow |
| `cbAllowRememberMe` | Enables/disables the "remember me" cookie |
| `cbRememberMeDays` | How long a remember-me token stays valid (default: `14`) |
| `cbRequirePasskey` | Forces passkey enrollment before reaching the admin area |

## Password & token policy

| Setting | Purpose |
|---|---|
| `cbMinPasswordLength` | Minimum password length (default: `8`) |
| `cbPasswordResetExpiration` | Reset-token validity, in minutes (default: `60`) |
| `cbInvitationExpiration` | Invitation-token validity, in days (default: `7`) |
| `cbRegistrationVerificationExpiration` | Registration-verification-token validity, in hours (default: `24`) |
| `cbApiTokenMaxValidityMonths` | Maximum lifetime an API token can be issued for (default: `12`) |
| `cbEncryptionKey` / `cbSaltingKey` | Encryption/salting keys used by the security layer |

## Branding & appearance

| Setting | Purpose |
|---|---|
| `cbAppName` | Application display name |
| `cbAppLogo` | Logo shown in the admin sidebar |
| `cbAppTagline` | Tagline shown alongside the logo |
| `cbDefaultTheme` | Default light/dark theme for new visitors |

## Email

| Setting | Purpose |
|---|---|
| `cbDefaultEmail` | Default "from" address for outgoing mail |
| `cbMailHost` / `cbMailPort` | SMTP host/port |
| `cbMailUsername` / `cbMailPassword` | SMTP credentials |
| `cbMailTLS` / `cbMailSSL` | Transport security flags |

::: page-link href="../guides/configuration.md"
:::

::: page-link href="../guides/extending.md"
:::
