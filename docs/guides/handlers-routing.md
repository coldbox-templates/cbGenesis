---
title: Handlers & Routing
order: 1
icon: phosphor-duotone:signpost
summary: Every handler, its actions, and how Router.bx wires URLs to them.
tags: [guides, handlers, routing]
---

# Handlers & Routing

## Handler map

| Handler | Base | Purpose |
|---|---|---|
| [`AuditLog.bx`](#auditlog) | `BaseSecureHandler` | Audit trail browsing, export, and purging |
| [`Auth.bx`](#auth) | `EventHandler` | Login, registration, invitations, password reset - all public |
| [`BaseSecureHandler.bx`](#basesecurehandler) | `RestHandler` | Base class for every admin handler |
| [`Dashboard.bx`](#dashboard) | `BaseSecureHandler` | The authenticated landing page |
| `Main.bx` | `EventHandler` | Implicit-event handler - see [Architecture](../architecture.md#request-lifecycle) |
| [`Permissions.bx`](#permissions) | `BaseSecureHandler` | Permission slug CRUD |
| [`Profile.bx`](#profile) | `BaseSecureHandler` | Self-service profile, password, API tokens, passkeys |
| [`Roles.bx`](#roles) | `BaseSecureHandler` | Role CRUD + user assignment |
| [`Settings.bx`](#settings) | `BaseSecureHandler` | App settings registry |
| [`Users.bx`](#users) | `BaseSecureHandler` | User administration |

### `BaseSecureHandler`

Every protected handler extends `BaseSecureHandler`, whose `preHandler` [verifies CSRF on every state-changing request](#csrf-verification), forces the `Admin` layout, and redirects to `profile/passkey-required` when `cbRequirePasskey` is on and the user has none. It also provides shared helpers (`getApiResults()`, `ensureSortDirection()`, `getPagination()`):

```boxlang title="app/handlers/BaseSecureHandler.bx"
component extends="coldbox.system.RestHandler" {

    function preHandler( event, rc, prc ){
        // ...CSRF verification, deny-by-default...
        event.setLayout( "Admin" );
        // ...passkey enforcement...
    }

}
```

Building a new secured handler starts the same way every time:

```boxlang title="Example: a new secured handler"
component extends="BaseSecureHandler" secured {

    function index( event, rc, prc ){
        prc.pageTitle = "My Page";
        event.setView( "myhandler/index" );
    }

}
```

### `AuditLog`

`@secured("auditlog:admin,auditlog:read")` at the class level; every action but `index` is `@remote`:

- `index`, `search`, `show` - browse and filter the audit trail
- `export` - `@secured("auditlog:admin,auditlog:export")`, streams CSV
- `purge` - `@secured("auditlog:admin,auditlog:delete")`, deletes entries older than a cutoff
- `clear` - `@secured("auditlog:admin")`, deletes every entry

### `Auth`

No `@secured` annotation - these actions must stay reachable by guests:

- `login` / `doLogin` (GET/POST) - CSRF-verified, calls `securityService.login()`, supports `rememberMe`
- `register` / `doRegister` - gated by the `cbAllowRegistration` setting
- `checkEmailAvailability` - JSON endpoint for live email-availability checks
- `verifyRegistration` - consumes a `PURPOSE_REGISTRATION` action token
- `activateInvitation` / `doActivateInvitation` - sets a password for an invited, admin-created user
- `forgotPassword` / `doForgotPassword` - gated by `cbAllowForgotPassword`
- `resetPassword` / `doResetPassword` - validates the reset token, sets a new password
- `verifyEmailChange` - consumes a `PURPOSE_EMAIL_CHANGE` action token
- `logout` - calls `securityService.logout()`

`preHandler` redirects an already-authenticated visitor straight to the dashboard, and sets the layout from `prc.settings.cbLoginLayout` (`AuthSplit` by default - see [`guides/security.md`](security.md)); `verifyEmailChange` and `logout` are exempted from that redirect so they stay reachable whether or not the visitor is already authenticated.

### `Dashboard`

`@secured` (any authenticated user, no specific permission required):

- `index` - the dashboard home
- `notAuthorized` - the target of `invalidAuthorizationEvent`, shown when an authenticated user is missing a required permission

### `Permissions`

`@secured("permissions:admin,permissions:read")` at the class level:

- `index`
- `create` - `@secured("permissions:admin,permissions:write")`
- `update` / `delete` - `@remote`, same write/delete permissions

### `Profile`

`@secured` self-service actions for the current user, all `@remote` AJAX endpoints except `index`:

- `index`, `passkeyRequired`
- `save`, `doPasswordChange`
- `requestEmailChange` / `cancelEmailChange` - starts/cancels a pending email change, confirmed via `Auth.verifyEmailChange`
- `listTokens` / `createToken` / `updateToken` / `deleteToken` - API tokens
- `listPasskeys` / `updatePasskey` / `deletePasskey`

Every one of these is CSRF-verified by `BaseSecureHandler` unless it is reached over a safe HTTP method - see [CSRF verification](#csrf-verification).

### `Roles`

`@secured("roles:admin,roles:read")` at the class level; every action but `index` is `@remote`:

- `index`
- `create` / `update` / `delete` - `@secured("roles:admin,roles:write"` / `"...:delete")`
- `users` / `availableUsers` - list users on/available for a role
- `addUser` / `removeUser` - `@secured("roles:admin")`

### `Settings`

`@secured("settings:admin,settings:read")` at the class level:

- `index`
- `registry` / `registrySearch` - paginated settings registry
- `createRegistry` / `updateRegistry` / `toggleRegistryStatus` / `deleteRegistry` - `settings:admin,settings:write`
- `save` - bulk save of core settings
- Admin utilities (all `settings:admin`): `clearTemplateCache`, `clearSessionsCache`, `revokeRememberTokens`, `flushSettingsCache`

### `Users`

`@secured("users:admin,users:read")` at the class level:

- `index`, `search`
- `create` / `update` / `delete` / `resendInvitation` - `users:admin,users:write` / `...:delete`
- `show` - `users:read`
- Admin-only (`users:admin`): `updateProfile`, `setStatus`, `resetPassword`, `verify`, `revokeRememberTokens`, `addRole`/`removeRole`, `addPermission`/`removePermission`, `savePreferences`, `revokeToken`/`revokeAllTokens`

`ensureNotSelf()` guards several of these to block an admin from demoting or removing their own roles.

## CSRF verification

`app/config/modules/cbsecurity.bx` sets `csrf.enableAutoVerifier: false`, so there is no global interceptor. Instead, `BaseSecureHandler.preHandler()` verifies CSRF **deny-by-default** for every handler that extends it:

```boxlang title="app/handlers/BaseSecureHandler.bx (excerpt)"
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

What this means when you extend a secured handler:

- **You do not opt in.** Any action reached over `POST`, `PUT`, `PATCH`, or `DELETE` must carry a valid `rc.csrf`, from the day you add it. There is no per-handler list to remember to update.
- **Safe methods are exempt.** `GET`, `HEAD`, and `OPTIONS` must not change state, so they carry no CSRF risk, and `OPTIONS` (CORS preflight) cannot carry a token at all. If a safe method in your code does change state, that is the bug to fix.
- **`onInvalidCSRF()` is overridable.** The base implementation aborts with an authorization failure, which is what the JSON/AJAX endpoints want. `Permissions` and `Settings` override it to flash a message and redirect, so a browser form gets a page instead of a bare 403. Override it in your own handler when it renders HTML.

!!! note "`Auth` is not a secured handler"
    `Auth` extends `coldbox.system.EventHandler`, not `BaseSecureHandler`, because its actions run for unauthenticated visitors and so cannot inherit the check above. Each state-changing action verifies its own token: `doLogin`, `doRegister`, `doActivateInvitation`, `doForgotPassword`, `doResetPassword`, and `logout`.

## Route map (`app/config/Router.bx`)

All routes are declared in one `configure()` function:

```boxlang title="app/config/Router.bx (excerpt)"
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

See [Reference: Route Map](../reference/routes.md) for the full table of every method, URL, target action, and required permission.

::: cards
::: card title="Route Map" icon="phosphor-duotone:map-trifold" href="../reference/routes.md"
The complete method/URL/handler/permission table.
:::
::: card title="Security & Permissions" icon="phosphor-duotone:shield-check" href="security.md"
How `@secured` ties into the firewall and the permission model.
:::
::: card title="Extending the App" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Add a new handler, route, and view following these same conventions.
:::
:::
