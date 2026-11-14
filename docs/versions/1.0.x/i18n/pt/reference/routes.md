---
title: Mapa de Rotas
order: 1
icon: phosphor-duotone:map-trifold
summary: Todos os métodos, URLs, ações-alvo, e permissões exigidas.
tags: [reference, routing]
---

# Mapa de Rotas

"Auth" significa qualquer utilizador autenticado; um slug de permissão significa que a firewall também exige que `prc.authUser.hasPermission()` passe (veja [Segurança e Permissões](../guides/security.md#permission-model)) — falhar isso redireciona para `dashboard.notAuthorized`, em vez de para `login`.

Todas as rotas `POST`, `PUT`, e `DELETE` abaixo exigem um token CSRF válido em `rc.csrf`. As rotas `GET` não exigem — veja [Verificação de CSRF](../guides/handlers-routing.md#csrf-verification).

Os placeholders `:userId`, `:roleId`, `:permissionId`, `:auditLogId`, `:settingId`, `:tokenId`, `:passkeyId`, e `:size` são os nomes literais de parâmetro que o router liga em `rc`. `:size` é `sm` ou `lg`.

| Método | URL | Handler.Ação | Autenticação |
|---|---|---|---|
| `GET` | `/login` | `Auth.login` | Visitante |
| `POST` | `/login` | `Auth.doLogin` | Visitante |
| `GET` | `/register` | `Auth.register` | Visitante |
| `POST` | `/register` | `Auth.doRegister` | Visitante |
| `GET` | `/register/check-email` | `Auth.checkEmailAvailability` | Visitante |
| `GET` | `/verify-registration` | `Auth.verifyRegistration` | Visitante |
| `GET` | `/activate-invitation` | `Auth.activateInvitation` | Visitante |
| `POST` | `/activate-invitation` | `Auth.doActivateInvitation` | Visitante |
| `GET` | `/confirm-email-change` | `Auth.verifyEmailChange` | Visitante ou Autenticado — acessível de ambas as formas, ao contrário das outras ações de `Auth` (veja [Handlers e Rotas](../guides/handlers-routing.md#auth)) |
| `GET` | `/forgot-password` | `Auth.forgotPassword` | Visitante |
| `POST` | `/forgot-password` | `Auth.doForgotPassword` | Visitante |
| `GET` | `/reset-password` | `Auth.resetPassword` | Visitante |
| `POST` | `/reset-password` | `Auth.doResetPassword` | Visitante |
| `POST` | `/logout` | `Auth.logout` | Autenticado |
| `GET` | `/dashboard` | `Dashboard.index` | Autenticado |
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
| `GET` | `/profile` | `Profile.index` | Autenticado |
| `POST` | `/profile` | `Profile.save` | Autenticado |
| `GET` | `/profile/passkey-required` | `Profile.passkeyRequired` | Autenticado |
| `POST` | `/profile/password` | `Profile.doPasswordChange` | Autenticado |
| `POST` | `/profile/email-change` | `Profile.requestEmailChange` | Autenticado |
| `DELETE` | `/profile/email-change` | `Profile.cancelEmailChange` | Autenticado |
| `GET` | `/profile/api-tokens` | `Profile.listTokens` | Autenticado |
| `POST` | `/profile/api-tokens` | `Profile.createToken` | Autenticado |
| `POST` | `/profile/api-tokens/:tokenId` | `Profile.updateToken` | Autenticado |
| `DELETE` | `/profile/api-tokens/:tokenId` | `Profile.deleteToken` | Autenticado |
| `GET` | `/profile/passkeys` | `Profile.listPasskeys` | Autenticado |
| `POST` | `/profile/passkeys` | `Profile.updatePasskey` | Autenticado |
| `DELETE` | `/profile/passkeys/:passkeyId` | `Profile.deletePasskey` | Autenticado |
| `POST` | `/profile/avatar` | `Profile.uploadAvatar` | Autenticado |
| `DELETE` | `/profile/avatar` | `Profile.deleteAvatar` | Autenticado |
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
| `GET` | `/avatars/:userId/:size` | `Assets.avatar` | Autenticado |
| `GET` | `/branding/logo/:size` | `Assets.logo` | Público |
| `GET` | `/healthcheck` | Devolve `Ok!` | Público |

Todas as rotas também suportam o padrão catch-all baseado em convenções `/:handler/:action?`, verificado por último em `app/config/Router.bx`.

::: page-link href="../guides/handlers-routing.md"
:::

::: page-link href="../guides/security.md"
:::
