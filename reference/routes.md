---
title: Route Map
order: 1
icon: phosphor-duotone:map-trifold
summary: Every method, URL, target action, and required permission.
tags: [reference, routing]
---

# Route Map

"Auth" means any authenticated user; a permission slug means the firewall also requires `prc.authUser.hasPermission()` to pass (see [Security & Permissions](../guides/security.md#permission-model)) — failing that redirects to `dashboard.notAuthorized` instead of `login`.

| Method | URL | Handler.Action | Auth |
|---|---|---|---|
| `GET` | `/login` | `Auth.login` | Guest |
| `POST` | `/login` | `Auth.doLogin` | Guest |
| `GET` | `/register` | `Auth.register` | Guest |
| `POST` | `/register` | `Auth.doRegister` | Guest |
| `GET` | `/forgot-password` | `Auth.forgotPassword` | Guest |
| `POST` | `/forgot-password` | `Auth.doForgotPassword` | Guest |
| `GET` | `/reset-password` | `Auth.resetPassword` | Guest |
| `POST` | `/reset-password` | `Auth.doResetPassword` | Guest |
| `POST` | `/logout` | `Auth.logout` | Auth |
| `GET` | `/dashboard` | `Dashboard.index` | Auth |
| `GET` | `/auditlog` | `AuditLog.index` | `auditlog:read,auditlog:admin` |
| `GET` | `/auditlog/:id` | `AuditLog.show` | `auditlog:read,auditlog:admin` |
| `GET` | `/auditlog/search` | `AuditLog.search` | `auditlog:read,auditlog:admin` |
| `GET` | `/auditlog/export` | `AuditLog.export` | `auditlog:read,auditlog:admin` |
| `POST` | `/auditlog/purge` | `AuditLog.purge` | `auditlog:admin` |
| `DELETE` | `/auditlog/clear` | `AuditLog.clear` | `auditlog:admin` |
| `GET` | `/users` | `Users.index` | `users:read,users:admin` |
| `GET` | `/users/:id` | `Users.show` | `users:read` |
| `GET` | `/roles` | `Roles.index` | `roles:read,roles:admin` |
| `POST` | `/roles` | `Roles.create` | `roles:write,roles:admin` |
| `PUT` | `/roles/:id` | `Roles.update` | `roles:write,roles:admin` |
| `DELETE` | `/roles/:id` | `Roles.delete` | `roles:delete,roles:admin` |
| `GET` | `/roles/:roleId/users` | `Roles.users` | `roles:read,roles:admin` |
| `POST` | `/roles/:roleId/users/:userId` | `Roles.addUser` | `roles:admin` |
| `DELETE` | `/roles/:roleId/users/:userId` | `Roles.removeUser` | `roles:admin` |
| `GET` | `/permissions` | `Permissions.index` | `permissions:read,permissions:admin` |
| `POST` | `/permissions` | `Permissions.create` | `permissions:write,permissions:admin` |
| `PUT` | `/permissions/:id` | `Permissions.update` | `permissions:write,permissions:admin` |
| `DELETE` | `/permissions/:id` | `Permissions.delete` | `permissions:delete,permissions:admin` |
| `GET` | `/profile` | `Profile.index` | Auth |
| `POST` | `/profile` | `Profile.update` | Auth |
| `POST` | `/profile/password` | `Profile.doPasswordChange` | Auth |
| `GET` | `/profile/api-tokens` | `Profile.listTokens` | Auth |
| `POST` | `/profile/api-tokens` | `Profile.createToken` | Auth |
| `POST` | `/profile/api-tokens/:id` | `Profile.updateToken` | Auth |
| `DELETE` | `/profile/api-tokens/:id` | `Profile.deleteToken` | Auth |
| `GET` | `/profile/passkeys` | `Profile.listPasskeys` | Auth |
| `POST` | `/profile/passkeys` | `Profile.updatePasskey` | Auth |
| `DELETE` | `/profile/passkeys/:id` | `Profile.deletePasskey` | Auth |
| `GET` | `/settings` | `Settings.index` | `settings:read,settings:admin` |
| `POST` | `/settings` | `Settings.save` | `settings:write,settings:admin` |
| `GET` | `/settings/registry` | `Settings.registry` | `settings:read,settings:admin` |
| `POST` | `/settings/registry` | `Settings.createRegistry` | `settings:write,settings:admin` |
| `GET` | `/settings/registry/search` | `Settings.registrySearch` | `settings:read,settings:admin` |
| `PUT` | `/settings/registry/:id` | `Settings.updateRegistry` | `settings:write,settings:admin` |
| `DELETE` | `/settings/registry/:id` | `Settings.deleteRegistry` | `settings:delete,settings:admin` |
| `POST` | `/settings/registry/:id/status` | `Settings.toggleRegistryStatus` | `settings:admin` |
| `GET` | `/healthcheck` | Returns `Ok!` | Public |

All routes also support the conventions-based catch-all pattern `/:handler/:action?`, matched last in `app/config/Router.bx`.

::: page-link href="../guides/handlers-routing.md"
:::

::: page-link href="../guides/security.md"
:::
