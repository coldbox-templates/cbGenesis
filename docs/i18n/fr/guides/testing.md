---
title: Tests
order: 6
icon: phosphor-duotone:test-tube
summary: Spécifications unitaires TestBox pour chaque entité et service, plus des spécifications d'intégration sur de vraies requêtes HTTP.
tags: [guides, testing, testbox]
---

# Tests

CBGenesis est livré avec une suite [TestBox](https://testbox.ortusbooks.com) couvrant chaque service et entité, plus des spécifications d'intégration qui exercent de vraies requêtes.

## Exécuter les tests

```bash frame="terminal" title="Terminal"
box testbox run                                  # All tests
box testbox run directory=tests.specs.unit       # Unit tests only
box testbox run directory=tests.specs.integration # Integration tests only
box testbox run bundles=tests.specs.unit.security.RoleServiceTest  # One bundle
```

L'exécuteur (`tests/runner.bxm`, câblé par la clé `testbox.runner` de `box.json`) accepte aussi `labels=` et `excludes=`, mais aucune spécification de cette suite ne déclare de label, donc filtrez plutôt par répertoire ou par bundle. `--verbose` affiche chaque spécification à mesure qu'elle s'exécute, et `outputFile=`/`outputFormats=` écrivent des rapports - c'est ainsi que la CI l'invoque.

!!! warning "Les spécifications d'intégration ont besoin d'un serveur en cours d'exécution"
    Elles émettent de vraies requêtes, donc `box server start` doit être actif et la base de données migrée et seedée au préalable. La CI fait exactement cela avant `box testbox run`.

## Structure des tests

```text title="tests/ layout" linenums="1"
tests/
├── Application.bx              Virtual ColdBox app (appMapping="/app")
├── runner.bxm                  TestBox CLI runner entry
├── run.bxm / index.bxm         Browser-based runner UI
├── specs/
│   ├── integration/
│   │   ├── MainSpec.bx         Lifecycle events and exception handling
│   │   ├── AuthTest.bx         Login, registration, and password reset
│   │   ├── ProfileTest.bx      Password change and profile validation
│   │   └── SettingsTest.bx     Settings handler CRUD and registry
│   └── unit/
│       ├── security/           APIToken, APITokenService, Permission,
│       │                       PermissionService, RateLimitService,
│       │                       RememberTokenService, Role, RoleService,
│       │                       SecurityService
│       └── system/              AuditLog, AuditLogService, Setting,
│                               SettingService, User, UserService
└── resources/
    └── BaseIntegrationSpec.bx  Shared helper for integration tests
```

La convention de nommage est une spécification unitaire par entité et une par service, réparties par dossier de domaine (`security`, `system`) - reflétant `app/models`. Suivez le même appariement lorsque vous ajoutez votre propre domaine. L'exécuteur découvre les bundles par le motif de nom de fichier `*Spec*`/`*Test*`, donc les deux suffixes fonctionnent.

## Écrire une spécification d'intégration

Les spécifications d'intégration étendent `tests.resources.BaseIntegrationSpec`, qui câble `appMapping="/app"` afin que les chemins se résolvent exactement comme en production :

```boxlang title="tests/specs/integration/MainSpec.bx" linenums="1"
component extends="tests.resources.BaseIntegrationSpec" {

    function run(){
        describe( "Registration", () => {
            it( "renders the registration form", () => {
                var event = execute( event = "Auth.register", renderResults = true );
                expect( event.getValue( "cbox_rendered_content" ) ).toInclude( "register" );
            } );
        } );
    }

}
```

!!! tip "Toujours réinitialiser l'état dans beforeEach()"
    Appelez `setup()` dans `beforeEach()` pour chaque spécification d'intégration, afin que l'état d'un test ne se propage jamais au suivant.

La suite intégrée compte **185 spécifications réparties sur 19 suites** : couverture unitaire pour chaque entité et service de sécurité et système, plus des spécifications d'intégration pour le cycle de vie de l'application (`MainSpec`), les flux d'authentification (`AuthTest`), le handler de profil (`ProfileTest`), et le handler de paramètres (`SettingsTest`). Il n'existe pas encore de couverture d'intégration pour les handlers d'administration `Users`, `Roles`, `Permissions`, ou `AuditLog` - ajoutez-la à mesure que vous construisez dessus ; une fonctionnalité n'est pas couverte simplement parce que son service possède une spécification unitaire.

::: cards
::: card title="Étendre l'application" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Ajouter une spécification unitaire pour un nouveau service, aux côtés de sa spécification d'entité.
:::
:::
