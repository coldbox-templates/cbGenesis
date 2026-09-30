---
title: Correo electrónico
order: 5
icon: phosphor-duotone:envelope
summary: Plantillas de correo electrónico basadas en tokens, enviadas a través de cbmailservices.
tags: [guides, email]
---

# Correo electrónico

Las plantillas de correo electrónico usan [cbmailservices](https://coldbox-mailservices.ortusbooks.com) con simples marcadores de posición `@token@`, reemplazados en el momento del envío:

```html title="app/email_templates/password_verification.bxm" linenums="1"
<h1>Reset Your Password</h1>
<p>Click the link below to reset your password:</p>
<a href="@linkToken@">Reset Password</a>
<p>This link expires @expiration@.</p>
```

Enviado desde una llamada a servicio:

```boxlang title="Sending a templated email" linenums="1"
mailService.newMail()
    .config( from = "noreply@app.com", to = user.getEmail(), subject = "Reset Password" )
    .setBodyTokens( { linkToken: resetLink, expiration: "in 60 minutes" } )
    .setBodyTemplate( "password_verification" )
    .send();
```

## Plantillas incluidas

| Plantilla | Se envía cuando |
|---|---|
| `user_welcome.bxm` | Se crea una nueva cuenta |
| `registration_verification.bxm` | Una nueva cuenta necesita verificación de correo electrónico |
| `password_verification.bxm` | Se solicita un enlace de restablecimiento de contraseña |
| `password_reset.bxm` | Confirmación después de un cambio de contraseña |
| `email_change_confirmation.bxm` | Un usuario solicita un cambio de correo electrónico - se envía a la nueva dirección para confirmarlo |
| `email_change_notice.bxm` | Un usuario solicita un cambio de correo electrónico - se envía a la dirección antigua como aviso |

## Protocolo por entorno

!!! note "Protocolo de archivos en desarrollo"
    En desarrollo, `app/config/modules/cbmailservices.bx` escribe el correo saliente en disco en lugar de enviarlo - nada sale de tu máquina mientras estás construyendo. Configura un proveedor SMTP real (Postmark, SendGrid, o SMTP simple) para producción - consulta [Despliegue](../deployment.md#production-checklist).
