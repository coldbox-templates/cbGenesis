---
name: cbgenesis-rbac-permissions
description: Use this skill when adding or changing access control in cbGenesis - securing a new handler or action, adding a permission, checking a permission in a view or handler, or reasoning about the CSRF gate on state-changing requests. Covers the resource:action permission model, @secured annotations, BaseSecureHandler's preHandler, and how permissions/roles/users relate.
---

# cbGenesis RBAC & Permissions

cbGenesis ships a complete `resource:action` permission model. Do not invent a new authorization scheme - extend this one.

## The permission string format

Every permission is `resource:action` (e.g. `users:admin`, `permissions:read`, `settings:admin`). `Permission.bx` (`app/models/security/Permission.bx`) derives `getPrefix()` (the resource) and `getSlug()` (the action) by splitting on `:`. The frontend groups the permission catalog by prefix (see `PermissionsForm.js`'s `groups` getter) - a new permission with no `:` lands in a "general" group, so always include the colon.

Convention: most resources define `resource:admin` (full CRUD) and sometimes `resource:read` (view-only). Check `app/handlers/*.bx` `@secured` annotations for the existing set before inventing a new action name.

## Securing a handler

Every admin handler extends `BaseSecureHandler` (`app/handlers/BaseSecureHandler.bx`) and carries a class-level `@secured` annotation naming the permissions that grant access, comma-separated as OR:

```boxlang
@secured( "permissions:admin,permissions:read" )
class extends="BaseSecureHandler" {
```

`BaseSecureHandler.preHandler()` (inherited by every handler here) also:
- Sets the `Admin` layout on every view.
- Redirects to `profile/passkey-required` if `cbRequirePasskey` is on and the user has no passkey (except `logout` and `passkeyRequired` itself).
- **Verifies CSRF deny-by-default**: any request that is not `GET`/`HEAD`/`OPTIONS` must carry a valid `rc.csrf`, or the request is rejected via `onInvalidCSRF()`. This is automatic - you do not add per-action CSRF checks. The base `onInvalidCSRF()` aborts with a 403, which is correct for an `@remote` JSON handler. Override it only if the handler renders HTML and needs to flash+redirect instead (see `Settings.bx`'s override) - most handlers here are pure JSON now and should NOT override it (see `cbgenesis-csrf-frontend` skill for the matching frontend side).

`Auth.bx` is the one exception: it extends `coldbox.system.EventHandler` directly (unauthenticated visitors can't pass a secured preHandler) and verifies `csrfVerify()` manually inside each state-changing action.

## Checking permissions elsewhere

- **In a handler/service**: inject `securityService` and call its permission-check methods (see how `Users.bx`/`Roles.bx` guard cross-cutting actions like `ensureNotSelf()`).
- **In a view**: use the permission helpers already wired into layouts to hide/show admin-only UI (buttons, nav items) - grep `app/views/` for an existing `hasPermission`-style check on the resource you're adding before writing a new one.

## Roles, users, and permissions relate like this

- `Role` has a many-to-many to `Permission` (`role_permissions` link table) and to `User` (`user_roles`).
- `User` can also hold **direct** permissions (`user_permissions`), independent of role - `UserDetailForm.js`'s "effective permissions" list is roles' permissions UNION direct permissions.
- When a form submits a to-many relationship (e.g. a role's permission list), send it as a single comma-delimited field even when empty (`permissions: this.form.permissionIds.join(",")`), never as repeated `field[]` keys. cborm's `populate()` only touches keys present in the request body; an absent key leaves the existing relationship untouched. A role save that omits `permissions[]` for an empty selection silently keeps the old permissions instead of clearing them - this was a real, shipped bug (issue #68). See `RolesForm.js`'s `saveRole()` for the fixed pattern and its comment.

## Self-action guards

Some admin actions must not target the acting user themselves (e.g. removing your own last role, changing your own status through the admin panel). The `ensureNotSelf()` pattern in `Users.bx` throws before the mutation runs. Apply it consistently to genuinely dangerous self-actions (deactivating yourself, revoking your only access path) - but don't over-apply it to harmless ones (issue #71 was `ensureNotSelf()` blocking a user from removing their own role from a *different* admin's session, which had no self-lockout risk and wasn't guarded on the equivalent `Roles.removeUser()` path). When adding a new destructive action, check whether the equivalent action already exists elsewhere and match its guard, rather than deciding fresh each time.
