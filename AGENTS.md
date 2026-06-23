# Component Structure Convention

## BXM Views (`app/views/_components/`)

Components are organized into two sub-folders:

- **`app/`** — Application-specific components (business logic, layout parts)
  - `header.bxm`, `mainNav.bxm`, `footer.bxm`, `notificationBell.bxm`, `includes.bxm`

- **`ui/`** — Reusable UI primitives (can be used across apps)
  - `logo.bxm`, `messagebox.bxm`

## Alpine JS Components (`resources/assets/js/components/`)

Mirrors the same `app/` and `ui/` sub-folder layout as BXM views. Every `.bxm` component should have a matching `.js` Alpine component file (even if empty) to keep view/behavior pairs easy to find by name.

- **`app/`** — `AuthForm.js`, `Header.js`, `MainNav.js`, `Footer.js`, `NotificationBell.js`, `Includes.js`
- **`ui/`** — `Logo.js`, `MessageBox.js`, `PasswordStrength.js`

| BXM View | Alpine JS |
|---|---|
| `app/header.bxm` | `app/Header.js` |
| `app/mainNav.bxm` | `app/MainNav.js` |
| `app/footer.bxm` | `app/Footer.js` |
| `app/notificationBell.bxm` | `app/NotificationBell.js` |
| `app/includes.bxm` | `app/Includes.js` |
| `ui/logo.bxm` | `ui/Logo.js` |
| `ui/messagebox.bxm` | `ui/MessageBox.js` |

## Adding a New Component

1. Create the `.bxm` in the appropriate sub-folder (`app/` or `ui/`)
2. Create a matching `.js` Alpine stub in the same sub-folder under `resources/assets/js/components/`
3. Register it in the app's Alpine initialization file (`App.js`)
4. Reference via `#view( view: "_components/<sub-folder>/<name>", args: {...} )#`