---
title: Route Map
order: 1
icon: phosphor-duotone:map-trifold
summary: Every method, URL, target action, and required permission.
tags: [reference, routing]
---

# Route Map

"Auth" means any authenticated user; a permission slug means the firewall also requires `prc.authUser.hasPermission()` to pass (see [Security & Permissions](../guides/security.md#permission-model)) — failing that redirects to `dashboard.notAuthorized` instead of `login`.

Every `POST`, `PUT`, and `DELETE` route below requires a valid CSRF token in `rc.csrf`. `GET` routes do not — see [CSRF verification](../guides/handlers-routing.md#csrf-verification).

The `:userId`, `:roleId`, `:permissionId`, `:settingId`, `:tokenId`, `:passkeyId`, and `:size` placeholders are the literal parameter names the router binds into `rc`. `:size` is `sm` or `lg`.

| Method | URL | Handler.Action | Auth |
|---|---|---|---|
| `GET` | `/login` | `Auth.login` | Guest |
| `POST` | `/login` | `Auth.doLogin` | Guest |
| `GET` | `/register` | `Auth.register` | Guest |
| `POST` | `/register` | `Auth.doRegister` | Guest |
| `GET` | `/register/check-email` | `Auth.checkEmailAvailability` | Guest |
| `GET` | `/verify-registration` | `Auth.verifyRegistration` | Guest |
| `GET` | `/activate-invitation` | `Auth.activateInvitation` | Guest |
| `POST` | `/activate-invitation` | `Auth.doActivateInvitation` | Guest |
| `GET` | `/confirm-email-change` | `Auth.verifyEmailChange` | Guest or Auth — reachable either way, unlike the other `Auth` actions (see [Handlers & Routing](../guides/handlers-routing.md#auth)) |
| `GET` | `/forgot-password` | `Auth.forgotPassword` | Guest |
| `POST` | `/forgot-password` | `Auth.doForgotPassword` | Guest |
| `GET` | `/reset-password` | `Auth.resetPassword` | Guest |
| `POST` | `/reset-password` | `Auth.doResetPassword` | Guest |
| `POST` | `/logout` | `Auth.logout` | Auth |
| `GET` | `/dashboard` | `Dashboard.index` | Auth |
| `GET` | `/auditlog` | `AuditLog.index` | `auditlog:read,auditlog:admin` |
| `GET` | `/auditlog/:id` | `AuditLog.show` | `auditlog:read,auditlog:admin` |
| `GET` | `/auditlog/search` | `AuditLog.search` | `auditlog:read,auditlog:admin` |
| `GET` | `/auditlog/export` | `AuditLog.export` | `auditlog:export,auditlog:admin` |
| `POST` | `/auditlog/purge` | `AuditLog.purge` | `auditlog:delete,auditlog:admin` |
| `DELETE` | `/auditlog/clear` | `AuditLog.clear` | `auditlog:admin` |
| `GET` | `/users` | `Users.index` | `users:read,users:admin` |
| `GET` | `/users/search` | `Users.search` | `users:read,users:admin` |
| `POST` | `/users` | `Users.create` | `users:write,users:admin` |
| `GET` | `/users/:userId` | `Users.show` | `users:read` |
| `PUT` | `/users/:userId` | `Users.update` | `users:write,users:admin` |
| `DELETE` | `/users/:userId` | `Users.delete` | `users:delete,users:admin` |
| `POST` | `/users/:userId/invitation` | `Users.resendInvitation` | `users:write,users:admin` |
| `PUT` | `/users/:userId/profile` | `Users.updateProfile` | `users:write,users:admin` |
| `POST` | `/users/:userId/status` | `Users.setStatus` | `users:write,users:admin` |
| `POST` | `/users/:userId/preferences` | `Users.savePreferences` | `users:write,users:admin` |
| `POST` | `/users/:userId/reset-password` | `Users.resetPassword` | `users:admin` |
| `POST` | `/users/:userId/force-password-reset` | `Users.forcePasswordReset` | `users:admin` |
| `POST` | `/users/:userId/verify` | `Users.verify` | `users:admin` |
| `POST` | `/users/:userId/revoke-remember-tokens` | `Users.revokeRememberTokens` | `users:admin` |
| `POST` | `/users/:userId/roles/:roleId` | `Users.addRole` | `users:admin` |
| `DELETE` | `/users/:userId/roles/:roleId` | `Users.removeRole` | `users:admin` |
| `POST` | `/users/:userId/permissions/:permissionId` | `Users.addPermission` | `users:admin` |
| `DELETE` | `/users/:userId/permissions/:permissionId` | `Users.removePermission` | `users:admin` |
| `POST` | `/users/:userId/tokens/revoke-all` | `Users.revokeAllTokens` | `users:admin` |
| `DELETE` | `/users/:userId/tokens/:tokenId` | `Users.revokeToken` | `users:admin` |
| `GET` | `/roles` | `Roles.index` | `roles:read,roles:admin` |
| `POST` | `/roles` | `Roles.create` | `roles:write,roles:admin` |
| `PUT` | `/roles/:roleId` | `Roles.update` | `roles:write,roles:admin` |
| `DELETE` | `/roles/:roleId` | `Roles.delete` | `roles:delete,roles:admin` |
| `GET` | `/roles/:roleId/users` | `Roles.users` | `roles:read,roles:admin` |
| `GET` | `/roles/:roleId/available-users` | `Roles.availableUsers` | `roles:read,roles:admin` |
| `POST` | `/roles/:roleId/users/:userId` | `Roles.addUser` | `roles:admin` |
| `DELETE` | `/roles/:roleId/users/:userId` | `Roles.removeUser` | `roles:admin` |
| `GET` | `/permissions` | `Permissions.index` | `permissions:read,permissions:admin` |
| `POST` | `/permissions` | `Permissions.create` | `permissions:write,permissions:admin` |
| `PUT` | `/permissions/:permissionId` | `Permissions.update` | `permissions:write,permissions:admin` |
| `DELETE` | `/permissions/:permissionId` | `Permissions.delete` | `permissions:delete,permissions:admin` |
| `GET` | `/profile` | `Profile.index` | Auth |
| `POST` | `/profile` | `Profile.save` | Auth |
| `GET` | `/profile/passkey-required` | `Profile.passkeyRequired` | Auth |
| `POST` | `/profile/password` | `Profile.doPasswordChange` | Auth |
| `POST` | `/profile/email-change` | `Profile.requestEmailChange` | Auth |
| `DELETE` | `/profile/email-change` | `Profile.cancelEmailChange` | Auth |
| `GET` | `/profile/api-tokens` | `Profile.listTokens` | Auth |
| `POST` | `/profile/api-tokens` | `Profile.createToken` | Auth |
| `POST` | `/profile/api-tokens/:tokenId` | `Profile.updateToken` | Auth |
| `DELETE` | `/profile/api-tokens/:tokenId` | `Profile.deleteToken` | Auth |
| `GET` | `/profile/passkeys` | `Profile.listPasskeys` | Auth |
| `POST` | `/profile/passkeys` | `Profile.updatePasskey` | Auth |
| `DELETE` | `/profile/passkeys/:passkeyId` | `Profile.deletePasskey` | Auth |
| `POST` | `/profile/avatar` | `Profile.uploadAvatar` | Auth |
| `DELETE` | `/profile/avatar` | `Profile.deleteAvatar` | Auth |
| `GET` | `/settings` | `Settings.index` | `settings:read,settings:admin` |
| `POST` | `/settings` | `Settings.save` | `settings:write,settings:admin` |
| `GET` | `/settings/registry` | `Settings.registry` | `settings:read,settings:admin` |
| `POST` | `/settings/registry` | `Settings.createRegistry` | `settings:write,settings:admin` |
| `GET` | `/settings/registry/search` | `Settings.registrySearch` | `settings:read,settings:admin` |
| `PUT` | `/settings/registry/:settingId` | `Settings.updateRegistry` | `settings:write,settings:admin` |
| `DELETE` | `/settings/registry/:settingId` | `Settings.deleteRegistry` | `settings:write,settings:admin` |
| `POST` | `/settings/registry/:settingId/status` | `Settings.toggleRegistryStatus` | `settings:write,settings:admin` |
| `POST` | `/settings/clear-template-cache` | `Settings.clearTemplateCache` | `settings:admin` |
| `POST` | `/settings/clear-sessions-cache` | `Settings.clearSessionsCache` | `settings:admin` |
| `POST` | `/settings/revoke-remember-tokens` | `Settings.revokeRememberTokens` | `settings:admin` |
| `POST` | `/settings/flush-settings-cache` | `Settings.flushSettingsCache` | `settings:admin` |
| `POST` | `/settings/logo` | `Settings.uploadLogo` | `settings:write,settings:admin` |
| `DELETE` | `/settings/logo` | `Settings.deleteLogo` | `settings:write,settings:admin` |
| `GET` | `/avatars/:userId/:size` | `Assets.avatar` | Auth |
| `GET` | `/branding/logo/:size` | `Assets.logo` | Public |
| `GET` | `/healthcheck` | Returns `Ok!` | Public |

All routes also support the conventions-based catch-all pattern `/:handler/:action?`, matched last in `app/config/Router.bx`.

::: page-link href="../guides/handlers-routing.md"
:::

::: page-link href="../guides/security.md"
:::
