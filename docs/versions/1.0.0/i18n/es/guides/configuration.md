---
title: Configuración
order: 7
icon: phosphor-duotone:gear-six
summary: Variables de entorno, ajustes del framework y configuración por módulo.
tags: [guides, configuration]
---

# Configuración

## Variables de entorno

Copia `.env.example` a `.env` y completa tus propios valores - se leen desde cualquier parte de la aplicación mediante `getSystemSetting( "VAR_NAME", "default" )`:

| Variable | Propósito |
|---|---|
| `APPNAME` | Nombre visible de la aplicación |
| `ENVIRONMENT` | `development` o `production` |
| `ASSET_URL` | Prefijo de URL pública para los assets de producción de Vite (predeterminado `/includes`) |
| `BOXLANG_DEBUG` | Habilita la salida de depuración de BoxLang |
| `DB_CONNECTIONSTRING` | Cadena de conexión JDBC completa |
| `DB_DRIVER` | Controlador de base de datos, en minúsculas, que coincide con un módulo de controlador JDBC `bx-*` (`mysql` para MySQL o MariaDB, `mssql`, `postgresql`, `h2`, `oracle`, `sqlite`) - `onServerInitialInstall` de `server.json` instala `bx-${DB_DRIVER}` en el primer arranque del servidor |
| `DB_HOST` / `DB_PORT` / `DB_DATABASE` | Detalles de conexión a la base de datos |
| `DB_SCHEMA` | Esquema al que apunta el ejecutor de migraciones (`.cbmigrations.json`); déjalo en blanco para motores sin esquema |
| `DB_USER` / `DB_PASSWORD` | Credenciales de la base de datos |
| `JWT_SECRET` | Clave de firma para el soporte de JWT de `cbsecurity` |
| `COOKIE_ENCRYPTION_KEY` | Clave de cifrado para el almacenamiento de cookies de `cbstorages`. Solo importa una vez que `useEncryption` está activado (desactivado por defecto) - configúrala antes de hacerlo, o la clave se regenera en cada arranque e invalida silenciosamente las cookies previamente cifradas |
| `CBFS_ASSETS_DISK_PATH` | Ruta del sistema de archivos para el disco `assets` de cbfs que almacena los avatares y el logo de marca (predeterminado `<app-root>/.cbfs`) |
| `COLDBOX_REINIT_PASSWORD` | Contraseña requerida por `?fwreinit`. Si no se define significa un valor aleatorio nuevo por arranque, de modo que el reinicio queda cerrado - consulta [Despliegue](../deployment.md#production-checklist) |
| `COLDBOX_SESSION_TIMEOUT` | Tiempo de espera de la caché de sesión, en minutos, para el almacenamiento de sesión de `cbstorages` (predeterminado `60`) |

## Ajustes del framework (`app/config/Coldbox.bx`)

| Ajuste | Valor |
|---|---|
| `defaultEvent` | `Auth.login` — los visitantes no autenticados llegan a la página de inicio de sesión |
| `requestStartHandler` | `Main.onRequestStart` |
| `applicationStartHandler` | `Main.onAppInit` |
| `exceptionHandler` | `Main.onException` |
| `modulesExternalLocation` | `["/modules"]` |
| `autoMapModels` | `true` |
| `jsonPayloadToRC` | `true` |
| `reinitPassword` | `COLDBOX_REINIT_PASSWORD`, o un UUID aleatorio nuevo por arranque cuando no está definido |

Un override del entorno `development()` habilita la plantilla de errores de Whoops, la recarga de singletons de WireBox, el modo de depuración de ColdBox, y borra `reinitPassword` para que `?fwreinit=1` funcione localmente sin necesitar uno. LogBox está configurado con un appender de consola más un appender de archivo rotativo que escribe en `app/logs`.

## Ajustes de la aplicación frente a la configuración del framework

Dos cosas distintas viven ambas bajo `app/config/`, y es fácil confundirlas:

::: columns
::: column
**Configuración del framework** (`Coldbox.bx`, `Router.bx`, `WireBox.bx`, `CacheBox.bx`, `Scheduler.bx`) es estática, basada en archivos, y los cambios surten efecto en el siguiente `?fwreinit`.
:::
::: column
**Ajustes de la aplicación** (`cbAppName`, `cbAllowRegistration`, `cbMinPasswordLength`, ...) están respaldados por base de datos, son editables por un administrador en `/settings`, se definen en `SettingService.static.DEFAULTS`, y se cachean con un TTL de 2 horas.
:::
:::

`SettingService.preFlightCheck()` (llamado desde `Main.onAppInit`) siembra en la base de datos, al arrancar, cualquier valor predeterminado que falte, así que agregar una nueva clave a `DEFAULTS` es suficiente para que aparezca. Un ajuste también puede sobrescribirse de otras dos maneras, ambas leídas por `loadConfigOverrides()`/`loadEnvironmentOverrides()`:

- Cualquier clave con prefijo `cb*` colocada en `variables.settings` de `Coldbox.bx`
- Cualquier variable de entorno con prefijo `genesis_*`

## Configuración de módulos

Cada módulo instalado tiene su propio archivo de ajustes bajo `app/config/modules/`:

| Módulo | Ajustes clave |
|---|---|
| **cbsecurity** | Proveedor de cbauth, CSRF (rotativo, 30 min), firewall con escaneo de anotaciones `@secured`, encabezados de seguridad, JWT (HS512, 60 min) — consulta [Seguridad y permisos](security.md) |
| **cbauth** | `UserService` como proveedor de identidad, almacenamiento de sesión basado en caché |
| **cbmailservices** | Protocolo BXMail en producción, protocolo de archivos en desarrollo — consulta [Correo electrónico](email.md) |
| **cborm** | Inyección de entidades habilitada, paginación `maxRows: 25` / `maxRowsLimit: 500` |
| **cbfs** | Disco `assets` (proveedor `Local` por defecto, ruta desde `CBFS_ASSETS_DISK_PATH`) - almacena avatares y el logo de marca, transmitido por `Assets.bx` — consulta [Frontend](frontend.md#avatars-branding-logo) |
| **cbstorages** | Almacenamiento en caché (caché de sesiones, tiempo de espera desde `COLDBOX_SESSION_TIMEOUT`, predeterminado 60 min), almacenamiento de cookies (cifrado desactivado por defecto) |
| **cbsecurity-passkeys** | Configuración de relying-party WebAuthn para el inicio de sesión con passkey - `relyingPartyId`/`allowedOrigins` son valores de marcador de posición `localhost` que **debes** cambiar antes de producción, consulta [Despliegue](../deployment.md#production-checklist) |
| **mementifier** | Fechas ISO8601, auto-inclusiones de ORM, conversión a UTC |

::: cards
::: card title="Seguridad y permisos" icon="phosphor-duotone:shield-check" href="security.md"
La configuración completa del firewall de cbsecurity, en contexto.
:::
::: card title="Despliegue" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Cuáles de estos ajustes realmente importan para salir a producción.
:::
:::
