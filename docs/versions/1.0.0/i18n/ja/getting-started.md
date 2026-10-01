---
title: はじめに
order: 2
icon: phosphor-duotone:rocket-launch
summary: BoxLang をインストールし、テンプレートをクローンし、データベースを設定して、ログイン画面を開きます。
tags: [guides, setup]
---

# はじめに

## システム要件

- **Java 21+**(JDK または JRE)
- **BoxLang 1.17+**
- **CommandBox 7+**(`bx-cli`)
- **Node.js 22+**(Vite フロントエンド用)
- **サポートされているデータベース**: MySQL 8+(デフォルト)、MariaDB、PostgreSQL、SQLite、Oracle、または MSSQL
- 任意の OS

## BoxLang のインストール

=== "クイックインストーラー"

	### macOS & Linux

	```bash frame="terminal" title="Terminal"
	# macOS & Linux
	/bin/bash -c "$(curl -fsSL https://install.boxlang.io)"

	# ...with automatic Java 21 installation
	curl -fsSL https://install.boxlang.io | bash -s -- --with-jre
	```

	### Windows

	```powershell frame="terminal" title="PowerShell (Windows)"
	powershell -NoExit -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://install-windows.boxlang.io'))"
	```

=== "BVM(バージョンマネージャー)"

	複数の BoxLang バージョンを切り替える必要がある場合は、代わりに [BVM](https://boxlang.ortusbooks.com) を使用してください。

	```bash frame="terminal" title="Terminal"
	curl -fsSL https://install-bvm.boxlang.io | bash

	bvm install latest && bvm use latest
	```

	インストールを確認します。

	```bash frame="terminal" title="Terminal"
	boxlang --version
	```

!!! danger "通常の CommandBox ではなく bx-cli を使用してください"
    CBGenesis は BoxLang テンプレートです。標準の Lucee ベースの CommandBox ディストリビューションはインストールしないでください。クイックインストーラーまたは BVM で BoxLang をインストールしたら、BoxLang ネイティブの CLI モジュールをインストールします。これは `box install`、`box server`、`box migrate`、`box testbox` を実行する前に必要です。

    ```bash frame="terminal" title="Terminal"
    install-bx-module bx-cli
    ```

    BoxLang CLI が有効になっていることを確認します。

    ```bash frame="terminal" title="Terminal"
    box version
    ```

    Lucee ベースの CommandBox ディストリビューションを現在使用している開発者は、必要なモジュールの最新バージョンが実行されるよう、キャッシュされたアーティファクトをクリーンにしてください。

    ```bash frame="terminal" title="Terminal"
    box artifacts clean
    ```

    インストール後に `box` が見つからない場合は、ターミナルを再起動するか、インストーラーが報告したディレクトリを `PATH` に追加してください。

## アプリをスキャフォールドする

まず `box` と入力して CommandBox シェルに入ります。

::: stepper
::: step "最新の ColdBox CLI をインストールする"
```bash frame="terminal" title="Terminal"
install coldbox-cli
```
:::

::: step "CBGenesis アプリを作成する"
```bash frame="terminal" title="Terminal"
coldbox create app name="my-app" skeleton="cbgenesis"
```
:::

::: step "Node の依存関係をインストールする"
```bash frame="terminal" title="Terminal"
!npm install
```
:::

::: step "データベースの認証情報と設定を更新する"
お好みのテキストエディタで `.env` ファイルを開き、データベースの認証情報を適宜更新してください。このテンプレートは MySQL 向けに事前設定されています。MySQL、MariaDB、PostgreSQL、MSSQL がサポートされ、テストされているデータベースターゲットです。`server.json` の `onServerInitialInstall` は、`box server start` を初めて実行したときに、`DB_DRIVER` 設定(`bx-${DB_DRIVER}`、デフォルトは `bx-mysql`)に一致する JDBC ドライバーモジュールをインストールします。他のデータベースを使用するには、その最初のサーバー起動**前**に `.env` で `DB_DRIVER` を設定してください。
:::

::: step "マイグレーションとシード"

`.env` を設定したら、以下のコマンドを実行してデータベースを初期化し、シードします。設定されたデータベースに CLI を接続するために必要なドライバーが自動的にダウンロードされるはずです。接続に問題がある場合は、正しい `DB_DRIVER` が設定されており、対応する JDBC ドライバーモジュールがインストールされていることを確認してください。

```bash frame="terminal" title="Terminal"
migrate init
migrate up --seed
```

??? tip "シーダーは何を作成しますか?"
    `resources/database/seeds/AdminData.bx` は、組み込みの 20 個の権限をすべて持つ **Admin** ロールと、1 人の管理者ユーザーを作成します。

    | フィールド | 値 |
    |---|---|
    | メールアドレス | `admin@cbgenesis.com` |
    | パスワード | `test`(リセット保留) |

    このアカウントはリセット保留としてシードされているため、`test` でサインインしてもセッションは得られません - 実際のパスワードを選ぶためのパスワードリセットフォームに直接送られます。これは意図的なものです。ブートストラップ用のハッシュはこのリポジトリに含まれており、公開されています。[本番稼働チェックリスト](deployment.md#production-checklist) を参照してください。

:::

::: step "AI スキルを更新する"

CBGenesis は `.agents/` に事前設定された AI ガイドライン、スキル、エージェントファイルを同梱しているため、GitHub Copilot、Cursor、Claude Code などのアシスタントは正確な ColdBox と BoxLang のコンテキストを取得できます。これらは、スキャフォールドの手順でインストールした `coldbox-cli` モジュールによって生成されます。ガイドラインとスキルがインストール済みのモジュールと一致するように、スキャフォールド後に更新してください。

```bash frame="terminal" title="Terminal"
coldbox ai refresh
```

CommandBox モジュールをインストール、更新、削除するたびに `coldbox ai refresh` を再実行して、モジュール固有のガイドラインとスキルを反映させてください。

??? tip "AI 連携機能を確認・管理する"
    ```bash frame="terminal" title="Terminal"
    coldbox ai --help         # Discover the available AI commands
    coldbox ai info           # Show installed guidelines, skills, agents, and MCP servers
    coldbox ai skills list    # List the available skills
    coldbox ai agents --help  # Add, update, or remove AI agent configuration files
    ```
:::

::: step "サーバーを起動する" color="success"

```bash frame="terminal" title="Terminal"
server start
```

これは BoxLang CLI のサーバーコマンドです。初回実行時に、`server.json` に記載された BoxLang モジュール(`bx-esapi`、`bx-password-encrypt`、`bx-mail`、`bx-orm`、`DB_DRIVER` で選択された JDBC ドライバー、`bx-image`)がインストールされます。

??? tip "サーバーを一度起動した後にドライバーを切り替える"
    `onServerInitialInstall` はサーバーの初回起動時にのみ発火するため、後から `DB_DRIVER` を変更しても自動的には新しいドライバーが再インストールされません。再度起動する前に `server forget`(サーバーのインストール状態をクリアします)を実行し、新しいドライバーがインストールされるようにしてください。

    ```bash frame="terminal" title="Terminal"
    server forget
    server start
    ```
:::
::: step "Vite を起動する(2 つ目のターミナルで)" color="success"
```bash frame="terminal" title="Terminal"
npm run dev
```
:::
:::

## アプリを開く

**[http://127.0.0.1:8080](http://127.0.0.1:8080)** にアクセスすると、ログインページが表示されます。上記のシードされた管理者の認証情報でサインインしてください。

<figure>
	<img src="assets/screenshots/login.png" alt="デフォルトの AuthSplit レイアウトを使用したログイン画面">
	<figcaption>デフォルトの <code>AuthSplit</code> レイアウトを使用したログイン画面。</figcaption>
</figure>

サインインすると、ダッシュボードに移動し、管理サイドバーには Users、Roles、Permissions、Audit Log、Settings への準備が整っています。

<figure>
	<img src="assets/screenshots/dashboard.png" alt="サインイン後の管理ダッシュボード">
	<figcaption>サインイン後の管理ダッシュボード。</figcaption>
</figure>

::: cards
::: card title="アーキテクチャ" icon="phosphor-duotone:tree-structure" href="architecture.md"
`public/`、`app/`、`resources/`、`lib/` がどのように組み合わさっているかを確認し、リクエストライフサイクルをたどってみましょう。
:::
::: card title="セキュリティと権限" icon="phosphor-duotone:shield-check" href="guides/security.md"
最初の保護されたページを追加する前に、ログインフローと `resource:action` 権限モデルを理解しましょう。
:::
::: card title="アプリの拡張" icon="phosphor-duotone:puzzle-piece" href="guides/extending.md"
構築の準備はできましたか? 新しい CRUD モジュールを追加する具体的な手順は、こちらから始めてください。
:::
:::
