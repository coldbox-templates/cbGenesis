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

!!! note "Install the CommandBox CLI module too"
    Once BoxLang is installed, add the CommandBox CLI module so the `box` command is available for dependency management, the server, and migrations:

    ```bash frame="terminal" title="Terminal"
    install-bx-module bx-cli
    ```

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
Installs ColdBox, WireBox/CacheBox/LogBox, TestBox, qb, cbsecurity, cborm, cbmailservices, and every other `box.json` dependency into `lib/`.
:::
::: step "Install Node dependencies"
```bash frame="terminal" title="Terminal"
npm install
```
Pulls in Alpine.js, Bootstrap 5, and Vite for the frontend build.
:::
::: step "Install a JDBC driver"
The template ships pre-configured for MySQL (`bx-mysql`, installed automatically on first server start via `server.json`'s `onServerInitialInstall`). Swap it for another database instead:

```bash frame="terminal" title="Terminal"
box install bx-postgresql   # PostgreSQL
box install bx-mssql        # Microsoft SQL Server
box install bx-h2           # H2 (embedded, dev only)
box install bx-oracle       # Oracle
box install bx-sqlite       # SQLite
```

Then update both `.env` (connection string) and the datasource block in `public/Application.bx`.
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
    `resources/database/seeds/AdminData.bx` creates an **Administrator** role with all 16 built-in permissions, and one admin user:

    | Field | Value |
    |---|---|
    | Email | `admin@cbgenesis.com` |
    | Password | `admin` |

    Change this password immediately after your first login - see the [production checklist](deployment.md#production-checklist).
:::
::: step "Start the server" color="success"
```bash frame="terminal" title="Terminal"
box server start
```
The first run installs the BoxLang modules listed in `server.json` (`bx-esapi`, `bx-password-encrypt`, `bx-mail`, `bx-orm`, `bx-mysql`).
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
