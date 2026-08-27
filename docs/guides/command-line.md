---
title: BoxLang CLI
order: 0
icon: phosphor-duotone:terminal-window
summary: Install BoxLang and use the BoxLang-native bx-cli workflow for dependencies, servers, migrations, and tests.
tags: [guides, setup, cli, boxlang]
---

# BoxLang CLI

CB Genesis is a BoxLang application. Its `box` commands must be provided by the BoxLang-native `bx-cli` module. The regular Lucee-based CommandBox distribution is not supported for this template.

## Required installation

Install BoxLang with either the quick installer or BVM, then install `bx-cli`:

=== "Quick installer"
    ```bash
    /bin/bash -c "$(curl -fsSL https://install.boxlang.io)"
    ```

    To install with a Java 21 runtime when Java is not already available:

    ```bash
    curl -fsSL https://install.boxlang.io | bash -s -- --with-jre
    ```

=== "BVM"
    ```bash
    curl -fsSL https://install-bvm.boxlang.io | bash
    bvm install latest
    bvm use latest
    ```

After BoxLang is available, install the CLI module:

```bash
install-bx-module bx-cli
box version
```

Restart the terminal if `box` is not found immediately after installation. Do not install the standard Lucee CommandBox executable alongside this workflow; it can cause the wrong runtime and command modules to be selected.

## Daily commands

Run these from the project root. They are all executed by `bx-cli`:

| Command | Purpose |
|---|---|
| `box install` | Install `box.json` dependencies into `lib/` |
| `box server start` | Start the BoxLang web server on port `8080` |
| `box server stop` | Stop the project server |
| `box migrate up` | Apply pending database migrations |
| `box migrate down` | Roll back the most recent migration batch |
| `box migrate reset` | Roll back all migrations and apply them again |
| `box migrate seed` | Run seed data, including the initial Administrator user |
| `box testbox run` | Run the TestBox suite |
| `box task run path/to/task.cfc` | Run a CommandBox task through `bx-cli` |
| `box format --source app/,tests/specs/,*.bx` | Format BoxLang source |

The frontend uses Node.js separately:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run lint:scss
```

## First-run sequence

```bash
install-bx-module bx-cli
box install
npm install
cp .env.example .env
box migrate up
box migrate seed
box server start
npm run dev
```

The server uses `server.json` to select `boxlang@1`, the `public/` webroot, port `8080`, and the BoxLang modules installed on first startup. See [Getting Started](../getting-started.md) for database setup and [Configuration](configuration.md) for environment variables.

## Troubleshooting

- **`box: command not found`**: confirm BoxLang is installed, restart the terminal, and ensure the installer directory is on `PATH`.
- **Lucee or CFML engine messages**: the regular CommandBox executable is being used. Remove it from `PATH`, reinstall BoxLang, and run `install-bx-module bx-cli`.
- **Missing project commands**: run `box version` from the project root and then `box install` so the dependencies in `box.json` are available.
- **Database connection errors**: verify `.env`, ensure the database exists, and install/start the JDBC driver through the BoxLang server configuration.
