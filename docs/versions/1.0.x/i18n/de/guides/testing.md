---
title: Testing
order: 6
icon: phosphor-duotone:test-tube
summary: TestBox-Unit-Specs für jede Entität und jeden Service, plus Integrations-Specs über echte HTTP-Requests.
tags: [guides, testing, testbox]
---

# Testing

CBGenesis wird mit einer [TestBox](https://testbox.ortusbooks.com)-Suite ausgeliefert, die jeden Service und jede Entität abdeckt, plus Integrations-Specs, die echte Requests ausführen.

## Tests ausführen

```bash frame="terminal" title="Terminal"
box testbox run                                  # All tests
box testbox run directory=tests.specs.unit       # Unit tests only
box testbox run directory=tests.specs.integration # Integration tests only
box testbox run bundles=tests.specs.unit.security.RoleServiceTest  # One bundle
```

Der Runner (`tests/runner.bxm`, verdrahtet über `box.json`s Schlüssel `testbox.runner`) akzeptiert auch `labels=` und `excludes=`, aber keine Spec in dieser Suite deklariert ein Label, filtere also stattdessen nach Verzeichnis oder Bundle. `--verbose` gibt jede Spec beim Ausführen aus, und `outputFile=`/`outputFormats=` schreiben Berichte - so ruft CI es auf.

!!! warning "Integrations-Specs benötigen einen laufenden Server"
    Sie stellen echte Requests, daher muss `box server start` laufen und die Datenbank zuvor migriert und geseedet sein. CI tut genau das, bevor `box testbox run` ausgeführt wird.

## Teststruktur

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

Die Namenskonvention ist eine Unit-Spec pro Entität und eine pro Service, aufgeteilt nach Domänenordner (`security`, `system`) - spiegelt `app/models`. Folge derselben Paarung, wenn du deine eigene Domäne hinzufügst. Der Runner entdeckt Bundles anhand des Dateinamensmusters `*Spec*`/`*Test*`, beide Suffixe funktionieren also.

## Eine Integrations-Spec schreiben

Integrations-Specs erweitern `tests.resources.BaseIntegrationSpec`, das `appMapping="/app"` verdrahtet, sodass Pfade genau wie in der Produktion aufgelöst werden:

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

!!! tip "Den Zustand immer in beforeEach() zurücksetzen"
    Rufe `setup()` in `beforeEach()` für jede Integrations-Spec auf, damit der Zustand eines Tests niemals in den nächsten durchsickert.

Die eingecheckte Suite umfasst **185 Specs in 19 Suiten**: Unit-Abdeckung für jede Security- und System-Entität und jeden Service, plus Integrations-Specs für den Anwendungslebenszyklus (`MainSpec`), die Authentifizierungsabläufe (`AuthTest`), den Profil-Handler (`ProfileTest`) und den Settings-Handler (`SettingsTest`). Es gibt noch keine Integrationsabdeckung für die Admin-Handler `Users`, `Roles`, `Permissions` oder `AuditLog` - füge sie hinzu, während du darauf aufbaust; ein Feature ist nicht allein deshalb abgedeckt, weil sein Service eine Unit-Spec hat.

::: cards
::: card title="Die App erweitern" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Eine Unit-Spec für einen neuen Service hinzufügen, neben dessen Entitäts-Spec.
:::
:::
