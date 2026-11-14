---
title: フロントエンド
order: 4
icon: phosphor-duotone:palette
summary: サーバーサイドでレンダリングされる BXM ビュー、小さな Alpine.js コンポーネント、そして Vite でコンパイルされる SCSS/JS パイプライン。
tags: [guides, frontend, alpine, vite]
---

# フロントエンド

## 全体の構成

フロントエンドは**サーバーサイドレンダリングと Alpine.js のハイブリッド**アプリケーションです - SPA でも、クライアントサイドルーターでもありません。

::: stepper
::: step "ColdBox のレイアウトがシェルを提供する"
`app/layouts/` にある `Admin.bxm`、`AuthSplit.bxm` などが HTML フレームをレンダリングします。
:::
::: step "BXM テンプレートがサーバーサイドでレンダリングされる"
`app/views/` のビューは、ハンドラーによってすでに解決済みの `rc`/`prc` データを使ってレンダリングされます。
:::
::: step "Alpine.js がインタラクティブ性を追加する"
小さな `x-data` コンポーネントが、フォーム、モーダル、ドロワー、トグルを処理します - コンポーネントごとのビルドステップは不要です。
:::
::: step "Vite がアセットをコンパイルする" color="success"
`resources/assets/` の SCSS + JS が `public/includes/` にコンパイルされ、`ASSET_URL` プレフィックスで配信されます。
:::
:::

## Alpine.js アーキテクチャ

```text title="resources/assets/js/ layout" linenums="1"
App.js (entry)
  ├── Registers all Alpine stores + components
  ├── Imports Bootstrap JS + Phosphor icons + Tippy.js
  │
  ├── Stores ($store.*)
  │   ├── theme.js     → dark/light mode, syncs data-bs-theme + localStorage
  │   └── sidebar.js   → collapse/open, mobile overlay, localStorage persistence
  │
  └── Components (x-data)
      ├── auth/        → AuthForm, RegisterForm, ForgotPasswordForm, PasswordResetForm
    ├── security/     → AuditLogForm, PermissionsForm, RolesForm, UserDetailForm, UsersForm
    ├── profile/      → PasskeyOnboarding, PreferencesForm, ProfileForm
    ├── settings/     → SettingsForm, SettingsRegistryForm
    └── ui/           → Drawer, GlobalProgress, GlobalToast, Logo, MessageBox, PasswordMeter, PasswordStrength, Switch
```

各コンポーネントは、Alpine の `x-data` オブジェクトを返す単独のモジュールです。

=== "コンポーネント"
    ```js title="resources/assets/js/components/ui/MessageBox.js" linenums="1"
    export default () => ( {
        visible: true,
        init() {
            setTimeout( () => this.visible = false, 5000 );
        }
    } );
    ```
=== "ビューでの使用"
    ```html title="app/views/_components/ui/messagebox.bxm" linenums="1"
    <div x-data="messageBox" x-show="visible" x-transition>
        <!-- alert content -->
    </div>
    ```

## SCSS 構造

```text title="resources/assets/scss/ layout" linenums="1"
app.scss
  ├── _variables.scss   Bootstrap variable overrides
  ├── bootstrap          Full Bootstrap 5.3 import
  ├── _base.scss         CSS custom properties (light/dark theme)
  ├── components/        9 component partials
  ├── layouts/            Admin + Auth layout partials
  └── views/              Page-specific styles
```

## Vite の設定

`vite.config.mjs` は [`coldbox-vite-plugin`](https://github.com/coldbox-modules/coldbox-vite-plugin) の `coldbox()` プラグインを使用しています。

- エントリポイント: `resources/assets/scss/app.scss` と `resources/assets/js/App.js`
- `refresh: appRefreshPaths` — ハンドラー/ビューの変更時に自動フルリロード
- `publicDirectory: "public/includes"` — ビルド済みアセットの出力先
- 新しい Dart Sass 向けの `silenceDeprecations` フラグ(import、global-builtin、color-functions、if-function)を持つ SCSS プリプロセッサ

```bash frame="terminal" title="Terminal"
npm run dev        # Vite dev server with HMR
npm run build      # Production build → public/includes/
npm run lint       # ESLint check on resources/assets/js
npm run lint:fix   # ESLint auto-fix
npm run lint:scss  # Stylelint on resources/assets/scss
```

!!! note "ASSET_URL"
    本番環境では、コンパイル済みアセットの URL には `ASSET_URL` 環境変数(`.env.example` ではデフォルトで `/includes`)がプレフィックスとして付きます - 詳細は [設定](configuration.md#environment-variables) を参照してください。

## サーバーサイドレンダリングのビューコンポーネント

これらの BXM パーシャルは `app/views/_components/` 配下にあり、ColdBox の `view()` ヘルパーでレンダリングされます。意図的にプレゼンテーションに特化しており、`args` 構造体で値を渡し、ビジネスロジックはハンドラーやサービスに置いてください。

### アプリケーションシェル

| パーシャル | 目的と入力 |
|---|---|
| `_components/app/includes` | ドキュメントメタデータ、テーマ/サイドバーの FOUC 防止、パスキースクリプト、Vite の CSS/JS。オプションの `title`。`<head>` 内で 1 回だけインクルードします。 |
| `_components/app/sidebar` | 管理ナビゲーション、権限に応じた Users/Roles/Permissions/Audit Log リンク、設定サブメニュー、サイドバーフッター。`prc.authUser` を読み取ります。`Admin.bxm` からインクルードします。 |
| `_components/app/sidebar-brand` | サイドバーで使用されるアプリケーションのロゴ/名前リンク。 |
| `_components/app/sidebar-footer` | サイドバーで使用される、認証済みユーザーの概要とプロフィール/サインアウトアクション。 |
| `_components/app/topbar` | サイドバートグル、テーマトグル、パンくずリスト、ユーザーメニュー、サインアウトアクション。`prc.authUser` と `prc.title` を読み取ります。 |
| `_components/app/topbar-breadcrumbs` | トップバー内にレンダリングされるダッシュボードのパンくずリスト。より深いナビゲーションを追加する際に拡張してください。 |
| `_components/app/topbar-notifications` | アプリケーション通知用のトップバー通知スロット/コンポーネント。 |
| `_components/app/footer` | 著作権表示とフッターリンク。オプションの `classes`。`prc.settings.cbCopyrightNotice` を読み取ります。 |

### 認証パーシャル

| パーシャル | 目的と入力 |
|---|---|
| `_components/auth/footer` | 認証レイアウトで使用されるフッター。 |
| `_components/auth/passwordInput` | 表示切り替えとパスワード強度の表示を備えた、再利用可能なパスワードフィールド。 |

### UI パーシャル

| パーシャル | 目的と入力 |
|---|---|
| `_components/ui/modal` | オプションのネストされたビューをレンダリングする汎用の Alpine ダイアログ。必須の `id` は一意である必要があり、`title`、`openExpression`、`closeExpression`、`contentView`、`contentArgs` をサポートします。 |
| `_components/ui/drawer` | 背景/Escape での閉じる操作をサポートする、右側のフォーカストラップ付きダイアログ。オプションで `contentView`/`contentArgs` を指定でき、`drawer()` も初期化します。 |
| `_components/ui/confirm` | 静的またはAlpine バインドのメッセージ、確認/キャンセル式、ラベル、アイコン、ボタンクラス、無効化式を持つ確認ダイアログ。 |
| `_components/ui/messagebox` | 閉じることができる情報/成功/警告/エラーのアラート。静的な `message`/`title`、または動的な `messageExpression`/`typeExpression`/`dismissAction` に加え、`autoDismiss` と `classes` をサポートします。 |
| `_components/ui/globalProgress` | グローバルなアクセシブルプログレスバー。レイアウトごとに 1 回だけインクルードし、`$progress.start()`、`$progress.set()`、`$progress.stop()` で制御します。 |
| `_components/ui/globalToast` | グローバルなトーストスタック。レイアウトごとに 1 回だけインクルードし、`duration`、`position`、`maxVisible` を受け付け、`$toast()` からの通知を受け取ります。 |
| `_components/ui/avatar` | `hasAvatar` が true のときにユーザーのアバター画像をレンダリングし、そうでなければ `initials` にフォールバックします。サイドバー、トップバー、Users 一覧、Users 詳細ページで使われる読み取り専用の表示です — [アバターとブランディングロゴ](#avatars-branding-logo) を参照してください。 |
| `_components/ui/logo` | 再利用可能なアプリケーションロゴ/ブランディングパーシャル。 |
| `_components/ui/passwordMeter` | パスワードフィールドの隣で使用されるパスワードポリシーメーター。 |
| `_components/ui/progressbar` | ローカルな数値のためのインラインプログレスバーパーシャル。 |
| `_components/ui/switch` | 真偽値の設定のためのアクセシブルなスイッチコントロールパーシャル。 |

## Alpine コンポーネントとストア

`resources/assets/js/App.js` は、以下の名前を Alpine にグローバルに登録します。BXM ビュー内では `x-data="name"` または `x-data="name(...)"` として使用してください。フォームコンポーネントは対応するハンドラールートへリモートリクエストを行い、そのビューから供給される CSRF トークンが `fetchWithCsrf()` を通じて送信されることを想定しています([ミューテーションを行うリクエストにおける CSRF](#csrf-on-mutating-requests) を参照)。

### アプリケーションシェルと認証

| Alpine 名 | ソース | 役割 |
|---|---|---|
| `adminBody` | `components/app/AdminBody.js` | 管理ページのシェル動作とグローバルレイアウトイベント。 |
| `sidebarBrand` | `components/app/SidebarBrand.js` | サイドバーのブランドとのインタラクション。 |
| `footer` | `components/app/Footer.js` | フッターの状態と現在の年の挙動。 |
| `authForm` | `components/auth/AuthForm.js` | ログイン送信、バリデーション、リメンバーミー、エラー。 |
| `registerForm` | `components/auth/RegisterForm.js` | 登録バリデーション、メールアドレスの利用可否確認、送信。 |
| `forgotPasswordForm` | `components/auth/ForgotPasswordForm.js` | パスワード忘れリクエストの状態とフィードバック。 |
| `passwordResetForm` | `components/auth/PasswordResetForm.js` | パスワードリセットトークンの送信とバリデーション。 |

### 管理・プロフィールフォーム

| Alpine 名 | ソース | 役割 |
|---|---|---|
| `usersForm` | `components/security/UsersForm.js` | ユーザー一覧、検索、ページネーション、招待、ステータス、管理アクション。 |
| `userDetailForm` | `components/security/UserDetailForm.js` | ユーザーのプロフィール、ロール、権限、設定、トークン、認証アクション。 |
| `rolesForm` | `components/security/RolesForm.js` | ロールの CRUD、およびユーザーと権限の割り当て/解除。 |
| `permissionsForm` | `components/security/PermissionsForm.js` | 権限の一覧表示と CRUD 操作。 |
| `auditLogForm` | `components/security/AuditLogForm.js` | 監査フィルタリング、ページネーション、詳細ドロワー、CSV エクスポート、パージ、クリアアクション。 |
| `settingsForm` | `components/settings/SettingsForm.js` | コアとなるアプリケーション設定の編集とキャッシュ関連のフィードバック。 |
| `logoUploader` | `components/settings/LogoUploader.js` | 「App Logo Path」フィールドのためのブランディングロゴのアップロード/削除。既存の手動 URL 入力とライブプレビューと並存します — [アバターとブランディングロゴ](#avatars-branding-logo) を参照。 |
| `settingsRegistryForm` | `components/settings/SettingsRegistryForm.js` | レジストリの検索、ページネーション、作成/更新、有効/無効化、削除アクション。 |
| `profileForm` | `components/profile/ProfileForm.js` | プロフィールフィールド、パスワードポリシー、API トークン管理、メールアドレス変更リクエスト/キャンセルのサブフォーム、アバターのアップロード/削除。 |
| `preferencesForm` | `components/profile/PreferencesForm.js` | ユーザー設定の保存。 |
| `passkeyOnboarding` | `components/profile/PasskeyOnboarding.js` | パスキー登録と必須パスキーのオンボーディング。 |

### UI コンポーネントとグローバル API

| Alpine 名 | ソース | 役割 |
|---|---|---|
| `messageBox` | `components/ui/MessageBox.js` | アラートの表示とオプションのタイムド解除。 |
| `passwordMeter` | `components/ui/PasswordMeter.js` | パスワード要件と強度の表示。 |
| `passwordStrength` | `components/ui/PasswordStrength.js` | パスワード強度の計算とラベル。 |
| `switchComponent` | `components/ui/Switch.js` | トグルの状態と変更処理。 |
| `drawer` | `components/ui/Drawer.js` | ドロワーのライフサイクルとフォーカス動作。 |
| `globalProgress` | `components/ui/GlobalProgress.js` | プログレスイベントと現在のプログレス値。 |
| `globalToast` | `components/ui/GlobalToast.js` | トーストキュー、解除、タイプマッピング、スタック上限。 |

ソースには `Header.js`、`Sidebar.js`、`TopBarNotifications.js`、`Logo.js` も含まれています。これらのエクスポートはローカルインポートとして利用可能ですが、現在 `App.js` には登録されていません。グローバルな `x-data` コンポーネントとして使用する前に、`Alpine.data()` で登録してください。

### ストア、ユーティリティ、マジックプロパティ

| API | ソース | 用途 |
|---|---|---|
| `$store.theme` | `stores/theme.js` | ライト/ダークモード、`data-bs-theme`、localStorage への永続化。 |
| `$store.sidebar` | `stores/sidebar.js` | デスクトップの折りたたみ、モバイルの開閉、localStorage への永続化。 |
| `$formatDate`、`$formatDateTime`、`$relativeDate` | `utils/dateFormat.js` | フォールバック付きの一貫した日付表示。 |
| `$countLabel` | `utils/countLabel.js` | 単数/複数の件数ラベル。 |
| `$sortClass`、`$sortIcon` | `utils/sort.js` | ソート可能なテーブルヘッダーとインジケーター。 |
| `$passwordMeetsPolicy` | `utils/passwordPolicy.js` | 設定されたパスワード要件を満たしているかを確認します。 |
| `$isEmail` | `App.js` | 軽量なメールアドレス形式チェック。 |
| `$toast` / `$progress` | `components/ui/GlobalToast.js`、`GlobalProgress.js` | グローバルな通知とプログレス API。 |
| `$focus` / `$copy` | `App.js` | Alpine の更新後に子孫要素にフォーカスします。ブラウザのクリップボード API 経由でテキストをコピーします。 |
| `createRemoteListing()` | `utils/listing.js` | 共有のリモートリスティング状態、ローディング、ページネーション、エラーハンドリング。 |
| `fetchWithCsrf()`、`refreshCsrfToken()` | `utils/csrf.js` | コンポーネントの CSRF トークンを使ってミューテーションリクエストを送信し、古いトークンから一度だけ復旧します。 |

`AlpinePlugins.js` は Collapse、Focus、Mask、Persist をインストールします。`passkeys.js` はブラウザ側の WebAuthn 連携を提供します。新しく再利用可能なブラウザ API は、ここに文書化し、グローバルなものであれば `App.js` に登録/インポートを追加してください。

### ミューテーションを行うリクエストにおける CSRF

非 `GET` リクエストを送信するすべてのコンポーネントアクションは、`fetch()` を直接呼び出すのではなく、`fetchWithCsrf()`(`utils/csrf.js`)を通ります。これは、ミューテーションを行うリクエストが構築される唯一のカプセル化された場所であり、トークン復旧の挙動 - そして後で追加されるかもしれないもの(リクエスト/レスポンスフック、グローバルヘッダー、テレメトリ)- は、状態を変更するたびにたまたま遭遇したコンポーネントごとに変更するのではなく、ここだけを変更すれば済みます。

**そもそもなぜ復旧が必要なのか。** コンポーネントの `csrfToken` は、そのビューがレンダリングされたときに一度だけ埋め込まれます。ページが開いたままの間に、サーバーはそれを無効化できます。cbcsrf 自身のドキュメントが挙げている 2 つの方法によってです。`csrfField()`(すべての非表示 `csrf` 入力の背後にあるミックスイン)は、リクエストごとの初回使用時にセッションのトークンを強制的にローテーションするため、それをレンダリングするページ(Settings、パスキー必須ページ、認証ページ)は、開いている他のすべてのタブに座っているトークンを静かに無効化します。また、トークンはページが読み込まれてからではなく、*作成されてから*一定時間で期限切れになるため、トークンの寿命の終盤にレンダリングされたページは、残り数秒しかないトークンを渡される可能性があります。いずれにせよ、コンポーネントに埋め込まれたトークンは、ユーザーが入力を終える前に古くなることがあります。

**契約:**

```js title="resources/assets/js/utils/csrf.js" linenums="1"
export async function fetchWithCsrf( component, url, method, buildRequest ) { /* ... */ }
export async function refreshCsrfToken( component ) { /* ... */ }
```

- `component` は Alpine コンポーネントのインスタンスです(`this` を渡します)。可変な `csrfToken` プロパティを公開している必要があります - `fetchWithCsrf()` はそれを読み取ってリクエストを構築し、トークンが古い場合の再試行時には、`refreshCsrfToken()` 経由でセッションの現在のトークンで上書きします。
- `buildRequest( csrfToken )` は、与えられたトークンに対するメソッド固有の `RequestInit` フィールド(`headers`、`body`、`credentials` など)を返します。再試行時にも再度呼び出されるため、一度だけ計算した値をクロージャで保持するのではなく、毎回ボディを新しく構築する必要があります - これにより、同じヘルパーが `URLSearchParams`、`JSON.stringify()`、`FormData` のいずれのボディも同じように扱えます。
- 403 が返された場合、`fetchWithCsrf()` は `refreshCsrfToken()` を呼び出し、実際に新しいトークンを取得できた場合は、`buildRequest()` を再度呼び出してリクエストを 1 回だけ再送します。2 回目の 403(例えば実際の認可失敗や、完全に期限切れになったセッション)はそのまま返されます - この場合、呼び出し元は依然として通常のエラーハンドリングを必要とします。

```js title="A urlencoded mutation" linenums="1"
const response = await fetchWithCsrf( this, "/permissions", "POST", ( csrf ) => ( {
	headers : { "Content-Type": "application/x-www-form-urlencoded" },
	body    : new URLSearchParams( { permission: this.form.permission, csrf } ),
} ) );
```

```js title="A FormData mutation built from a rendered <form>" linenums="1"
const response = await fetchWithCsrf( this, form.action, "POST", ( csrf ) => {
	const formData = new FormData( form );
	formData.set( "csrf", csrf );
	return { body: formData, credentials: "same-origin", headers: { Accept: "application/json" } };
} );
```

`GET`/`HEAD` の読み取りだけが `fetchWithCsrf()` をスキップして `fetch()` を直接呼び出します - これらは CSRF トークンを持たず、それが原因で 403 になることもありません。一部の cbSecurity モジュールのエンドポイント(WebAuthn パスキーのセレモニールート)も、プレーンな `fetch()` で呼び出されます。これらは WebAuthn セレモニー自体を通じて認証を行い、このアプリの CSRF トークンは使わないため、このヘルパーの対象外です。`resources/assets/js/components/` 内のそれ以外のすべてのミューテーションは `fetchWithCsrf()` を通ります。サーバーの状態を変更するリクエストを追加する新しいフォームコンポーネントでも、これと一貫性を保ってください。

## アバターとブランディングロゴ

ユーザーのアバターとアプリケーションのブランディングロゴは、非公開の cbfs `assets` ディスク([設定](configuration.md#module-configuration) を参照)に保存され、静的ファイルとして配信されるのではなく `Assets.bx`([ハンドラーとルーティング](handlers-routing.md#assets) を参照)によってストリーミング配信されます。

<figure>
	<img src="../assets/screenshots/profile.png" alt="アバターのアップロードと割り当てられたロールを表示するプロフィールページ">
	<figcaption>アバターのアップロードと割り当てられたロールを表示するプロフィールページ。</figcaption>
</figure>

- **表示**は `_components/ui/avatar` パーシャルを通じて行われます。`hasAvatar` が true のときに `<img src="/avatars/:userId/:size">` をレンダリングし、そうでなければイニシャルの `<span>` にフォールバックします。サイドバー、トップバー、Users 一覧テーブル(サーバー側で投影される `hasAvatar` フィールド)に組み込まれており、Users 詳細ページではインラインで使われます(そのページのアバターは静的パーシャルではなく Alpine 駆動のサマリーカード内にあるため、`user.hasAvatar` に応じた `x-show`/`x-cloak` の切り替えを行います)。
- 現在のユーザー自身のアバターの**アップロード/削除**はプロフィールページにあり、`profileForm`(`ProfileForm.js`)が所有します。非表示のファイル入力が選択された画像を base64 データ URI として読み込み(`readFileAsDataUrl()`)、それを `POST /profile/avatar` に送信します。`DELETE /profile/avatar` で削除します。どちらも `version` カウンターを増加させ、ファイルパス自体はアップロード間で変わらないため、ストリーミング配信される URL のキャッシュ無効化用クエリパラメータとして使用されます。
- **ブランディングロゴ**は、Settings ページで `logoUploader` コンポーネント(`LogoUploader.js`)を介し、`POST`/`DELETE /settings/logo` に対して同様のアップロード/削除の扱いを受けます。アップロード時には `cbAppLogo` 設定のテキスト入力値をストリーミングパス(`/branding/logo/lg`)に置き換え、削除時には設定済みのデフォルト値を復元します — 手動の URL テキスト入力とライブ `<img>` プレビューは、代わりに `cbAppLogo` を外部 URL に向けたい人のために、これまでどおり動作し続けます。
- 両方のアップロードエンドポイントは同じ形式を受け付けます。画像はサーバー側で `BaseSecureHandler.decodeDataUri()` によってデコードされ、`ImageService`(`app/models/system/ImageService.bx`)によって `sm`/`lg` の JPEG(アバター)または PNG(ロゴ)バリアントにリサイズ/クロップされます。

::: cards
::: card title="アプリの拡張" icon="phosphor-duotone:puzzle-piece" href="extending.md"
自分の管理ページ向けに、新しい Alpine コンポーネントと SCSS パーシャルを追加します。
:::
::: card title="デプロイ" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
本番フロントエンドバンドルのビルドと出荷。
:::
:::
