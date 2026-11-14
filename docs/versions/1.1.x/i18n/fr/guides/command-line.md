---
title: CLI BoxLang
order: 0
icon: phosphor-duotone:terminal-window
summary: Installer BoxLang et utiliser le flux de travail natif bx-cli pour les dépendances, les serveurs, les migrations, et les tests.
tags: [guides, setup, cli, boxlang]
---

# CLI BoxLang

CBGenesis est une application BoxLang. Ses commandes `box` doivent être fournies par le module natif BoxLang `bx-cli`. La distribution CommandBox classique basée sur Lucee n'est pas prise en charge pour ce template.

## Installation requise

Installez BoxLang avec l'installateur rapide ou BVM, puis installez `bx-cli` :

=== "Installateur rapide"
    ```bash linenums="1"
    /bin/bash -c "$(curl -fsSL https://install.boxlang.io)"
    ```

    Pour installer avec un runtime Java 21 lorsque Java n'est pas déjà disponible :

    ```bash linenums="1"
    curl -fsSL https://install.boxlang.io | bash -s -- --with-jre
    ```

=== "BVM"
    ```bash linenums="1"
    curl -fsSL https://install-bvm.boxlang.io | bash
    bvm install latest
    bvm use latest
    ```

Une fois BoxLang disponible, installez le module CLI :

```bash linenums="1"
install-bx-module bx-cli
box version
```

Redémarrez le terminal si `box` n'est pas trouvé immédiatement après l'installation. N'installez pas l'exécutable CommandBox classique basé sur Lucee en parallèle de ce flux de travail ; cela peut entraîner la sélection du mauvais runtime et des mauvais modules de commande.

## Commandes quotidiennes

Exécutez-les depuis la racine du projet. Elles sont toutes exécutées par `bx-cli` :

| Commande | Objectif |
|---|---|
| `box install` | Installer les dépendances de `box.json` dans `lib/` |
| `box server start` | Démarrer le serveur web BoxLang sur le port `8080` |
| `box server stop` | Arrêter le serveur du projet |
| `box migrate up` | Appliquer les migrations de base de données en attente |
| `box migrate down` | Annuler le dernier lot de migration |
| `box migrate reset` | Annuler toutes les migrations et les réappliquer |
| `box migrate seed run` | Exécuter les données de départ : le rôle `Admin`, ses 20 permissions, et l'utilisateur administrateur en attente de réinitialisation |
| `box testbox run` | Exécuter la suite TestBox - voir [Tests](testing.md#running-tests) pour le filtrage |
| `box task run path/to/task.cfc` | Exécuter une tâche CommandBox via `bx-cli` |
| `box coldbox ai refresh` | Synchroniser les directives et skills IA dans `.agents/` avec vos modules installés |
| `box run-script format` | Formater le code source BoxLang (`app/`, `tests/specs/`, `*.bx` à la racine) |
| `box run-script format:check` | Vérifier le formatage sans écrire de modifications |

Le frontend utilise Node.js séparément :

```bash linenums="1"
npm install
npm run dev
npm run build
npm run lint
npm run lint:scss
```

## Séquence de première exécution

```bash linenums="1"
install-bx-module bx-cli
box install
npm install
cp .env.example .env
box migrate up
box migrate seed run
box server start
npm run dev
```

Le serveur utilise `server.json` pour sélectionner `boxlang@1`, la racine web `public/`, le port `8080`, et les modules BoxLang installés au premier démarrage. Voir [Démarrage](../getting-started.md) pour la configuration de la base de données et [Configuration](configuration.md) pour les variables d'environnement.

## Dépannage

- **`box: command not found`** : confirmez que BoxLang est installé, redémarrez le terminal, et assurez-vous que le répertoire de l'installateur est dans le `PATH`.
- **Messages du moteur Lucee ou CFML** : l'exécutable CommandBox classique est utilisé. Retirez-le du `PATH`, réinstallez BoxLang, et exécutez `install-bx-module bx-cli`.
- **Commandes de projet manquantes** : exécutez `box version` depuis la racine du projet puis `box install` afin que les dépendances de `box.json` soient disponibles.
- **Erreurs de connexion à la base de données** : vérifiez `.env`, assurez-vous que la base de données existe, et installez/démarrez le pilote JDBC via la configuration du serveur BoxLang.
