---
title: Estender a Aplicação
order: 8
icon: phosphor-duotone:puzzle-piece
summary: Adicione um novo módulo CRUD, permissão, definição, ou tarefa agendada, seguindo as próprias convenções da aplicação.
tags: [guides, extending]
---

# Estender a Aplicação

O CBGenesis é uma plataforma de lançamento, não um produto acabado. Estes são os mesmos passos que os seus próprios módulos Users/Roles/Permissions/Settings seguem - use-os como template para qualquer coisa nova.

## Construir com um agente de IA

Se está a estender o cbGenesis com um agente de IA de programação (Claude Code, Copilot, Cursor, ou semelhante), aponte-o para `.agents/skills-custom/` antes de escrever qualquer código - estas skills codificam exatamente os passos abaixo como instruções legíveis por máquina, com excertos de código reais desta base de código, para que o agente não tenha de os descobrir por engenharia reversa explorando cada handler:

| Skill | Cobre |
|---|---|
| `cbgenesis-crud-resource` | A fatia vertical completa abaixo - entidade, serviço, handler, rota, vista, componente - de ponta a ponta. |
| `cbgenesis-rbac-permissions` | O modelo de permissões `resource:action`, o `@secured`, e as proteções contra auto-ação. |
| `cbgenesis-csrf-frontend` | O padrão obrigatório `fetchWithCsrf()` para qualquer pedido de frontend que altere estado. |
| `cbgenesis-alpine-components` | A forma dos componentes Alpine.js, o seu registo, e a biblioteca `utils/` partilhada. |
| `cbgenesis-testing-conventions` | `BaseIntegrationSpec`, o verdadeiro mecanismo de isolamento por reversão de transação, e os auxiliares de fixtures. |
| `cbgenesis-settings-config` | Quando utilizar uma variável de ambiente em vez do registo de definições guardado na base de dados. |

Encontrou uma nova convenção que valha a pena um agente (ou um humano) não ter de redescobrir por tentativa e erro? Adicione-a aqui como uma nova skill, em vez de a deixar como conhecimento tribal numa descrição de PR. Veja [Construído para o Desenvolvimento Assistido por IA](../ai-native.md) para saber porque isto importa, e uma comparação medida de antes/depois.

## Adicionar um novo módulo CRUD

::: stepper
::: step "Criar a entidade"
Em `app/models/<domain>/`, estendendo `BaseEntity` — veja [Base de Dados e ORM](database-orm.md#entity-hierarchy).
:::
::: step "Criar o serviço"
Estendendo `BaseService`, marcado como `singleton threadSafe` — veja [o padrão de serviço](database-orm.md#service-layer-pattern).
:::
::: step "Criar o handler"
Estendendo `BaseSecureHandler`, com uma anotação `@secured` — veja [Handlers e Rotas](handlers-routing.md#basesecurehandler). Herdar dessa base significa que qualquer ação `POST`/`PUT`/`DELETE` que adicionar é [verificada automaticamente por CSRF](handlers-routing.md#csrf-verification); não há nada a ativar manualmente, mas os seus formulários e componentes Alpine têm de enviar `rc.csrf`.
:::
::: step "Adicionar rotas"
Em `app/config/Router.bx`, perto do marcador `// @app_routes@`.
:::
::: step "Criar vistas"
Em `app/views/<domain>/`, reutilizando os partials existentes em `_components/ui/`.
:::
::: step "Criar um componente Alpine"
Em `resources/assets/js/components/<domain>/`, e depois registe-o em `App.js` — veja [Frontend](frontend.md#alpinejs-architecture).
:::
::: step "Adicionar SCSS"
Em `resources/assets/scss/views/`, importado a partir de `app.scss`.
:::
::: step "Escrever testes" color="success"
Specs unitárias em `tests/specs/unit/<domain>/`, mais uma spec de integração em `tests/specs/integration/` para as rotas que adicionou — veja [Testes](testing.md#test-structure).
:::
:::

## Adicionar uma nova permissão

::: stepper
::: step "Semear o slug"
Adicione o slug `resource:action` a `resources/database/seeds/AdminData.bx` e atribua-o à(s) função(ões) apropriada(s).
:::
::: step "Proteger o handler"
`@secured( "resource:action,resource:admin" )` — a vírgula significa OU. Veja [Segurança e Permissões](security.md#permission-model).
:::
::: step "Restringir a vista"
```html linenums="1"
<bx:if prc.authUser.hasPermission( "resource:action,resource:admin" )>
```
para que a interface nunca ofereça algo que o handler recusaria.
:::
::: step "Semear novamente" color="success"
`box migrate seed run` contra uma base de dados existente - ou conceda a permissão a uma função diretamente a partir da página de administração de Funções.
:::
:::

## Adicionar uma definição

Adicione uma nova chave à struct `DEFAULTS` em `SettingService.bx`. `preFlightCheck()` semeia-a automaticamente no próximo arranque, e ela aparece na página de administração `/settings` sem qualquer ligação adicional — veja [Configuração](configuration.md#app-settings-vs-framework-config).

## Personalizar layouts

Os layouts residem em `app/layouts/`. A seleção acontece por handler, tipicamente em `preHandler`:

```boxlang title="app/handlers/BaseSecureHandler.bx" linenums="1"
function preHandler( event, rc, prc ){
    event.setLayout( "Admin" );
}
```

## Adicionar uma tarefa agendada

Registe tarefas em `app/config/Scheduler.bx`, ao lado das três que já lá são executadas - veja [Arquitetura](../architecture.md#scheduled-tasks) para saber o que fazem:

```boxlang title="app/config/Scheduler.bx" linenums="1"
task( "My Task" )
    .call( () => getInstance( "MyService" ).doWork() )
    .everyDayAt( "03:45" )
    .onOneServer()
    .withNoOverlaps();
```

`onOneServer()` e `withNoOverlaps()` importam a partir do momento em que implanta mais do que uma instância: sem eles, cada instância executa a tarefa segundo o seu próprio calendário. Coloque a lógica real de purga/limpeza no serviço (`doWork()` acima), e não diretamente na closure, para que se mantenha testável de forma unitária.

## Sobrepor a configuração de módulos

As configurações de módulos em `app/config/modules/` estendem as predefinições do próprio módulo. Sobreponha aí qualquer chave — as alterações têm efeito no próximo `?fwreinit`.

::: cards
::: card title="Construído para o Desenvolvimento Assistido por IA" icon="phosphor-duotone:robot" href="../ai-native.md"
Por que as skills personalizadas existem, e uma comparação medida de tokens/chamadas a ferramentas.
:::
::: card title="Handlers e Rotas" icon="phosphor-duotone:signpost" href="handlers-routing.md"
As convenções completas de handlers/rotas sobre as quais esta secção se apoia.
:::
::: card title="Base de Dados e ORM" icon="phosphor-duotone:database" href="database-orm.md"
Os padrões de entidade e serviço em profundidade.
:::
::: card title="Implantação" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Lance o que construiu.
:::
:::
