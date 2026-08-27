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

```bash
git clone https://github.com/coldbox-templates/cbGenesis my-app
cd my-app

box install
npm install
cp .env.example .env
box migrate up
box migrate seed
box server start
```

## Requirements

- BoxLang 1.16+
- CommandBox BoxLang Version (bx-cli)
- Java 21+
- Node.js 18+
- MySQL 8+ (or any JDBC-compatible database)

## License

Apache 2.0 License
