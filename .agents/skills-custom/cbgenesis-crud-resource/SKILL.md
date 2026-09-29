---
name: cbgenesis-crud-resource
description: Use this skill when adding a new admin-managed CRUD resource to cbGenesis (a new entity/model with a management screen - e.g. "add a Tags feature", "add a new lookup table with an admin UI"). Covers the full vertical slice - entity, service, handler, routes, permissions, view, and Alpine form component - end to end, matching the pattern used by Permissions/Roles/Settings registry.
---

# Adding a CRUD resource

cbGenesis already has three working examples of this exact shape: `Permissions`, `Roles`, and the Settings registry (`Settings.registry*`). Copy the closest one - usually Permissions, the simplest - rather than designing a new shape. A new resource touches exactly these files:

## 1. Entity - `app/models/<domain>/<Name>.bx`

Extend `app.models.BaseEntity`. Use `@persistent(true)` + `@table("<plural_snake_case>")`, a UUID id property, `this.constraints` for cbvalidation, `this.population.exclude` for the id (and any relationship) fields, and `this.memento` for the JSON shape the frontend gets. Example skeleton (based on `app/models/security/Permission.bx`):

```boxlang
@persistent( true )
@table( "tags" )
class extends="app.models.BaseEntity" {
	@fieldType( "id" ) @generator( "uuid" )
	property name="tagId" setter="false";

	@notNull( true ) @unique( true )
	property name="name" default="";

	this.constraints = {
		name: { required: true, size: "1..255", validator: "UniqueValidator@cborm" }
	}
	this.population = { exclude: [ "tagId" ] }
	this.memento = { defaultIncludes: [ "tagId", "name" ] }

	function init() {
		super.init( "tagId" )
		variables.name = ""
		return this
	}
}
```

## 2. Service - `app/models/<domain>/<Name>Service.bx`

Extend `app.models.BaseService`, `@singleton @threadSafe`, and set the entity name in `init()`:

```boxlang
@singleton @threadSafe
class extends="app.models.BaseService" {
	function init() {
		super.init( entityName: "Tag" )
		return this;
	}
}
```

`BaseService` already gives you `new()`, `getOrFail()`, `findAllWhere()`, `getAll()`, `save()`, `delete()` (cborm's `VirtualEntityService`) - only add methods here for genuinely resource-specific queries.

## 3. Handler - `app/handlers/<Names>.bx` (plural name)

Extend `BaseSecureHandler`, class-level `@secured("<resource>:admin")` (add `<resource>:read` too if you need a view-only tier - see the RBAC skill). Every mutation is a `@remote` JSON action shaped like this (copy from `Permissions.bx`'s `create`/`update`/`delete` almost verbatim):

```boxlang
@secured( "tags:admin" )
class extends="BaseSecureHandler" {
	@inject property name="tagService";

	function index( event, rc, prc ) {
		prc.title = "Tags"
		prc.tagCatalog = tagService.getAll().map( .getMemento() )
		event.setView( "tags/index" )
	}

	@remote @secured( "tags:admin" )
	function create( event, rc, prc ) {
		var results = getApiResults()
		try {
			prc.tag = tagService.new().populate( rc )
			prc.tag.validateOrFail().save()
			results.messages = "Tag saved successfully."
			results.data = prc.tag.getMemento()
		} catch ( ValidationException error ) {
			results.error = true
			results.data = prc.tag.getValidationResults().getAllErrorsAsStruct()
			event.setHTTPHeader( statusCode: 422 )
		} catch ( any error ) {
			results.error = true
			results.messages = "Tag could not be saved: #error.message#"
			event.setHTTPHeader( statusCode: 500 )
		}
		return results
	}
	// update() and delete() mirror Permissions.bx exactly - getOrFail(rc.tagId), populate/validateOrFail/save
	// or .delete(), same try/catch shape, statusCode 422 on ValidationException, 500 otherwise.
}
```

Do **not** override `onInvalidCSRF()` on a new handler - see the `cbgenesis-csrf-frontend` skill for why (this is what lets the frontend recover from a stale token instead of losing the user's input).

## 4. Routes - `app/config/Router.bx`

```boxlang
resources( resource: "tags", parameterName: "tagId" )
```

This alone maps `GET /tags` (index), `POST /tags` (create), `GET/PUT/PATCH /tags/:tagId` (show/update), `DELETE /tags/:tagId` (delete) to the matching handler actions. Add hand-written `route()` calls only for extra, non-CRUD actions (see how `Roles` adds `/roles/:roleId/users` alongside its `resources()` block).

## 5. Permissions

Add the new permission string(s) (e.g. `tags:admin`) as seed/migration data the same way existing permissions are seeded - check `resources/migrations` or the seeder for the existing pattern rather than inserting rows by hand.

## 6. View + Alpine component

- View: `app/views/tags/index.bxm`, extending the `Admin` layout implicitly (handler sets it). Copy the structure of `app/views/permissions/index.bxm` - a catalog listing plus a create/edit modal.
- Component: `resources/assets/js/components/security/TagsForm.js` (or a new domain folder), following the shape of `PermissionsForm.js` - **use `fetchWithCsrf()` for every mutation** (see `cbgenesis-csrf-frontend` skill), not a raw `fetch()`.
- Register it in `resources/assets/js/App.js`: `import { tagsForm } from "./components/.../TagsForm.js"; Alpine.data( "tagsForm", tagsForm );`

## 7. Tests

Add `tests/specs/unit/<domain>/TagServiceTest.bx` (extends `tests.resources.BaseIntegrationSpec`) and an integration spec for the handler if it has non-trivial logic beyond plain CRUD. See the `cbgenesis-testing-conventions` skill.

## What NOT to do

- Don't invent a different response shape for API results - use `getApiResults()` (from `BaseSecureHandler`) and the `{error, messages, data}` contract every existing handler uses; the frontend's error handling assumes it.
- Don't skip `this.population.exclude` on the id field - population from `rc` should never let a client overwrite the primary key.
- Don't write a raw SQL migration for a routine table - use the project's cfmigrations workflow (see `docs/guides/database-orm.md`).
