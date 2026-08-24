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

Every protected handler extends `BaseSecureHandler`, which forces the `Admin` layout in `preHandler`, redirects to `profile/passkey-required` when `cbRequirePasskey` is on and the user has none, and provides shared helpers (`getApiResults()`, `ensureSortDirection()`, `getPagination()`):

```boxlang title="app/handlers/BaseSecureHandler.bx"
component extends="coldbox.system.RestHandler" {

    function preHandler( event, rc, prc ){
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

### `Auth`

No `@secured` annotation - these actions must stay reachable by guests:

- `login` / `doLogin` (GET/POST) - CSRF-verified, calls `securityService.login()`, supports `rememberMe`
- `register` / `doRegister` - gated by the `cbAllowRegistration` setting
- `checkEmailAvailability` - JSON endpoint for live email-availability checks
- `verifyRegistration` - consumes a `PURPOSE_REGISTRATION` action token
- `activateInvitation` / `doActivateInvitation` - sets a password for an invited, admin-created user
- `forgotPassword` / `doForgotPassword` - gated by `cbAllowForgotPassword`
- `resetPassword` / `doResetPassword` - validates the reset token, sets a new password
- `logout` - calls `securityService.logout()`

`preHandler` redirects an already-authenticated visitor straight to the dashboard, and sets the layout from `prc.settings.cbLoginLayout` (`AuthSplit` by default - see [`guides/security.md`](security.md)).

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
- `listTokens` / `createToken` / `updateToken` / `deleteToken` - API tokens
- `listPasskeys` / `updatePasskey` / `deletePasskey`

A static `csrfVerify` map on the class lists which of these actions require CSRF verification.

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

!!! warning "CSRF is manual, not automatic"
    `app/config/modules/cbsecurity.bx` sets `csrf.enableAutoVerifier: false` - every state-changing action verifies CSRF itself (via a `preHandler` check or a `static.csrfVerify` map), rather than relying on a global interceptor. Follow the existing pattern in the handler you're extending.

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
