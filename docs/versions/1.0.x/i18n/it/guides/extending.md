---
title: Estendere l'app
order: 8
icon: phosphor-duotone:puzzle-piece
summary: Aggiungi un nuovo modulo CRUD, permesso, impostazione o task pianificato, seguendo le convenzioni proprie dell'app.
tags: [guides, extending]
---

# Estendere l'app

CBGenesis è un punto di partenza, non un prodotto finito. Questi sono gli stessi passi seguiti dai suoi moduli Users/Roles/Permissions/Settings - usali come template per qualsiasi cosa nuova.

## Costruire con un agente AI

Se stai estendendo cbGenesis con un agente di coding AI (Claude Code, Copilot, Cursor o simili), puntalo verso `.agents/skills-custom/` prima che scriva qualsiasi codice - queste skill codificano i passi esatti qui sotto come istruzioni leggibili da macchina, con estratti di codice reali da questo codebase, così l'agente non deve decodificarli esplorando ogni handler:

| Skill | Copre |
|---|---|
| `cbgenesis-crud-resource` | L'intera vertical slice qui sotto - entità, servizio, handler, rotta, vista, componente - dall'inizio alla fine. |
| `cbgenesis-rbac-permissions` | Il modello di permessi `resource:action`, `@secured` e le guardie contro le self-action. |
| `cbgenesis-csrf-frontend` | Il pattern obbligatorio `fetchWithCsrf()` per qualsiasi richiesta frontend che modifica dati. |
| `cbgenesis-alpine-components` | La forma dei componenti Alpine.js, la registrazione e la libreria condivisa `utils/`. |
| `cbgenesis-testing-conventions` | `BaseIntegrationSpec`, il vero meccanismo di isolamento tramite rollback delle transazioni e gli helper per le fixture. |
| `cbgenesis-settings-config` | Quando usare una variabile d'ambiente rispetto al registro delle impostazioni basato su DB. |

Una nuova convenzione che vale la pena far sì che un agente (o un umano) non debba riscoprire per tentativi ed errori? Aggiungila come nuova skill qui piuttosto che lasciarla come conoscenza tribale in una descrizione di PR. Vedi [Progettato per lo sviluppo assistito dall'AI](../ai-native.md) per il perché questo conta e un confronto prima/dopo misurato.

## Aggiungere un nuovo modulo CRUD

::: stepper
::: step "Crea l'entità"
In `app/models/<domain>/`, estendendo `BaseEntity` — vedi [Database e ORM](database-orm.md#entity-hierarchy).
:::
::: step "Crea il servizio"
Estendendo `BaseService`, marcato `singleton threadSafe` — vedi [il pattern del servizio](database-orm.md#service-layer-pattern).
:::
::: step "Crea l'handler"
Estendendo `BaseSecureHandler`, con un'annotazione `@secured` — vedi [Handler e Routing](handlers-routing.md#basesecurehandler). Ereditare quella base significa che ogni azione `POST`/`PUT`/`DELETE` che aggiungi è [verificata automaticamente per il CSRF](handlers-routing.md#csrf-verification); non c'è nulla da attivare, ma i tuoi form e componenti Alpine devono inviare `rc.csrf`.
:::
::: step "Aggiungi le rotte"
In `app/config/Router.bx`, vicino al marcatore `// @app_routes@`.
:::
::: step "Crea le viste"
In `app/views/<domain>/`, riutilizzando i partial esistenti di `_components/ui/`.
:::
::: step "Crea un componente Alpine"
In `resources/assets/js/components/<domain>/`, poi registralo in `App.js` — vedi [Frontend](frontend.md#alpinejs-architecture).
:::
::: step "Aggiungi lo SCSS"
In `resources/assets/scss/views/`, importato da `app.scss`.
:::
::: step "Scrivi i test" color="success"
Spec unitarie in `tests/specs/unit/<domain>/`, più una spec di integrazione in `tests/specs/integration/` per le rotte che hai aggiunto — vedi [Testing](testing.md#test-structure).
:::
:::

## Aggiungere un nuovo permesso

::: stepper
::: step "Semina lo slug"
Aggiungi lo slug `resource:action` a `resources/database/seeds/AdminData.bx` e assegnalo al/ai ruolo/i appropriato/i.
:::
::: step "Proteggi l'handler"
`@secured( "resource:action,resource:admin" )` — la virgola significa OR. Vedi [Sicurezza e permessi](security.md#permission-model).
:::
::: step "Filtra la vista"
```html linenums="1"
<bx:if prc.authUser.hasPermission( "resource:action,resource:admin" )>
```
così l'interfaccia non offre mai qualcosa che l'handler rifiuterebbe.
:::
::: step "Riesegui il seed" color="success"
`box migrate seed run` su un database esistente - oppure concedi il permesso a un ruolo direttamente dalla pagina admin Ruoli.
:::
:::

## Aggiungere un'impostazione

Aggiungi una nuova chiave alla struct `DEFAULTS` in `SettingService.bx`. `preFlightCheck()` la semina automaticamente al prossimo avvio, e compare nella pagina admin `/settings` senza ulteriore cablaggio — vedi [Configurazione](configuration.md#app-settings-vs-framework-config).

## Personalizzare i layout

I layout vivono in `app/layouts/`. La selezione avviene per handler, tipicamente in `preHandler`:

```boxlang title="app/handlers/BaseSecureHandler.bx" linenums="1"
function preHandler( event, rc, prc ){
    event.setLayout( "Admin" );
}
```

## Aggiungere un task pianificato

Registra i task in `app/config/Scheduler.bx`, accanto ai tre che già vi vengono eseguiti - vedi [Architettura](../architecture.md#scheduled-tasks) per cosa fanno:

```boxlang title="app/config/Scheduler.bx" linenums="1"
task( "My Task" )
    .call( () => getInstance( "MyService" ).doWork() )
    .everyDayAt( "03:45" )
    .onOneServer()
    .withNoOverlaps();
```

`onOneServer()` e `withNoOverlaps()` contano nel momento in cui distribuisci più di un'istanza: senza di essi, ogni istanza esegue il task secondo il proprio programma. Metti la logica effettiva di purge/pulizia sul servizio (`doWork()` sopra), non inline nella closure, così resta testabile a livello unitario.

## Sovrascrivere la configurazione dei moduli

Le configurazioni dei moduli in `app/config/modules/` estendono i default del modulo stesso. Sovrascrivi qualsiasi chiave lì — le modifiche hanno effetto al prossimo `?fwreinit`.

::: cards
::: card title="Progettato per lo sviluppo assistito dall'AI" icon="phosphor-duotone:robot" href="../ai-native.md"
Perché esistono le skill personalizzate, e un confronto misurato di token/chiamate a strumenti.
:::
::: card title="Handler e Routing" icon="phosphor-duotone:signpost" href="handlers-routing.md"
Le convenzioni complete di handler/rotta su cui si basa questa sezione.
:::
::: card title="Database e ORM" icon="phosphor-duotone:database" href="database-orm.md"
I pattern di entità e servizio in profondità.
:::
::: card title="Deployment" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Distribuisci ciò che hai costruito.
:::
:::
