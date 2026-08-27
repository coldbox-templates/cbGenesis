---
title: Email
order: 5
icon: phosphor-duotone:envelope
summary: Token-based email templates sent through cbmailservices.
tags: [guides, email]
---

# Email

Email templates use [cbmailservices](https://coldbox-mailservices.ortusbooks.com) with simple `@token@` placeholders, replaced at send time:

```html title="app/email_templates/password_verification.bxm"
<h1>Reset Your Password</h1>
<p>Click the link below to reset your password:</p>
<a href="@linkToken@">Reset Password</a>
<p>This link expires @expiration@.</p>
```

Sent from a service call:

```boxlang title="Sending a templated email" linenums="1"
mailService.newMail()
    .config( from = "noreply@app.com", to = user.getEmail(), subject = "Reset Password" )
    .setBodyTokens( { linkToken: resetLink, expiration: "in 60 minutes" } )
    .setBodyTemplate( "password_verification" )
    .send();
```

## Templates shipped

| Template | Sent when |
|---|---|
| `user_welcome.bxm` | A new account is created |
| `password_verification.bxm` | A password-reset link is requested |
| `password_reset.bxm` | Confirmation after a password change |

## Protocol by environment

!!! note "Files protocol in development"
    In development, `app/config/modules/cbmailservices.bx` writes outgoing mail to disk instead of sending it - nothing leaves your machine while you're building. Configure a real SMTP provider (Postmark, SendGrid, or plain SMTP) for production - see [Deployment](../deployment.md#production-checklist).
