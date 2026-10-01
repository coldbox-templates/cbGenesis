---
title: メール
order: 5
icon: phosphor-duotone:envelope
summary: cbmailservices を通じて送信される、トークンベースのメールテンプレート。
tags: [guides, email]
---

# メール

メールテンプレートは [cbmailservices](https://coldbox-mailservices.ortusbooks.com) を使用しており、送信時に置き換えられる単純な `@token@` プレースホルダーを持ちます。

```html title="app/email_templates/password_verification.bxm" linenums="1"
<h1>Reset Your Password</h1>
<p>Click the link below to reset your password:</p>
<a href="@linkToken@">Reset Password</a>
<p>This link expires @expiration@.</p>
```

サービス呼び出しから送信します。

```boxlang title="Sending a templated email" linenums="1"
mailService.newMail()
    .config( from = "noreply@app.com", to = user.getEmail(), subject = "Reset Password" )
    .setBodyTokens( { linkToken: resetLink, expiration: "in 60 minutes" } )
    .setBodyTemplate( "password_verification" )
    .send();
```

## 同梱されているテンプレート

| テンプレート | 送信されるタイミング |
|---|---|
| `user_welcome.bxm` | 新しいアカウントが作成されたとき |
| `registration_verification.bxm` | 新しいアカウントにメール認証が必要なとき |
| `password_verification.bxm` | パスワードリセットリンクが要求されたとき |
| `password_reset.bxm` | パスワード変更後の確認 |
| `email_change_confirmation.bxm` | ユーザーがメールアドレス変更を要求したとき - 確認のため新しいアドレスに送信されます |
| `email_change_notice.bxm` | ユーザーがメールアドレス変更を要求したとき - 通知として古いアドレスに送信されます |

## 環境別のプロトコル

!!! note "開発環境ではファイルプロトコル"
    開発環境では、`app/config/modules/cbmailservices.bx` は送信メールを送信する代わりにディスクに書き込みます - 構築中はあなたのマシンから何も出て行きません。本番環境では実際の SMTP プロバイダー(Postmark、SendGrid、または通常の SMTP)を設定してください - 詳細は [デプロイ](../deployment.md#production-checklist) を参照。

## メールログビューア(開発環境)

ファイルプロトコルによってディスクに書き込まれたすべてのメールは、アプリが開発環境で動作している間、**`/cbmailservices/log`** で閲覧できます。これは cbmailservices 自体のページであり(cbGenesis のハンドラーではありません)、送信されたすべてのメッセージを、レンダリングされたプレビューと、実際に生成された HTML の生ソース表示付きで一覧表示します。

<figure>
    <img src="../assets/screenshots/mail-log.png" alt="確認メールのレンダリングされたプレビューを表示する cbMailServices ログビューア">
    <figcaption>プレビュー - 受信者が実際に目にするとおりにレンダリングされたメール。</figcaption>
</figure>

<figure>
    <img src="../assets/screenshots/mail-log-source.png" alt="送信されたメールの生 HTML を表示する cbMailServices ログビューアの Source タブ">
    <figcaption>ソース - cbmailservices がディスクに書き込んだ生の HTML/メタデータ。</figcaption>
</figure>

このビューアは開発環境でのみ表示されます。`Log.cfc` はすべてのアクションで `controller.getSetting( "environment" ) == "development"` を確認し、そうでない場合は 404 を返すため、デプロイ前に無効化する必要は何もありません。

### メールをどのように見つけるか

ログサービスは固定フォルダーを読むわけではありません - `app/config/modules/cbmailservices.bx` の `mailers` 設定に登録されているすべてのメーラーを調べ、`File` プロトコルを使用しているメーラーからのメッセージを一覧表示します。

```boxlang title="app/config/modules/cbmailservices.bx" linenums="1"
mailers : {
    "default" : { class : "BXMail" },
    "files" : { class : "File", properties : { filePath : "/app/logs" } }
},
```

cbGenesis はこの `files` メーラーを標準で同梱しており、同じファイル内の `development()` は `defaultProtocol` を `"files"` に切り替えます - そのため、`environment` が `development` である間にアプリが送信するすべてのメールは、追加の設定なしに自動的にそこに届きます。

別のフォルダーを指定したり、別の設定を分離してテストするために 2 つ目のファイルベースのメーラーを追加したりするには、`class: "File"` と `filePath` を持つエントリを `mailers` の下に追加または編集してください。ビューアは `files` だけでなく、一致するすべてのメーラーを取り込みます。

### メッセージの管理

UI とその基盤となる JSON ルートの両方がクリーンアップに対応しており、テスト実行によってメッセージの山が残った場合に便利です。

| アクション | ルート |
|---|---|
| メッセージ一覧(JSON) | `GET /cbmailservices/log/messages` |
| メッセージを 1 件表示(JSON) | `GET /cbmailservices/log/message/:id` |
| メッセージを 1 件削除 | `DELETE /cbmailservices/log/message/:id` |
| 特定のセットを削除 | `DELETE /cbmailservices/log/messages` を `{ "ids": [...] }` とともに |
| すべて削除 | `DELETE /cbmailservices/log/messages` を `{ "all": true }` とともに |
