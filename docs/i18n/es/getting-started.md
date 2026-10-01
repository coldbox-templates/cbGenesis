---
title: Primeros pasos
order: 2
icon: phosphor-duotone:rocket-launch
summary: Instala BoxLang, clona la plantilla, configura tu base de datos y abre la pantalla de inicio de sesión.
tags: [guides, setup]
---

# Primeros pasos

## Requisitos del sistema

- **Java 21+** (JDK o JRE)
- **BoxLang 1.17+**
- **CommandBox 7+** (`bx-cli`)
- **Node.js 22+** (para el frontend con Vite)
- **Una base de datos compatible**: MySQL 8+ (predeterminada), MariaDB, PostgreSQL, SQLite, Oracle o MSSQL
- Cualquier sistema operativo

## Instalar BoxLang

=== "Instalador rápido"

	### macOS y Linux

	```bash frame="terminal" title="Terminal"
	# macOS & Linux
	/bin/bash -c "$(curl -fsSL https://install.boxlang.io)"

	# ...with automatic Java 21 installation
	curl -fsSL https://install.boxlang.io | bash -s -- --with-jre
	```

	### Windows

	```powershell frame="terminal" title="PowerShell (Windows)"
	powershell -NoExit -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://install-windows.boxlang.io'))"
	```

=== "BVM (gestor de versiones)"

	Usa [BVM](https://boxlang.ortusbooks.com) en su lugar si necesitas alternar entre varias versiones de BoxLang:

	```bash frame="terminal" title="Terminal"
	curl -fsSL https://install-bvm.boxlang.io | bash

	bvm install latest && bvm use latest
	```

	Verifica la instalación:

	```bash frame="terminal" title="Terminal"
	boxlang --version
	```

!!! danger "Usa bx-cli, no el CommandBox habitual"
    CBGenesis es una plantilla de BoxLang. No instales la distribución estándar de CommandBox basada en Lucee. Después de instalar BoxLang con el instalador rápido o BVM, instala el módulo CLI nativo de BoxLang. Esto es necesario antes de ejecutar `box install`, `box server`, `box migrate` o `box testbox`:

    ```bash frame="terminal" title="Terminal"
    install-bx-module bx-cli
    ```

    Verifica que el CLI de BoxLang esté activo:

    ```bash frame="terminal" title="Terminal"
    box version
    ```

    Los desarrolladores que ya usan la distribución de CommandBox basada en Lucee deberían limpiar los artefactos en caché para asegurarse de estar ejecutando las últimas versiones de los módulos requeridos:

    ```bash frame="terminal" title="Terminal"
    box artifacts clean
    ```

    Si `box` no se encuentra después de la instalación, reinicia la terminal o añade el directorio que indica el instalador a tu `PATH`.

## Monta el andamiaje de tu aplicación

Entra al shell de CommandBox escribiendo `box` primero:

::: stepper
::: step "Instala el último ColdBox CLI"
```bash frame="terminal" title="Terminal"
install coldbox-cli
```
:::

::: step "Crea la aplicación CBGenesis"
```bash frame="terminal" title="Terminal"
coldbox create app name="my-app" skeleton="cbgenesis"
```
:::

::: step "Instala las dependencias de Node"
```bash frame="terminal" title="Terminal"
!npm install
```
:::

::: step "Actualiza las credenciales y la configuración de la base de datos"
Abre el archivo `.env` en tu editor de texto preferido y actualiza las credenciales de la base de datos según corresponda. La plantilla viene preconfigurada para MySQL. MySQL, MariaDB, PostgreSQL y MSSQL son destinos de base de datos compatibles y probados. `onServerInitialInstall` de `server.json` instala el módulo del controlador JDBC que coincide con tu ajuste `DB_DRIVER` (`bx-${DB_DRIVER}`, predeterminado `bx-mysql`) la primera vez que ejecutas `box server start`. Para usar otra base de datos, establece `DB_DRIVER` en `.env` **antes** de ese primer inicio del servidor
:::

::: step "Migra y siembra"

Una vez configurado tu `.env`, ejecuta los siguientes comandos para inicializar y sembrar la base de datos. Debería descargar automáticamente los controladores necesarios para conectar el CLI a la base de datos configurada. Si hay algún problema de conexión, asegúrate de que el `DB_DRIVER` correcto esté establecido y de que el módulo del controlador JDBC correspondiente esté instalado.

```bash frame="terminal" title="Terminal"
migrate init
migrate up --seed
```

??? tip "¿Qué crea el seeder?"
    `resources/database/seeds/AdminData.bx` crea un rol **Admin** con los 20 permisos incorporados, y un usuario administrador:

    | Campo | Valor |
    |---|---|
    | Correo electrónico | `admin@cbgenesis.com` |
    | Contraseña | `test` (pendiente de restablecimiento) |

    Esta cuenta se siembra como pendiente de restablecimiento, así que iniciar sesión con `test` no te da una sesión: te lleva directamente al formulario de restablecimiento de contraseña para elegir una contraseña real. Esto es deliberado: el hash de arranque viene incluido en este repositorio y es público. Consulta la [lista de verificación de producción](deployment.md#production-checklist).

:::

::: step "Actualiza tus AI Skills"

CBGenesis viene con directrices, skills y archivos de agentes de IA preconfigurados en `.agents/`, de modo que asistentes como GitHub Copilot, Cursor y Claude Code obtienen contexto preciso de ColdBox y BoxLang. Estos son generados por el módulo `coldbox-cli` que instalaste en el paso de andamiaje. Actualízalos después de montar el andamiaje para que las directrices y skills coincidan con tus módulos instalados:

```bash frame="terminal" title="Terminal"
coldbox ai refresh
```

Ejecuta `coldbox ai refresh` de nuevo cada vez que instales, actualices o elimines módulos de CommandBox para que se recojan las directrices y skills específicas de cada módulo.

??? tip "Descubre y gestiona tus integraciones de IA"
    ```bash frame="terminal" title="Terminal"
    coldbox ai --help         # Discover the available AI commands
    coldbox ai info           # Show installed guidelines, skills, agents, and MCP servers
    coldbox ai skills list    # List the available skills
    coldbox ai agents --help  # Add, update, or remove AI agent configuration files
    ```
:::

::: step "Inicia el servidor" color="success"

```bash frame="terminal" title="Terminal"
server start
```

Este es el comando de servidor del CLI de BoxLang. La primera ejecución instala los módulos de BoxLang listados en `server.json` (`bx-esapi`, `bx-password-encrypt`, `bx-mail`, `bx-orm`, el controlador JDBC seleccionado por `DB_DRIVER`, y `bx-image`).

??? tip "Cambiar de controlador después de que el servidor ya se inició una vez"
    `onServerInitialInstall` solo se dispara en el primer arranque de un servidor, así que cambiar `DB_DRIVER` después no reinstalará el controlador por sí solo. Ejecuta `server forget` (que borra el estado de instalación del servidor) antes de volver a iniciarlo para que se instale el nuevo controlador:

    ```bash frame="terminal" title="Terminal"
    server forget
    server start
    ```
:::
::: step "Inicia Vite (en una segunda terminal)" color="success"
```bash frame="terminal" title="Terminal"
npm run dev
```
:::
:::

## Abre la aplicación

Visita **[http://127.0.0.1:8080](http://127.0.0.1:8080)** - llegarás a la página de inicio de sesión. Inicia sesión con las credenciales de administrador sembradas arriba.

<figure>
	<img src="assets/screenshots/login.png" alt="The login screen, using the default AuthSplit layout">
	<figcaption>La pantalla de inicio de sesión usando el diseño <code>AuthSplit</code> predeterminado.</figcaption>
</figure>

Una vez dentro, llegarás al panel de control, con la barra lateral de administración lista para Usuarios, Roles, Permisos, Registro de Auditoría y Configuración:

<figure>
	<img src="assets/screenshots/dashboard.png" alt="The admin dashboard after signing in">
	<figcaption>El panel de administración después de iniciar sesión.</figcaption>
</figure>

::: cards
::: card title="Arquitectura" icon="phosphor-duotone:tree-structure" href="architecture.md"
Descubre cómo encajan entre sí `public/`, `app/`, `resources/` y `lib/`, y recorre el ciclo de vida de una solicitud.
:::
::: card title="Seguridad y permisos" icon="phosphor-duotone:shield-check" href="guides/security.md"
Comprende el flujo de inicio de sesión y el modelo de permisos `resource:action` antes de agregar tu primera página protegida.
:::
::: card title="Extendiendo la aplicación" icon="phosphor-duotone:puzzle-piece" href="guides/extending.md"
¿Listo para construir? Empieza aquí para conocer los pasos exactos para agregar un nuevo módulo CRUD.
:::
:::
