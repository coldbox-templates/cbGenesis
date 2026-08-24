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
| `GET` | `/settings` | `Settings.index` | `settings:read,settings:admin` |
| `POST` | `/settings` | `Settings.save` | `settings:write,settings:admin` |
| `GET` | `/healthcheck` | Returns `Ok!` | Public |

All routes also support the conventions-based catch-all pattern `/:handler/:action?`, matched last in `app/config/Router.bx`.

::: page-link href="../guides/handlers-routing.md"
:::

::: page-link href="../guides/security.md"
:::
