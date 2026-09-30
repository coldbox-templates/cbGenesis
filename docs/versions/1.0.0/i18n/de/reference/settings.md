---
title: App-Einstellungen
order: 2
icon: phosphor-duotone:sliders
summary: Die DB-gestützten, admin-editierbaren Einstellungen, definiert in SettingService.static.DEFAULTS.
tags: [reference, configuration, settings]
---

# App-Einstellungen

Diese leben in `SettingService.static.DEFAULTS`, werden beim Boot von `preFlightCheck()` eingesät, mit einer TTL von 2 Stunden gecacht und sind unter `/settings` für jeden mit der Berechtigung `settings:write` (oder `settings:admin`) editierbar — siehe [Konfiguration](../guides/configuration.md#app-settings-vs-framework-config).

<figure>
	<img src="../assets/screenshots/settings.png" alt="The Global Settings admin page">
	<figcaption>Die Global-Settings-Admin-Seite.</figcaption>
</figure>

## Authentifizierung & Registrierung

| Einstellung | Zweck |
|---|---|
| `cbLoginLayout` | Layout für Auth-Seiten (`AuthSplit` standardmäßig; wähle `AuthCenter` oder `AuthSplit`) |
| `cbAllowRegistration` | Aktiviert/deaktiviert die Self-Service-Registrierung |
| `cbAllowForgotPassword` | Aktiviert/deaktiviert den Passwort-vergessen-Ablauf |
| `cbAllowRememberMe` | Aktiviert/deaktiviert das "Angemeldet bleiben"-Cookie |
| `cbRememberMeDays` | Wie lange ein Remember-me-Token gültig bleibt (Standard: `14`) |
| `cbRequirePasskey` | Erzwingt die Passkey-Registrierung, bevor der Admin-Bereich erreicht werden kann |

### Auswahl des Login-Layouts

Die **Settings**-Seite stellt `cbLoginLayout` als Auswahlfeld bereit:

| Wert | Layout | Aussehen |
|---|---|---|
| `AuthSplit` | `app/layouts/AuthSplit.bxm` | Zweigeteilter Login: Branding/Features links, das Formular rechts. Auf kleinen Bildschirmen kollabiert er zum Formular mit kompaktem Branding. Dies ist der Standard. |
| `AuthCenter` | `app/layouts/AuthCenter.bxm` | Zentrierte Authentifizierungskarte mit Logo, Formular und Authentifizierungs-Footer. |

Wähle **Auth Center** oder **Auth Split** unter `/settings`, speichere die Einstellungen und lade die Authentifizierungsseite neu. Der Handler ruft `event.setLayout( prc.settings.cbLoginLayout )` auf, sodass das gewählte Layout für Login-, Registrierungs-, Einladungsaktivierungs- und Passwort-Wiederherstellungsseiten gilt. Du kannst den Wert auch in der Datenbank setzen oder einen eigenen Layout-Namen unter `app/layouts/` hinzufügen, falls deine Anwendung dieses Layout bereitstellt.

## Passwort- & Token-Richtlinie

| Einstellung | Zweck |
|---|---|
| `cbMinPasswordLength` | Mindestlänge des Passworts (Standard: `8`). `SettingService.isValidPassword()` verlangt außerdem einen Großbuchstaben, einen Kleinbuchstaben, eine Ziffer und ein Sonderzeichen, und jeder serverseitige Pfad, der ein Passwort setzt (Registrierung, Einladungsaktivierung, Zurücksetzung und Profiländerung), führt sie aus |
| `cbPasswordResetExpiration` | Gültigkeit des Reset-Tokens in Minuten (Standard: `60`) |
| `cbInvitationExpiration` | Gültigkeit des Einladungs-Tokens in Tagen (Standard: `7`) |
| `cbRegistrationVerificationExpiration` | Gültigkeit des Registrierungs-Verifizierungs-Tokens in Stunden (Standard: `24`) |
| `cbApiTokenMaxValidityMonths` | Maximale Lebensdauer, für die ein API-Token ausgestellt werden kann (Standard: `12`) |
| `cbAuditLogRetentionDays` | Alter in Tagen, ab dem die tägliche geplante Aufgabe Audit-Log-Einträge endgültig löscht (Standard: `90`). `0` deaktiviert die Bereinigung - siehe [Geplante Aufgaben](../architecture.md#scheduled-tasks) |
| `cbRateLimitMaxAttempts` | Erlaubte Versuche pro IP, pro Endpunkt, bevor `RateLimiter` Login/Registrierung/Passwort-Zurücksetzung blockiert (Standard: `5`) - siehe [Rate Limiting](../guides/security.md#rate-limiting) |
| `cbRateLimitWindowSeconds` | Rate-Limit-Fenster in Sekunden (Standard: `300`). `0` deaktiviert Rate Limiting vollständig |
| `cbTrustProxyHeaders` | Ob `RateLimiter`, der Audit-Trail und Sicherheits-E-Mails den Headern `X-Forwarded-For`/`X-Cluster-Client-IP` für die IP des Aufrufers vertrauen (Standard: `true`, da diese App typischerweise hinter einem Reverse-Proxy oder Load-Balancer deployt wird). Schalte dies nur aus, wenn die App direkt am Internet hängt, ohne etwas davor - siehe [Deployment hinter einem Proxy](../deployment.md#deploying-behind-a-reverse-proxy) |
| `cbEncryptionKey` / `cbSaltingKey` | Verschlüsselungs-/Salting-Schlüssel, verwendet von der Sicherheitsschicht |

## Branding & Erscheinungsbild

| Einstellung | Zweck |
|---|---|
| `cbAppName` | Anzeigename der Anwendung |
| `cbAppLogo` | Logo, angezeigt in der Admin-Seitenleiste. Entweder eine manuell eingegebene URL, oder `/branding/logo/lg` nach einem Upload über Settings — siehe [Avatare & Branding-Logo](../guides/frontend.md#avatars-branding-logo) |
| `cbAppTagline` | Tagline, angezeigt neben dem Logo |
| `cbAppBrandTagline` | Kurze Branding-Beschriftung, angezeigt im Marken-Bereich der Seitenleiste |
| `cbCopyrightNotice` | Copyright-Text, gerendert vom Anwendungs-Footer |
| `cbDefaultTheme` | Standard-Hell-/Dunkel-Theme für neue Besucher |

## E-Mail

| Einstellung | Zweck |
|---|---|
| `cbDefaultEmail` | Standard-"Von"-Adresse für ausgehende E-Mails |
| `cbMailHost` / `cbMailPort` | SMTP-Host/-Port |
| `cbMailUsername` / `cbMailPassword` | SMTP-Zugangsdaten |
| `cbMailTLS` / `cbMailSSL` | Transportsicherheits-Flags |

## Audit-Log

| Einstellung | Zweck |
|---|---|
| `cbAuditLogRetentionDays` | Anzahl der Tage, für die Audit-Datensätze von der geplanten Bereinigung aufbewahrt werden. Auf `0` setzen, um die automatische Bereinigung zu deaktivieren (Standard: `90`). |

## Geheimnisse und Verschlüsselung

| Einstellung | Zweck |
|---|---|
| `cbEncryptionKey` | AES-Verschlüsselungsgeheimnis, verwendet von der Sicherheits-/Speicherschicht. Ersetze den generierten Entwicklungswert in der Produktion durch ein stabiles Geheimnis. |
| `cbSaltingKey` | Salt, verwendet von Sicherheitsoperationen. In der Produktion stabil und geheim halten. |

::: page-link href="../guides/configuration.md"
:::

::: page-link href="../guides/extending.md"
:::
