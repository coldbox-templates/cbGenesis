---
title: Étendre l'application
order: 8
icon: phosphor-duotone:puzzle-piece
summary: Ajouter un nouveau module CRUD, une permission, un paramètre, ou une tâche planifiée, en suivant les conventions propres de l'application.
tags: [guides, extending]
---

# Étendre l'application

CBGenesis est un tremplin, pas un produit fini. Ce sont les mêmes étapes que suivent ses propres modules Users/Roles/Permissions/Settings - utilisez-les comme modèle pour tout ce que vous ajoutez.

## Construire avec un agent IA

Si vous étendez cbGenesis avec un agent de codage IA (Claude Code, Copilot, Cursor, ou similaire), pointez-le vers `.agents/skills-custom/` avant qu'il n'écrive la moindre ligne de code - ces skills encodent les étapes exactes ci-dessous sous forme d'instructions lisibles par une machine, avec de vrais extraits de code de cette base de code, afin que l'agent n'ait pas à les rétro-ingénierer en explorant chaque handler :

| Skill | Couvre |
|---|---|
| `cbgenesis-crud-resource` | La tranche verticale complète ci-dessous - entité, service, handler, route, vue, composant - de bout en bout. |
| `cbgenesis-rbac-permissions` | Le modèle de permissions `resource:action`, `@secured`, et les protections contre les auto-actions. |
| `cbgenesis-csrf-frontend` | Le patron obligatoire `fetchWithCsrf()` pour toute requête frontend mutative. |
| `cbgenesis-alpine-components` | La forme des composants Alpine.js, leur enregistrement, et la bibliothèque `utils/` partagée. |
| `cbgenesis-testing-conventions` | `BaseIntegrationSpec`, le véritable mécanisme d'isolation par annulation de transaction, et les aides de fixtures. |
| `cbgenesis-settings-config` | Quand utiliser une variable d'environnement plutôt que le registre de paramètres en base de données. |

Une nouvelle convention qui mériterait qu'un agent (ou un humain) n'ait pas à la redécouvrir par essais et erreurs ? Ajoutez-la comme nouvelle skill ici plutôt que de la laisser comme savoir tribal dans une description de PR. Voir [Conçu pour le développement assisté par IA](../ai-native.md) pour comprendre pourquoi cela compte, avec une comparaison chiffrée avant/après.

## Ajouter un nouveau module CRUD

::: stepper
::: step "Créer l'entité"
Dans `app/models/<domain>/`, en étendant `BaseEntity` — voir [Base de données & ORM](database-orm.md#entity-hierarchy).
:::
::: step "Créer le service"
En étendant `BaseService`, marqué `singleton threadSafe` — voir [le patron de service](database-orm.md#service-layer-pattern).
:::
::: step "Créer le handler"
En étendant `BaseSecureHandler`, avec une annotation `@secured` — voir [Handlers & Routage](handlers-routing.md#basesecurehandler). Hériter de cette base signifie que chaque action `POST`/`PUT`/`DELETE` que vous ajoutez est [vérifiée CSRF automatiquement](handlers-routing.md#csrf-verification) ; il n'y a rien à activer, mais vos formulaires et composants Alpine doivent envoyer `rc.csrf`.
:::
::: step "Ajouter des routes"
Dans `app/config/Router.bx`, près du marqueur `// @app_routes@`.
:::
::: step "Créer des vues"
Dans `app/views/<domain>/`, en réutilisant les partials `_components/ui/` existants.
:::
::: step "Créer un composant Alpine"
Dans `resources/assets/js/components/<domain>/`, puis l'enregistrer dans `App.js` — voir [Frontend](frontend.md#alpinejs-architecture).
:::
::: step "Ajouter du SCSS"
Dans `resources/assets/scss/views/`, importé depuis `app.scss`.
:::
::: step "Écrire des tests" color="success"
Spécifications unitaires dans `tests/specs/unit/<domain>/`, plus une spécification d'intégration dans `tests/specs/integration/` pour les routes ajoutées — voir [Tests](testing.md#test-structure).
:::
:::

## Ajouter une nouvelle permission

::: stepper
::: step "Semer le slug"
Ajouter le slug `resource:action` à `resources/database/seeds/AdminData.bx` et l'assigner au(x) rôle(s) approprié(s).
:::
::: step "Protéger le handler"
`@secured( "resource:action,resource:admin" )` — la virgule signifie OU. Voir [Sécurité & Permissions](security.md#permission-model).
:::
::: step "Conditionner la vue"
```html linenums="1"
<bx:if prc.authUser.hasPermission( "resource:action,resource:admin" )>
```
afin que l'interface n'offre jamais quelque chose que le handler rejetterait.
:::
::: step "Réensemencer" color="success"
`box migrate seed run` sur une base de données existante - ou accorder la permission à un rôle directement depuis la page d'administration des Rôles.
:::
:::

## Ajouter un paramètre

Ajoutez une nouvelle clé à la structure `DEFAULTS` dans `SettingService.bx`. `preFlightCheck()` l'insère automatiquement en base au prochain démarrage, et elle apparaît dans la page d'administration `/settings` sans câblage supplémentaire — voir [Configuration](configuration.md#app-settings-vs-framework-config).

## Personnaliser les mises en page

Les mises en page vivent dans `app/layouts/`. La sélection se fait par handler, typiquement dans `preHandler` :

```boxlang title="app/handlers/BaseSecureHandler.bx" linenums="1"
function preHandler( event, rc, prc ){
    event.setLayout( "Admin" );
}
```

## Ajouter une tâche planifiée

Enregistrez les tâches dans `app/config/Scheduler.bx`, à côté des trois qui s'y exécutent déjà - voir [Architecture](../architecture.md#scheduled-tasks) pour ce qu'elles font :

```boxlang title="app/config/Scheduler.bx" linenums="1"
task( "My Task" )
    .call( () => getInstance( "MyService" ).doWork() )
    .everyDayAt( "03:45" )
    .onOneServer()
    .withNoOverlaps();
```

`onOneServer()` et `withNoOverlaps()` comptent dès l'instant où vous déployez plus d'une instance : sans eux, chaque instance exécute la tâche selon son propre planning. Placez la logique réelle de purge/nettoyage sur le service (`doWork()` ci-dessus), pas en ligne dans la closure, afin qu'elle reste testable unitairement.

## Surcharger la configuration des modules

Les configurations de module dans `app/config/modules/` étendent les valeurs par défaut du module lui-même. Surchargez n'importe quelle clé là - les modifications prennent effet au prochain `?fwreinit`.

::: cards
::: card title="Conçu pour le développement assisté par IA" icon="phosphor-duotone:robot" href="../ai-native.md"
Pourquoi les skills personnalisées existent, et une comparaison chiffrée de tokens/appels d'outils.
:::
::: card title="Handlers & Routage" icon="phosphor-duotone:signpost" href="handlers-routing.md"
Les conventions complètes de handler/route sur lesquelles s'appuie cette section.
:::
::: card title="Base de données & ORM" icon="phosphor-duotone:database" href="database-orm.md"
Les patrons d'entité et de service en détail.
:::
::: card title="Déploiement" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Livrez ce que vous avez construit.
:::
:::
