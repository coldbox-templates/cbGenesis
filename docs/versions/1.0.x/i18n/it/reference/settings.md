---
title: Impostazioni dell'app
order: 2
icon: phosphor-duotone:sliders
summary: Le impostazioni basate su DB, modificabili dall'admin, definite in SettingService.static.DEFAULTS.
tags: [reference, configuration, settings]
---

# Impostazioni dell'app

Queste vivono in `SettingService.static.DEFAULTS`, sono seminate all'avvio da `preFlightCheck()`, messe in cache con un TTL di 2 ore, e modificabili in `/settings` da chiunque abbia il permesso `settings:write` (o `settings:admin`) — vedi [Configurazione](../guides/configuration.md#app-settings-vs-framework-config).

<figure>
	<img src="../assets/screenshots/settings.png" alt="The Global Settings admin page">
	<figcaption>La pagina admin Impostazioni globali.</figcaption>
</figure>

## Autenticazione e registrazione

| Impostazione | Scopo |
|---|---|
| `cbLoginLayout` | Layout usato per le pagine di auth (`AuthSplit` per default; scegli `AuthCenter` o `AuthSplit`) |
| `cbAllowRegistration` | Abilita/disabilita la registrazione self-service |
| `cbAllowForgotPassword` | Abilita/disabilita il flusso di password dimenticata |
| `cbAllowRememberMe` | Abilita/disabilita il cookie "ricordami" |
| `cbRememberMeDays` | Per quanto tempo resta valido un token remember-me (default: `14`) |
| `cbRequirePasskey` | Forza l'iscrizione di una passkey prima di raggiungere l'area admin |

### Selezione del layout di login

La pagina **Impostazioni** espone `cbLoginLayout` come selettore:

| Valore | Layout | Aspetto |
|---|---|---|
| `AuthSplit` | `app/layouts/AuthSplit.bxm` | Login a due pannelli: branding/funzionalità a sinistra e il form a destra. Su schermi piccoli si riduce al form con branding compatto. Questo è il default. |
| `AuthCenter` | `app/layouts/AuthCenter.bxm` | Scheda di autenticazione centrata con logo, form, e footer di autenticazione. |

Seleziona **Auth Center** o **Auth Split** in `/settings`, salva le impostazioni, e ricarica la pagina di autenticazione. L'handler chiama `event.setLayout( prc.settings.cbLoginLayout )`, quindi il layout selezionato si applica alle pagine di login, registrazione, attivazione invito, e recupero password. Puoi anche impostare il valore nel database o aggiungere un nome di layout personalizzato sotto `app/layouts/` se la tua applicazione fornisce quel layout.

## Policy di password e token

| Impostazione | Scopo |
|---|---|
| `cbMinPasswordLength` | Lunghezza minima della password (default: `8`). `SettingService.isValidPassword()` richiede anche una lettera maiuscola, una minuscola, una cifra, e un carattere speciale, e ogni percorso lato server che imposta una password (registrazione, attivazione invito, reset, e cambio dal profilo) la esegue |
| `cbPasswordResetExpiration` | Validità del token di reset, in minuti (default: `60`) |
| `cbInvitationExpiration` | Validità del token di invito, in giorni (default: `7`) |
| `cbRegistrationVerificationExpiration` | Validità del token di verifica registrazione, in ore (default: `24`) |
| `cbApiTokenMaxValidityMonths` | Durata massima per cui può essere emesso un token API (default: `12`) |
| `cbAuditLogRetentionDays` | Età, in giorni, alla quale il task pianificato giornaliero elimina definitivamente le voci del registro di audit (default: `90`). `0` disabilita la purga - vedi [Task pianificati](../architecture.md#scheduled-tasks) |
| `cbRateLimitMaxAttempts` | Tentativi consentiti per IP, per endpoint, prima che `RateLimiter` blocchi login/registrazione/reset password (default: `5`) - vedi [Rate limiting](../guides/security.md#rate-limiting) |
| `cbRateLimitWindowSeconds` | Finestra di rate limit, in secondi (default: `300`). `0` disabilita completamente il rate limiting |
| `cbTrustProxyHeaders` | Se `RateLimiter`, il registro di audit, e le email di sicurezza si fidano degli header `X-Forwarded-For`/`X-Cluster-Client-IP` per l'IP del chiamante (default: `true`, poiché questa app è tipicamente distribuita dietro un reverse proxy o load balancer). Disattivalo solo se l'app è direttamente esposta a internet senza nulla davanti - vedi [Deployment dietro un proxy](../deployment.md#deploying-behind-a-reverse-proxy) |
| `cbEncryptionKey` / `cbSaltingKey` | Chiavi di crittografia/salting usate dal livello di sicurezza |

## Branding e aspetto

| Impostazione | Scopo |
|---|---|
| `cbAppName` | Nome visualizzato dell'applicazione |
| `cbAppLogo` | Logo mostrato nella sidebar admin. Un URL inserito manualmente, oppure `/branding/logo/lg` dopo un caricamento tramite Impostazioni — vedi [Avatar e logo del branding](../guides/frontend.md#avatars-branding-logo) |
| `cbAppTagline` | Tagline mostrata accanto al logo |
| `cbAppBrandTagline` | Etichetta di branding breve mostrata nell'area brand della sidebar |
| `cbCopyrightNotice` | Testo di copyright renderizzato dal footer dell'applicazione |
| `cbDefaultTheme` | Tema chiaro/scuro predefinito per i nuovi visitatori |

## Email

| Impostazione | Scopo |
|---|---|
| `cbDefaultEmail` | Indirizzo "da" predefinito per la posta in uscita |
| `cbMailHost` / `cbMailPort` | Host/porta SMTP |
| `cbMailUsername` / `cbMailPassword` | Credenziali SMTP |
| `cbMailTLS` / `cbMailSSL` | Flag di sicurezza del trasporto |

## Registro di audit

| Impostazione | Scopo |
|---|---|
| `cbAuditLogRetentionDays` | Numero di giorni per cui i record di audit vengono conservati dalla purga pianificata. Imposta a `0` per disabilitare la purga automatica (default: `90`). |

## Segreti e crittografia

| Impostazione | Scopo |
|---|---|
| `cbEncryptionKey` | Segreto di crittografia AES usato dal livello di sicurezza/storage. Sostituisci il valore di sviluppo generato con un segreto stabile in produzione. |
| `cbSaltingKey` | Salt usato dalle operazioni di sicurezza. Mantienilo stabile e segreto in produzione. |

::: page-link href="../guides/configuration.md"
:::

::: page-link href="../guides/extending.md"
:::
