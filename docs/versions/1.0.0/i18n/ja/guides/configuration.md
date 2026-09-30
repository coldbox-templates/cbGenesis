---
title: 設定
order: 7
icon: phosphor-duotone:gear-six
summary: 環境変数、フレームワーク設定、そしてモジュールごとの設定。
tags: [guides, configuration]
---

# 設定

## 環境変数

`.env.example` を `.env` にコピーし、自分の値を入力してください - アプリ内のどこからでも `getSystemSetting( "VAR_NAME", "default" )` で読み取れます。

| 変数 | 目的 |
|---|---|
| `APPNAME` | アプリケーションの表示名 |
| `ENVIRONMENT` | `development` または `production` |
| `ASSET_URL` | Vite 本番アセット用の公開 URL プレフィックス(デフォルトは `/includes`) |
| `BOXLANG_DEBUG` | BoxLang のデバッグ出力を有効にします |
| `DB_CONNECTIONSTRING` | 完全な JDBC 接続文字列 |
| `DB_DRIVER` | 小文字のデータベースドライバーで、`bx-*` JDBC ドライバーモジュールに一致します(MySQL または MariaDB の場合は `mysql`、その他 `mssql`、`postgresql`、`h2`、`oracle`、`sqlite`)- `server.json` の `onServerInitialInstall` が初回サーバー起動時に `bx-${DB_DRIVER}` をインストールします |
| `DB_HOST` / `DB_PORT` / `DB_DATABASE` | データベース接続の詳細 |
| `DB_SCHEMA` | マイグレーションランナー(`.cbmigrations.json`)が対象とするスキーマ。スキーマの概念がないエンジンでは空欄のままにしてください |
| `DB_USER` / `DB_PASSWORD` | データベースの認証情報 |
| `JWT_SECRET` | `cbsecurity` の JWT サポートの署名鍵 |
| `COOKIE_ENCRYPTION_KEY` | `cbstorages` のクッキーストレージ用の暗号化鍵。`useEncryption` を有効にした場合にのみ意味を持ちます(デフォルトはオフ)- 有効にする前に設定してください。さもないと、起動のたびに鍵が再生成され、以前に暗号化されたクッキーが静かに無効化されます |
| `CBFS_ASSETS_DISK_PATH` | アバターとブランディングロゴを保存する cbfs の `assets` ディスクのファイルシステムパス(デフォルトは `<app-root>/.cbfs`) |
| `COLDBOX_REINIT_PASSWORD` | `?fwreinit` に必要なパスワード。未設定の場合は起動ごとに新しいランダムな値になるため、再初期化は閉じられます - 詳細は [デプロイ](../deployment.md#production-checklist) を参照 |
| `COLDBOX_SESSION_TIMEOUT` | `cbstorages` のセッションストレージのセッションキャッシュタイムアウト(分単位、デフォルトは `60`) |

## フレームワーク設定 (`app/config/Coldbox.bx`)

| 設定 | 値 |
|---|---|
| `defaultEvent` | `Auth.login` — 未認証の訪問者はログインページに着地します |
| `requestStartHandler` | `Main.onRequestStart` |
| `applicationStartHandler` | `Main.onAppInit` |
| `exceptionHandler` | `Main.onException` |
| `modulesExternalLocation` | `["/modules"]` |
| `autoMapModels` | `true` |
| `jsonPayloadToRC` | `true` |
| `reinitPassword` | `COLDBOX_REINIT_PASSWORD`、または未設定の場合は起動ごとに生成される新しいランダムな UUID |

`development()` 環境オーバーライドは、Whoops エラーテンプレート、WireBox シングルトンのリロード、ColdBox デバッグモードを有効にし、`reinitPassword` をクリアするため、ローカルでは `?fwreinit=1` がパスワードなしで動作します。LogBox はコンソールアペンダーと、`app/logs` に書き込むローリングファイルアペンダーで設定されています。

## アプリ設定とフレームワーク設定の違い

`app/config/` 配下には異なる 2 つのものが共存しており、混同しやすいので注意してください。

::: columns
::: column
**フレームワーク設定**(`Coldbox.bx`、`Router.bx`、`WireBox.bx`、`CacheBox.bx`、`Scheduler.bx`)は静的でファイルベースであり、変更は次の `?fwreinit` で反映されます。
:::
::: column
**アプリ設定**(`cbAppName`、`cbAllowRegistration`、`cbMinPasswordLength` など)は DB に保存され、`/settings` から管理者が編集でき、`SettingService.static.DEFAULTS` で定義され、2 時間の TTL でキャッシュされます。
:::
:::

`SettingService.preFlightCheck()`(`Main.onAppInit` から呼び出されます)は、起動時に不足しているデフォルト値をデータベースにシードするため、新しいキーを `DEFAULTS` に追加するだけで表示されるようになります。設定は、`loadConfigOverrides()`/`loadEnvironmentOverrides()` によって読み込まれる、他の 2 つの方法でも上書きできます。

- `Coldbox.bx` の `variables.settings` に置かれた任意の `cb*` プレフィックス付きキー
- 任意の `genesis_*` プレフィックス付き環境変数

## モジュール設定

インストールされた各モジュールには、`app/config/modules/` 配下に独自の設定ファイルがあります。

| モジュール | 主な設定 |
|---|---|
| **cbsecurity** | cbauth プロバイダー、CSRF(ローテーション式、30 分)、`@secured` アノテーションスキャンを行うファイアウォール、セキュリティヘッダー、JWT(HS512、60 分)— 詳細は [セキュリティと権限](security.md) を参照 |
| **cbauth** | アイデンティティプロバイダーとしての `UserService`、キャッシュベースのセッションストレージ |
| **cbmailservices** | 本番では BXMail プロトコル、開発ではファイルプロトコル — 詳細は [メール](email.md) を参照 |
| **cborm** | エンティティ注入が有効、ページネーション `maxRows: 25` / `maxRowsLimit: 500` |
| **cbfs** | `assets` ディスク(デフォルトで `Local` プロバイダー、パスは `CBFS_ASSETS_DISK_PATH` から)- アバターとブランディングロゴを保存し、`Assets.bx` によってストリーミング配信されます — 詳細は [フロントエンド](frontend.md#avatars-branding-logo) を参照 |
| **cbstorages** | キャッシュストレージ(セッションキャッシュ、タイムアウトは `COLDBOX_SESSION_TIMEOUT` から、デフォルト 60 分)、クッキーストレージ(デフォルトで暗号化オフ) |
| **cbsecurity-passkeys** | パスキーサインイン用の WebAuthn リライングパーティ設定 - `relyingPartyId`/`allowedOrigins` はプレースホルダーの `localhost` 値であり、本番環境前に**必ず**変更する必要があります。詳細は [デプロイ](../deployment.md#production-checklist) を参照 |
| **mementifier** | ISO8601 の日付、ORM 自動インクルード、UTC 変換 |

::: cards
::: card title="セキュリティと権限" icon="phosphor-duotone:shield-check" href="security.md"
文脈の中で見る、cbsecurity ファイアウォールの完全な設定。
:::
::: card title="デプロイ" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
これらの設定のうち、本番稼働にとって実際に重要なのはどれか。
:::
:::
