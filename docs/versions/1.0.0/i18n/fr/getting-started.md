---
title: Démarrage
order: 2
icon: phosphor-duotone:rocket-launch
summary: Installer BoxLang, cloner le template, configurer votre base de données, et ouvrir l'écran de connexion.
tags: [guides, setup]
---

# Démarrage

## Prérequis système

- **Java 21+** (JDK ou JRE)
- **BoxLang 1.17+**
- **CommandBox 7+** (`bx-cli`)
- **Node.js 22+** (pour le frontend Vite)
- **Une base de données prise en charge** : MySQL 8+ (par défaut), MariaDB, PostgreSQL, SQLite, Oracle, ou MSSQL
- N'importe quel système d'exploitation

## Installer BoxLang

=== "Installateur rapide"

	### macOS & Linux

	```bash frame="terminal" title="Terminal"
	# macOS & Linux
	/bin/bash -c "$(curl -fsSL https://install.boxlang.io)"

	# ...avec installation automatique de Java 21
	curl -fsSL https://install.boxlang.io | bash -s -- --with-jre
	```

	### Windows

	```powershell frame="terminal" title="PowerShell (Windows)"
	powershell -NoExit -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://install-windows.boxlang.io'))"
	```

=== "BVM (gestionnaire de versions)"

	Utilisez plutôt [BVM](https://boxlang.ortusbooks.com) si vous devez basculer entre plusieurs versions de BoxLang :

	```bash frame="terminal" title="Terminal"
	curl -fsSL https://install-bvm.boxlang.io | bash

	bvm install latest && bvm use latest
	```

	Vérifiez l'installation :

	```bash frame="terminal" title="Terminal"
	boxlang --version
	```

!!! danger "Utilisez bx-cli, pas le CommandBox classique"
    CBGenesis est un template BoxLang. N'installez pas la distribution CommandBox classique basée sur Lucee. Après avoir installé BoxLang avec l'installateur rapide ou BVM, installez le module CLI natif BoxLang. Cela est requis avant d'exécuter `box install`, `box server`, `box migrate`, ou `box testbox` :

    ```bash frame="terminal" title="Terminal"
    install-bx-module bx-cli
    ```

    Vérifiez que le CLI BoxLang est actif :

    ```bash frame="terminal" title="Terminal"
    box version
    ```

    Les développeurs utilisant actuellement la distribution CommandBox basée sur Lucee devraient nettoyer les artefacts mis en cache pour s'assurer d'exécuter les dernières versions des modules requis :

    ```bash frame="terminal" title="Terminal"
    box artifacts clean
    ```

    Si `box` est introuvable après l'installation, redémarrez le terminal ou ajoutez le répertoire indiqué par l'installateur à votre `PATH`.

## Échafauder votre application

Entrez dans le Shell CommandBox en tapant d'abord `box` :

::: stepper
::: step "Installer le dernier CLI ColdBox"
```bash frame="terminal" title="Terminal"
install coldbox-cli
```
:::

::: step "Créer l'application CBGenesis"
```bash frame="terminal" title="Terminal"
coldbox create app name="my-app" skeleton="cbgenesis"
```
:::

::: step "Installer les dépendances Node"
```bash frame="terminal" title="Terminal"
!npm install
```
:::

::: step "Mettre à jour les identifiants et la configuration de la base de données"
Ouvrez le fichier `.env` dans votre éditeur de texte préféré et mettez à jour les identifiants de base de données en conséquence. Le template est livré préconfiguré pour MySQL. MySQL, MariaDB, PostgreSQL, et MSSQL sont des cibles de base de données prises en charge et testées. Le `onServerInitialInstall` de `server.json` installe le module de pilote JDBC correspondant à votre paramètre `DB_DRIVER` (`bx-${DB_DRIVER}`, par défaut `bx-mysql`) lors du premier `box server start`. Pour utiliser une autre base de données, définissez `DB_DRIVER` dans `.env` **avant** ce premier démarrage du serveur
:::

::: step "Migrer & Semer"

Une fois votre `.env` configuré, exécutez les commandes suivantes pour initialiser et semer la base de données. Les pilotes nécessaires pour connecter le CLI à la base de données configurée devraient être téléchargés automatiquement. En cas de problème de connexion, assurez-vous que le bon `DB_DRIVER` est défini et que le module de pilote JDBC correspondant est installé.

```bash frame="terminal" title="Terminal"
migrate init
migrate up --seed
```

??? tip "Que crée le seeder ?"
    `resources/database/seeds/AdminData.bx` crée un rôle **Admin** avec les 20 permissions intégrées, et un utilisateur administrateur :

    | Champ | Valeur |
    |---|---|
    | Email | `admin@cbgenesis.com` |
    | Mot de passe | `test` (en attente de réinitialisation) |

    Ce compte est semé en état d'attente de réinitialisation, donc se connecter avec `test` ne vous donne pas de session - cela vous amène directement au formulaire de réinitialisation de mot de passe pour en choisir un véritable. C'est délibéré : le hash de démarrage est livré dans ce dépôt et est public. Voir la [checklist de mise en production](deployment.md#production-checklist).

:::

::: step "Actualiser vos skills IA"

CBGenesis est livré avec des directives IA, des skills, et des fichiers d'agents préconfigurés dans `.agents/`, afin que des assistants comme GitHub Copilot, Cursor, et Claude Code obtiennent un contexte ColdBox et BoxLang précis. Ils sont générés par le module `coldbox-cli` que vous avez installé à l'étape d'échafaudage. Actualisez-les après l'échafaudage pour que les directives et les skills correspondent à vos modules installés :

```bash frame="terminal" title="Terminal"
coldbox ai refresh
```

Réexécutez `coldbox ai refresh` chaque fois que vous installez, mettez à jour, ou supprimez des modules CommandBox, afin que les directives et skills spécifiques aux modules soient prises en compte.

??? tip "Découvrir et gérer vos intégrations IA"
    ```bash frame="terminal" title="Terminal"
    coldbox ai --help         # Découvrir les commandes IA disponibles
    coldbox ai info           # Afficher les directives, skills, agents, et serveurs MCP installés
    coldbox ai skills list    # Lister les skills disponibles
    coldbox ai agents --help  # Ajouter, mettre à jour, ou supprimer des fichiers de configuration d'agent IA
    ```
:::

::: step "Démarrer le serveur" color="success"

```bash frame="terminal" title="Terminal"
server start
```

Il s'agit de la commande serveur du CLI BoxLang. La première exécution installe les modules BoxLang listés dans `server.json` (`bx-esapi`, `bx-password-encrypt`, `bx-mail`, `bx-orm`, le pilote JDBC sélectionné par `DB_DRIVER`, et `bx-image`).

??? tip "Changer de pilote après un premier démarrage du serveur"
    `onServerInitialInstall` ne se déclenche que lors du tout premier démarrage d'un serveur, donc changer `DB_DRIVER` par la suite ne réinstallera pas le pilote de lui-même. Exécutez `server forget` (qui efface l'état d'installation du serveur) avant de le redémarrer afin que le nouveau pilote soit installé :

    ```bash frame="terminal" title="Terminal"
    server forget
    server start
    ```
:::
::: step "Démarrer Vite (dans un second terminal)" color="success"
```bash frame="terminal" title="Terminal"
npm run dev
```
:::
:::

## Ouvrir l'application

Visitez **[http://127.0.0.1:8080](http://127.0.0.1:8080)** - vous arriverez sur la page de connexion. Connectez-vous avec les identifiants administrateur semés ci-dessus.

<figure>
	<img src="assets/screenshots/login.png" alt="The login screen, using the default AuthSplit layout">
	<figcaption>L'écran de connexion utilisant la mise en page <code>AuthSplit</code> par défaut.</figcaption>
</figure>

Une fois connecté, vous arriverez sur le tableau de bord, avec la barre latérale d'administration prête pour Utilisateurs, Rôles, Permissions, Journal d'audit, et Paramètres :

<figure>
	<img src="assets/screenshots/dashboard.png" alt="The admin dashboard after signing in">
	<figcaption>Le tableau de bord d'administration après connexion.</figcaption>
</figure>

::: cards
::: card title="Architecture" icon="phosphor-duotone:tree-structure" href="architecture.md"
Voir comment `public/`, `app/`, `resources/` et `lib/` s'articulent, et parcourir le cycle de vie des requêtes.
:::
::: card title="Sécurité & Permissions" icon="phosphor-duotone:shield-check" href="guides/security.md"
Comprendre le flux de connexion et le modèle de permissions `resource:action` avant d'ajouter votre première page protégée.
:::
::: card title="Étendre l'application" icon="phosphor-duotone:puzzle-piece" href="guides/extending.md"
Prêt à construire ? Commencez ici pour les étapes exactes pour ajouter un nouveau module CRUD.
:::
:::
