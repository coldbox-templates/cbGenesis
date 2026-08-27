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
    ├── security/     → AuditLogForm, PermissionsForm, RolesForm, UserDetailForm, UsersForm
    ├── profile/      → PasskeyOnboarding, PreferencesForm, ProfileForm
    ├── settings/     → SettingsForm, SettingsRegistryForm
    └── ui/           → Drawer, GlobalProgress, GlobalToast, Logo, MessageBox, PasswordMeter, PasswordStrength, Switch
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

## Server-rendered view components

These BXM partials live under `app/views/_components/` and are rendered with ColdBox's `view()` helper. They are intentionally presentation-focused: pass values through the `args` struct and keep business logic in handlers or services.

### Application shell

| Partial | Purpose and inputs |
|---|---|
| `_components/app/includes` | Document metadata, theme/sidebar FOUC prevention, passkey script, and Vite CSS/JS. Optional `title`. Include once in `<head>`. |
| `_components/app/sidebar` | Admin navigation, permission-aware Users/Roles/Permissions/Audit Log links, settings submenu, and sidebar footer. Reads `prc.authUser`; include from `Admin.bxm`. |
| `_components/app/sidebar-brand` | Application logo/name link used by the sidebar. |
| `_components/app/sidebar-footer` | Authenticated user summary and profile/sign-out actions used by the sidebar. |
| `_components/app/topbar` | Sidebar toggle, theme toggle, breadcrumbs, user menu, and sign-out action. Reads `prc.authUser` and `prc.title`. |
| `_components/app/topbar-breadcrumbs` | Dashboard breadcrumb rendered inside the topbar. Extend when adding deeper navigation. |
| `_components/app/topbar-notifications` | Topbar notification slot/component for application notifications. |
| `_components/app/footer` | Copyright and footer links. Optional `classes`. Reads `prc.settings.cbCopyrightNotice`. |

### Authentication partials

| Partial | Purpose and inputs |
|---|---|
| `_components/auth/footer` | Footer used by authentication layouts. |
| `_components/auth/passwordInput` | Reusable password field with visibility toggle and password-strength affordances. |

### UI partials

| Partial | Purpose and inputs |
|---|---|
| `_components/ui/modal` | Generic Alpine dialog that renders an optional nested view. Required `id` should be unique; supports `title`, `openExpression`, `closeExpression`, `contentView`, and `contentArgs`. |
| `_components/ui/drawer` | Right-side focus-trapped dialog with backdrop/Escape closing and optional `contentView`/`contentArgs`; also initializes `drawer()`. |
| `_components/ui/confirm` | Confirmation dialog with static or Alpine-bound message, confirm/cancel expressions, labels, icon, button class, and disabled expression. |
| `_components/ui/messagebox` | Dismissible info/success/warning/error alert. Supports static `message`/`title` or dynamic `messageExpression`/`typeExpression`/`dismissAction`, plus `autoDismiss` and `classes`. |
| `_components/ui/globalProgress` | Global accessible progress bar. Include once per layout; controlled by `$progress.start()`, `$progress.set()`, and `$progress.stop()`. |
| `_components/ui/globalToast` | Global toast stack. Include once per layout; accepts `duration`, `position`, and `maxVisible`, and receives notifications from `$toast()`. |
| `_components/ui/logo` | Reusable application logo/branding partial. |
| `_components/ui/passwordMeter` | Password policy meter used beside password fields. |
| `_components/ui/progressbar` | Inline progress bar partial for a local numeric value. |
| `_components/ui/switch` | Accessible switch control partial for boolean settings. |

## Alpine components and stores

`resources/assets/js/App.js` registers the following names globally with Alpine. Use them as `x-data="name"` or `x-data="name(...)"` in BXM views. Form components make remote requests to the matching handler routes and expect the CSRF token supplied by their view.

### Application shell and authentication

| Alpine name | Source | Responsibility |
|---|---|---|
| `adminBody` | `components/app/AdminBody.js` | Admin page shell behavior and global layout events. |
| `sidebarBrand` | `components/app/SidebarBrand.js` | Sidebar brand interactions. |
| `footer` | `components/app/Footer.js` | Footer state and current-year behavior. |
| `authForm` | `components/auth/AuthForm.js` | Login submission, validation, remember-me, and errors. |
| `registerForm` | `components/auth/RegisterForm.js` | Registration validation, email availability, and submission. |
| `forgotPasswordForm` | `components/auth/ForgotPasswordForm.js` | Forgot-password request state and feedback. |
| `passwordResetForm` | `components/auth/PasswordResetForm.js` | Password reset token submission and validation. |

### Admin and profile forms

| Alpine name | Source | Responsibility |
|---|---|---|
| `usersForm` | `components/security/UsersForm.js` | User listing, search, pagination, invitation, status, and admin actions. |
| `userDetailForm` | `components/security/UserDetailForm.js` | User profile, role, permission, preference, token, and verification actions. |
| `rolesForm` | `components/security/RolesForm.js` | Role CRUD and assigning/removing users and permissions. |
| `permissionsForm` | `components/security/PermissionsForm.js` | Permission listing and CRUD operations. |
| `auditLogForm` | `components/security/AuditLogForm.js` | Audit filtering, pagination, detail drawer, CSV export, purge, and clear actions. |
| `settingsForm` | `components/settings/SettingsForm.js` | Core application settings editing and cache-related feedback. |
| `settingsRegistryForm` | `components/settings/SettingsRegistryForm.js` | Registry search, pagination, create/update, enable/disable, and delete actions. |
| `profileForm` | `components/profile/ProfileForm.js` | Profile fields, password policy, and API token management. |
| `preferencesForm` | `components/profile/PreferencesForm.js` | Persisting user preferences. |
| `passkeyOnboarding` | `components/profile/PasskeyOnboarding.js` | Passkey registration and required-passkey onboarding. |

### UI components and global APIs

| Alpine name | Source | Responsibility |
|---|---|---|
| `messageBox` | `components/ui/MessageBox.js` | Alert visibility and optional timed dismissal. |
| `passwordMeter` | `components/ui/PasswordMeter.js` | Password requirement and strength display. |
| `passwordStrength` | `components/ui/PasswordStrength.js` | Password strength calculation and labels. |
| `switchComponent` | `components/ui/Switch.js` | Toggle state and change handling. |
| `drawer` | `components/ui/Drawer.js` | Drawer lifecycle and focus behavior. |
| `globalProgress` | `components/ui/GlobalProgress.js` | Progress events and current progress value. |
| `globalToast` | `components/ui/GlobalToast.js` | Toast queue, dismissal, type mapping, and stack limits. |

The source also contains `Header.js`, `Sidebar.js`, `TopBarNotifications.js`, and `Logo.js`. Their exports are available for local imports, but they are not currently registered by `App.js`; register them with `Alpine.data()` before using them as global `x-data` components.

### Stores, utilities, and magic properties

| API | Source | Usage |
|---|---|---|
| `$store.theme` | `stores/theme.js` | Light/dark mode, `data-bs-theme`, and localStorage persistence. |
| `$store.sidebar` | `stores/sidebar.js` | Desktop collapse, mobile open/close, and localStorage persistence. |
| `$formatDate`, `$formatDateTime`, `$relativeDate` | `utils/dateFormat.js` | Consistent date display with fallbacks. |
| `$countLabel` | `utils/countLabel.js` | Singular/plural count labels. |
| `$sortClass`, `$sortIcon` | `utils/sort.js` | Sortable table headers and indicators. |
| `$passwordMeetsPolicy` | `utils/passwordPolicy.js` | Checks the configured password requirements. |
| `$isEmail` | `App.js` | Lightweight email-format check. |
| `$toast` / `$progress` | `components/ui/GlobalToast.js`, `GlobalProgress.js` | Global notification and progress APIs. |
| `$focus` / `$copy` | `App.js` | Focus a descendant after Alpine updates; copy text through the browser clipboard API. |
| `createRemoteListing()` | `utils/listing.js` | Shared remote listing state, loading, pagination, and error handling. |

`AlpinePlugins.js` installs Collapse, Focus, Mask, and Persist. `passkeys.js` provides the browser-side WebAuthn integration. Keep new reusable browser APIs documented here and add their registration/import to `App.js` when they are global.

::: cards
::: card title="Extending the App" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Add a new Alpine component and SCSS partial for your own admin page.
:::
::: card title="Deployment" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Building and shipping the production frontend bundle.
:::
:::
