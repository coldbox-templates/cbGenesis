---
title: Extending the App
order: 8
icon: phosphor-duotone:puzzle-piece
summary: Add a new CRUD module, permission, setting, or scheduled task, following the app's own conventions.
tags: [guides, extending]
---

# Extending the App

CB Genesis is a launchpad, not a finished product. These are the same steps its own Users/Roles/Permissions/Settings modules follow - use them as the template for anything new.

## Adding a new CRUD module

::: stepper
::: step "Create the entity"
In `app/models/<domain>/`, extending `BaseEntity` — see [Database & ORM](database-orm.md#entity-hierarchy).
:::
::: step "Create the service"
Extending `BaseService`, marked `singleton threadSafe` — see [the service pattern](database-orm.md#service-layer-pattern).
:::
::: step "Create the handler"
Extending `BaseSecureHandler`, with an `@secured` annotation — see [Handlers & Routing](handlers-routing.md#basesecurehandler).
:::
::: step "Add routes"
In `app/config/Router.bx`, near the `// @app_routes@` marker.
:::
::: step "Create views"
In `app/views/<domain>/`, reusing existing `_components/ui/` partials.
:::
::: step "Create an Alpine component"
In `resources/assets/js/components/<domain>/`, then register it in `App.js` — see [Frontend](frontend.md#alpinejs-architecture).
:::
::: step "Add SCSS"
In `resources/assets/scss/views/`, imported from `app.scss`.
:::
::: step "Write tests" color="success"
Unit specs in `tests/specs/unit/<domain>/` — see [Testing](testing.md#test-structure).
:::
:::

## Adding a new permission

::: stepper
::: step "Seed the slug"
Add the `resource:action` slug to `resources/database/seeds/AdminData.bx` and assign it to the appropriate role(s).
:::
::: step "Guard the handler"
`@secured( "resource:action,resource:admin" )` — comma means OR. See [Security & Permissions](security.md#permission-model).
:::
::: step "Gate the view"
```html
<bx:if prc.authUser.hasPermission( "resource:action,resource:admin" )>
```
so the UI never offers something the handler would reject.
:::
::: step "Re-seed" color="success"
`box migrate seed` against an existing database - or grant the permission to a role directly from the Roles admin page.
:::
:::

## Adding a setting

Add a new key to the `DEFAULTS` struct in `SettingService.bx`. `preFlightCheck()` seeds it automatically on next boot, and it appears in the `/settings` admin page with no further wiring — see [Configuration](configuration.md#app-settings-vs-framework-config).

## Customizing layouts

Layouts live in `app/layouts/`. Selection happens per-handler, typically in `preHandler`:

```boxlang title="app/handlers/BaseSecureHandler.bx"
function preHandler( event, rc, prc ){
    event.setLayout( "Admin" );
}
```

## Adding a scheduled task

Register tasks in `app/config/Scheduler.bx`:

```boxlang title="app/config/Scheduler.bx" linenums="1"
task( "My Task" )
    .call( () => getInstance( "MyService" ).doWork() )
    .everyDayAt( "03:00" )
    .when( isClusterReady )
    .withoutOverlaps();
```

## Overriding module configuration

Module configs in `app/config/modules/` extend the module's own defaults. Override any key there — changes take effect on the next `?fwreinit`.

::: cards
::: card title="Handlers & Routing" icon="phosphor-duotone:signpost" href="handlers-routing.md"
The full handler/route conventions this section builds on.
:::
::: card title="Database & ORM" icon="phosphor-duotone:database" href="database-orm.md"
Entity and service patterns in depth.
:::
::: card title="Deployment" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Ship what you've built.
:::
:::
