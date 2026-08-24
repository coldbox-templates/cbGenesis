---
title: Frontend
order: 4
icon: phosphor-duotone:palette
summary: Server-rendered BXM views, small Alpine.js components, and a Vite-compiled SCSS/JS pipeline.
tags: [guides, frontend, alpine, vite]
---

# Frontend

## How it fits together

The frontend is a **hybrid server-rendered + Alpine.js** application - no SPA, no client-side router:

::: stepper
::: step "ColdBox layouts provide the shell"
`Admin.bxm`, `AuthSplit.bxm`, and friends in `app/layouts/` render the HTML frame.
:::
::: step "BXM templates render server-side"
Views in `app/views/` render with `rc`/`prc` data already resolved by the handler.
:::
::: step "Alpine.js adds interactivity"
Small `x-data` components handle forms, modals, drawers, and toggles - no build step needed per-component.
:::
::: step "Vite compiles the assets" color="success"
SCSS + JS from `resources/assets/` compile into `public/includes/`, served at the `ASSET_URL` prefix.
:::
:::

## Alpine.js architecture

```text title="resources/assets/js/ layout"
App.js (entry)
  ├── Registers all Alpine stores + components
  ├── Imports Bootstrap JS + Phosphor icons + Tippy.js
  │
  ├── Stores ($store.*)
  │   ├── theme.js     → dark/light mode, syncs data-bs-theme + localStorage
  │   └── sidebar.js   → collapse/open, mobile overlay, localStorage persistence
  │
  └── Components (x-data)
      ├── auth/        → AuthForm, RegisterForm, ForgotPasswordForm, PasswordResetForm
      ├── security/     → PermissionsForm, RoleForm
      ├── settings/     → SettingsForm
      └── ui/           → Drawer, Logo, MessageBox, PasswordMeter, Switch, Modal, Confirm
```

Each component is a standalone module returning an Alpine `x-data` object:

=== "Component"
    ```js title="resources/assets/js/components/ui/MessageBox.js"
    export default () => ( {
        visible: true,
        init() {
            setTimeout( () => this.visible = false, 5000 );
        }
    } );
    ```
=== "Usage in a view"
    ```html title="app/views/_components/ui/messagebox.bxm"
    <div x-data="messageBox" x-show="visible" x-transition>
        <!-- alert content -->
    </div>
    ```

## SCSS structure

```text title="resources/assets/scss/ layout"
app.scss
  ├── _variables.scss   Bootstrap variable overrides
  ├── bootstrap          Full Bootstrap 5.3 import
  ├── _base.scss         CSS custom properties (light/dark theme)
  ├── components/        9 component partials
  ├── layouts/            Admin + Auth layout partials
  └── views/              Page-specific styles
```

## Vite configuration

`vite.config.mjs` uses [`coldbox-vite-plugin`](https://github.com/coldbox-modules/coldbox-vite-plugin)'s `coldbox()` plugin:

- Entry points: `resources/assets/scss/app.scss` and `resources/assets/js/App.js`
- `refresh: appRefreshPaths` — auto full-reload on handler/view changes
- `publicDirectory: "public/includes"` — where built assets land
- SCSS preprocessor with `silenceDeprecations` flags for newer Dart Sass (import, global-builtin, color-functions, if-function)

```bash frame="terminal" title="Terminal"
npm run dev        # Vite dev server with HMR
npm run build      # Production build → public/includes/
npm run lint       # ESLint check on resources/assets/js
npm run lint:fix   # ESLint auto-fix
npm run lint:scss  # Stylelint on resources/assets/scss
```

!!! note "ASSET_URL"
    In production, compiled asset URLs are prefixed with the `ASSET_URL` environment variable (`.env.example` defaults it to `/includes`) - see [Configuration](configuration.md#environment-variables).

::: cards
::: card title="Extending the App" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Add a new Alpine component and SCSS partial for your own admin page.
:::
::: card title="Deployment" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Building and shipping the production frontend bundle.
:::
:::
