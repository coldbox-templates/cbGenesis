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
box testbox run                        # All tests
box testbox run --labels=unit          # Unit tests only
box testbox run --labels=integration   # Integration tests only
```

## Test structure

```text title="tests/ layout"
tests/
├── Application.bx              Virtual ColdBox app (appMapping="/app")
├── runner.bxm                  TestBox CLI runner entry
├── specs/
│   ├── integration/
│   │   ├── MainSpec.bx         Lifecycle events (onAppInit, onException...)
│   │   └── AuthSpec.bx         Registration form, CSRF, validation
│   └── unit/
│       ├── security/           APIToken, Permission, Role, SecurityService tests
│       └── system/             Setting, User tests
└── resources/
    └── BaseIntegrationSpec.bx  Shared helper for integration tests
```

The naming convention is one unit spec per entity and one per service, split by domain folder (`security`, `system`) - mirroring `app/models`. Follow the same pairing when you add your own domain.

## Writing an integration spec

Integration specs extend `tests.resources.BaseIntegrationSpec`, which wires up `appMapping="/app"` so paths resolve exactly like production:

```boxlang title="tests/specs/integration/AuthSpec.bx" linenums="1"
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

::: cards
::: card title="Extending the App" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Add a unit spec for a new service, alongside its entity spec.
:::
:::
