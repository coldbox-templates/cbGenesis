---
title: Paramètres de l'application
order: 2
icon: phosphor-duotone:sliders
summary: Les paramètres en base de données, modifiables par un administrateur, définis dans SettingService.static.DEFAULTS.
tags: [reference, configuration, settings]
---

# Paramètres de l'application

Ceux-ci vivent dans `SettingService.static.DEFAULTS`, sont seedés au démarrage par `preFlightCheck()`, mis en cache avec une durée de vie de 2 heures, et modifiables sur `/settings` par quiconque possède la permission `settings:write` (ou `settings:admin`) — voir [Configuration](../guides/configuration.md#app-settings-vs-framework-config).

<figure>
	<img src="../assets/screenshots/settings.png" alt="The Global Settings admin page">
	<figcaption>La page d'administration des Paramètres globaux.</figcaption>
</figure>

## Authentification & inscription

| Paramètre | Objet |
|---|---|
| `cbLoginLayout` | Mise en page utilisée pour les pages d'authentification (`AuthSplit` par défaut ; choisissez `AuthCenter` ou `AuthSplit`) |
| `cbAllowRegistration` | Active/désactive l'inscription en libre-service |
| `cbAllowForgotPassword` | Active/désactive le flux de mot de passe oublié |
| `cbAllowRememberMe` | Active/désactive le cookie « se souvenir de moi » |
| `cbRememberMeDays` | Durée pendant laquelle un jeton « se souvenir de moi » reste valide (par défaut : `14`) |
| `cbRequirePasskey` | Impose l'enregistrement d'une passkey avant d'accéder à la zone d'administration |

### Sélection de la mise en page de connexion

La page **Paramètres** expose `cbLoginLayout` comme un sélecteur :

| Valeur | Mise en page | Apparence |
|---|---|---|
| `AuthSplit` | `app/layouts/AuthSplit.bxm` | Connexion à deux panneaux : branding/fonctionnalités à gauche et formulaire à droite. Sur petits écrans, elle se réduit au formulaire avec un branding compact. C'est la valeur par défaut. |
| `AuthCenter` | `app/layouts/AuthCenter.bxm` | Carte d'authentification centrée avec le logo, le formulaire, et le pied de page d'authentification. |

Sélectionnez **Auth Center** ou **Auth Split** sur `/settings`, enregistrez les paramètres, et rechargez la page d'authentification. Le handler appelle `event.setLayout( prc.settings.cbLoginLayout )`, donc la mise en page sélectionnée s'applique aux pages de connexion, d'inscription, d'activation d'invitation, et de récupération de mot de passe. Vous pouvez aussi définir la valeur directement en base de données ou ajouter un nom de mise en page personnalisé sous `app/layouts/` si votre application fournit cette mise en page.

## Politique de mot de passe & de jetons

| Paramètre | Objet |
|---|---|
| `cbMinPasswordLength` | Longueur minimale du mot de passe (par défaut : `8`). `SettingService.isValidPassword()` exige aussi une lettre majuscule, une lettre minuscule, un chiffre, et un caractère spécial, et chaque chemin côté serveur qui définit un mot de passe (inscription, activation d'invitation, réinitialisation, et changement de profil) l'exécute |
| `cbPasswordResetExpiration` | Validité du jeton de réinitialisation, en minutes (par défaut : `60`) |
| `cbInvitationExpiration` | Validité du jeton d'invitation, en jours (par défaut : `7`) |
| `cbRegistrationVerificationExpiration` | Validité du jeton de vérification d'inscription, en heures (par défaut : `24`) |
| `cbApiTokenMaxValidityMonths` | Durée de vie maximale pour laquelle un jeton API peut être émis (par défaut : `12`) |
| `cbAuditLogRetentionDays` | Âge, en jours, auquel la tâche planifiée quotidienne supprime définitivement les entrées du journal d'audit (par défaut : `90`). `0` désactive la purge - voir [Tâches planifiées](../architecture.md#scheduled-tasks) |
| `cbRateLimitMaxAttempts` | Tentatives autorisées par IP, par point de terminaison, avant que `RateLimiter` ne bloque la connexion/l'inscription/la réinitialisation de mot de passe (par défaut : `5`) - voir [Limitation de débit](../guides/security.md#rate-limiting) |
| `cbRateLimitWindowSeconds` | Fenêtre de limitation de débit, en secondes (par défaut : `300`). `0` désactive entièrement la limitation de débit |
| `cbTrustProxyHeaders` | Si `RateLimiter`, le journal d'audit, et les emails de sécurité font confiance aux en-têtes `X-Forwarded-For`/`X-Cluster-Client-IP` pour l'IP de l'appelant (par défaut : `true`, puisque cette application est typiquement déployée derrière un proxy inverse ou un répartiteur de charge). Désactivez ceci uniquement si l'application est directement exposée sur Internet sans rien devant elle - voir [Déploiement derrière un proxy](../deployment.md#deploying-behind-a-reverse-proxy) |
| `cbEncryptionKey` / `cbSaltingKey` | Clés de chiffrement/salage utilisées par la couche de sécurité |

## Image de marque & apparence

| Paramètre | Objet |
|---|---|
| `cbAppName` | Nom d'affichage de l'application |
| `cbAppLogo` | Logo affiché dans la barre latérale d'administration. Soit une URL saisie manuellement, soit `/branding/logo/lg` après un téléversement via Paramètres — voir [Avatars & logo de marque](../guides/frontend.md#avatars-branding-logo) |
| `cbAppTagline` | Slogan affiché à côté du logo |
| `cbAppBrandTagline` | Court libellé de marque affiché dans la zone de marque de la barre latérale |
| `cbCopyrightNotice` | Texte de copyright rendu par le pied de page de l'application |
| `cbDefaultTheme` | Thème clair/sombre par défaut pour les nouveaux visiteurs |

## Email

| Paramètre | Objet |
|---|---|
| `cbDefaultEmail` | Adresse « de » par défaut pour les emails sortants |
| `cbMailHost` / `cbMailPort` | Hôte/port SMTP |
| `cbMailUsername` / `cbMailPassword` | Identifiants SMTP |
| `cbMailTLS` / `cbMailSSL` | Drapeaux de sécurité du transport |

## Journal d'audit

| Paramètre | Objet |
|---|---|
| `cbAuditLogRetentionDays` | Nombre de jours pendant lesquels les enregistrements d'audit sont conservés par la purge planifiée. Définir à `0` pour désactiver la purge automatique (par défaut : `90`). |

## Secrets et chiffrement

| Paramètre | Objet |
|---|---|
| `cbEncryptionKey` | Secret de chiffrement AES utilisé par la couche de sécurité/stockage. Remplacez la valeur de développement générée par un secret stable en production. |
| `cbSaltingKey` | Sel utilisé par les opérations de sécurité. Gardez-le stable et secret en production. |

::: page-link href="../guides/configuration.md"
:::

::: page-link href="../guides/extending.md"
:::
