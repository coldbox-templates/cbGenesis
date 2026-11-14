---
title: Mappa delle rotte
order: 1
icon: phosphor-duotone:map-trifold
summary: Ogni metodo, URL, azione target, e permesso richiesto.
tags: [reference, routing]
---

# Mappa delle rotte

"Auth" significa qualsiasi utente autenticato; uno slug di permesso significa che il firewall richiede anche che `prc.authUser.hasPermission()` passi (vedi [Sicurezza e permessi](../guides/security.md#permission-model)) — in caso contrario reindirizza a `dashboard.notAuthorized` invece che a `login`.

Ogni rotta `POST`, `PUT`, e `DELETE` qui sotto richiede un token CSRF valido in `rc.csrf`. Le rotte `GET` no — vedi [Verifica CSRF](../guides/handlers-routing.md#csrf-verification).

I segnaposto `:userId`, `:roleId`, `:permissionId`, `:auditLogId`, `:settingId`, `:tokenId`, `:passkeyId`, e `:size` sono i nomi letterali dei parametri che il router associa a `rc`. `:size` è `sm` o `lg`.

| Metodo | URL | Handler.Action | Auth |
|---|---|---|---|
| `GET` | `/login` | `Auth.login` | Ospite |
| `POST` | `/login` | `Auth.doLogin` | Ospite |
| `GET` | `/register` | `Auth.register` | Ospite |
| `POST` | `/register` | `Auth.doRegister` | Ospite |
| `GET` | `/register/check-email` | `Auth.checkEmailAvailability` | Ospite |
| `GET` | `/verify-registration` | `Auth.verifyRegistration` | Ospite |
| `GET` | `/activate-invitation` | `Auth.activateInvitation` | Ospite |
| `POST` | `/activate-invitation` | `Auth.doActivateInvitation` | Ospite |
| `GET` | `/confirm-email-change` | `Auth.verifyEmailChange` | Ospite o Auth — raggiungibile in entrambi i casi, a differenza delle altre azioni `Auth` (vedi [Handler e Routing](../guides/handlers-routing.md#auth)) |
| `GET` | `/forgot-password` | `Auth.forgotPassword` | Ospite |
| `POST` | `/forgot-password` | `Auth.doForgotPassword` | Ospite |
| `GET` | `/reset-password` | `Auth.resetPassword` | Ospite |
| `POST` | `/reset-password` | `Auth.doResetPassword` | Ospite |
| `POST` | `/logout` | `Auth.logout` | Auth |
| `GET` | `/dashboard` | `Dashboard.index` | Auth |
| `GET` | `/auditlog` | `AuditLog.index` | `auditlog:read,auditlog:admin` |
| `GET` | `/auditlog/:auditLogId` | `AuditLog.show` | `auditlog:read,auditlog:admin` |
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
| `GET` | `/branding/logo/:size` | `Assets.logo` | Pubblico |
| `GET` | `/healthcheck` | Restituisce `Ok!` | Pubblico |

Tutte le rotte supportano anche il pattern catch-all basato su convenzioni `/:handler/:action?`, abbinato per ultimo in `app/config/Router.bx`.

::: page-link href="../guides/handlers-routing.md"
:::

::: page-link href="../guides/security.md"
:::
