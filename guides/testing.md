---
title: Testing
order: 6
icon: phosphor-duotone:test-tube
summary: TestBox unit specs for every entity and service, plus integration specs over real HTTP requests.
tags: [guides, testing, testbox]
---

# Testing

CB Genesis ships with a [TestBox](https://testbox.ortusbooks.com) suite covering every service and entity, plus integration specs that exercise real requests.

## Running tests

```bash frame="terminal" title="Terminal"
box testbox run                                  # All tests
box testbox run directory=tests.specs.unit       # Unit tests only
box testbox run directory=tests.specs.integration # Integration tests only
box testbox run bundles=tests.specs.unit.security.RoleServiceTest  # One bundle
```

The runner (`tests/runner.bxm`, wired up by `box.json`'s `testbox.runner` key) also accepts `labels=` and `excludes=`, but no spec in this suite declares a label, so filter by directory or bundle instead. `--verbose` prints each spec as it runs, and `outputFile=`/`outputFormats=` write reports - that is how CI invokes it.

!!! warning "Integration specs need a running server"
    They issue real requests, so `box server start` must be up and the database migrated and seeded first. CI does exactly that before `box testbox run`.

## Test structure

```text title="tests/ layout"
tests/
├── Application.bx              Virtual ColdBox app (appMapping="/app")
├── runner.bxm                  TestBox CLI runner entry
├── run.bxm / index.bxm         Browser-based runner UI
├── specs/
│   ├── integration/
│   │   ├── MainSpec.bx         Lifecycle events and exception handling
│   │   ├── AuthTest.bx         Login, registration, and password reset
│   │   └── ProfileTest.bx      Password change and profile validation
│   └── unit/
│       ├── security/           APIToken, APITokenService, Permission,
│       │                       PermissionService, RememberTokenService,
│       │                       Role, RoleService, SecurityService
│       └── system/             AuditLog, AuditLogService, Setting,
│                               SettingService, User, UserService
└── resources/
    └── BaseIntegrationSpec.bx  Shared helper for integration tests
```

The naming convention is one unit spec per entity and one per service, split by domain folder (`security`, `system`) - mirroring `app/models`. Follow the same pairing when you add your own domain. The runner discovers bundles by the `*Spec*`/`*Test*` filename pattern, so either suffix works.

## Writing an integration spec

Integration specs extend `tests.resources.BaseIntegrationSpec`, which wires up `appMapping="/app"` so paths resolve exactly like production:

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

!!! tip "Always reset state in beforeEach()"
    Call `setup()` in `beforeEach()` for every integration spec, so state from one test never leaks into the next.

The checked-in suite is **169 specs across 17 suites**: unit coverage for every security and system entity and service, plus integration specs for the application lifecycle (`MainSpec`), the authentication flows (`AuthTest`), and the profile handler (`ProfileTest`). Add integration coverage for new routes and handlers as you build them; a feature is not covered merely because its service has a unit spec.

::: cards
::: card title="Extending the App" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Add a unit spec for a new service, alongside its entity spec.
:::
:::
