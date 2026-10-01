---
title: ルートマップ
order: 1
icon: phosphor-duotone:map-trifold
summary: すべてのメソッド、URL、ターゲットアクション、必要な権限。
tags: [reference, routing]
---

# ルートマップ

「Auth」は認証済みの任意のユーザーを意味し、権限スラッグはファイアウォールがさらに `prc.authUser.hasPermission()` の通過も要求することを意味します([セキュリティと権限](../guides/security.md#permission-model) を参照)— それに失敗すると `login` ではなく `dashboard.notAuthorized` にリダイレクトされます。

以下のすべての `POST`、`PUT`、`DELETE` ルートは、`rc.csrf` に有効な CSRF トークンを必要とします。`GET` ルートは必要としません — [CSRF 検証](../guides/handlers-routing.md#csrf-verification) を参照してください。

`:userId`、`:roleId`、`:permissionId`、`:auditLogId`、`:settingId`、`:tokenId`、`:passkeyId`、`:size` のプレースホルダーは、ルーターが `rc` にバインドする実際のパラメーター名です。`:size` は `sm` または `lg` です。

| メソッド | URL | Handler.Action | 認証 |
|---|---|---|---|
| `GET` | `/login` | `Auth.login` | ゲスト |
| `POST` | `/login` | `Auth.doLogin` | ゲスト |
| `GET` | `/register` | `Auth.register` | ゲスト |
| `POST` | `/register` | `Auth.doRegister` | ゲスト |
| `GET` | `/register/check-email` | `Auth.checkEmailAvailability` | ゲスト |
| `GET` | `/verify-registration` | `Auth.verifyRegistration` | ゲスト |
| `GET` | `/activate-invitation` | `Auth.activateInvitation` | ゲスト |
| `POST` | `/activate-invitation` | `Auth.doActivateInvitation` | ゲスト |
| `GET` | `/confirm-email-change` | `Auth.verifyEmailChange` | ゲストまたは認証済み — 他の `Auth` アクションと異なり、どちらでも到達可能です([ハンドラーとルーティング](../guides/handlers-routing.md#auth) を参照) |
| `GET` | `/forgot-password` | `Auth.forgotPassword` | ゲスト |
| `POST` | `/forgot-password` | `Auth.doForgotPassword` | ゲスト |
| `GET` | `/reset-password` | `Auth.resetPassword` | ゲスト |
| `POST` | `/reset-password` | `Auth.doResetPassword` | ゲスト |
| `POST` | `/logout` | `Auth.logout` | 認証済み |
| `GET` | `/dashboard` | `Dashboard.index` | 認証済み |
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
| `GET` | `/profile` | `Profile.index` | 認証済み |
| `POST` | `/profile` | `Profile.save` | 認証済み |
| `GET` | `/profile/passkey-required` | `Profile.passkeyRequired` | 認証済み |
| `POST` | `/profile/password` | `Profile.doPasswordChange` | 認証済み |
| `POST` | `/profile/email-change` | `Profile.requestEmailChange` | 認証済み |
| `DELETE` | `/profile/email-change` | `Profile.cancelEmailChange` | 認証済み |
| `GET` | `/profile/api-tokens` | `Profile.listTokens` | 認証済み |
| `POST` | `/profile/api-tokens` | `Profile.createToken` | 認証済み |
| `POST` | `/profile/api-tokens/:tokenId` | `Profile.updateToken` | 認証済み |
| `DELETE` | `/profile/api-tokens/:tokenId` | `Profile.deleteToken` | 認証済み |
| `GET` | `/profile/passkeys` | `Profile.listPasskeys` | 認証済み |
| `POST` | `/profile/passkeys` | `Profile.updatePasskey` | 認証済み |
| `DELETE` | `/profile/passkeys/:passkeyId` | `Profile.deletePasskey` | 認証済み |
| `POST` | `/profile/avatar` | `Profile.uploadAvatar` | 認証済み |
| `DELETE` | `/profile/avatar` | `Profile.deleteAvatar` | 認証済み |
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
| `GET` | `/avatars/:userId/:size` | `Assets.avatar` | 認証済み |
| `GET` | `/branding/logo/:size` | `Assets.logo` | 公開 |
| `GET` | `/healthcheck` | `Ok!` を返す | 公開 |

すべてのルートは、`app/config/Router.bx` で最後にマッチする、規約ベースのキャッチオールパターン `/:handler/:action?` もサポートしています。

::: page-link href="../guides/handlers-routing.md"
:::

::: page-link href="../guides/security.md"
:::
