---
title: ハンドラーとルーティング
order: 1
icon: phosphor-duotone:signpost
summary: すべてのハンドラー、そのアクション、そして Router.bx が URL をそれらに結びつける方法。
tags: [guides, handlers, routing]
---

# ハンドラーとルーティング

## ハンドラーマップ

| ハンドラー | ベース | 目的 |
|---|---|---|
| [`AuditLog.bx`](#auditlog) | `BaseSecureHandler` | 監査トレイルの閲覧、エクスポート、パージ |
| [`Assets.bx`](#assets) | `EventHandler` | ユーザーアバターとブランディングロゴをストリーミング配信 |
| [`Auth.bx`](#auth) | `EventHandler` | ログイン、登録、招待、パスワードリセット - すべて公開 |
| [`BaseSecureHandler.bx`](#basesecurehandler) | `RestHandler` | すべての管理ハンドラーの基底クラス |
| [`Dashboard.bx`](#dashboard) | `BaseSecureHandler` | 認証済みユーザーのランディングページ |
| `Main.bx` | `EventHandler` | 暗黙イベントハンドラー - [アーキテクチャ](../architecture.md#request-lifecycle) を参照 |
| [`Permissions.bx`](#permissions) | `BaseSecureHandler` | 権限スラッグの CRUD |
| [`Profile.bx`](#profile) | `BaseSecureHandler` | セルフサービスのプロフィール、パスワード、API トークン、パスキー |
| [`Roles.bx`](#roles) | `BaseSecureHandler` | ロールの CRUD とユーザー割り当て |
| [`Settings.bx`](#settings) | `BaseSecureHandler` | アプリ設定レジストリ |
| [`Users.bx`](#users) | `BaseSecureHandler` | ユーザー管理 |

### `BaseSecureHandler`

すべての保護されたハンドラーは `BaseSecureHandler` を継承しており、その `preHandler` は[すべての状態変更リクエストで CSRF を検証](#csrf-verification)し、`Admin` レイアウトを強制し、`cbRequirePasskey` がオンでユーザーがパスキーを持っていない場合は `profile/passkey-required` にリダイレクトします。また、共有ヘルパー(`getApiResults()`、`ensureSortDirection()`、`getPagination()`)も提供します。

```boxlang title="app/handlers/BaseSecureHandler.bx" linenums="1"
component extends="coldbox.system.RestHandler" {

    function preHandler( event, rc, prc ){
        // ...CSRF verification, deny-by-default...
        event.setLayout( "Admin" );
        // ...passkey enforcement...
    }

}
```

新しい保護されたハンドラーを構築するときは、いつも同じところから始まります。

```boxlang title="Example: a new secured handler" linenums="1"
component extends="BaseSecureHandler" secured {

    function index( event, rc, prc ){
        prc.pageTitle = "My Page";
        event.setView( "myhandler/index" );
    }

}
```

### `AuditLog`

クラスレベルで `@secured("auditlog:admin,auditlog:read")`。`index` 以外のすべてのアクションは `@remote` です。

- `index`、`search`、`show` - 監査トレイルの閲覧とフィルタリング
- `export` - `@secured("auditlog:admin,auditlog:export")`、CSV をストリーミング配信
- `purge` - `@secured("auditlog:admin,auditlog:delete")`、カットオフより古いエントリを削除
- `clear` - `@secured("auditlog:admin")`、すべてのエントリを削除

### `Assets`

クラスレベルでの `@secured` アノテーションはありません - 非公開の cbfs `assets` ディスク([データベースと ORM](database-orm.md) と `app/config/modules/cbfs.bx` を参照)からバイナリファイルをストリーミング配信します。このディスクは Web ルートの外にあり、それ以外の方法では到達できません。

- `avatar` - `@secured`(認証済みの任意のユーザー)、ユーザーの `sm`/`lg` アバター JPEG バリアントをストリーミング配信
- `logo` - 公開、`sm`/`lg` のブランディングロゴ PNG バリアントをストリーミング配信し、ログイン画面などのゲストページがそれをレンダリングできるようにします

どちらのアクションも、`userId`/`size` の形式が認識できない場合や、要求されたファイルが単に存在しない場合には(エラーではなく)404 を返すため、呼び出し元はレスポンスの形からは「アバターなし」と「そのようなユーザーなし」を区別できません。リサイズ、クロップ、ストレージはすべて `ImageService`(`app/models/system/ImageService.bx`)を通じて行われ、`@inject` プロパティではなく各アクション内で `getInstance()` を使って呼び出されます - その理由については `Assets.bx` の docblock を参照してください(ハンドラーがトリガーするシングルトン構築に関する WireBox の起動順序の癖です)。

### `Auth`

`@secured` アノテーションはありません - これらのアクションはゲストにも到達可能である必要があります。

- `login` / `doLogin`(GET/POST) - CSRF 検証済み、`securityService.login()` を呼び出し、`rememberMe` をサポート
- `register` / `doRegister` - `cbAllowRegistration` 設定によってゲート
- `checkEmailAvailability` - ライブなメールアドレス利用可否チェックのための JSON エンドポイント
- `verifyRegistration` - `PURPOSE_REGISTRATION` アクショントークンを消費
- `activateInvitation` / `doActivateInvitation` - 招待された、管理者が作成したユーザーにパスワードを設定
- `forgotPassword` / `doForgotPassword` - `cbAllowForgotPassword` によってゲート
- `resetPassword` / `doResetPassword` - リセットトークンを検証し、新しいパスワードを設定
- `verifyEmailChange` - `PURPOSE_EMAIL_CHANGE` アクショントークンを消費
- `logout` - `securityService.logout()` を呼び出し

`preHandler` は、すでに認証済みの訪問者をダッシュボードへ直接リダイレクトし、レイアウトを `prc.settings.cbLoginLayout`(デフォルトは `AuthSplit` - [`guides/security.md`](security.md) を参照)から設定します。`verifyEmailChange` と `logout` はそのリダイレクトから除外されているため、訪問者が認証済みかどうかにかかわらず到達可能です。

### `Dashboard`

`@secured`(認証済みの任意のユーザー、特定の権限は不要)。

- `index` - ダッシュボードのホーム
- `notAuthorized` - `invalidAuthorizationEvent` のターゲットで、認証済みユーザーに必要な権限がない場合に表示されます

### `Permissions`

クラスレベルで `@secured("permissions:admin,permissions:read")`。

- `index`
- `create` - `@secured("permissions:admin,permissions:write")`
- `update` / `delete` - `@remote`、同じ write/delete 権限

### `Profile`

現在のユーザーのためのセルフサービスアクションで、`@secured` が付いており、`index` を除いてすべて `@remote` の AJAX エンドポイントです。

- `index`、`passkeyRequired`
- `save`、`doPasswordChange`
- `requestEmailChange` / `cancelEmailChange` - 保留中のメールアドレス変更を開始/キャンセルし、`Auth.verifyEmailChange` を通じて確認されます
- `listTokens` / `createToken` / `updateToken` / `deleteToken` - API トークン
- `listPasskeys` / `updatePasskey` / `deletePasskey`
- `uploadAvatar` / `deleteAvatar` - 画像を `rc.avatar` 内の base64 データ URI として受け付けます(BoxLang には multipart/form-data パーサーがないため、アップロードは JSON として送られます)。`BaseSecureHandler.decodeDataUri()` でデコードされ、`Assets.avatar` によってストリーミングで返されます

これらのすべては、安全な HTTP メソッドで到達されない限り、`BaseSecureHandler` によって CSRF 検証されます - [CSRF 検証](#csrf-verification) を参照してください。

### `Roles`

クラスレベルで `@secured("roles:admin,roles:read")`。`index` 以外のすべてのアクションは `@remote` です。

- `index`
- `create` / `update` / `delete` - `@secured("roles:admin,roles:write"` / `"...:delete")`
- `users` / `availableUsers` - ロールに割り当て済み/割り当て可能なユーザーを一覧表示
- `addUser` / `removeUser` - `@secured("roles:admin")`

### `Settings`

クラスレベルで `@secured("settings:admin,settings:read")`。

- `index`
- `registry` / `registrySearch` - ページネーション付きの設定レジストリ
- `createRegistry` / `updateRegistry` / `toggleRegistryStatus` / `deleteRegistry` - `settings:admin,settings:write`
- `save` - コア設定の一括保存
- `uploadLogo` / `deleteLogo` - `settings:admin,settings:write`、`Profile.uploadAvatar` と同じ base64 データ URI の規約。`cbAppLogo` 設定を保存/復元し、`Assets.logo` 経由でストリーミングして返します
- 管理ユーティリティ(すべて `settings:admin`): `clearTemplateCache`、`clearSessionsCache`、`revokeRememberTokens`、`flushSettingsCache`

### `Users`

クラスレベルで `@secured("users:admin,users:read")`。

- `index`、`search`
- `create` / `update` / `delete` / `resendInvitation` - `users:admin,users:write` / `...:delete`
- `show` - `users:read`
- 管理者専用(`users:admin`): `updateProfile`、`setStatus`、`resetPassword`、`verify`、`revokeRememberTokens`、`addRole`/`removeRole`、`addPermission`/`removePermission`、`savePreferences`、`revokeToken`/`revokeAllTokens`

`ensureNotSelf()` は、これらのうちいくつかを保護し、管理者が自分自身のロールを降格・削除することを防ぎます。

<figure>
	<img src="../assets/screenshots/users.png" alt="ユーザー管理ページ">
	<figcaption>ユーザー管理ページ。</figcaption>
</figure>

## CSRF 検証

`app/config/modules/cbsecurity.bx` は `csrf.enableAutoVerifier: false` を設定しているため、グローバルなインターセプターは存在しません。代わりに、`BaseSecureHandler.preHandler()` が、これを継承するすべてのハンドラーに対して **デフォルト拒否** の方式で CSRF を検証します。

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

保護されたハンドラーを継承するとき、これが意味することは次のとおりです。

- **オプトインするものはありません。** `POST`、`PUT`、`PATCH`、`DELETE` で到達するどのアクションも、追加した日から有効な `rc.csrf` を持たなければなりません。更新を忘れないよう覚えておくべきハンドラーごとのリストはありません。
- **安全なメソッドは免除されます。** `GET`、`HEAD`、`OPTIONS` は状態を変更してはならないため CSRF のリスクを持たず、`OPTIONS`(CORS のプリフライト)はそもそもトークンを持てません。もしコード内の安全なメソッドが状態を変更しているなら、それが修正すべきバグです。
- **`onInvalidCSRF()` はオーバーライド可能です。** 基本実装は認可失敗として中断します。これは JSON/AJAX エンドポイントが求めるものです - `Permissions` のすべてのミューテーションは、リダイレクトではなく古いトークンから復旧する `fetchWithCsrf()`([フロントエンド](frontend.md#csrf-on-mutating-requests) を参照)を通じて送信される、まさにこの種類のものになりました。`Settings` は依然としてこれをオーバーライドし、ネイティブなフォーム送信に対してメッセージをフラッシュしてリダイレクトするため、ブラウザのフォームは裸の 403 ではなくページを受け取ります。JSON ではなく HTML をレンダリングする自分のハンドラーでは、これをオーバーライドしてください。

!!! note "`Auth` は保護されたハンドラーではありません"
    `Auth` は `BaseSecureHandler` ではなく `coldbox.system.EventHandler` を継承しています。そのアクションは未認証の訪問者のために実行されるため、上記のチェックを継承できないからです。各状態変更アクションは、それぞれ独自にトークンを検証します。`doLogin`、`doRegister`、`doActivateInvitation`、`doForgotPassword`、`doResetPassword`、`logout` です。

## ルートマップ (`app/config/Router.bx`)

すべてのルートは 1 つの `configure()` 関数内で宣言されます。

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

すべてのメソッド、URL、ターゲットアクション、必要な権限の完全な表については、[リファレンス: ルートマップ](../reference/routes.md) を参照してください。

::: cards
::: card title="ルートマップ" icon="phosphor-duotone:map-trifold" href="../reference/routes.md"
完全なメソッド/URL/ハンドラー/権限の表。
:::
::: card title="セキュリティと権限" icon="phosphor-duotone:shield-check" href="security.md"
`@secured` がファイアウォールと権限モデルにどのように結びつくか。
:::
::: card title="アプリの拡張" icon="phosphor-duotone:puzzle-piece" href="extending.md"
同じ規約に従って、新しいハンドラー、ルート、ビューを追加します。
:::
:::
