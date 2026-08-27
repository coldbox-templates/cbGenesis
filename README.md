# CB Genesis

A production-ready ColdBox starter template for [BoxLang](https://boxlang.io).

## What You Get

- Modern ColdBox HMVC application structure with separated application and public webroot code
- Ready-to-use authentication, registration, password reset, profiles, users, roles, and permissions
- cbSecurity integration with secure handlers and session-based authentication
- ORM entities, database migrations, seed data, and QB query building
- Email workflows with reusable password reset, verification, and welcome templates
- Vite-powered frontend asset development with SCSS and JavaScript support
- Admin layouts and dashboard views ready to customize

## Documentation

Full documentation lives here:

- https://coldbox-templates.github.io/cbGenesis/

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
