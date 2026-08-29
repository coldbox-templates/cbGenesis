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

A `Dockerfile` and `docker-compose.yml` live in `resources/docker/`. The `docker:*` package scripts run Docker directly; they do not replace the required BoxLang CLI installation for local `box` commands.

```bash frame="terminal" title="Terminal"
npm run docker:build
npm run docker:stack -- up -d
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
The seeder creates `admin@cbgenesis.com` / `test` - change it immediately after your first login. See [Getting Started](getting-started.md#scaffold-your-app).
:::
::: step "Set a strong reinitPassword"
In `app/config/Coldbox.bx`, so framework reinit (`?fwreinit=true`) isn't left open to anyone.
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
