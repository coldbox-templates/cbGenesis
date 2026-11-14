---
title: デプロイ
order: 5
icon: phosphor-duotone:cloud-arrow-up
summary: 本番ビルド、Docker、BoxLang MiniServer、そして本番稼働チェックリスト。
tags: [deployment]
---

# デプロイ

## 本番ビルド

```bash frame="terminal" title="Terminal"
npm run build
```

フロントエンドをコンパイルし、フィンガープリントを付けて `public/includes/` に出力します - 詳細は [フロントエンド](guides/frontend.md#vite-configuration) を参照してください。

## Docker

`Dockerfile` とデータベース別の Compose ファイルは `resources/docker/` にあります。MySQL がデフォルトで、PostgreSQL と MSSQL の代替構成が、CI でテストされている他のターゲット向けに用意されています。MariaDB は MySQL の設定と `mysql` JDBC ドライバーをそのまま使えます。`box.json` には `docker:build`、`docker:run`、`docker:bash`、`docker:stack` の各スクリプトも定義されており(`box run-script <name>` で実行)、以下の単一引数コマンドのショートカットとなっていますが、これらはローカルでの `box` コマンドに必要な BoxLang CLI のインストールを代替するものではなく、`npm run` とも無関係です(`npm run docker:*` というものはありません)。

### Docker Compose でのローカル開発

`resources/docker/docker-compose.yml` は、アプリ(`resources/docker/Dockerfile.dev` からビルドされ、公式の `ortussolutions/boxlang:cli` イメージの上に CommandBox をネイティブインストールすることでエンジンバージョンを `.bvmrc` に一致させています)を MySQL 8 コンテナと一緒に実行し、リポジトリ全体がアプリコンテナにバインドマウントされているため、ホスト側での編集がリビルドなしで反映されます - ローカルに BoxLang/MySQL をインストールする必要はありません。`up -d` のような複数語のコマンドが正しく渡されるよう、(`docker:stack` パッケージスクリプト経由ではなく)`docker compose` を直接実行してください。

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.yml up -d
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box migrate seed run
```

`http://127.0.0.1:8080` にアクセスしてください。MySQL はホストから `127.0.0.1:3406` でアクセスできます(すでに `3306` で動作している MySQL/MariaDB との衝突を避けるために選ばれています)。アプリコンテナは内部の Docker ネットワーク経由で MySQL の実際のポートである `3306` に接続します。

この compose ファイルは Vite を実行しません - HMR のためにはホスト側で別途起動してください。

```bash frame="terminal" title="Terminal"
npm install
npm run dev
```

MSSQL 専用の Compose ファイルも、SQL Server 2022 に対するテスト用に用意されています。アプリコンテナに `bx-mssql` ドライバーをインストールし、`cbgenesis` データベースを作成し、そのデータを `resources/docker/.db/mssql/` 配下に保持します。

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.mssql.yml up -d
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box migrate seed run
```

アプリケーションは引き続き `http://127.0.0.1:8080` で利用でき、SQL Server はホストから `127.0.0.1:1434` でアクセスできます。デフォルトの `sa` パスワードはローカルテスト専用です。上書きするには、スタックを起動する前に `MSSQL_SA_PASSWORD` を設定してください。このスタックを停止するには:

```bash frame="terminal" title="Terminal"
docker compose -f resources/docker/docker-compose.mssql.yml down
```

PostgreSQL の代替構成は PostgreSQL 16 を使用し、ホストポート `5433` を公開し、`bx-postgresql` を自動的にインストールします。

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.postgresql.yml up -d
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box migrate seed run
```

デフォルトの MySQL Compose ファイルは変更されていません。いずれかの代替構成を停止するには、対応する Compose ファイルと `down` を使ってください。

```bash frame="terminal" title="Terminal"
docker compose -f resources/docker/docker-compose.yml down
```

### 本番イメージ

```bash frame="terminal" title="Terminal"
box run-script docker:build
box run-script docker:run
```

本番イメージを作成する前にフロントエンドをビルドしてください。

```bash linenums="1"
npm run build
```

## BoxLang MiniServer

コンパイル済みのアプリを直接実行するための、`bx-cli` の開発サーバーに代わる選択肢です。

```bash frame="terminal" title="Terminal"
cd my-app
boxlang-miniserver --port 8080 --webroot ./public --dev
```

MiniServer は `box install`、マイグレーション、TestBox コマンドを提供しません。それらのタスクには必須の [BoxLang CLI](guides/command-line.md) を使用してください。

## 本番稼働チェックリスト

::: stepper
::: step "環境を設定する"
`.env` に `ENVIRONMENT=production` と `BOXLANG_DEBUG=false` を設定します。
:::
::: step "実際のメールを設定する"
`app/config/modules/cbmailservices.bx` を実際の SMTP/Postmark/SendGrid ドライバーに向けます - 詳細は [メール](guides/email.md#protocol-by-environment) を参照してください。
:::
::: step "シードされた管理者パスワードをローテーションする" color="warning"
シーダーは `admin@cbgenesis.com` / `test` を作成し、リセット保留としてフラグを立てます。このアカウントでサインインしてもセッションは付与されません - パスワードリセットフォームに直接送られ、まず新しいパスワードを設定する必要があります。ブートストラップ用のハッシュは公開されている(リポジトリに含まれている)ため、`test` を使い続けられるようにこのフラグをクリアしてはいけません。詳細は [はじめに](getting-started.md#scaffold-your-app) を参照してください。
:::
::: step "フレームワークの再初期化を誰が行えるかを決める"
`reinitPassword` は環境変数 `COLDBOX_REINIT_PASSWORD` を読み込みます。本番環境では**未設定のまま**にしておくと、起動ごとに誰も知らない新しいランダムな UUID にフォールバックし、`?fwreinit` を完全に閉じます。稼働中のインスタンスを再初期化する必要がある場合にのみ設定し、認証情報として扱ってください。空文字列に設定すると誰でも再初期化できてしまうため、`development()` はまさにそれを行いますが、本番環境ではそうしてはいけません。
:::
::: step "HTTPS を有効にする"
`server.json` の SSL 設定、または選択したリバースプロキシ/ロードバランサー経由で行います。
:::
::: step "プロキシヘッダーを信頼するかどうかを決める" color="warning"
`cbTrustProxyHeaders` はデフォルトで**オン**になっており、リバースプロキシやロードバランサーの背後に配置される典型的なデプロイに合わせています。アプリが直接インターネットに公開される場合は、オフにしてください - 詳細は [リバースプロキシの背後でのデプロイ](#deploying-behind-a-reverse-proxy) を参照してください。これを逆にしてしまうと、レート制限が無効になるか、プロキシの背後にいる全員に対して機能しなくなります。
:::
::: step "パスキーのリライングパーティ設定を更新する" color="warning"
`app/config/modules/cbsecurity-passkeys.bx` は開発専用のプレースホルダー(`relyingPartyId: "localhost"`、`allowedOrigins: ["http://localhost:8080"]`)を同梱しています。本番稼働の前に、これらを実際の本番ドメインに設定してください。さもないとパスキー登録が失敗します - 詳細は [セキュリティと権限](guides/security.md#known-issues) を参照してください。
:::
::: step "フロントエンドをビルドする"
`npm run build` を実行し、圧縮・フィンガープリント済みのアセットを生成します。
:::
::: step "/healthcheck をロックダウンする" color="danger"
インフラの外部から到達可能であってはならない場合は、公開されている `/healthcheck` エンドポイントを削除または制限してください。
:::
:::

## リバースプロキシの背後でのデプロイ

`RateLimiter`、監査トレイル、そして「IP からリセットが要求された」というセキュリティメールはすべて、`cbsecurity` の `getRealIP()` を通じて呼び出し元の IP を読み取ります。この関数には IP の取得元が 2 通りあり、あなた - このアプリをデプロイする本人 - だけが、自分の環境にとってどちらが正しいかを知っています。

- **生のソケットアドレス**(`cgi.remote_addr`) - アプリが直接インターネットに公開されている場合に正しい値です。前段にリバースプロキシがある場合、これは常にプロキシ自身のアドレスであり、訪問者のものではありません。
- **`X-Forwarded-For` / `X-Cluster-Client-IP` リクエストヘッダー** - アプリの前段にある何か(nginx、ロードバランサー、CDN)がクライアントから送られた値を取り除き、自らそのヘッダーを設定している場合にのみ正しい値です。何もそれを行っていない場合、どの呼び出し元でもこのヘッダーに任意の値を設定でき、リクエストごとに異なる値にすることさえできます。

`cbTrustProxyHeaders` 設定(デフォルト `true`、`/settings` で編集可能)は、この 2 つのどちらを使うかを選択します。実際にはヘッダーをサニタイズするプロキシの背後にいないのにこれをオンのままにしておくと、それが閉じるはずだった、まさにそのレート制限バイパスが再び開いてしまいます - 呼び出し元はログイン試行のたびに新しい `X-Forwarded-For` 値を偽造し、決してブロックされなくなります。実際にそのようなプロキシの背後にいるのにこれをオフにすると、すべての訪問者がプロキシの IP を共有することになります - 1 つのブロックされた呼び出し元が、その背後にいる全員をブロックし、監査トレイルにはすべてのアクションについてプロキシのアドレスが記録されます。

アプリの前段に何もなく、直接インターネットに公開してデプロイする場合は、これをオフにしてください。リバースプロキシの背後にデプロイする場合は、これをオンのままにする前に、そのプロキシが実際に `X-Forwarded-For` を(クライアントから提供された値に追加したり素通りさせたりするのではなく)上書きしていることを確認してください。

::: cards
::: card title="設定" icon="phosphor-duotone:gear-six" href="guides/configuration.md"
上記で参照したすべての環境変数とモジュール設定。
:::
::: card title="セキュリティと権限" icon="phosphor-duotone:shield-check" href="guides/security.md"
本番稼働前に、ファイアウォールと CSRF の設定を再確認してください。
:::
:::
