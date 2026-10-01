---
title: Testing
order: 6
icon: phosphor-duotone:test-tube
summary: Spec unitarie TestBox per ogni entità e servizio, più spec di integrazione su vere richieste HTTP.
tags: [guides, testing, testbox]
---

# Testing

CBGenesis viene fornito con una suite [TestBox](https://testbox.ortusbooks.com) che copre ogni servizio ed entità, più spec di integrazione che eseguono richieste reali.

## Eseguire i test

```bash frame="terminal" title="Terminal"
box testbox run                                  # Tutti i test
box testbox run directory=tests.specs.unit       # Solo test unitari
box testbox run directory=tests.specs.integration # Solo test di integrazione
box testbox run bundles=tests.specs.unit.security.RoleServiceTest  # Un bundle
```

Il runner (`tests/runner.bxm`, collegato dalla chiave `testbox.runner` di `box.json`) accetta anche `labels=` e `excludes=`, ma nessuna spec in questa suite dichiara un'etichetta, quindi filtra per directory o bundle. `--verbose` stampa ogni spec man mano che viene eseguita, e `outputFile=`/`outputFormats=` scrivono i report - è così che la CI lo invoca.

!!! warning "Le spec di integrazione richiedono un server in esecuzione"
    Eseguono richieste reali, quindi `box server start` deve essere attivo e il database migrato e seminato prima. La CI fa esattamente questo prima di `box testbox run`.

## Struttura dei test

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

La convenzione di naming è una spec unitaria per entità e una per servizio, suddivisa per cartella di dominio (`security`, `system`) - rispecchiando `app/models`. Segui lo stesso abbinamento quando aggiungi il tuo dominio. Il runner scopre i bundle tramite il pattern di nome file `*Spec*`/`*Test*`, quindi entrambi i suffissi funzionano.

## Scrivere una spec di integrazione

Le spec di integrazione estendono `tests.resources.BaseIntegrationSpec`, che collega `appMapping="/app"` così i percorsi si risolvono esattamente come in produzione:

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

!!! tip "Ripristina sempre lo stato in beforeEach()"
    Chiama `setup()` in `beforeEach()` per ogni spec di integrazione, così lo stato di un test non trapela mai nel successivo.

La suite in repository è di **185 spec su 19 suite**: copertura unitaria per ogni entità e servizio di sicurezza e di sistema, più spec di integrazione per il ciclo di vita dell'applicazione (`MainSpec`), i flussi di autenticazione (`AuthTest`), l'handler del profilo (`ProfileTest`), e l'handler delle impostazioni (`SettingsTest`). Non c'è ancora copertura di integrazione per gli handler admin `Users`, `Roles`, `Permissions`, o `AuditLog` - aggiungila man mano che ci costruisci sopra; una funzionalità non è coperta solo perché il suo servizio ha una spec unitaria.

::: cards
::: card title="Estendere l'app" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Aggiungi una spec unitaria per un nuovo servizio, accanto alla sua spec di entità.
:::
:::
