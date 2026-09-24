# CBGenesis

![alt text](public/includes/images/cbgenesis-icon-full.svg)

A production-ready ColdBox HMVC starter for the [BoxLang](https://boxlang.io) language - authentication, SSO, RBAC permissions, API tokens, rate limiting, an Alpine-powered admin panel, and a real test suite, so you spend day one building features instead of scaffolding.


## What You Get

- **[Auth & RBAC, Batteries Included](https://cbgenesis.coldbox.org/guides/security/)** - Session auth via cbauth, `@secured` handler annotations, CSRF rotation, JWT support, and a `resource:action` permission model with roles and permissions admin screens.
- **[Single Sign-On](https://cbgenesis.coldbox.org/guides/security/#single-sign-on)** - cbSSO with a shipped Google OAuth provider (More included), account linking, auto-provisioning by allowed email domain, and full audit trail integration.
- **[Passkeys / WebAuthn](https://cbgenesis.coldbox.org/guides/security/)** - Passwordless sign-in backed by `cbsecurity-passkeys`, with an optional policy that requires a passkey before a user can proceed.
- **[Modern Template Structure](https://cbgenesis.coldbox.org/architecture/)** - Application code lives in `app/`, fully separated from the public webroot in `public/` - enhanced security by default.
- **[Hibernate ORM + qb](https://cbgenesis.coldbox.org/guides/database-orm/)** - `BaseEntity`/`BaseService` conventions on top of cborm, migrations and seed data via cfmigrations, and qb for anything raw SQL does better.
- **[Alpine.js + Bootstrap 5 UI](https://cbgenesis.coldbox.org/guides/frontend/)** - Server-rendered BXM views, small Alpine.js components, light/dark theme switching, and a Vite-compiled SCSS/JS pipeline with HMR.
- **[Audit Log & Rate Limiting](https://cbgenesis.coldbox.org/guides/security/#rate-limiting)** - Every sign-in, sign-out, and authorization failure is written to a searchable audit trail; an IP-based rate limiter throttles login, registration, and password-reset abuse.
- **[API Tokens](https://cbgenesis.coldbox.org/reference/routes/)** - Per-user, hashed personal access tokens with expiration and a scheduled purge job, ready for programmatic API access.
- **[Email Workflows](https://cbgenesis.coldbox.org/guides/email/)** - cbMailServices-powered templates for password reset, email verification, invitations, and welcome messages.
- **[A Real Test Suite](https://cbgenesis.coldbox.org/guides/testing/)** - TestBox unit specs for every entity and service, plus integration specs that exercise real HTTP requests.
- **[Production Ready](https://cbgenesis.coldbox.org/deployment/)** - A real go-live checklist, Docker support (app + MySQL/PostgreSQL/MSSQL), and a choice of CommandBox or the BoxLang MiniServer.

## Documentation

Full documentation lives here:

- https://cbgenesis.coldbox.org/

## Requirements

- BoxLang 1.17+ (with `bx-cli`)
- Node.js 22+
- ColdBox 8.2+
- MySQL/PostgreSQL/MSSQL/SQLite/Oracle/MariaDB

## Quick Start

Easily get started with the cbGenesis template by following these 5 steps:

### 1. BoxLang & CommandBox (`bx-cli`)

Install BoxLang into your operating system using our [Quick Installer](https://boxlang.ortusbooks.com/getting-started/installation/boxlang-quick-installer) or the [BoxLang Version Manager](https://boxlang.ortusbooks.com/getting-started/installation/boxlang-version-manager-bvm) (BVM).  Once installed, you can proceed with adding the BoxLang-native CommandBox CLI module.

> **Warning**: Make sure you have the BoxLang-native CommandBox CLI installed, as the regular Lucee CommandBox is not supported.

```bash
# Install CommandBox
install-bx-module bx-cli
# Install the ColdBox CLI Module
box install coldbox-cli
```

This installs the BoxLang-native CommandBox CLI module and the ColdBox CLI module, allowing you to use the `box` commands specific to BoxLang.

### 2. Node.js

This template requires Vite and UI elements that require Node.js 22+ to build and run properly.  So make sure you have [Node.js 22+](https://nodejs.org/en/download) installed on your system.

### 3. Scaffold the Project

Use the `coldbox-cli` to scaffold a new project.

```bash
box coldbox create app name="my-app" skeleton="cbgenesis"
```

### 3. Install Dependencies

```bash
# Install BoxLang Dependencies
box install
# Install Node.js Dependencies
npm install
```

### 4. Database Setup

Configure your database connection in the `.env` file and run the necessary migrations to set up the database schema.

```bash
box migrate up
box migrate seed
```

### 5. Start the Server

```bash
box server start
```

## License

Apache 2.0 License

## Issues

You can report issues and bugs related to this project on the [GitHub Issues](https://github.com/coldbox-templates/cbGenesis/issues) page.

## ❤️ Support Us

You can support the development of this project by [starring](https://github.com/coldbox-templates/cbGenesis) the repository on GitHub, contributing to the codebase, or providing financial support through platforms like [Patreon](https://www.patreon.com/ortussolutions) or purchasing a [BoxLang license](https://boxlang.io/plans). Your support helps us maintain and improve the project for the community.
