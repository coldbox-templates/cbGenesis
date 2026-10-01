---
title: Pruebas
order: 6
icon: phosphor-duotone:test-tube
summary: Specs unitarias de TestBox para cada entidad y servicio, más specs de integración sobre solicitudes HTTP reales.
tags: [guides, testing, testbox]
---

# Pruebas

CBGenesis viene con una suite de [TestBox](https://testbox.ortusbooks.com) que cubre cada servicio y entidad, más specs de integración que ejercitan solicitudes reales.

## Ejecutando las pruebas

```bash frame="terminal" title="Terminal"
box testbox run                                  # All tests
box testbox run directory=tests.specs.unit       # Unit tests only
box testbox run directory=tests.specs.integration # Integration tests only
box testbox run bundles=tests.specs.unit.security.RoleServiceTest  # One bundle
```

El ejecutor (`tests/runner.bxm`, conectado mediante la clave `testbox.runner` de `box.json`) también acepta `labels=` y `excludes=`, pero ninguna spec de esta suite declara una etiqueta, así que filtra por directorio o bundle en su lugar. `--verbose` imprime cada spec a medida que se ejecuta, y `outputFile=`/`outputFormats=` escriben reportes - así es como CI lo invoca.

!!! warning "Las specs de integración necesitan un servidor en ejecución"
    Emiten solicitudes reales, así que `box server start` debe estar activo y la base de datos migrada y sembrada primero. CI hace exactamente eso antes de `box testbox run`.

## Estructura de las pruebas

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
│       └── system/             AuditLog, AuditLogService, Setting,
│                               SettingService, User, UserService
└── resources/
    └── BaseIntegrationSpec.bx  Shared helper for integration tests
```

La convención de nombres es una spec unitaria por entidad y una por servicio, dividida por carpeta de dominio (`security`, `system`) - reflejando `app/models`. Sigue el mismo emparejamiento cuando agregues tu propio dominio. El ejecutor descubre los bundles por el patrón de nombre de archivo `*Spec*`/`*Test*`, así que cualquiera de los dos sufijos funciona.

## Escribiendo una spec de integración

Las specs de integración extienden `tests.resources.BaseIntegrationSpec`, la cual configura `appMapping="/app"` para que las rutas se resuelvan exactamente igual que en producción:

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

!!! tip "Siempre reinicia el estado en beforeEach()"
    Llama a `setup()` en `beforeEach()` en cada spec de integración, para que el estado de una prueba nunca se filtre a la siguiente.

La suite integrada al repositorio tiene **185 specs en 19 suites**: cobertura unitaria para cada entidad y servicio de seguridad y sistema, más specs de integración para el ciclo de vida de la aplicación (`MainSpec`), los flujos de autenticación (`AuthTest`), el handler de perfil (`ProfileTest`), y el handler de configuración (`SettingsTest`). Aún no hay cobertura de integración para los handlers de administración `Users`, `Roles`, `Permissions`, o `AuditLog` - agrégala a medida que construyas sobre ellos; una funcionalidad no está cubierta solo porque su servicio tenga una spec unitaria.

::: cards
::: card title="Extendiendo la aplicación" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Agrega una spec unitaria para un nuevo servicio, junto a la spec de su entidad.
:::
:::
