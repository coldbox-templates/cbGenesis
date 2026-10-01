---
title: Extendiendo la aplicación
order: 8
icon: phosphor-duotone:puzzle-piece
summary: Agrega un nuevo módulo CRUD, permiso, ajuste, o tarea programada, siguiendo las propias convenciones de la aplicación.
tags: [guides, extending]
---

# Extendiendo la aplicación

CBGenesis es una plataforma de lanzamiento, no un producto terminado. Estos son los mismos pasos que siguen sus propios módulos de Usuarios/Roles/Permisos/Configuración - úsalos como plantilla para cualquier cosa nueva.

## Construyendo con un agente de IA

Si estás extendiendo cbGenesis con un agente de codificación de IA (Claude Code, Copilot, Cursor, o similar), apúntalo a `.agents/skills-custom/` antes de que escriba cualquier código - estas skills codifican los pasos exactos de abajo como instrucciones legibles por máquina, con extractos de código reales de este código base, para que el agente no tenga que hacer ingeniería inversa explorando cada handler:

| Skill | Cubre |
|---|---|
| `cbgenesis-crud-resource` | La porción vertical completa de abajo - entidad, servicio, handler, ruta, vista, componente - de principio a fin. |
| `cbgenesis-rbac-permissions` | El modelo de permisos `resource:action`, `@secured`, y las protecciones contra auto-acciones. |
| `cbgenesis-csrf-frontend` | El patrón obligatorio `fetchWithCsrf()` para cualquier solicitud de frontend que modifique datos. |
| `cbgenesis-alpine-components` | La forma de los componentes de Alpine.js, su registro, y la librería compartida `utils/`. |
| `cbgenesis-testing-conventions` | `BaseIntegrationSpec`, el mecanismo real de aislamiento por reversión de transacciones, y los helpers de fixtures. |
| `cbgenesis-settings-config` | Cuándo usar una variable de entorno frente al registro de ajustes respaldado por base de datos. |

¿Una nueva convención que valga la pena que un agente (o un humano) no tenga que redescubrir por prueba y error? Agrégala como una nueva skill aquí en lugar de dejarla como conocimiento tribal en la descripción de un PR. Consulta [Diseñado para el desarrollo asistido por IA](../ai-native.md) para saber por qué esto importa y una comparación medida de antes/después.

## Agregar un nuevo módulo CRUD

::: stepper
::: step "Crea la entidad"
En `app/models/<domain>/`, extendiendo `BaseEntity` — consulta [Base de datos y ORM](database-orm.md#entity-hierarchy).
:::
::: step "Crea el servicio"
Extendiendo `BaseService`, marcado `singleton threadSafe` — consulta [el patrón de servicio](database-orm.md#service-layer-pattern).
:::
::: step "Crea el handler"
Extendiendo `BaseSecureHandler`, con una anotación `@secured` — consulta [Handlers y enrutamiento](handlers-routing.md#basesecurehandler). Heredar esa base significa que cada acción `POST`/`PUT`/`DELETE` que agregues queda [verificada automáticamente por CSRF](handlers-routing.md#csrf-verification); no hay nada que activar, pero tus formularios y componentes Alpine deben enviar `rc.csrf`.
:::
::: step "Agrega rutas"
En `app/config/Router.bx`, cerca del marcador `// @app_routes@`.
:::
::: step "Crea vistas"
En `app/views/<domain>/`, reutilizando los parciales existentes de `_components/ui/`.
:::
::: step "Crea un componente Alpine"
En `resources/assets/js/components/<domain>/`, y luego regístralo en `App.js` — consulta [Frontend](frontend.md#alpinejs-architecture).
:::
::: step "Agrega SCSS"
En `resources/assets/scss/views/`, importado desde `app.scss`.
:::
::: step "Escribe pruebas" color="success"
Specs unitarias en `tests/specs/unit/<domain>/`, más una spec de integración en `tests/specs/integration/` para las rutas que agregaste — consulta [Pruebas](testing.md#test-structure).
:::
:::

## Agregar un nuevo permiso

::: stepper
::: step "Siembra el slug"
Agrega el slug `resource:action` a `resources/database/seeds/AdminData.bx` y asígnalo a los roles apropiados.
:::
::: step "Protege el handler"
`@secured( "resource:action,resource:admin" )` — la coma significa OR. Consulta [Seguridad y permisos](security.md#permission-model).
:::
::: step "Protege la vista"
```html linenums="1"
<bx:if prc.authUser.hasPermission( "resource:action,resource:admin" )>
```
para que la interfaz nunca ofrezca algo que el handler rechazaría.
:::
::: step "Vuelve a sembrar" color="success"
`box migrate seed run` contra una base de datos existente - o concede el permiso a un rol directamente desde la página de administración de Roles.
:::
:::

## Agregar un ajuste

Agrega una nueva clave al struct `DEFAULTS` en `SettingService.bx`. `preFlightCheck()` la siembra automáticamente en el siguiente arranque, y aparece en la página de administración `/settings` sin necesidad de más conexiones — consulta [Configuración](configuration.md#app-settings-vs-framework-config).

## Personalizando los layouts

Los layouts viven en `app/layouts/`. La selección ocurre por handler, típicamente en `preHandler`:

```boxlang title="app/handlers/BaseSecureHandler.bx" linenums="1"
function preHandler( event, rc, prc ){
    event.setLayout( "Admin" );
}
```

## Agregar una tarea programada

Registra las tareas en `app/config/Scheduler.bx`, junto a las tres que ya se ejecutan ahí - consulta [Arquitectura](../architecture.md#scheduled-tasks) para ver qué hacen:

```boxlang title="app/config/Scheduler.bx" linenums="1"
task( "My Task" )
    .call( () => getInstance( "MyService" ).doWork() )
    .everyDayAt( "03:45" )
    .onOneServer()
    .withNoOverlaps();
```

`onOneServer()` y `withNoOverlaps()` importan en el momento en que despliegas más de una instancia: sin ellos, cada instancia ejecuta la tarea según su propio calendario. Pon la lógica real de purga/limpieza en el servicio (`doWork()` arriba), no en línea dentro del closure, para que se mantenga comprobable de forma unitaria.

## Sobrescribiendo la configuración de módulos

Las configuraciones de módulos en `app/config/modules/` extienden los valores predeterminados propios del módulo. Sobrescribe cualquier clave ahí — los cambios surten efecto en el siguiente `?fwreinit`.

::: cards
::: card title="Diseñado para el desarrollo asistido por IA" icon="phosphor-duotone:robot" href="../ai-native.md"
Por qué existen las skills personalizadas, y una comparación medida de tokens/llamadas a herramientas.
:::
::: card title="Handlers y enrutamiento" icon="phosphor-duotone:signpost" href="handlers-routing.md"
Las convenciones completas de handler/ruta sobre las que se construye esta sección.
:::
::: card title="Base de datos y ORM" icon="phosphor-duotone:database" href="database-orm.md"
Los patrones de entidad y servicio en profundidad.
:::
::: card title="Despliegue" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Pon en producción lo que has construido.
:::
:::
