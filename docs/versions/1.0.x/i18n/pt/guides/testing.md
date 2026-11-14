---
title: Testes
order: 6
icon: phosphor-duotone:test-tube
summary: Specs unitárias em TestBox para cada entidade e serviço, além de specs de integração sobre pedidos HTTP reais.
tags: [guides, testing, testbox]
---

# Testes

O CBGenesis vem com um conjunto [TestBox](https://testbox.ortusbooks.com) que cobre todos os serviços e entidades, além de specs de integração que exercitam pedidos reais.

## Executar os testes

```bash frame="terminal" title="Terminal"
box testbox run                                  # Todos os testes
box testbox run directory=tests.specs.unit       # Apenas testes unitários
box testbox run directory=tests.specs.integration # Apenas testes de integração
box testbox run bundles=tests.specs.unit.security.RoleServiceTest  # Um único bundle
```

O executor (`tests/runner.bxm`, ligado pela chave `testbox.runner` do `box.json`) também aceita `labels=` e `excludes=`, mas nenhuma spec deste conjunto declara um label, pelo que deve filtrar por diretoria ou bundle. `--verbose` imprime cada spec à medida que é executada, e `outputFile=`/`outputFormats=` escrevem relatórios - é assim que o CI o invoca.

!!! warning "As specs de integração precisam de um servidor em execução"
    Emitem pedidos reais, pelo que `box server start` tem de estar ativo, e a base de dados migrada e semeada previamente. O CI faz exatamente isso antes de `box testbox run`.

## Estrutura dos testes

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

A convenção de nomenclatura é uma spec unitária por entidade e uma por serviço, dividida por pasta de domínio (`security`, `system`) - espelhando `app/models`. Siga o mesmo emparelhamento ao adicionar o seu próprio domínio. O executor descobre os bundles pelo padrão de nome de ficheiro `*Spec*`/`*Test*`, pelo que qualquer um dos dois sufixos funciona.

## Escrever uma spec de integração

As specs de integração estendem `tests.resources.BaseIntegrationSpec`, que liga `appMapping="/app"`, para que os caminhos se resolvam exatamente como em produção:

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

!!! tip "Reponha sempre o estado em beforeEach()"
    Chame `setup()` em `beforeEach()` para todas as specs de integração, para que o estado de um teste nunca se propague para o seguinte.

O conjunto já incluído tem **185 specs em 19 suites**: cobertura unitária para todas as entidades e serviços de segurança e de sistema, além de specs de integração para o ciclo de vida da aplicação (`MainSpec`), os fluxos de autenticação (`AuthTest`), o handler de perfil (`ProfileTest`), e o handler de definições (`SettingsTest`). Ainda não há cobertura de integração para os handlers de administração `Users`, `Roles`, `Permissions`, ou `AuditLog` - adicione-a à medida que for construindo sobre eles; uma funcionalidade não está coberta apenas porque o seu serviço tem uma spec unitária.

::: cards
::: card title="Estender a Aplicação" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Adicione uma spec unitária para um novo serviço, junto da spec da sua entidade.
:::
:::
