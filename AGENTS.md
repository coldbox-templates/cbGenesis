# Component Structure Convention

## BXM Views (`app/views/_components/`)

Components are organized into two sub-folders:

- **`app/`** — Application-specific components (business logic, layout parts)
  - `sidebar.bxm`, `sidebar-brand.bxm`, `sidebar-footer.bxm`
  - `topbar.bxm`, `topbar-breadcrumbs.bxm`, `topbar-notifications.bxm`
  - `footer.bxm`, `includes.bxm`

- **`ui/`** — Reusable UI primitives (can be used across apps)
  - `logo.bxm`, `messagebox.bxm`, `passwordMeter.bxm`, `switch.bxm`

## Alpine JS Components (`resources/assets/js/components/`)

Mirrors the same `app/`, `auth/`, and `ui/` sub-folder layout as BXM views.
Every `.bxm` component should have a matching `.js` Alpine component file (even if empty)
to keep view/behavior pairs easy to find by name.

- **`app/`** — `AdminBody.js`, `Sidebar.js`, `SidebarBrand.js`, `TopBarNotifications.js`, `Footer.js`, `Header.js`
- **`auth/`** — `AuthForm.js`
- **`ui/`** — `Logo.js`, `MessageBox.js`, `PasswordMeter.js`, `PasswordStrength.js`, `Switch.js`

| BXM View | Alpine JS |
|---|---|
| `app/sidebar.bxm` | `app/Sidebar.js` |
| `app/sidebar-brand.bxm` | `app/SidebarBrand.js` |
| `app/sidebar-footer.bxm` | — (no custom logic) |
| `app/topbar.bxm` | — (no custom logic) |
| `app/topbar-breadcrumbs.bxm` | — (no custom logic) |
| `app/topbar-notifications.bxm` | `app/TopBarNotifications.js` |
| `app/footer.bxm` | `app/Footer.js` |
| `app/includes.bxm` | — (no custom logic) |
| `ui/logo.bxm` | `ui/Logo.js` |
| `ui/messagebox.bxm` | `ui/MessageBox.js` |
| `ui/passwordMeter.bxm` | `ui/PasswordMeter.js` |
| `ui/switch.bxm` | `ui/Switch.js` |

## SCSS (`resources/assets/scss/`)

Organized into **layouts**, **components**, and **views** — matching the same separation
as BXM views. The manifest at `app.scss` imports everything in dependency order.

```
_variables.scss          Brand tokens + Bootstrap variable overrides
_base.scss               CSS custom properties (light/dark), body, utilities
app.scss                 Main manifest (imports in order: variables → bootstrap → base → layouts → components → views)

layouts/                 Page shells (structure only, no component styles)
  _auth.scss             Auth-centered card + split-screen variants
  _admin.scss            Fixed sidebar + scrollable main wrapper

components/              Reusable UI pieces (alphabetical)
  _auth-forms.scss       Form controls inside auth cards, alert overrides, "or" divider
  _footer.scss           App footer (copyright, links)
  _logo.scss             Brand logo mark, theme-toggle SVG
  _messagebox.scss       Themed alert messages (info/success/warning/error)
  _password-strength.scss  Strength bar + requirements checklist
  _sidebar.scss          Sidebar shell, header, navigation, footer/user
  _switch.scss           Toggle switch (checkbox-based)
  _theme-toggle.scss     Small icon-only theme toggle button
  _topbar.scss           Topbar shell, toggle/buttons, breadcrumb, user menu

views/                   Page-specific styles
  _dashboard.scss        Dashboard stat cards, activity feed, quick actions
  _security-admin.scss   Security/admin screens (tables, chips, permissions, roles)
```

### Adding a New SCSS Component

1. Create `_name.scss` in the appropriate folder (`components/` for reusable, `views/` for page-specific)
2. Add `@import "components/name"` or `@import "views/name"` to `app.scss`
3. Keep the import manifest in alphabetical order within each group

## Adding a New View Component

1. Create the `.bxm` in the appropriate sub-folder (`app/`, `ui/`, or `auth/`)
2. Create a matching `.js` Alpine stub in the same sub-folder under `resources/assets/js/components/`
3. Create a matching `.scss` partial if the component needs styles
4. Register it in the app's Alpine initialization file (`App.js`)
5. Reference via `#view( view: "_components/<sub-folder>/<name>", args: {...} )#`