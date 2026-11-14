---
title: CLI de BoxLang
order: 0
icon: phosphor-duotone:terminal-window
summary: Instala BoxLang y usa el flujo de trabajo nativo bx-cli de BoxLang para dependencias, servidores, migraciones y pruebas.
tags: [guides, setup, cli, boxlang]
---

# CLI de BoxLang

CBGenesis es una aplicación BoxLang. Sus comandos `box` deben ser provistos por el módulo nativo de BoxLang `bx-cli`. La distribución habitual de CommandBox basada en Lucee no es compatible con esta plantilla.

## Instalación requerida

Instala BoxLang con el instalador rápido o BVM, luego instala `bx-cli`:

=== "Instalador rápido"
    ```bash linenums="1"
    /bin/bash -c "$(curl -fsSL https://install.boxlang.io)"
    ```

    Para instalar con un runtime de Java 21 cuando Java aún no está disponible:

    ```bash linenums="1"
    curl -fsSL https://install.boxlang.io | bash -s -- --with-jre
    ```

=== "BVM"
    ```bash linenums="1"
    curl -fsSL https://install-bvm.boxlang.io | bash
    bvm install latest
    bvm use latest
    ```

Una vez que BoxLang esté disponible, instala el módulo CLI:

```bash linenums="1"
install-bx-module bx-cli
box version
```

Reinicia la terminal si `box` no se encuentra inmediatamente después de la instalación. No instales el ejecutable estándar de CommandBox de Lucee junto a este flujo de trabajo; puede provocar que se seleccionen el runtime y los módulos de comandos incorrectos.

## Comandos diarios

Ejecuta estos desde la raíz del proyecto. Todos son ejecutados por `bx-cli`:

| Comando | Propósito |
|---|---|
| `box install` | Instala las dependencias de `box.json` en `lib/` |
| `box server start` | Inicia el servidor web de BoxLang en el puerto `8080` |
| `box server stop` | Detiene el servidor del proyecto |
| `box migrate up` | Aplica las migraciones de base de datos pendientes |
| `box migrate down` | Revierte el lote de migración más reciente |
| `box migrate reset` | Revierte todas las migraciones y las vuelve a aplicar |
| `box migrate seed run` | Ejecuta los datos semilla: el rol `Admin`, sus 20 permisos, y el usuario administrador pendiente de restablecimiento |
| `box testbox run` | Ejecuta la suite de TestBox - consulta [Pruebas](testing.md#running-tests) para filtrar |
| `box task run path/to/task.cfc` | Ejecuta una tarea de CommandBox a través de `bx-cli` |
| `box coldbox ai refresh` | Sincroniza las directrices y skills de IA en `.agents/` con tus módulos instalados |
| `box run-script format` | Formatea el código fuente de BoxLang (`app/`, `tests/specs/`, `*.bx` en la raíz) |
| `box run-script format:check` | Verifica el formato sin escribir cambios |

El frontend usa Node.js por separado:

```bash linenums="1"
npm install
npm run dev
npm run build
npm run lint
npm run lint:scss
```

## Secuencia de primera ejecución

```bash linenums="1"
install-bx-module bx-cli
box install
npm install
cp .env.example .env
box migrate up
box migrate seed run
box server start
npm run dev
```

El servidor usa `server.json` para seleccionar `boxlang@1`, el webroot `public/`, el puerto `8080`, y los módulos de BoxLang instalados en el primer arranque. Consulta [Primeros pasos](../getting-started.md) para la configuración de la base de datos y [Configuración](configuration.md) para las variables de entorno.

## Solución de problemas

- **`box: command not found`**: confirma que BoxLang está instalado, reinicia la terminal, y asegúrate de que el directorio del instalador esté en `PATH`.
- **Mensajes de Lucee o del motor CFML**: se está usando el ejecutable habitual de CommandBox. Elimínalo de `PATH`, reinstala BoxLang, y ejecuta `install-bx-module bx-cli`.
- **Faltan comandos del proyecto**: ejecuta `box version` desde la raíz del proyecto y luego `box install` para que las dependencias en `box.json` estén disponibles.
- **Errores de conexión a la base de datos**: verifica `.env`, asegúrate de que la base de datos exista, e instala/inicia el controlador JDBC a través de la configuración del servidor de BoxLang.
