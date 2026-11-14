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

## Visor de registro de correo (desarrollo)

Todo correo escrito en disco por el protocolo de archivos se puede examinar en **`/cbmailservices/log`** mientras la aplicación se ejecuta en desarrollo. Es una página del propio cbmailservices (no un handler de cbGenesis), que lista cada mensaje enviado con una vista previa renderizada y una vista de código fuente sin procesar del HTML realmente generado:

<figure>
    <img src="../assets/screenshots/mail-log.png" alt="The cbMailServices Log viewer, showing a rendered preview of a verification email">
    <figcaption>Vista previa - el correo renderizado, tal como lo vería un destinatario.</figcaption>
</figure>

<figure>
    <img src="../assets/screenshots/mail-log-source.png" alt="The cbMailServices Log viewer's Source tab, showing the raw HTML of a sent email">
    <figcaption>Fuente - el HTML/metadatos sin procesar que cbmailservices escribió en disco.</figcaption>
</figure>

El visor solo aparece en desarrollo: `Log.cfc` comprueba `controller.getSetting( "environment" ) == "development"` en cada acción y devuelve un 404 en caso contrario, así que no hay nada que desactivar antes de desplegar.

### Cómo encuentra tu correo

El servicio de registro no lee una carpeta fija - inspecciona cada mailer registrado en la configuración `mailers` de `app/config/modules/cbmailservices.bx`, y lista mensajes de cualquier mailer que use el protocolo `File`:

```boxlang title="app/config/modules/cbmailservices.bx" linenums="1"
mailers : {
    "default" : { class : "BXMail" },
    "files" : { class : "File", properties : { filePath : "/app/logs" } }
},
```

cbGenesis incluye ese mailer `files` de forma predeterminada, y `development()` en el mismo archivo cambia `defaultProtocol` a `"files"` - así que todo correo que la aplicación envía mientras `environment` es `development` llega ahí automáticamente, sin nada más que configurar.

Para apuntarlo a otra carpeta, o añadir un segundo mailer basado en archivos para probar otra configuración de forma aislada, añade o edita una entrada bajo `mailers` con `class: "File"` y un `filePath`; el visor detecta cualquier mailer que coincida, no solo `files`.

### Gestión de mensajes

Tanto la interfaz como sus rutas JSON subyacentes admiten la limpieza, útil cuando una ejecución de pruebas deja un montón de mensajes:

| Acción | Ruta |
|---|---|
| Listar mensajes (JSON) | `GET /cbmailservices/log/messages` |
| Ver un mensaje (JSON) | `GET /cbmailservices/log/message/:id` |
| Eliminar un mensaje | `DELETE /cbmailservices/log/message/:id` |
| Eliminar un conjunto específico | `DELETE /cbmailservices/log/messages` con `{ "ids": [...] }` |
| Eliminar todo | `DELETE /cbmailservices/log/messages` con `{ "all": true }` |
