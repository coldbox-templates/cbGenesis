# CB Genesis

A production-ready ColdBox starter template for [BoxLang](https://boxlang.io).

## What You Get

- **[Auth & RBAC, Batteries Included](https://cbgenesis.coldbox.org/guides/security/)** - Session auth via cbauth, `@secured` handler annotations, CSRF rotation, JWT support, and a `resource:action` permission model with roles and permissions admin screens.
- **[Single Sign-On](https://cbgenesis.coldbox.org/guides/security/#single-sign-on)** - cbSSO with a shipped Google OAuth provider, account linking, auto-provisioning by allowed email domain, and full audit trail integration.
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

## Quick Start

> **Required CLI:** This template runs on BoxLang. Do not install or use the regular Lucee-based CommandBox distribution. Install BoxLang first, then install the BoxLang CLI module before running any `box` command.

```bash
git clone https://github.com/coldbox-templates/cbGenesis my-app
cd my-app

# Install BoxLang first, then add the BoxLang-native CommandBox CLI
# (use either the BoxLang quick installer or BVM; see docs/getting-started.md)
install-bx-module bx-cli

box install
npm install
cp .env.example .env
box migrate up
box migrate seed
box server start
```

## Requirements

- BoxLang 1.16+
- BoxLang CLI (`bx-cli`) - required; regular Lucee CommandBox is not supported
- Java 21+
- Node.js 18+
- MySQL 8+ (or any JDBC-compatible database)

## License

Apache 2.0 License
