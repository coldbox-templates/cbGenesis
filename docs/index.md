---
title: Home
order: 1
icon: phosphor-duotone:lightning
summary: A production-ready ColdBox HMVC starter template for BoxLang - authentication, SSO, passkeys, RBAC permissions, API tokens, dark mode, and an Alpine-powered admin panel, ready to build on.
toc: false
layout: home
ogImage: assets/home-banner.png
---

<!--
	This page renders through theme/home.bxm (the `layout: home` above),
	which hardcodes the whole page and never includes this file's own
	rendered body - everything below is kept, unused, as the starting
	point for reverting to the normal layout.bxm + page.bxm rendering if
	`layout: home` is ever removed.
-->

<div class="bxsites-hero">
	<img class="bxsites-hero__banner" src="assets/home-banner.png" alt="CB Genesis Docs - The official ColdBox project starter. Everything you need to Scaffold. Build. Accelerate. Built for developers, by developers, backed by ColdBox.">
	<div class="bxsites-hero__actions">
		<a class="bxsites-hero__btn bxsites-hero__btn--primary" href="getting-started.md">Get Started</a>
		<a class="bxsites-hero__btn bxsites-hero__btn--secondary" href="https://github.com/coldbox-templates/cbGenesis">View on GitHub</a>
	</div>
</div>

A production-ready **ColdBox HMVC** starter template for [BoxLang](https://boxlang.io) - the modern, dynamic JVM language. It ships with authentication, SSO, passkeys, role-based permissions, API tokens, dark mode, and an Alpine-powered admin panel, so you spend your first day building features instead of scaffolding auth.

::: cards
::: card title="Get Started in Minutes" icon="phosphor-duotone:rocket-launch" href="getting-started.md"
Install BoxLang, clone the template, run migrations, and be looking at the login screen in under ten minutes.
:::
::: card title="Modern Template Structure" icon="phosphor-duotone:folders" href="architecture.md"
Application code lives in `app/`, fully separated from the public webroot in `public/` - enhanced security by default.
:::
::: card title="Auth & RBAC, Batteries Included" icon="phosphor-duotone:shield-check" href="guides/security.md"
Session auth via cbauth, `@secured` handler annotations, CSRF rotation, JWT support, and a `resource:action` permission model.
:::
::: card title="SSO & Passkeys" icon="phosphor-duotone:key" href="guides/security.md#single-sign-on"
cbSSO with a shipped Google OAuth provider and account linking, plus WebAuthn passkeys for passwordless sign-in.
:::
::: card title="Hibernate ORM + qb" icon="phosphor-duotone:database" href="guides/database-orm.md"
`BaseEntity`/`BaseService` conventions on top of cborm, migrations via cfmigrations, and qb for anything raw SQL does better.
:::
::: card title="Alpine.js + Bootstrap 5 UI" icon="phosphor-duotone:palette" href="guides/frontend.md"
Server-rendered BXM views, sprinkled with small Alpine components, compiled by Vite with hot module reload.
:::
::: card title="A Real Test Suite" icon="phosphor-duotone:test-tube" href="guides/testing.md"
TestBox unit specs for every entity and service, plus integration specs that exercise real HTTP requests.
:::
::: card title="Easy Configuration" icon="phosphor-duotone:sliders" href="guides/configuration.md"
Environment variables for the essentials, DB-backed admin settings for everything else - no redeploy needed to change them.
:::
::: card title="Production Ready" icon="phosphor-duotone:cloud-arrow-up" href="deployment.md"
A real go-live checklist, Docker support, and a choice of CommandBox or the BoxLang MiniServer.
:::
:::

## Screenshots

The admin panel, end to end - login through audit trail:

::: columns
::: column
<figure>
	<img src="assets/screenshots/login.png" alt="The login screen using the default AuthSplit layout">
	<figcaption>Login - the default <code>AuthSplit</code> layout.</figcaption>
</figure>
:::
::: column
<figure>
	<img src="assets/screenshots/dashboard.png" alt="The admin dashboard after signing in">
	<figcaption>Dashboard - after signing in.</figcaption>
</figure>
:::
:::

::: columns
::: column
<figure>
	<img src="assets/screenshots/users.png" alt="The Users admin page">
	<figcaption>Users - search, invite, and manage accounts.</figcaption>
</figure>
:::
::: column
<figure>
	<img src="assets/screenshots/roles.png" alt="The Roles admin page">
	<figcaption>Roles - group permissions and assign users.</figcaption>
</figure>
:::
:::

::: columns
::: column
<figure>
	<img src="assets/screenshots/permissions.png" alt="The Permissions admin page, grouped by resource">
	<figcaption>Permissions - the <code>resource:action</code> model, grouped by resource.</figcaption>
</figure>
:::
::: column
<figure>
	<img src="assets/screenshots/settings.png" alt="The Global Settings admin page">
	<figcaption>Settings - DB-backed configuration, no redeploy needed.</figcaption>
</figure>
:::
:::

::: columns
::: column
<figure>
	<img src="assets/screenshots/profile.png" alt="The Profile page, showing the avatar upload and assigned role">
	<figcaption>Profile - avatar, passkeys, API tokens, and account settings.</figcaption>
</figure>
:::
::: column
<figure>
	<img src="assets/screenshots/auditlog.png" alt="The Audit Log admin page, showing a recorded sign-in">
	<figcaption>Audit Log - every sign-in, sign-out, and access failure.</figcaption>
</figure>
:::
:::

## See it, don't just read about it

CB Genesis's request lifecycle, from browser to database and back:

```mermaid
sequenceDiagram
    Browser->>+public/Application.bx: HTTP Request
    public/Application.bx->>+ColdBox Bootstrap: loadColdbox()
    ColdBox Bootstrap->>+Main Handler: onRequestStart
    Main Handler->>+Router: Match route
    Router->>+Target Handler: Dispatch event
    Target Handler->>+Service Layer: Business logic
    Service Layer->>+ORM / qb: Data access
    Target Handler->>+View / Layout: Render response
    View / Layout-->>-Browser: HTML + Vite assets
```

::: columns
::: column
!!! tip "Secured by convention"
    Every admin handler extends `BaseSecureHandler` and carries a `@secured( "resource:action,resource:admin" )` annotation. The firewall enforces it - no hand-rolled `if` checks scattered through your controllers. See [Security & Permissions](guides/security.md).
:::
::: column
!!! faq "Grow it your way"
    New CRUD module? New setting? New scheduled task? [Extending CB Genesis](guides/extending.md) walks through the exact files to touch, in the order the existing code already follows.
:::
:::

## Where to go next

::: cards
::: card title="Getting Started" icon="phosphor-duotone:rocket-launch" href="getting-started.md"
Install, configure, migrate, and run the app locally.
:::
::: card title="Architecture" icon="phosphor-duotone:tree-structure" href="architecture.md"
The modern app/public split, the full project tree, and the request lifecycle.
:::
::: card title="Handlers & Routing" icon="phosphor-duotone:signpost" href="guides/handlers-routing.md"
Every handler, every route, and the conventions tying them together.
:::
::: card title="Security & Permissions" icon="phosphor-duotone:shield-check" href="guides/security.md"
cbsecurity, cbauth, CSRF, JWT, and the `resource:action` permission model.
:::
::: card title="Database & ORM" icon="phosphor-duotone:database" href="guides/database-orm.md"
Entities, services, migrations, and seed data.
:::
::: card title="Frontend" icon="phosphor-duotone:palette" href="guides/frontend.md"
Alpine.js components, SCSS structure, and the Vite pipeline.
:::
::: card title="Extending the App" icon="phosphor-duotone:puzzle-piece" href="guides/extending.md"
Add a CRUD module, a permission, a setting, or a scheduled task.
:::
::: card title="Deployment" icon="phosphor-duotone:cloud-arrow-up" href="deployment.md"
Production build, Docker, BoxLang MiniServer, and a go-live checklist.
:::
:::

## Built with BX Sites

This documentation site is generated with [BX Sites](https://ortus-boxlang.github.io/bx-sites/) - the official BoxLang static site generator - straight from the Markdown in this repository's `docs/` folder, using the default `bootstrap` theme. See [`.github/workflows/docs.yml`](https://github.com/coldbox-templates/cbGenesis/blob/development/.github/workflows/docs.yml) for how it's built and published on every push.
