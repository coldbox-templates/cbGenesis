---
title: Ajustes de la aplicación
order: 2
icon: phosphor-duotone:sliders
summary: Los ajustes respaldados por base de datos y editables por un administrador, definidos en SettingService.static.DEFAULTS.
tags: [reference, configuration, settings]
---

# Ajustes de la aplicación

Estos viven en `SettingService.static.DEFAULTS`, se siembran al arrancar mediante `preFlightCheck()`, se cachean con un TTL de 2 horas, y son editables en `/settings` por cualquiera con el permiso `settings:write` (o `settings:admin`) — consulta [Configuración](../guides/configuration.md#app-settings-vs-framework-config).

<figure>
	<img src="../assets/screenshots/settings.png" alt="The Global Settings admin page">
	<figcaption>La página de administración de Configuración Global.</figcaption>
</figure>

## Autenticación y registro

| Ajuste | Propósito |
|---|---|
| `cbLoginLayout` | Layout usado para las páginas de autenticación (`AuthSplit` por defecto; elige `AuthCenter` o `AuthSplit`) |
| `cbAllowRegistration` | Habilita/deshabilita el registro de autoservicio |
| `cbAllowForgotPassword` | Habilita/deshabilita el flujo de contraseña olvidada |
| `cbAllowRememberMe` | Habilita/deshabilita la cookie de "recordarme" |
| `cbRememberMeDays` | Cuánto tiempo permanece válido un token de recordarme (predeterminado: `14`) |
| `cbRequirePasskey` | Fuerza el registro de passkey antes de llegar al área de administración |

### Selección del layout de inicio de sesión

La página **Configuración** expone `cbLoginLayout` como un selector:

| Valor | Layout | Apariencia |
|---|---|---|
| `AuthSplit` | `app/layouts/AuthSplit.bxm` | Inicio de sesión de dos paneles: marca/características a la izquierda y el formulario a la derecha. En pantallas pequeñas se colapsa al formulario con marca compacta. Este es el predeterminado. |
| `AuthCenter` | `app/layouts/AuthCenter.bxm` | Tarjeta de autenticación centrada con el logo, el formulario, y el pie de autenticación. |

Selecciona **Auth Center** o **Auth Split** en `/settings`, guarda los ajustes, y recarga la página de autenticación. El handler llama a `event.setLayout( prc.settings.cbLoginLayout )`, así que el layout seleccionado se aplica a las páginas de inicio de sesión, registro, activación de invitación, y recuperación de contraseña. También puedes establecer el valor en la base de datos o agregar un nombre de layout personalizado bajo `app/layouts/` si tu aplicación provee ese layout.

## Política de contraseñas y tokens

| Ajuste | Propósito |
|---|---|
| `cbMinPasswordLength` | Longitud mínima de la contraseña (predeterminado: `8`). `SettingService.isValidPassword()` también requiere una letra mayúscula, una letra minúscula, un dígito, y un carácter especial, y cada ruta del lado del servidor que establece una contraseña (registro, activación de invitación, restablecimiento, y cambio de perfil) la ejecuta |
| `cbPasswordResetExpiration` | Validez del token de restablecimiento, en minutos (predeterminado: `60`) |
| `cbInvitationExpiration` | Validez del token de invitación, en días (predeterminado: `7`) |
| `cbRegistrationVerificationExpiration` | Validez del token de verificación de registro, en horas (predeterminado: `24`) |
| `cbApiTokenMaxValidityMonths` | Vida máxima con la que se puede emitir un token de API (predeterminado: `12`) |
| `cbAuditLogRetentionDays` | Antigüedad, en días, a la que la tarea programada diaria elimina permanentemente las entradas del registro de auditoría (predeterminado: `90`). `0` desactiva la purga - consulta [Tareas programadas](../architecture.md#scheduled-tasks) |
| `cbRateLimitMaxAttempts` | Intentos permitidos por IP, por endpoint, antes de que `RateLimiter` bloquee el inicio de sesión/registro/restablecimiento de contraseña (predeterminado: `5`) - consulta [Limitación de tasa](../guides/security.md#rate-limiting) |
| `cbRateLimitWindowSeconds` | Ventana de límite de tasa, en segundos (predeterminado: `300`). `0` desactiva la limitación de tasa por completo |
| `cbTrustProxyHeaders` | Si `RateLimiter`, el registro de auditoría, y los correos de seguridad confían en los encabezados `X-Forwarded-For`/`X-Cluster-Client-IP` para la IP del llamante (predeterminado: `true`, ya que esta aplicación se despliega típicamente detrás de un proxy inverso o balanceador de carga). Desactiva esto solo si la aplicación está directamente expuesta a internet sin nada delante de ella - consulta [Despliegue detrás de un proxy](../deployment.md#deploying-behind-a-reverse-proxy) |
| `cbEncryptionKey` / `cbSaltingKey` | Claves de cifrado/salting usadas por la capa de seguridad |

## Marca y apariencia

| Ajuste | Propósito |
|---|---|
| `cbAppName` | Nombre visible de la aplicación |
| `cbAppLogo` | Logo mostrado en la barra lateral de administración. Ya sea una URL introducida manualmente, o `/branding/logo/lg` después de una subida vía Configuración — consulta [Avatares y logo de marca](../guides/frontend.md#avatars-branding-logo) |
| `cbAppTagline` | Eslogan mostrado junto al logo |
| `cbAppBrandTagline` | Etiqueta de marca corta mostrada en el área de marca de la barra lateral |
| `cbCopyrightNotice` | Texto de copyright renderizado por el pie de página de la aplicación |
| `cbDefaultTheme` | Tema claro/oscuro predeterminado para nuevos visitantes |

## Correo electrónico

| Ajuste | Propósito |
|---|---|
| `cbDefaultEmail` | Dirección "de" predeterminada para el correo saliente |
| `cbMailHost` / `cbMailPort` | Host/puerto SMTP |
| `cbMailUsername` / `cbMailPassword` | Credenciales SMTP |
| `cbMailTLS` / `cbMailSSL` | Indicadores de seguridad del transporte |

## Registro de auditoría

| Ajuste | Propósito |
|---|---|
| `cbAuditLogRetentionDays` | Número de días que se conservan los registros de auditoría mediante la purga programada. Establece `0` para desactivar la purga automática (predeterminado: `90`). |

## Secretos y cifrado

| Ajuste | Propósito |
|---|---|
| `cbEncryptionKey` | Secreto de cifrado AES usado por la capa de seguridad/almacenamiento. Reemplaza el valor de desarrollo generado por un secreto estable en producción. |
| `cbSaltingKey` | Salt usado por las operaciones de seguridad. Mantenlo estable y en secreto en producción. |

::: page-link href="../guides/configuration.md"
:::

::: page-link href="../guides/extending.md"
:::
