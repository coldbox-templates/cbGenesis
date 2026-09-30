---
title: Configuration
order: 7
icon: phosphor-duotone:gear-six
summary: Variables d'environnement, paramètres du framework, et configuration par module.
tags: [guides, configuration]
---

# Configuration

## Variables d'environnement

Copiez `.env.example` vers `.env` et renseignez vos propres valeurs - lisibles n'importe où dans l'application via `getSystemSetting( "VAR_NAME", "default" )` :

| Variable | Objectif |
|---|---|
| `APPNAME` | Nom d'affichage de l'application |
| `ENVIRONMENT` | `development` ou `production` |
| `ASSET_URL` | Préfixe d'URL public pour les assets de production Vite (par défaut `/includes`) |
| `BOXLANG_DEBUG` | Active la sortie de débogage de BoxLang |
| `DB_CONNECTIONSTRING` | Chaîne de connexion JDBC complète |
| `DB_DRIVER` | Pilote de base de données, en minuscules, correspondant à un module de pilote JDBC `bx-*` (`mysql` pour MySQL ou MariaDB, `mssql`, `postgresql`, `h2`, `oracle`, `sqlite`) - le `onServerInitialInstall` de `server.json` installe `bx-${DB_DRIVER}` au premier démarrage du serveur |
| `DB_HOST` / `DB_PORT` / `DB_DATABASE` | Détails de connexion à la base de données |
| `DB_SCHEMA` | Schéma ciblé par l'exécuteur de migrations (`.cbmigrations.json`) ; laissez vide pour les moteurs qui n'en ont pas |
| `DB_USER` / `DB_PASSWORD` | Identifiants de base de données |
| `JWT_SECRET` | Clé de signature pour le support JWT de `cbsecurity` |
| `COOKIE_ENCRYPTION_KEY` | Clé de chiffrement pour le stockage de cookies de `cbstorages`. Ne compte que lorsque `useEncryption` est activé (désactivé par défaut) - définissez-la avant de l'activer, sinon la clé se régénère à chaque démarrage et invalide silencieusement les cookies précédemment chiffrés |
| `CBFS_ASSETS_DISK_PATH` | Chemin du système de fichiers pour le disque cbfs `assets` qui stocke les avatars et le logo de marque (par défaut `<app-root>/.cbfs`) |
| `COLDBOX_REINIT_PASSWORD` | Mot de passe requis par `?fwreinit`. Non défini signifie une valeur aléatoire fraîche à chaque démarrage, donc la réinitialisation est fermée - voir [Déploiement](../deployment.md#production-checklist) |
| `COLDBOX_SESSION_TIMEOUT` | Délai d'expiration du cache de session, en minutes, pour le stockage de session de `cbstorages` (par défaut `60`) |

## Paramètres du framework (`app/config/Coldbox.bx`)

| Paramètre | Valeur |
|---|---|
| `defaultEvent` | `Auth.login` — les visiteurs non authentifiés arrivent sur la page de connexion |
| `requestStartHandler` | `Main.onRequestStart` |
| `applicationStartHandler` | `Main.onAppInit` |
| `exceptionHandler` | `Main.onException` |
| `modulesExternalLocation` | `["/modules"]` |
| `autoMapModels` | `true` |
| `jsonPayloadToRC` | `true` |
| `reinitPassword` | `COLDBOX_REINIT_PASSWORD`, ou un UUID aléatoire frais à chaque démarrage lorsque celui-ci n'est pas défini |

Une surcharge d'environnement `development()` active le template d'erreur Whoops, le rechargement des singletons WireBox, le mode débogage ColdBox, et vide `reinitPassword` afin que `?fwreinit=1` fonctionne localement sans mot de passe. LogBox est configuré avec un appender console plus un appender de fichier tournant écrivant dans `app/logs`.

## Paramètres d'application vs. configuration du framework

Deux choses différentes vivent toutes deux sous `app/config/`, et il est facile de les confondre :

::: columns
::: column
**La configuration du framework** (`Coldbox.bx`, `Router.bx`, `WireBox.bx`, `CacheBox.bx`, `Scheduler.bx`) est statique, basée sur des fichiers, et les modifications prennent effet au prochain `?fwreinit`.
:::
::: column
**Les paramètres d'application** (`cbAppName`, `cbAllowRegistration`, `cbMinPasswordLength`, ...) sont stockés en base de données, modifiables par un administrateur sur `/settings`, définis dans `SettingService.static.DEFAULTS`, et mis en cache avec une durée de vie de 2 heures.
:::
:::

`SettingService.preFlightCheck()` (appelé depuis `Main.onAppInit`) insère en base au démarrage toute valeur par défaut manquante, donc ajouter une nouvelle clé à `DEFAULTS` suffit à la faire apparaître. Un paramètre peut aussi être surchargé de deux autres façons, toutes deux lues par `loadConfigOverrides()`/`loadEnvironmentOverrides()` :

- Toute clé préfixée par `cb*` placée dans `variables.settings` de `Coldbox.bx`
- Toute variable d'environnement préfixée par `genesis_*`

## Configuration des modules

Chaque module installé possède son propre fichier de paramètres sous `app/config/modules/` :

| Module | Paramètres clés |
|---|---|
| **cbsecurity** | Fournisseur cbauth, CSRF (rotatif, 30 min), pare-feu avec analyse d'annotations `@secured`, en-têtes de sécurité, JWT (HS512, 60 min) — voir [Sécurité & Permissions](security.md) |
| **cbauth** | `UserService` comme fournisseur d'identité, stockage de session basé sur le cache |
| **cbmailservices** | Protocole BXMail en production, protocole fichiers en développement — voir [Email](email.md) |
| **cborm** | Injection d'entités activée, pagination `maxRows: 25` / `maxRowsLimit: 500` |
| **cbfs** | Disque `assets` (fournisseur `Local` par défaut, chemin depuis `CBFS_ASSETS_DISK_PATH`) - stocke les avatars et le logo de marque, diffusé par `Assets.bx` — voir [Frontend](frontend.md#avatars-branding-logo) |
| **cbstorages** | Stockage cache (cache de sessions, délai depuis `COLDBOX_SESSION_TIMEOUT`, par défaut 60 min), stockage cookie (chiffrement désactivé par défaut) |
| **cbsecurity-passkeys** | Configuration du tiers de confiance WebAuthn pour la connexion par passkey - `relyingPartyId`/`allowedOrigins` sont des valeurs de substitution `localhost` que vous **devez** changer avant la production, voir [Déploiement](../deployment.md#production-checklist) |
| **mementifier** | Dates ISO8601, inclusions automatiques ORM, conversion UTC |

::: cards
::: card title="Sécurité & Permissions" icon="phosphor-duotone:shield-check" href="security.md"
La configuration complète du pare-feu cbsecurity, en contexte.
:::
::: card title="Déploiement" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Lesquels de ces paramètres comptent réellement pour une mise en production.
:::
:::
