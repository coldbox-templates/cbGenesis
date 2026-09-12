---
title: Getting Started
order: 2
icon: phosphor-duotone:rocket-launch
summary: Install BoxLang, clone the template, configure your database, and open the login screen.
tags: [guides, setup]
---

# Getting Started

## System requirements

- **Java 21+** (JDK or JRE)
- **Node.js 18+** (for the Vite frontend)
- **MySQL 8+** (default - any JDBC-compatible database works)
- macOS, Linux, or Windows

## Install BoxLang

=== "Quick installer"
    ```bash frame="terminal" title="Terminal"
    # macOS & Linux
    /bin/bash -c "$(curl -fsSL https://install.boxlang.io)"

    # ...with automatic Java 21 installation
    curl -fsSL https://install.boxlang.io | bash -s -- --with-jre
    ```

    ```powershell frame="terminal" title="PowerShell (Windows)"
    powershell -NoExit -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://install-windows.boxlang.io'))"
    ```

=== "BVM (version manager)"
    Use [BVM](https://boxlang.ortusbooks.com) instead if you need to switch between multiple BoxLang versions:

    ```bash frame="terminal" title="Terminal"
    curl -fsSL https://install-bvm.boxlang.io | bash

    bvm install latest && bvm use latest
    ```

Verify the install:

```bash frame="terminal" title="Terminal"
boxlang --version
```

!!! danger "Use bx-cli, not regular CommandBox"
    CB Genesis is a BoxLang template. Do not install the standard Lucee-based CommandBox distribution. After installing BoxLang with the quick installer or BVM, install the BoxLang-native CLI module. This is required before running `box install`, `box server`, `box migrate`, or `box testbox`:

    ```bash frame="terminal" title="Terminal"
    install-bx-module bx-cli
    ```

    Verify that the BoxLang CLI is active:

    ```bash frame="terminal" title="Terminal"
    box version
    ```

    Current developers using the Lucee-based CommandBox distribution should clean cached artifacts to ensure they are running the latest versions of the required modules:

    ```bash frame="terminal" title="Terminal"
    box artifacts clean
    ```

    If `box` is not found after installation, restart the terminal or add the directory reported by the installer to your `PATH`.

## Scaffold your app

::: stepper
::: step "Clone the template"
```bash frame="terminal" title="Terminal"
git clone https://github.com/coldbox-templates/cbGenesis my-app
cd my-app
```
:::
::: step "Install BoxLang dependencies"
```bash frame="terminal" title="Terminal"
box install
```
Runs through `bx-cli` and installs ColdBox, WireBox/CacheBox/LogBox, TestBox, qb, cbsecurity, cborm, cbmailservices, and every other `box.json` dependency into `lib/`.
:::
::: step "Install Node dependencies"
```bash frame="terminal" title="Terminal"
npm install
```
Pulls in Alpine.js, Bootstrap 5, and Vite for the frontend build.
:::
::: step "Install a JDBC driver"
The template ships pre-configured for MySQL. `server.json`'s `onServerInitialInstall` installs the JDBC driver module matching your `DB_DRIVER` setting (`bx-${DB_DRIVER}`, defaulting to `bx-mysql`) the first time you run `box server start`. To use another database, set `DB_DRIVER` in `.env` **before** that first server start:

```bash frame="terminal" title="Terminal"
DB_DRIVER=postgresql   # installs bx-postgresql
DB_DRIVER=mssql        # installs bx-mssql (Microsoft SQL Server)
DB_DRIVER=h2           # installs bx-h2 (embedded, dev only)
DB_DRIVER=oracle       # installs bx-oracle
DB_DRIVER=sqlite       # installs bx-sqlite
```

Then update `.env`'s connection details and the datasource block in `public/Application.bx` (and `tests/Application.bx` for the test suite).

??? tip "Switching drivers after the server has already started once"
    `onServerInitialInstall` only fires on a server's first-ever start, so changing `DB_DRIVER` afterward won't reinstall the driver on its own. Run `server forget` (which clears the server's install state) before starting it again so the new driver gets installed:

    ```bash frame="terminal" title="Terminal"
    server forget
    box server start
    ```
:::
::: step "Configure your environment"
```bash frame="terminal" title="Terminal"
cp .env.example .env
```
Edit `.env` with your database credentials - see [Configuration](guides/configuration.md#environment-variables) for what each variable does.
:::
::: step "Migrate and seed the database"
```bash frame="terminal" title="Terminal"
box migrate up
box migrate seed
```

??? tip "What does the seeder create?"
    `resources/database/seeds/AdminData.bx` creates an **Admin** role with all 20 built-in permissions, and one admin user:

    | Field | Value |
    |---|---|
    | Email | `admin@cbgenesis.com` |
    | Password | `test` (reset-pending) |

    This account is seeded as reset-pending, so signing in with `test` does not give you a session - it takes you straight to the reset-password form to choose a real password. That is deliberate: the bootstrap hash ships in this repository and is public. See the [production checklist](deployment.md#production-checklist).
:::
::: step "Start the server" color="success"
```bash frame="terminal" title="Terminal"
box server start
```
This is the BoxLang CLI server command. The first run installs the BoxLang modules listed in `server.json` (`bx-esapi`, `bx-password-encrypt`, `bx-mail`, `bx-orm`, `bx-mysql`, `bx-image`).
:::
::: step "Start Vite (in a second terminal)" color="success"
```bash frame="terminal" title="Terminal"
npm run dev
```
:::
:::

## Open the app

Visit **[http://127.0.0.1:8080](http://127.0.0.1:8080)** - you'll land on the login page. Sign in with the seeded admin credentials above.

::: cards
::: card title="Architecture" icon="phosphor-duotone:tree-structure" href="architecture.md"
See how `public/`, `app/`, `resources/` and `lib/` fit together, and walk the request lifecycle.
:::
::: card title="Security & Permissions" icon="phosphor-duotone:shield-check" href="guides/security.md"
Understand the login flow and the `resource:action` permission model before you add your first protected page.
:::
::: card title="Extending the App" icon="phosphor-duotone:puzzle-piece" href="guides/extending.md"
Ready to build? Start here for the exact steps to add a new CRUD module.
:::
:::
