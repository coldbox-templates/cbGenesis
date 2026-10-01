---
title: E-mail
order: 5
icon: phosphor-duotone:envelope
summary: Templates de e-mail baseados em tokens, enviados através do cbmailservices.
tags: [guides, email]
---

# E-mail

Os templates de e-mail utilizam o [cbmailservices](https://coldbox-mailservices.ortusbooks.com) com simples placeholders `@token@`, substituídos no momento do envio:

```html title="app/email_templates/password_verification.bxm" linenums="1"
<h1>Reset Your Password</h1>
<p>Click the link below to reset your password:</p>
<a href="@linkToken@">Reset Password</a>
<p>This link expires @expiration@.</p>
```

Enviado a partir de uma chamada ao serviço:

```boxlang title="Sending a templated email" linenums="1"
mailService.newMail()
    .config( from = "noreply@app.com", to = user.getEmail(), subject = "Reset Password" )
    .setBodyTokens( { linkToken: resetLink, expiration: "in 60 minutes" } )
    .setBodyTemplate( "password_verification" )
    .send();
```

## Templates incluídos

| Template | Enviado quando |
|---|---|
| `user_welcome.bxm` | Uma nova conta é criada |
| `registration_verification.bxm` | Uma nova conta precisa de verificação de e-mail |
| `password_verification.bxm` | É pedida uma ligação de reposição de palavra-passe |
| `password_reset.bxm` | Confirmação após uma alteração de palavra-passe |
| `email_change_confirmation.bxm` | Um utilizador pede uma alteração de e-mail - enviado para o novo endereço, para o confirmar |
| `email_change_notice.bxm` | Um utilizador pede uma alteração de e-mail - enviado para o antigo endereço, como aviso |

## Protocolo por ambiente

!!! note "Protocolo de ficheiros em desenvolvimento"
    Em desenvolvimento, `app/config/modules/cbmailservices.bx` escreve o correio de saída em disco, em vez de o enviar - nada sai da sua máquina enquanto está a construir a aplicação. Configure um fornecedor SMTP real (Postmark, SendGrid, ou SMTP simples) para produção - veja [Implantação](../deployment.md#production-checklist).

## Visualizador de registo de correio (desenvolvimento)

Todo o correio escrito em disco pelo protocolo de ficheiros pode ser consultado em **`/cbmailservices/log`** enquanto a aplicação está em execução em desenvolvimento. É uma página do próprio cbmailservices (não um handler do cbGenesis), que lista cada mensagem enviada com uma pré-visualização renderizada e uma vista do código-fonte em bruto do HTML realmente gerado:

<figure>
    <img src="../assets/screenshots/mail-log.png" alt="The cbMailServices Log viewer, showing a rendered preview of a verification email">
    <figcaption>Pré-visualização - o correio renderizado, exatamente como um destinatário o veria.</figcaption>
</figure>

<figure>
    <img src="../assets/screenshots/mail-log-source.png" alt="The cbMailServices Log viewer's Source tab, showing the raw HTML of a sent email">
    <figcaption>Fonte - o HTML/metadados em bruto que o cbmailservices escreveu em disco.</figcaption>
</figure>

O visualizador só aparece em desenvolvimento: `Log.cfc` verifica `controller.getSetting( "environment" ) == "development"` em cada ação e devolve um 404 caso contrário, pelo que não há nada a desativar antes de implantar.

### Como encontra o seu correio

O serviço de registo não lê uma pasta fixa - inspeciona cada mailer registado na configuração `mailers` de `app/config/modules/cbmailservices.bx`, e lista mensagens de qualquer mailer que utilize o protocolo `File`:

```boxlang title="app/config/modules/cbmailservices.bx" linenums="1"
mailers : {
    "default" : { class : "BXMail" },
    "files" : { class : "File", properties : { filePath : "/app/logs" } }
},
```

O cbGenesis inclui esse mailer `files` por predefinição, e `development()` no mesmo ficheiro muda `defaultProtocol` para `"files"` - pelo que todo o correio que a aplicação envia enquanto `environment` é `development` chega ali automaticamente, sem nada mais a configurar.

Para o apontar para outra pasta, ou adicionar um segundo mailer baseado em ficheiros para testar outra configuração de forma isolada, adicione ou edite uma entrada em `mailers` com `class: "File"` e um `filePath`; o visualizador deteta qualquer mailer correspondente, não só `files`.

### Gerir mensagens

Tanto a interface como as suas rotas JSON subjacentes suportam a limpeza, útil quando uma execução de testes deixa uma pilha de mensagens:

| Ação | Rota |
|---|---|
| Listar mensagens (JSON) | `GET /cbmailservices/log/messages` |
| Ver uma mensagem (JSON) | `GET /cbmailservices/log/message/:id` |
| Eliminar uma mensagem | `DELETE /cbmailservices/log/message/:id` |
| Eliminar um conjunto específico | `DELETE /cbmailservices/log/messages` com `{ "ids": [...] }` |
| Eliminar tudo | `DELETE /cbmailservices/log/messages` com `{ "all": true }` |
