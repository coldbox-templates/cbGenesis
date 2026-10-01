---
title: BoxLang CLI
order: 0
icon: phosphor-duotone:terminal-window
summary: BoxLang をインストールし、依存関係、サーバー、マイグレーション、テストのために BoxLang ネイティブの bx-cli ワークフローを使用します。
tags: [guides, setup, cli, boxlang]
---

# BoxLang CLI

CBGenesis は BoxLang アプリケーションです。その `box` コマンドは BoxLang ネイティブの `bx-cli` モジュールによって提供される必要があります。通常の Lucee ベースの CommandBox ディストリビューションは、このテンプレートではサポートされていません。

## 必須のインストール

クイックインストーラーか BVM のいずれかで BoxLang をインストールし、次に `bx-cli` をインストールします。

=== "クイックインストーラー"
    ```bash linenums="1"
    /bin/bash -c "$(curl -fsSL https://install.boxlang.io)"
    ```

    Java がまだ利用できない環境で Java 21 ランタイムと一緒にインストールする場合:

    ```bash linenums="1"
    curl -fsSL https://install.boxlang.io | bash -s -- --with-jre
    ```

=== "BVM"
    ```bash linenums="1"
    curl -fsSL https://install-bvm.boxlang.io | bash
    bvm install latest
    bvm use latest
    ```

BoxLang が利用可能になったら、CLI モジュールをインストールします。

```bash linenums="1"
install-bx-module bx-cli
box version
```

インストール直後に `box` が見つからない場合は、ターミナルを再起動してください。このワークフローと並行して標準の Lucee CommandBox 実行ファイルをインストールしないでください。誤ったランタイムやコマンドモジュールが選択される原因になります。

## 日常的なコマンド

これらはすべてプロジェクトのルートから実行し、`bx-cli` によって実行されます。

| コマンド | 目的 |
|---|---|
| `box install` | `box.json` の依存関係を `lib/` にインストールします |
| `box server start` | ポート `8080` で BoxLang Web サーバーを起動します |
| `box server stop` | プロジェクトのサーバーを停止します |
| `box migrate up` | 未適用のデータベースマイグレーションを適用します |
| `box migrate down` | 直近のマイグレーションバッチをロールバックします |
| `box migrate reset` | すべてのマイグレーションをロールバックし、再度適用します |
| `box migrate seed run` | シードデータ(`Admin` ロール、その 20 個の権限、リセット保留の管理者ユーザー)を実行します |
| `box testbox run` | TestBox スイートを実行します - フィルタリングについては [テスト](testing.md#running-tests) を参照 |
| `box task run path/to/task.cfc` | `bx-cli` 経由で CommandBox タスクを実行します |
| `box coldbox ai refresh` | `.agents/` 内の AI ガイドラインとスキルを、インストール済みのモジュールと同期します |
| `box run-script format` | BoxLang ソース(`app/`、`tests/specs/`、ルートの `*.bx`)をフォーマットします |
| `box run-script format:check` | 変更を書き込まずにフォーマットを確認します |

フロントエンドは別途 Node.js を使用します。

```bash linenums="1"
npm install
npm run dev
npm run build
npm run lint
npm run lint:scss
```

## 初回実行シーケンス

```bash linenums="1"
install-bx-module bx-cli
box install
npm install
cp .env.example .env
box migrate up
box migrate seed run
box server start
npm run dev
```

サーバーは `server.json` を使用して、`boxlang@1`、`public/` ウェブルート、ポート `8080`、そして初回起動時にインストールされる BoxLang モジュールを選択します。データベース設定については [はじめに](../getting-started.md) を、環境変数については [設定](configuration.md) を参照してください。

## トラブルシューティング

- **`box: command not found`**: BoxLang がインストールされていることを確認し、ターミナルを再起動し、インストーラーのディレクトリが `PATH` に含まれていることを確認してください。
- **Lucee または CFML エンジンのメッセージ**: 通常の CommandBox 実行ファイルが使用されています。`PATH` から削除し、BoxLang を再インストールしてから `install-bx-module bx-cli` を実行してください。
- **プロジェクトコマンドが見つからない**: プロジェクトルートから `box version` を実行し、次に `box install` を実行して、`box.json` の依存関係が利用可能であることを確認してください。
- **データベース接続エラー**: `.env` を確認し、データベースが存在することを確認し、BoxLang サーバー設定を通じて JDBC ドライバーをインストール/起動してください。
