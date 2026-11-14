---
title: アプリの拡張
order: 8
icon: phosphor-duotone:puzzle-piece
summary: アプリ自身の規約に従って、新しい CRUD モジュール、権限、設定、またはスケジュールタスクを追加します。
tags: [guides, extending]
---

# アプリの拡張

CBGenesis は完成品ではなく、出発点です。以下は、アプリ自身の Users/Roles/Permissions/Settings モジュールが従っているのと同じ手順です - 何か新しいものを作るときのテンプレートとして使ってください。

## AI エージェントで構築する

AI コーディングエージェント(Claude Code、Copilot、Cursor など)で cbGenesis を拡張する場合は、コードを書かせる前に `.agents/skills-custom/` を参照させてください - これらのスキルは、以下の手順を、このコードベースからの実際のコード抜粋付きの機械可読な指示としてエンコードしているため、エージェントがすべてのハンドラーを調べてそれらをリバースエンジニアリングする必要がなくなります。

| スキル | カバーする内容 |
|---|---|
| `cbgenesis-crud-resource` | 以下の完全な縦割りスライス - エンティティ、サービス、ハンドラー、ルート、ビュー、コンポーネント - をエンドツーエンドで。 |
| `cbgenesis-rbac-permissions` | `resource:action` 権限モデル、`@secured`、そして自己操作ガード。 |
| `cbgenesis-csrf-frontend` | ミューテーションを行うすべてのフロントエンドリクエストに必須の `fetchWithCsrf()` パターン。 |
| `cbgenesis-alpine-components` | Alpine.js コンポーネントの形、登録方法、そして共有 `utils/` ライブラリ。 |
| `cbgenesis-testing-conventions` | `BaseIntegrationSpec`、実際のトランザクションロールバック分離メカニズム、そしてフィクスチャヘルパー。 |
| `cbgenesis-settings-config` | 環境変数を使うべきか、DB に保存された設定レジストリを使うべきかの判断基準。 |

エージェント(または人間)が試行錯誤で再発見しなくて済むような新しい規約を見つけましたか? PR の説明に暗黙知として残すのではなく、ここに新しいスキルとして追加してください。これが重要な理由と、実測による前後比較については、[AI 支援開発のために構築](../ai-native.md) を参照してください。

## 新しい CRUD モジュールの追加

::: stepper
::: step "エンティティを作成する"
`app/models/<domain>/` に、`BaseEntity` を継承して作成します — [データベースと ORM](database-orm.md#entity-hierarchy) を参照してください。
:::
::: step "サービスを作成する"
`BaseService` を継承し、`singleton threadSafe` を指定します — [サービスパターン](database-orm.md#service-layer-pattern) を参照してください。
:::
::: step "ハンドラーを作成する"
`BaseSecureHandler` を継承し、`@secured` アノテーションを付けます — [ハンドラーとルーティング](handlers-routing.md#basesecurehandler) を参照してください。このベースを継承するということは、追加する `POST`/`PUT`/`DELETE` アクションはすべて [自動的に CSRF 検証される](handlers-routing.md#csrf-verification) ことを意味します。オプトインするものは何もありませんが、フォームと Alpine コンポーネントは `rc.csrf` を送信しなければなりません。
:::
::: step "ルートを追加する"
`app/config/Router.bx` の `// @app_routes@` マーカー付近に追加します。
:::
::: step "ビューを作成する"
`app/views/<domain>/` に、既存の `_components/ui/` パーシャルを再利用して作成します。
:::
::: step "Alpine コンポーネントを作成する"
`resources/assets/js/components/<domain>/` に作成し、`App.js` に登録します — [フロントエンド](frontend.md#alpinejs-architecture) を参照してください。
:::
::: step "SCSS を追加する"
`resources/assets/scss/views/` に追加し、`app.scss` からインポートします。
:::
::: step "テストを書く" color="success"
`tests/specs/unit/<domain>/` にユニットスペックを、追加したルート向けの統合スペックを `tests/specs/integration/` に書きます — [テスト](testing.md#test-structure) を参照してください。
:::
:::

## 新しい権限の追加

::: stepper
::: step "スラッグをシードする"
`resources/database/seeds/AdminData.bx` に `resource:action` スラッグを追加し、適切なロールに割り当てます。
:::
::: step "ハンドラーを保護する"
`@secured( "resource:action,resource:admin" )` — カンマは OR を意味します。[セキュリティと権限](security.md#permission-model) を参照してください。
:::
::: step "ビューをゲートする"
```html linenums="1"
<bx:if prc.authUser.hasPermission( "resource:action,resource:admin" )>
```
これにより、UI がハンドラーが拒否するようなものを決して提供しないようになります。
:::
::: step "再シードする" color="success"
既存のデータベースに対して `box migrate seed run` を実行するか、Roles 管理ページから直接ロールに権限を付与します。
:::
:::

## 設定の追加

`SettingService.bx` の `DEFAULTS` 構造体に新しいキーを追加します。`preFlightCheck()` が次回起動時に自動的にシードし、追加の配線なしで `/settings` 管理ページに表示されます — [設定](configuration.md#app-settings-vs-framework-config) を参照してください。

## レイアウトのカスタマイズ

レイアウトは `app/layouts/` にあります。選択はハンドラーごとに、通常は `preHandler` で行われます。

```boxlang title="app/handlers/BaseSecureHandler.bx" linenums="1"
function preHandler( event, rc, prc ){
    event.setLayout( "Admin" );
}
```

## スケジュールタスクの追加

`app/config/Scheduler.bx` にタスクを登録します。すでに実行されている 3 つのタスクの隣に追加してください - それらが何をするかについては [アーキテクチャ](../architecture.md#scheduled-tasks) を参照してください。

```boxlang title="app/config/Scheduler.bx" linenums="1"
task( "My Task" )
    .call( () => getInstance( "MyService" ).doWork() )
    .everyDayAt( "03:45" )
    .onOneServer()
    .withNoOverlaps();
```

`onOneServer()` と `withNoOverlaps()` は、複数インスタンスをデプロイした瞬間に重要になります。これらがないと、すべてのインスタンスが独自のスケジュールでタスクを実行してしまいます。実際のパージ/クリーンアップロジックは、クロージャの中に直接書くのではなく、サービス側(上記の `doWork()`)に置いてください。そうすればユニットテストが可能になります。

## モジュール設定の上書き

`app/config/modules/` 内のモジュール設定は、モジュール自身のデフォルトを継承しています。そこにある任意のキーを上書きしてください — 変更は次の `?fwreinit` で反映されます。

::: cards
::: card title="AI 支援開発のために構築" icon="phosphor-duotone:robot" href="../ai-native.md"
カスタムスキルが存在する理由と、実測されたトークン数/ツール呼び出し回数の比較。
:::
::: card title="ハンドラーとルーティング" icon="phosphor-duotone:signpost" href="handlers-routing.md"
このセクションが基礎とする、ハンドラー/ルートの規約の全体像。
:::
::: card title="データベースと ORM" icon="phosphor-duotone:database" href="database-orm.md"
エンティティとサービスのパターンを詳しく。
:::
::: card title="デプロイ" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
構築したものをリリースしましょう。
:::
:::
