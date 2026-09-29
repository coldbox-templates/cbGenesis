---
name: cbgenesis-alpine-components
description: Use this skill when adding or editing an Alpine.js component in cbGenesis (resources/assets/js/components/**) - a new form, modal, drawer, or interactive widget on a server-rendered view. Covers the component module shape, registration in App.js, the shared utils/magic-property library, and the JSDoc requirement.
---

# Alpine.js component conventions

cbGenesis is **server-rendered + Alpine.js**, not an SPA - no client router, no build-time component tree. Each interactive piece is a standalone module exporting a factory function that returns an Alpine `x-data` object.

## Module shape

```js
/**
 * One-line summary of what this component does.
 *
 * @param {Object} initialData Server-rendered initial state.
 * @param {string} csrfToken CSRF token for mutation requests.
 * @returns {Object} Alpine component state and actions.
 */
export function tagsForm( initialData = {}, csrfToken = "" ) {
	return {
		csrfToken,
		// state...
		// getters...
		// actions...
	};
}
```

Place it under `resources/assets/js/components/<domain>/<Name>.js` (`security/`, `settings/`, `profile/`, `auth/`, `ui/`, `app/` - match the domain of the feature, don't create a new top-level folder for one component).

## Registering it

Every globally-used component is imported and registered in `resources/assets/js/App.js`:

```js
import { tagsForm } from "./components/security/TagsForm.js";
Alpine.data( "tagsForm", tagsForm );
```

Then used in a view as `x-data="tagsForm(#toScript(prc.tagCatalog, 'tagCatalog')#, '#csrfToken()#')"` (see `app/views/permissions/index.bxm` for the exact `toScript()`/`csrfToken()` calling convention from BXM). A component that is only ever locally imported by another component (not a global `x-data` root) does not need `App.js` registration - check `Header.js`/`Sidebar.js` for that pattern.

## Reuse before you write

Before writing new state/logic, check `resources/assets/js/utils/` and `App.js`'s magic-property registrations - most cross-cutting needs are already solved:

| Need | Use |
|---|---|
| A paginated/searchable/sortable remote listing | `createRemoteListing()` from `utils/listing.js` |
| Any non-GET request | `fetchWithCsrf()` from `utils/csrf.js` - **mandatory**, see `cbgenesis-csrf-frontend` skill |
| Date formatting | `$formatDate` / `$formatDateTime` / `$relativeDate` |
| Singular/plural counts | `$countLabel` |
| Sortable table headers | `$sortClass` / `$sortIcon` |
| Password policy check | `$passwordMeetsPolicy` |
| Toast / progress bar | `$toast` / `$progress` (`GlobalToast.js` / `GlobalProgress.js`) |
| Focus management / clipboard | `$focus` / `$copy` |

Full reference table: `docs/guides/frontend.md` under "Stores, utilities, and magic properties". If you build a genuinely new reusable helper, add it to `utils/` and to that table - don't leave it undocumented or duplicate it inline in a second component later.

## Documentation is required, not optional

Every exported function, method, computed getter, and event handler needs a JSDoc block: one-line summary, `@param`, `@returns`, and a note on side effects or failure behavior where non-obvious (see any method in `ProfileForm.js` or `RolesForm.js` for the expected density). This is a hard project rule (see AGENTS.md's "JavaScript Documentation" section), not a style preference - a PR that skips it should be treated as incomplete.

## Style

- Tabs, not spaces. Object literal colons align in multi-key objects (`key : value`, wider keys get no padding, narrower keys get spaces to align the colon column) - run `npx eslint resources/assets/js/<file>.js` before considering a change done; `npm run lint:fix` auto-fixes most of it.
- Verify with `npm run build` (Vite) after any component change - a syntax error here fails silently in the browser otherwise.
