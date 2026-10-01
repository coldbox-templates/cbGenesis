---
title: アプリ設定
order: 2
icon: phosphor-duotone:sliders
summary: SettingService.static.DEFAULTS で定義される、DB に保存され管理者が編集できる設定。
tags: [reference, configuration, settings]
---

# アプリ設定

これらは `SettingService.static.DEFAULTS` に存在し、`preFlightCheck()` によって起動時にシードされ、2 時間の TTL でキャッシュされ、`settings:write`(または `settings:admin`)権限を持つ誰でも `/settings` で編集できます — 詳細は [設定](../guides/configuration.md#app-settings-vs-framework-config) を参照してください。

<figure>
	<img src="../assets/screenshots/settings.png" alt="グローバル設定管理ページ">
	<figcaption>グローバル設定管理ページ。</figcaption>
</figure>

## 認証と登録

| 設定 | 目的 |
|---|---|
| `cbLoginLayout` | 認証ページに使用されるレイアウト(デフォルトは `AuthSplit`。`AuthCenter` または `AuthSplit` を選択) |
| `cbAllowRegistration` | セルフサービス登録の有効/無効を切り替えます |
| `cbAllowForgotPassword` | パスワード忘れフローの有効/無効を切り替えます |
| `cbAllowRememberMe` | 「リメンバーミー」クッキーの有効/無効を切り替えます |
| `cbRememberMeDays` | リメンバーミートークンが有効なままである期間(デフォルト: `14`) |
| `cbRequirePasskey` | 管理エリアに到達する前にパスキーの登録を強制します |

### ログインレイアウトの選択

**Settings** ページは、セレクターとして `cbLoginLayout` を公開しています。

| 値 | レイアウト | 見た目 |
|---|---|---|
| `AuthSplit` | `app/layouts/AuthSplit.bxm` | 2 パネル構成のログイン: 左側にブランディング/機能紹介、右側にフォーム。小さい画面では、コンパクトなブランディングとともにフォームだけに折りたたまれます。これがデフォルトです。 |
| `AuthCenter` | `app/layouts/AuthCenter.bxm` | ロゴ、フォーム、認証フッターを中央に配置した認証カード。 |

`/settings` で **Auth Center** または **Auth Split** を選択し、設定を保存して、認証ページを再読み込みしてください。ハンドラーは `event.setLayout( prc.settings.cbLoginLayout )` を呼び出すため、選択したレイアウトはログイン、登録、招待の有効化、パスワード復旧の各ページに適用されます。データベースで直接値を設定したり、アプリケーションがそのレイアウトを提供する場合は `app/layouts/` 配下にカスタムレイアウト名を追加したりすることもできます。

## パスワードとトークンのポリシー

| 設定 | 目的 |
|---|---|
| `cbMinPasswordLength` | パスワードの最小長(デフォルト: `8`)。`SettingService.isValidPassword()` はさらに大文字、小文字、数字、特殊文字を要求し、パスワードを設定するすべてのサーバーサイドの経路(登録、招待の有効化、リセット、プロフィール変更)がこれを実行します |
| `cbPasswordResetExpiration` | リセットトークンの有効期限(分単位、デフォルト: `60`) |
| `cbInvitationExpiration` | 招待トークンの有効期限(日単位、デフォルト: `7`) |
| `cbRegistrationVerificationExpiration` | 登録確認トークンの有効期限(時間単位、デフォルト: `24`) |
| `cbApiTokenMaxValidityMonths` | API トークンを発行できる最大有効期間(デフォルト: `12`) |
| `cbAuditLogRetentionDays` | 日次のスケジュールタスクが監査ログエントリを完全削除する経過日数(デフォルト: `90`)。`0` でパージを無効化します - 詳細は [スケジュールタスク](../architecture.md#scheduled-tasks) を参照 |
| `cbRateLimitMaxAttempts` | `RateLimiter` がログイン/登録/パスワードリセットをブロックする前に、IP ごと、エンドポイントごとに許可される試行回数(デフォルト: `5`) - 詳細は [レート制限](../guides/security.md#rate-limiting) を参照 |
| `cbRateLimitWindowSeconds` | レート制限の期間(秒単位、デフォルト: `300`)。`0` でレート制限を完全に無効化します |
| `cbTrustProxyHeaders` | `RateLimiter`、監査トレイル、セキュリティメールが、呼び出し元の IP について `X-Forwarded-For`/`X-Cluster-Client-IP` ヘッダーを信頼するかどうか(デフォルト: `true`。このアプリは通常、リバースプロキシやロードバランサーの背後にデプロイされるためです)。アプリの前段に何もなく、直接インターネットに公開されている場合にのみこれをオフにしてください - 詳細は [プロキシの背後でのデプロイ](../deployment.md#deploying-behind-a-reverse-proxy) を参照 |
| `cbEncryptionKey` / `cbSaltingKey` | セキュリティレイヤーで使用される暗号化/ソルト鍵 |

## ブランディングと外観

| 設定 | 目的 |
|---|---|
| `cbAppName` | アプリケーションの表示名 |
| `cbAppLogo` | 管理サイドバーに表示されるロゴ。手動で入力された URL か、Settings 経由でのアップロード後の `/branding/logo/lg` のいずれかです — 詳細は [アバターとブランディングロゴ](../guides/frontend.md#avatars-branding-logo) を参照 |
| `cbAppTagline` | ロゴの隣に表示されるタグライン |
| `cbAppBrandTagline` | サイドバーのブランドエリアに表示される短いブランディングラベル |
| `cbCopyrightNotice` | アプリケーションのフッターにレンダリングされる著作権表示 |
| `cbDefaultTheme` | 新規訪問者向けのデフォルトのライト/ダークテーマ |

## メール

| 設定 | 目的 |
|---|---|
| `cbDefaultEmail` | 送信メールのデフォルトの「From」アドレス |
| `cbMailHost` / `cbMailPort` | SMTP ホスト/ポート |
| `cbMailUsername` / `cbMailPassword` | SMTP 認証情報 |
| `cbMailTLS` / `cbMailSSL` | トランスポートセキュリティのフラグ |

## 監査ログ

| 設定 | 目的 |
|---|---|
| `cbAuditLogRetentionDays` | スケジュールされたパージによって監査記録が保持される日数。自動パージを無効にするには `0` を設定します(デフォルト: `90`)。 |

## シークレットと暗号化

| 設定 | 目的 |
|---|---|
| `cbEncryptionKey` | セキュリティ/ストレージレイヤーで使用される AES 暗号化シークレット。本番環境では、生成された開発用の値を安定したシークレットに置き換えてください。 |
| `cbSaltingKey` | セキュリティ操作で使用されるソルト。本番環境では安定させ、秘密のままにしてください。 |

::: page-link href="../guides/configuration.md"
:::

::: page-link href="../guides/extending.md"
:::
