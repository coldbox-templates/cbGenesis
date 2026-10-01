---
title: Déploiement
order: 5
icon: phosphor-duotone:cloud-arrow-up
summary: Build de production, Docker, BoxLang MiniServer, et une checklist de mise en production.
tags: [deployment]
---

# Déploiement

## Build de production

```bash frame="terminal" title="Terminal"
npm run build
```

Compile et signe (fingerprint) le frontend dans `public/includes/` - voir [Frontend](guides/frontend.md#vite-configuration).

## Docker

Un `Dockerfile` et des fichiers Compose spécifiques à chaque base de données vivent dans `resources/docker/`. MySQL est la valeur par défaut ; des alternatives PostgreSQL et MSSQL sont fournies pour les autres cibles testées en CI. MariaDB peut utiliser la configuration MySQL et le pilote JDBC `mysql`. `box.json` définit aussi les scripts `docker:build`, `docker:run`, `docker:bash`, et `docker:stack` (à exécuter avec `box run-script <name>`) comme raccourcis pour les commandes à argument unique ci-dessous - ils ne remplacent pas l'installation requise du CLI BoxLang pour les commandes `box` locales, et n'ont aucun rapport avec `npm run` (il n'existe pas de `npm run docker:*`).

### Développement local avec Docker Compose

`resources/docker/docker-compose.yml` exécute l'application (construite à partir de `resources/docker/Dockerfile.dev`, qui installe CommandBox nativement par-dessus l'image officielle `ortussolutions/boxlang:cli` afin que la version du moteur corresponde à `.bvmrc`) aux côtés d'un conteneur MySQL 8, avec tout le dépôt monté en bind dans le conteneur applicatif afin que les modifications faites sur l'hôte s'appliquent sans reconstruction - aucune installation locale de BoxLang/MySQL n'est nécessaire. Exécutez `docker compose` directement (plutôt que via le script de package `docker:stack`) afin que les commandes à plusieurs mots comme `up -d` soient correctement transmises :

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.yml up -d
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box migrate seed run
```

Visitez `http://127.0.0.1:8080`. MySQL est accessible depuis l'hôte sur `127.0.0.1:3406` (choisi pour éviter tout conflit avec un MySQL/MariaDB déjà en cours d'exécution sur `3306`) ; le conteneur applicatif s'adresse à lui via le réseau Docker interne, sur le vrai port de MySQL, `3306`.

Le fichier compose n'exécute pas Vite - démarrez-le séparément sur l'hôte pour le HMR :

```bash frame="terminal" title="Terminal"
npm install
npm run dev
```

Un fichier Compose spécifique à MSSQL est également disponible pour tester contre SQL Server 2022. Il installe le pilote `bx-mssql` dans le conteneur applicatif, crée la base de données `cbgenesis`, et conserve ses données sous `resources/docker/.db/mssql/` :

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.mssql.yml up -d
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box migrate seed run
```

L'application reste disponible sur `http://127.0.0.1:8080` ; SQL Server est accessible depuis l'hôte sur `127.0.0.1:1434`. Le mot de passe `sa` par défaut est prévu uniquement pour les tests locaux. Définissez `MSSQL_SA_PASSWORD` avant de démarrer la pile pour le remplacer. Arrêtez cette pile avec :

```bash frame="terminal" title="Terminal"
docker compose -f resources/docker/docker-compose.mssql.yml down
```

L'alternative PostgreSQL utilise PostgreSQL 16, publie le port hôte `5433`, et installe automatiquement `bx-postgresql` :

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.postgresql.yml up -d
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box migrate seed run
```

Le fichier Compose MySQL par défaut reste inchangé. Arrêtez l'une ou l'autre alternative avec son fichier Compose correspondant et `down`.

```bash frame="terminal" title="Terminal"
docker compose -f resources/docker/docker-compose.yml down
```

### Image de production

```bash frame="terminal" title="Terminal"
box run-script docker:build
box run-script docker:run
```

Construisez le frontend avant de créer une image de production :

```bash linenums="1"
npm run build
```

## BoxLang MiniServer

Une alternative au serveur de développement `bx-cli` pour exécuter directement l'application compilée :

```bash frame="terminal" title="Terminal"
cd my-app
boxlang-miniserver --port 8080 --webroot ./public --dev
```

Le MiniServer ne fournit pas `box install`, les migrations, ni les commandes TestBox. Utilisez le [CLI BoxLang](guides/command-line.md) requis pour ces tâches.

## Checklist de mise en production

::: stepper
::: step "Définir l'environnement"
`ENVIRONMENT=production` et `BOXLANG_DEBUG=false` dans `.env`.
:::
::: step "Configurer un vrai service d'email"
Pointez `app/config/modules/cbmailservices.bx` vers un vrai pilote SMTP/Postmark/SendGrid - voir [Email](guides/email.md#protocol-by-environment).
:::
::: step "Faire tourner le mot de passe administrateur seedé" color="warning"
Le seeder crée `admin@cbgenesis.com` / `test`, marqué comme en attente de réinitialisation. Se connecter avec ne donne pas de session : vous êtes envoyé directement vers le formulaire de réinitialisation de mot de passe et devez d'abord en définir un nouveau. Le hash de démarrage est public (il est livré dans le dépôt), donc ne retirez jamais ce marqueur pour continuer à utiliser `test`. Voir [Démarrage](getting-started.md#scaffold-your-app).
:::
::: step "Décider qui peut réinitialiser le framework"
`reinitPassword` lit `COLDBOX_REINIT_PASSWORD` depuis l'environnement. Laissez-le **non défini** en production et chaque démarrage se rabat sur un UUID aléatoire frais que personne ne connaît, ce qui ferme entièrement `?fwreinit`. Ne le définissez que si vous devez réinitialiser une instance en cours d'exécution, et traitez-le comme un identifiant sensible. Le définir avec une chaîne vide laisse la réinitialisation ouverte à tout le monde, ce que fait précisément `development()`, et ce que la production ne doit pas faire.
:::
::: step "Activer HTTPS"
Via la configuration SSL dans `server.json`, ou votre proxy inverse / répartiteur de charge de choix.
:::
::: step "Décider s'il faut faire confiance aux en-têtes de proxy" color="warning"
`cbTrustProxyHeaders` est activé **par défaut**, ce qui correspond à un déploiement typique derrière un proxy inverse ou un répartiteur de charge. Si l'application est directement exposée sur Internet, désactivez-le - voir [Déployer derrière un proxy inverse](#deploying-behind-a-reverse-proxy). Se tromper dans ce sens désactive soit la limitation de débit, soit la casse pour tout le monde derrière le proxy.
:::
::: step "Mettre à jour la configuration du tiers de confiance des passkeys" color="warning"
`app/config/modules/cbsecurity-passkeys.bx` est livré avec des valeurs de substitution réservées au développement (`relyingPartyId: "localhost"`, `allowedOrigins: ["http://localhost:8080"]`). Réglez-les sur votre véritable domaine de production avant la mise en ligne, sinon l'enregistrement des passkeys échouera - voir [Sécurité & Permissions](guides/security.md#known-issues).
:::
::: step "Construire le frontend"
`npm run build` pour des assets minifiés et signés (fingerprintés).
:::
::: step "Verrouiller /healthcheck" color="danger"
Retirez ou restreignez le point de terminaison public `/healthcheck` s'il ne doit pas être accessible depuis l'extérieur de votre infrastructure.
:::
:::

## Déployer derrière un proxy inverse

`RateLimiter`, le journal d'audit, et les emails de sécurité « réinitialisation demandée depuis l'IP » lisent tous l'IP de l'appelant via `getRealIP()` de `cbsecurity`. Cette fonction dispose de deux sources possibles pour l'IP, et seul vous - la personne qui déploie cette application - savez laquelle est correcte pour votre configuration :

- **L'adresse brute du socket** (`cgi.remote_addr`) - correcte lorsque l'application est directement exposée sur Internet. Si un proxy inverse se trouve devant, il s'agit toujours de l'adresse du proxy lui-même, pas de celle du visiteur.
- **Les en-têtes de requête `X-Forwarded-For` / `X-Cluster-Client-IP`** - correctes uniquement lorsque quelque chose devant l'application (nginx, un répartiteur de charge, un CDN) supprime toute valeur envoyée par le client et définit lui-même l'en-tête. Si rien ne fait cela, n'importe quel appelant peut définir cet en-tête à n'importe quelle valeur, y compris une valeur différente à chaque requête.

Le paramètre `cbTrustProxyHeaders` (par défaut `true`, modifiable sur `/settings`) choisit entre les deux. Le laisser activé alors que vous n'êtes pas réellement derrière un proxy qui assainit l'en-tête rouvre exactement le contournement de limitation de débit qu'il est censé fermer - un appelant peut forger une nouvelle valeur `X-Forwarded-For` à chaque tentative de connexion et n'être jamais bloqué. Le désactiver alors que vous *êtes* derrière un tel proxy fait que chaque visiteur partage l'IP du proxy - un appelant bloqué bloque tout le monde derrière lui, et le journal d'audit enregistre l'adresse du proxy pour chaque action.

Si vous déployez directement exposé sur Internet, sans rien devant l'application, désactivez ce paramètre. Si vous déployez derrière un proxy inverse, confirmez qu'il écrase effectivement `X-Forwarded-For` (plutôt que d'ajouter à une valeur fournie par le client ou de la laisser passer) avant de laisser ce paramètre activé.

::: cards
::: card title="Configuration" icon="phosphor-duotone:gear-six" href="guides/configuration.md"
Chaque variable d'environnement et paramètre de module mentionné ci-dessus.
:::
::: card title="Sécurité & Permissions" icon="phosphor-duotone:shield-check" href="guides/security.md"
Vérifiez la configuration du pare-feu et du CSRF avant la mise en ligne.
:::
:::
