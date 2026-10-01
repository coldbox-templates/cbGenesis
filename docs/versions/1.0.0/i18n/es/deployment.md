---
title: Despliegue
order: 5
icon: phosphor-duotone:cloud-arrow-up
summary: Compilación de producción, Docker, BoxLang MiniServer y una lista de verificación para salir a producción.
tags: [deployment]
---

# Despliegue

## Compilación de producción

```bash frame="terminal" title="Terminal"
npm run build
```

Compila y añade huellas digitales al frontend en `public/includes/` - consulta [Frontend](guides/frontend.md#vite-configuration).

## Docker

Un `Dockerfile` y archivos Compose específicos por base de datos viven en `resources/docker/`. MySQL es el predeterminado; se proveen alternativas de PostgreSQL y MSSQL para los otros destinos probados por CI. MariaDB puede usar la configuración de MySQL y el controlador JDBC `mysql`. `box.json` también define los scripts `docker:build`, `docker:run`, `docker:bash` y `docker:stack` (ejecútalos con `box run-script <name>`) como atajos para los comandos de un solo argumento a continuación - no reemplazan la instalación requerida del CLI de BoxLang para los comandos `box` locales, y no tienen relación con `npm run` (no existe `npm run docker:*`).

### Desarrollo local con Docker Compose

`resources/docker/docker-compose.yml` ejecuta la aplicación (construida desde `resources/docker/Dockerfile.dev`, que instala CommandBox de forma nativa sobre la imagen oficial `ortussolutions/boxlang:cli` para que la versión del motor coincida con `.bvmrc`) junto a un contenedor MySQL 8, con todo el repositorio montado como bind mount en el contenedor de la aplicación para que las ediciones en el host se apliquen sin reconstruir - no se requiere instalación local de BoxLang/MySQL. Ejecuta `docker compose` directamente (en lugar de a través del script del paquete `docker:stack`) para que comandos multi-palabra como `up -d` se pasen correctamente:

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.yml up -d
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box migrate seed run
```

Visita `http://127.0.0.1:8080`. MySQL es accesible desde el host en `127.0.0.1:3406` (elegido para evitar colisiones con un MySQL/MariaDB que ya se esté ejecutando en `3306`); el contenedor de la aplicación se comunica con él a través de la red Docker interna en el puerto real de MySQL, `3306`.

El archivo compose no ejecuta Vite - inícialo por separado en el host para HMR:

```bash frame="terminal" title="Terminal"
npm install
npm run dev
```

También hay disponible un archivo Compose específico para MSSQL para probar contra SQL Server 2022. Instala el controlador `bx-mssql` en el contenedor de la aplicación, crea la base de datos `cbgenesis`, y guarda sus datos bajo `resources/docker/.db/mssql/`:

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.mssql.yml up -d
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box migrate seed run
```

La aplicación sigue disponible en `http://127.0.0.1:8080`; SQL Server es accesible desde el host en `127.0.0.1:1434`. La contraseña `sa` predeterminada está pensada solo para pruebas locales. Establece `MSSQL_SA_PASSWORD` antes de iniciar el stack para sobrescribirla. Detén este stack con:

```bash frame="terminal" title="Terminal"
docker compose -f resources/docker/docker-compose.mssql.yml down
```

La alternativa de PostgreSQL usa PostgreSQL 16, publica el puerto de host `5433`, e instala `bx-postgresql` automáticamente:

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.postgresql.yml up -d
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box migrate seed run
```

El archivo Compose de MySQL predeterminado permanece sin cambios. Detén cualquiera de las alternativas con su archivo Compose correspondiente y `down`.

```bash frame="terminal" title="Terminal"
docker compose -f resources/docker/docker-compose.yml down
```

### Imagen de producción

```bash frame="terminal" title="Terminal"
box run-script docker:build
box run-script docker:run
```

Compila el frontend antes de crear una imagen de producción:

```bash linenums="1"
npm run build
```

## BoxLang MiniServer

Una alternativa al servidor de desarrollo `bx-cli` para ejecutar la aplicación compilada directamente:

```bash frame="terminal" title="Terminal"
cd my-app
boxlang-miniserver --port 8080 --webroot ./public --dev
```

El MiniServer no proporciona `box install`, migraciones ni comandos de TestBox. Usa el [CLI de BoxLang](guides/command-line.md) requerido para esas tareas.

## Lista de verificación para producción

::: stepper
::: step "Configura el entorno"
`ENVIRONMENT=production` y `BOXLANG_DEBUG=false` en `.env`.
:::
::: step "Configura un correo real"
Apunta `app/config/modules/cbmailservices.bx` a un driver SMTP/Postmark/SendGrid real - consulta [Correo electrónico](guides/email.md#protocol-by-environment).
:::
::: step "Rota la contraseña de administrador sembrada" color="warning"
El seeder crea `admin@cbgenesis.com` / `test`, marcado como pendiente de restablecimiento. Iniciar sesión con esa contraseña no otorga una sesión: se te envía directamente al formulario de restablecimiento de contraseña y debes establecer una nueva primero. El hash de arranque es público (viene incluido en el repositorio), así que nunca borres esa marca para seguir usando `test`. Consulta [Primeros pasos](getting-started.md#scaffold-your-app).
:::
::: step "Decide quién puede reiniciar el framework"
`reinitPassword` lee `COLDBOX_REINIT_PASSWORD` del entorno. Déjalo **sin definir** en producción y cada arranque recurrirá a un UUID aleatorio nuevo que nadie conoce, lo que cierra `?fwreinit` por completo. Defínelo solo si necesitas reiniciar una instancia en ejecución, y trátalo como una credencial. Establecerlo como una cadena vacía deja el reinicio abierto para cualquiera, que es exactamente lo que hace `development()`, y producción no debe hacerlo.
:::
::: step "Habilita HTTPS"
Mediante la configuración SSL en `server.json`, o el proxy inverso / balanceador de carga de tu elección.
:::
::: step "Decide si confiar en los encabezados del proxy" color="warning"
`cbTrustProxyHeaders` está **activado** por defecto, coincidiendo con un despliegue típico detrás de un proxy inverso o balanceador de carga. Si la aplicación está directamente expuesta a internet en su lugar, desactívalo - consulta [Desplegando detrás de un proxy inverso](#deploying-behind-a-reverse-proxy). Invertir esto anula la limitación de tasa o la rompe para todos los que están detrás del proxy.
:::
::: step "Actualiza la configuración de relying-party de passkeys" color="warning"
`app/config/modules/cbsecurity-passkeys.bx` viene con marcadores de posición solo para desarrollo (`relyingPartyId: "localhost"`, `allowedOrigins: ["http://localhost:8080"]`). Configúralos a tu dominio real de producción antes de salir a producción, o el registro de passkeys fallará - consulta [Seguridad y permisos](guides/security.md#known-issues).
:::
::: step "Compila el frontend"
`npm run build` para obtener assets minificados y con huella digital.
:::
::: step "Bloquea /healthcheck" color="danger"
Elimina o restringe el endpoint público `/healthcheck` si no debería ser accesible desde fuera de tu infraestructura.
:::
:::

## Desplegando detrás de un proxy inverso

`RateLimiter`, el registro de auditoría, y los correos de seguridad de "restablecimiento solicitado desde IP" leen todos la IP del llamante a través de `getRealIP()` de `cbsecurity`. Esa función tiene dos posibles fuentes para la IP, y solo tú -la persona que despliega esta aplicación- sabes cuál es la correcta para tu configuración:

- **La dirección de socket sin procesar** (`cgi.remote_addr`) - correcta cuando la aplicación está directamente expuesta a internet. Si un proxy inverso está delante, esta es siempre la dirección propia del proxy, no la del visitante.
- **Los encabezados de solicitud `X-Forwarded-For` / `X-Cluster-Client-IP`** - correctos solo cuando algo delante de la aplicación (nginx, un balanceador de carga, un CDN) elimina cualquier valor que envió el cliente y establece el encabezado por sí mismo. Si nada hace eso, cualquier llamante puede establecer este encabezado con cualquier valor, incluyendo uno distinto en cada solicitud.

El ajuste `cbTrustProxyHeaders` (predeterminado `true`, editable en `/settings`) elige entre ambos. Dejarlo activado cuando en realidad no estás detrás de un proxy que sanea el encabezado reabre exactamente el bypass de límite de tasa que existe para cerrar - un llamante puede falsificar un nuevo valor de `X-Forwarded-For` en cada intento de inicio de sesión y nunca ser bloqueado. Desactivarlo cuando *sí* estás detrás de tal proxy hace que todos los visitantes compartan la IP del proxy - un llamante bloqueado bloquea a todos los que están detrás de él, y el registro de auditoría registra la dirección del proxy para cada acción.

Si despliegas directamente expuesto a internet, sin nada delante de la aplicación, desactiva esto. Si despliegas detrás de un proxy inverso, confirma que realmente sobrescribe `X-Forwarded-For` (en lugar de añadir a, o dejar pasar, un valor suministrado por el cliente) antes de dejarlo activado.

::: cards
::: card title="Configuración" icon="phosphor-duotone:gear-six" href="guides/configuration.md"
Cada variable de entorno y ajuste de módulo referenciados arriba.
:::
::: card title="Seguridad y permisos" icon="phosphor-duotone:shield-check" href="guides/security.md"
Vuelve a comprobar el firewall y la configuración de CSRF antes de salir a producción.
:::
:::
