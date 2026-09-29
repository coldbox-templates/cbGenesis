---
name: cbgenesis-csrf-frontend
description: Use this skill when writing or reviewing an Alpine.js component in cbGenesis that sends a non-GET request (create, update, delete, status toggle, file upload). Covers the mandatory fetchWithCsrf() helper, why a component's CSRF token can go stale while the page sits open, and the handler-side contract it depends on.
---

# CSRF on mutating requests

Every component action that sends a `POST`/`PUT`/`PATCH`/`DELETE` request MUST go through `fetchWithCsrf()` (`resources/assets/js/utils/csrf.js`) instead of calling `fetch()` directly. Do not hand-roll a `fetch()` call with `csrf: this.csrfToken` in the body - that is the exact bug this skill exists to prevent.

## Why this exists

A component's `csrfToken` is embedded once, when its view renders. The server can invalidate it while the page is still open, in two ways:
1. `csrfField()` (cbcsrf's mixin, behind every hidden `csrf` input) force-rotates the session's token on its first use per request - any other page that renders it (Settings, the passkey-required page, the auth pages) silently invalidates the token sitting in every other open tab.
2. A token expires a fixed time after it was *created*, not after the page loaded - a page rendered late in a token's life can be served one with seconds left.

Either way, a raw `fetch()` with a stale token gets a `403`, and without recovery the user's typed input is lost.

## The contract

```js
export async function fetchWithCsrf( component, url, method, buildRequest ) { /* ... */ }
```

- `component` is the Alpine instance - pass `this`. It must expose a mutable `csrfToken` property; the helper overwrites it in place on a successful recovery.
- `buildRequest( csrfToken )` returns `{ headers, body, credentials? }` for the given token. **It is called again on retry** - build the body fresh inside the callback (don't close over a value computed once), so it works for `URLSearchParams`, `JSON.stringify()`, or `FormData` alike.
- On a `403`, it calls `/cbcsrf/generate` and, if that yields a genuinely new token, replays the request once. A second `403` (real authorization failure, or an expired session) is returned as-is - your caller still needs normal error handling for that.

```js
// urlencoded body
const response = await fetchWithCsrf( this, "/permissions", "POST", ( csrf ) => ( {
	headers : { "Content-Type": "application/x-www-form-urlencoded" },
	body    : new URLSearchParams( { permission: this.form.permission, csrf } ),
} ) );
```

```js
// FormData built from a rendered <form> (e.g. the profile save forms)
const response = await fetchWithCsrf( this, form.action, "POST", ( csrf ) => {
	const formData = new FormData( form );
	formData.set( "csrf", csrf );
	return { body: formData, credentials: "same-origin", headers: { Accept: "application/json" } };
} );
```

## What's exempt

- `GET`/`HEAD` reads: call `fetch()` directly, no token involved, cannot 403 for one.
- The cbSecurity-passkeys WebAuthn ceremony endpoints (`/cbsecurity/passkeys/registration*`): they authenticate through the WebAuthn ceremony itself, not this app's CSRF token.

Every other mutation in `resources/assets/js/components/` goes through `fetchWithCsrf()` - keep new components consistent with that.

## The matching handler-side contract

A JSON/AJAX handler should NOT override `onInvalidCSRF()` - let `BaseSecureHandler`'s default 403 through, since that's what triggers `fetchWithCsrf()`'s recovery. Overriding it to flash+redirect (as `Settings.bx` does, for its native `<form>` posts) breaks the recovery: `fetch()` follows the redirect to a 200 HTML page, and a caller checking only `response.ok` will wrongly report success while nothing was saved. When you add a new mutation, make it a `@remote` JSON action (see any `Permissions.bx` action) and let the frontend recover via `fetchWithCsrf()`, rather than adding a redirect override.

Full write-up, plus the reference table of every component using this pattern, lives in `docs/guides/frontend.md` under "CSRF on mutating requests".
