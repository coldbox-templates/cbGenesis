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
| `cbLoginLayout` | Layout used for auth pages (`AuthSplit` by default; choose `AuthCenter` or `AuthSplit`) |
| `cbAllowRegistration` | Enables/disables self-service registration |
| `cbAllowForgotPassword` | Enables/disables the forgot-password flow |
| `cbAllowRememberMe` | Enables/disables the "remember me" cookie |
| `cbRememberMeDays` | How long a remember-me token stays valid (default: `14`) |
| `cbRequirePasskey` | Forces passkey enrollment before reaching the admin area |

### Login layout selection

The **Settings** page exposes `cbLoginLayout` as a selector:

| Value | Layout | Appearance |
|---|---|---|
| `AuthSplit` | `app/layouts/AuthSplit.bxm` | Two-panel login: branding/features on the left and the form on the right. On small screens it collapses to the form with compact branding. This is the default. |
| `AuthCenter` | `app/layouts/AuthCenter.bxm` | Centered authentication card with the logo, form, and authentication footer. |

Select **Auth Center** or **Auth Split** at `/settings`, save the settings, and reload the authentication page. The handler calls `event.setLayout( prc.settings.cbLoginLayout )`, so the selected layout applies to login, registration, invitation activation, and password-recovery pages. You may also set the value in the database or add a custom layout name under `app/layouts/` if your application supplies that layout.

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
| `cbAppBrandTagline` | Short branding label shown in the sidebar brand area |
| `cbCopyrightNotice` | Copyright text rendered by the application footer |
| `cbDefaultTheme` | Default light/dark theme for new visitors |

## Email

| Setting | Purpose |
|---|---|
| `cbDefaultEmail` | Default "from" address for outgoing mail |
| `cbMailHost` / `cbMailPort` | SMTP host/port |
| `cbMailUsername` / `cbMailPassword` | SMTP credentials |
| `cbMailTLS` / `cbMailSSL` | Transport security flags |

## Audit log

| Setting | Purpose |
|---|---|
| `cbAuditLogRetentionDays` | Number of days audit records are retained by the scheduled purge. Set to `0` to disable automatic purging (default: `90`). |

## Secrets and encryption

| Setting | Purpose |
|---|---|
| `cbEncryptionKey` | AES encryption secret used by the security/storage layer. Replace the generated development value with a stable secret in production. |
| `cbSaltingKey` | Salt used by security operations. Keep it stable and secret in production. |

::: page-link href="../guides/configuration.md"
:::

::: page-link href="../guides/extending.md"
:::
