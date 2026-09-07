---
title: Deployment
order: 4
icon: phosphor-duotone:cloud-arrow-up
summary: Production build, Docker, BoxLang MiniServer, and a go-live checklist.
tags: [deployment]
---

# Deployment

## Production build

```bash frame="terminal" title="Terminal"
npm run build
```

Compiles and fingerprints the frontend into `public/includes/` - see [Frontend](guides/frontend.md#vite-configuration).

## Docker

A `Dockerfile` and `docker-compose.yml` live in `resources/docker/`. `box.json` also defines `docker:build`, `docker:run`, `docker:bash`, and `docker:stack` scripts (run them with `box run-script <name>`) as shortcuts for the single-argument commands below - they do not replace the required BoxLang CLI installation for local `box` commands, and are unrelated to `npm run` (there is no `npm run docker:*`).

### Local development with Docker Compose

`resources/docker/docker-compose.yml` runs the app (`ortussolutions/commandbox:boxlang`) alongside a MySQL 8 container, with the whole repo bind-mounted into the app container so host edits apply without a rebuild - no local BoxLang/MySQL install required. Run `docker compose` directly (rather than through the `docker:stack` package script) so multi-word commands like `up -d` pass through correctly:

```bash frame="terminal" title="Terminal"
docker compose -f resources/docker/docker-compose.yml up -d
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box migrate seed
```

Visit `http://127.0.0.1:8080`. MySQL is reachable from the host at `127.0.0.1:3406` (chosen to avoid colliding with a MySQL/MariaDB already running on `3306`); the app container talks to it over the internal Docker network on MySQL's real port, `3306`.

The compose file does not run Vite - start that separately on the host for HMR:

```bash frame="terminal" title="Terminal"
npm install
npm run dev
```

Commented-out PostgreSQL and Azure SQL Edge service blocks are included as a starting point if you swap the default database - update `DB_DRIVER` on `coldbox_app` to match.

```bash frame="terminal" title="Terminal"
docker compose -f resources/docker/docker-compose.yml down
```

### Production image

```bash frame="terminal" title="Terminal"
box run-script docker:build
box run-script docker:run
```

Build the frontend before creating a production image:

```bash
npm run build
```

## BoxLang MiniServer

An alternative to the `bx-cli` development server for running the compiled app directly:

```bash frame="terminal" title="Terminal"
cd my-app
boxlang-miniserver --port 8080 --webroot ./public --dev
```

The MiniServer does not provide `box install`, migrations, or TestBox commands. Use the required [BoxLang CLI](guides/command-line.md) for those tasks.

## Production checklist

::: stepper
::: step "Set the environment"
`ENVIRONMENT=production` and `BOXLANG_DEBUG=false` in `.env`.
:::
::: step "Configure real email"
Point `app/config/modules/cbmailservices.bx` at a real SMTP/Postmark/SendGrid driver - see [Email](guides/email.md#protocol-by-environment).
:::
::: step "Rotate the seeded admin password" color="warning"
The seeder creates `admin@cbgenesis.com` / `test`, flagged as reset-pending. Signing in with it does not grant a session: you are sent straight to the reset-password form and must set a new password first. The bootstrap hash is public (it ships in the repo), so never clear that flag to keep using `test`. See [Getting Started](getting-started.md#scaffold-your-app).
:::
::: step "Decide who may reinit the framework"
`reinitPassword` reads `COLDBOX_REINIT_PASSWORD` from the environment. Leave it **unset** in production and each boot falls back to a fresh random UUID nobody knows, which closes `?fwreinit` entirely. Set it only if you need to reinit a running instance, and treat it as a credential. Setting it to an empty string leaves reinit open to anyone, which is why `development()` does exactly that and production must not.
:::
::: step "Enable HTTPS"
Via SSL configuration in `server.json`, or your reverse proxy / load balancer of choice.
:::
::: step "Build the frontend"
`npm run build` for minified, fingerprinted assets.
:::
::: step "Lock down /healthcheck" color="danger"
Remove or restrict the public `/healthcheck` endpoint if it shouldn't be reachable from outside your infrastructure.
:::
:::

::: cards
::: card title="Configuration" icon="phosphor-duotone:gear-six" href="guides/configuration.md"
Every environment variable and module setting referenced above.
:::
::: card title="Security & Permissions" icon="phosphor-duotone:shield-check" href="guides/security.md"
Double-check the firewall and CSRF configuration before you go live.
:::
:::
