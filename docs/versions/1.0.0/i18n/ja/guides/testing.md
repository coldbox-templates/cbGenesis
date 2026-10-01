---
title: テスト
order: 6
icon: phosphor-duotone:test-tube
summary: すべてのエンティティとサービスに対する TestBox ユニットスペックに加え、実際の HTTP リクエストを扱う統合スペック。
tags: [guides, testing, testbox]
---

# テスト

CBGenesis には、すべてのサービスとエンティティをカバーする [TestBox](https://testbox.ortusbooks.com) スイートに加え、実際のリクエストを扱う統合スペックが同梱されています。

## テストの実行

```bash frame="terminal" title="Terminal"
box testbox run                                  # All tests
box testbox run directory=tests.specs.unit       # Unit tests only
box testbox run directory=tests.specs.integration # Integration tests only
box testbox run bundles=tests.specs.unit.security.RoleServiceTest  # One bundle
```

ランナー(`tests/runner.bxm`、`box.json` の `testbox.runner` キーで配線されています)は `labels=` と `excludes=` も受け付けますが、このスイート内でラベルを宣言しているスペックはないため、代わりにディレクトリやバンドルでフィルタリングしてください。`--verbose` は実行される各スペックを出力し、`outputFile=`/`outputFormats=` はレポートを書き出します - これが CI の呼び出し方です。

!!! warning "統合スペックには実行中のサーバーが必要です"
    実際のリクエストを発行するため、事前に `box server start` が起動しており、データベースがマイグレーション・シード済みである必要があります。CI は `box testbox run` の前にまさにそれを行います。

## テスト構造

```text title="tests/ layout" linenums="1"
tests/
├── Application.bx              Virtual ColdBox app (appMapping="/app")
├── runner.bxm                  TestBox CLI runner entry
├── run.bxm / index.bxm         Browser-based runner UI
├── specs/
│   ├── integration/
│   │   ├── MainSpec.bx         Lifecycle events and exception handling
│   │   ├── AuthTest.bx         Login, registration, and password reset
│   │   ├── ProfileTest.bx      Password change and profile validation
│   │   └── SettingsTest.bx     Settings handler CRUD and registry
│   └── unit/
│       ├── security/           APIToken, APITokenService, Permission,
│       │                       PermissionService, RateLimitService,
│       │                       RememberTokenService, Role, RoleService,
│       │                       SecurityService
│       └── system/              AuditLog, AuditLogService, Setting,
│                               SettingService, User, UserService
└── resources/
    └── BaseIntegrationSpec.bx  Shared helper for integration tests
```

命名規則は、エンティティごとに 1 つのユニットスペック、サービスごとに 1 つのユニットスペックで、ドメインフォルダー(`security`、`system`)ごとに分かれています - `app/models` を反映しています。自分のドメインを追加するときも同じ組み合わせに従ってください。ランナーは `*Spec*`/`*Test*` というファイル名パターンでバンドルを検出するため、どちらの接尾辞でも機能します。

## 統合スペックの書き方

統合スペックは `tests.resources.BaseIntegrationSpec` を継承しており、これは `appMapping="/app"` を配線するため、パスは本番環境とまったく同じように解決されます。

```boxlang title="tests/specs/integration/MainSpec.bx" linenums="1"
component extends="tests.resources.BaseIntegrationSpec" {

    function run(){
        describe( "Registration", () => {
            it( "renders the registration form", () => {
                var event = execute( event = "Auth.register", renderResults = true );
                expect( event.getValue( "cbox_rendered_content" ) ).toInclude( "register" );
            } );
        } );
    }

}
```

!!! tip "beforeEach() で必ず状態をリセットしてください"
    すべての統合スペックで `beforeEach()` 内で `setup()` を呼び出し、あるテストの状態が次のテストに漏れないようにしてください。

チェックイン済みのスイートは **19 のスイートにわたる 185 のスペック** です: すべてのセキュリティ・システムエンティティとサービスに対するユニットカバレッジに加え、アプリケーションのライフサイクル(`MainSpec`)、認証フロー(`AuthTest`)、プロフィールハンドラー(`ProfileTest`)、設定ハンドラー(`SettingsTest`)に対する統合スペックです。`Users`、`Roles`、`Permissions`、`AuditLog` の管理ハンドラーについては、まだ統合カバレッジがありません - それらの上に構築する際に追加してください。サービスにユニットスペックがあるからといって、その機能がカバーされているとは限りません。

::: cards
::: card title="アプリの拡張" icon="phosphor-duotone:puzzle-piece" href="extending.md"
新しいサービスに対するユニットスペックを、そのエンティティのスペックと一緒に追加します。
:::
:::
