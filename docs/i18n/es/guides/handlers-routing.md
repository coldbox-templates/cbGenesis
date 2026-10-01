---
title: Handlers y enrutamiento
order: 1
icon: phosphor-duotone:signpost
summary: Cada handler, sus acciones, y cómo Router.bx conecta las URLs con ellos.
tags: [guides, handlers, routing]
---

# Handlers y enrutamiento

## Mapa de handlers

| Handler | Base | Propósito |
|---|---|---|
| [`AuditLog.bx`](#auditlog) | `BaseSecureHandler` | Exploración, exportación y purga del registro de auditoría |
| [`Assets.bx`](#assets) | `EventHandler` | Transmite los avatares de usuario y el logo de marca |
| [`Auth.bx`](#auth) | `EventHandler` | Inicio de sesión, registro, invitaciones, restablecimiento de contraseña - todo público |
| [`BaseSecureHandler.bx`](#basesecurehandler) | `RestHandler` | Clase base para cada handler de administración |
| [`Dashboard.bx`](#dashboard) | `BaseSecureHandler` | La página de aterrizaje autenticada |
| `Main.bx` | `EventHandler` | Handler de eventos implícitos - consulta [Arquitectura](../architecture.md#request-lifecycle) |
| [`Permissions.bx`](#permissions) | `BaseSecureHandler` | CRUD de slugs de permisos |
| [`Profile.bx`](#profile) | `BaseSecureHandler` | Perfil de autoservicio, contraseña, tokens de API, passkeys |
| [`Roles.bx`](#roles) | `BaseSecureHandler` | CRUD de roles + asignación de usuarios |
| [`Settings.bx`](#settings) | `BaseSecureHandler` | Registro de ajustes de la aplicación |
| [`Users.bx`](#users) | `BaseSecureHandler` | Administración de usuarios |

### `BaseSecureHandler`

Cada handler protegido extiende `BaseSecureHandler`, cuyo `preHandler` [verifica CSRF en cada solicitud que cambia estado](#csrf-verification), fuerza el layout `Admin`, y redirige a `profile/passkey-required` cuando `cbRequirePasskey` está activado y el usuario no tiene ninguna. También provee helpers compartidos (`getApiResults()`, `ensureSortDirection()`, `getPagination()`):

```boxlang title="app/handlers/BaseSecureHandler.bx" linenums="1"
component extends="coldbox.system.RestHandler" {

    function preHandler( event, rc, prc ){
        // ...CSRF verification, deny-by-default...
        event.setLayout( "Admin" );
        // ...passkey enforcement...
    }

}
```

Construir un nuevo handler protegido comienza de la misma manera siempre:

```boxlang title="Example: a new secured handler" linenums="1"
component extends="BaseSecureHandler" secured {

    function index( event, rc, prc ){
        prc.pageTitle = "My Page";
        event.setView( "myhandler/index" );
    }

}
```

### `AuditLog`

`@secured("auditlog:admin,auditlog:read")` a nivel de clase; toda acción excepto `index` es `@remote`:

- `index`, `search`, `show` - explora y filtra el registro de auditoría
- `export` - `@secured("auditlog:admin,auditlog:export")`, transmite CSV
- `purge` - `@secured("auditlog:admin,auditlog:delete")`, elimina entradas anteriores a una fecha de corte
- `clear` - `@secured("auditlog:admin")`, elimina todas las entradas

### `Assets`

Sin anotación `@secured` a nivel de clase - transmite archivos binarios desde el disco privado `assets` de cbfs (consulta [Base de datos y ORM](database-orm.md) y `app/config/modules/cbfs.bx`), el cual se encuentra fuera del webroot y de otro modo es inalcanzable:

- `avatar` - `@secured` (cualquier usuario autenticado), transmite la variante JPEG de avatar `sm`/`lg` de un usuario
- `logo` - público, transmite la variante PNG de logo de marca `sm`/`lg` para que la pantalla de inicio de sesión y otras páginas de invitado puedan renderizarlo

Ambas acciones devuelven 404 (en lugar de un error) ante una forma no reconocida de `userId`/`size` o cuando el archivo solicitado simplemente no existe, de modo que un llamante no pueda distinguir "sin avatar" de "usuario inexistente" solo por la forma de la respuesta. El redimensionado, recorte, y almacenamiento pasan por `ImageService` (`app/models/system/ImageService.bx`), invocado vía `getInstance()` dentro de cada acción en lugar de una propiedad `@inject` - consulta el docblock en `Assets.bx` para saber por qué (una peculiaridad del orden de arranque de WireBox con la construcción de singleton disparada por handler).

### `Auth`

Sin anotación `@secured` - estas acciones deben permanecer accesibles para invitados:

- `login` / `doLogin` (GET/POST) - verificado por CSRF, llama a `securityService.login()`, admite `rememberMe`
- `register` / `doRegister` - controlado por el ajuste `cbAllowRegistration`
- `checkEmailAvailability` - endpoint JSON para comprobaciones de disponibilidad de correo electrónico en vivo
- `verifyRegistration` - consume un token de acción `PURPOSE_REGISTRATION`
- `activateInvitation` / `doActivateInvitation` - establece una contraseña para un usuario invitado, creado por un administrador
- `forgotPassword` / `doForgotPassword` - controlado por `cbAllowForgotPassword`
- `resetPassword` / `doResetPassword` - valida el token de restablecimiento, establece una nueva contraseña
- `verifyEmailChange` - consume un token de acción `PURPOSE_EMAIL_CHANGE`
- `logout` - llama a `securityService.logout()`

`preHandler` redirige a un visitante ya autenticado directamente al panel de control, y establece el layout a partir de `prc.settings.cbLoginLayout` (`AuthSplit` por defecto - consulta [`guides/security.md`](security.md)); `verifyEmailChange` y `logout` están exentos de esa redirección para que permanezcan accesibles esté o no el visitante ya autenticado.

### `Dashboard`

`@secured` (cualquier usuario autenticado, sin requerir un permiso específico):

- `index` - la página de inicio del panel de control
- `notAuthorized` - el objetivo de `invalidAuthorizationEvent`, mostrado cuando a un usuario autenticado le falta un permiso requerido

### `Permissions`

`@secured("permissions:admin,permissions:read")` a nivel de clase:

- `index`
- `create` - `@secured("permissions:admin,permissions:write")`
- `update` / `delete` - `@remote`, mismos permisos de escritura/eliminación

### `Profile`

Acciones de autoservicio `@secured` para el usuario actual, todas endpoints AJAX `@remote` excepto `index`:

- `index`, `passkeyRequired`
- `save`, `doPasswordChange`
- `requestEmailChange` / `cancelEmailChange` - inicia/cancela un cambio de correo electrónico pendiente, confirmado a través de `Auth.verifyEmailChange`
- `listTokens` / `createToken` / `updateToken` / `deleteToken` - tokens de API
- `listPasskeys` / `updatePasskey` / `deletePasskey`
- `uploadAvatar` / `deleteAvatar` - acepta la imagen como un URI de datos en base64 en `rc.avatar` (BoxLang no tiene un analizador multipart/form-data, así que las subidas viajan como JSON), decodificado vía `BaseSecureHandler.decodeDataUri()`; transmitido de vuelta por `Assets.avatar`

Cada una de estas es verificada por CSRF por `BaseSecureHandler` a menos que se alcance a través de un método HTTP seguro - consulta [Verificación de CSRF](#csrf-verification).

### `Roles`

`@secured("roles:admin,roles:read")` a nivel de clase; toda acción excepto `index` es `@remote`:

- `index`
- `create` / `update` / `delete` - `@secured("roles:admin,roles:write"` / `"...:delete")`
- `users` / `availableUsers` - lista usuarios asignados/disponibles para un rol
- `addUser` / `removeUser` - `@secured("roles:admin")`

### `Settings`

`@secured("settings:admin,settings:read")` a nivel de clase:

- `index`
- `registry` / `registrySearch` - registro de ajustes paginado
- `createRegistry` / `updateRegistry` / `toggleRegistryStatus` / `deleteRegistry` - `settings:admin,settings:write`
- `save` - guardado masivo de ajustes centrales
- `uploadLogo` / `deleteLogo` - `settings:admin,settings:write`, misma convención de URI de datos en base64 que `Profile.uploadAvatar`; almacena/restaura el ajuste `cbAppLogo` y transmite de vuelta vía `Assets.logo`
- Utilidades de administración (todas `settings:admin`): `clearTemplateCache`, `clearSessionsCache`, `revokeRememberTokens`, `flushSettingsCache`

### `Users`

`@secured("users:admin,users:read")` a nivel de clase:

- `index`, `search`
- `create` / `update` / `delete` / `resendInvitation` - `users:admin,users:write` / `...:delete`
- `show` - `users:read`
- Solo administrador (`users:admin`): `updateProfile`, `setStatus`, `resetPassword`, `verify`, `revokeRememberTokens`, `addRole`/`removeRole`, `addPermission`/`removePermission`, `savePreferences`, `revokeToken`/`revokeAllTokens`

`ensureNotSelf()` protege varias de estas para impedir que un administrador se degrade o se elimine sus propios roles.

<figure>
	<img src="../assets/screenshots/users.png" alt="The Users admin page">
	<figcaption>La página de administración de Usuarios.</figcaption>
</figure>

## Verificación de CSRF

`app/config/modules/cbsecurity.bx` establece `csrf.enableAutoVerifier: false`, así que no hay interceptor global. En su lugar, `BaseSecureHandler.preHandler()` verifica CSRF **con denegación por defecto** para cada handler que lo extiende:

```boxlang title="app/handlers/BaseSecureHandler.bx (excerpt)" linenums="1"
static {
    // The safe methods of RFC 9110, exempt from CSRF verification below.
    SAFE_HTTP_METHODS = "GET,HEAD,OPTIONS"
}

function preHandler( event, rc, prc ) {
    if (
        !static.SAFE_HTTP_METHODS.listFindNoCase( event.getHTTPMethod() )
        && !csrfVerify( rc.csrf ?: "" )
    ) {
        return onInvalidCSRF( argumentCollection = arguments )
    }
    // ...
}
```

Qué significa esto cuando extiendes un handler protegido:

- **No te suscribes voluntariamente.** Cualquier acción alcanzada vía `POST`, `PUT`, `PATCH`, o `DELETE` debe llevar un `rc.csrf` válido, desde el día en que la agregas. No hay una lista por handler que recordar actualizar.
- **Los métodos seguros están exentos.** `GET`, `HEAD`, y `OPTIONS` no deben cambiar el estado, así que no conllevan riesgo de CSRF, y `OPTIONS` (preflight de CORS) no puede llevar un token en absoluto. Si un método seguro en tu código sí cambia el estado, ese es el error a corregir.
- **`onInvalidCSRF()` es sobrescribible.** La implementación base aborta con un fallo de autorización, que es lo que quieren los endpoints JSON/AJAX - cada mutación en `Permissions` ahora es una de esas, enviada a través de `fetchWithCsrf()` (consulta [Frontend](frontend.md#csrf-on-mutating-requests)), que se recupera de un token caducado sin necesitar una redirección. `Settings` aún la sobrescribe para mostrar un mensaje flash y redirigir sus envíos de formulario nativo, así que un formulario del navegador obtiene una página en lugar de un 403 sin adornos. Sobrescríbela en tu propio handler cuando renderice HTML en lugar de JSON.

!!! note "`Auth` no es un handler protegido"
    `Auth` extiende `coldbox.system.EventHandler`, no `BaseSecureHandler`, porque sus acciones se ejecutan para visitantes no autenticados y por lo tanto no pueden heredar la comprobación anterior. Cada acción que cambia el estado verifica su propio token: `doLogin`, `doRegister`, `doActivateInvitation`, `doForgotPassword`, `doResetPassword`, y `logout`.

## Mapa de rutas (`app/config/Router.bx`)

Todas las rutas se declaran en una sola función `configure()`:

```boxlang title="app/config/Router.bx (excerpt)" linenums="1"
route( "/healthcheck" ).to( () => "Ok!" );

get( "dashboard" ).to( "Dashboard.index" );

resources( "permissions", parameterName = "permissionId" );

route( "roles/:roleId/available-users" ).to( "Roles.availableUsers" );
route( "roles/:roleId/users" ).toAction( { POST: "addUser" } );
route( "roles/:roleId/users/:userId" ).toAction( { DELETE: "removeUser" } );
resources( "roles", parameterName = "roleId" );

resources( "users", parameterName = "userId" );

route( "profile" ).toAction( { GET: "index", POST: "save" } );

// @app_routes@  ← insertion point for module/scaffold-generated routes

route( ":handler/:action?" ).end(); // conventions-based catch-all
```

Consulta [Referencia: Mapa de rutas](../reference/routes.md) para la tabla completa de cada método, URL, acción objetivo, y permiso requerido.

::: cards
::: card title="Mapa de rutas" icon="phosphor-duotone:map-trifold" href="../reference/routes.md"
La tabla completa de método/URL/handler/permiso.
:::
::: card title="Seguridad y permisos" icon="phosphor-duotone:shield-check" href="security.md"
Cómo se conecta `@secured` con el firewall y el modelo de permisos.
:::
::: card title="Extendiendo la aplicación" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Agrega un nuevo handler, ruta, y vista siguiendo estas mismas convenciones.
:::
:::
