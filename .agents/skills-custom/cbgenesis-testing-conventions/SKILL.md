---
name: cbgenesis-testing-conventions
description: Use this skill when writing or running tests in cbGenesis (tests/specs/**) - a unit spec for a service/entity, an integration spec for a handler, or reasoning about test isolation and fixtures. Covers BaseIntegrationSpec, the real (transaction-rollback) isolation mechanism, seed/fixture helpers, and how to exercise CSRF-protected handler actions.
---

# Testing conventions

TestBox specs live in `tests/specs/` (`unit/<domain>/` and `integration/`). Run them with `box testbox run`.

## Always extend `tests.resources.BaseIntegrationSpec`

```boxlang
class extends="tests.resources.BaseIntegrationSpec" {
	@inject property name="tagService";

	function run() {
		describe( "Tag Service", () => {
			it( "can be created", () => {
				expect( tagService ).notToBeNull()
			} )
		} )
	}
}
```

Do not write your own `@appMapping` annotation or reimplement ColdBox bootstrap - the base class already handles it, for unit specs and integration/handler specs alike.

## Test isolation is automatic - don't reinvent it

`BaseIntegrationSpec` wraps every spec in a real DB transaction via an `@aroundEach` hook (`aroundTransaction()`) and rolls it back after the spec runs, clearing the ORM session too. Anything your spec saves via `save()`/`delete()` is rolled back automatically - **you do not need to manually delete fixture data, and you do not need to call a `setup()` reset function per spec.** Write specs that create exactly the data they need inline (or via the fixture helpers below) and trust the rollback.

Because of this, never wrap a spec's own assertions in a manual transaction, and never disable/bypass the surrounding transaction to "test transactional behavior" - the harness already depends on it being active for cleanup.

## Fixture helpers already on the base class

- `createVerifiedUser( email? )` - a verified `User` ready to authenticate as, rolled back automatically.
- `seed( table, records )` - bulk-insert raw rows via qb when you need data the ORM entity layer shouldn't be involved in creating.
- `getBaseRecord( idColumn? )` - a struct with a fresh UUID id + `isActive`/`createdDate`/`updatedDate` defaults, to merge into `seed()` rows.
- `keyChecksOff()` / `keyChecksOn()` - toggle FK constraints for seeding data with real referential order violations (rare - most specs don't need this).

Check for a helper here before writing your own ad-hoc fixture builder.

## Exercising CSRF-protected handler actions

Handler integration specs call actions via `execute( "handler.action" )` and must generate a real CSRF token for any non-GET action, since `BaseSecureHandler.preHandler()` verifies it the same as a live request:

```boxlang
@inject( "@cbcsrf" ) property name="cbcsrf";
// ...
form.csrf = cbcsrf.generate();
execute( "permissions.create" );
```

A handler whose `onInvalidCSRF()` performs a real engine `abort` (rather than just flashing+redirecting) cannot have its invalid-token path exercised through in-process `execute()` - the abort terminates the whole test-runner request, not just the simulated sub-request. See `tests/specs/integration/ProfileTest.bx`'s file header comment for the precedent: test the valid-CSRF paths here, and note in a comment that the invalid-token path needs a real HTTP call instead (verify manually with curl, don't skip the check silently).

## BDD structure

Use `describe()`/`it()` (and `story()` where a spec documents a specific bug/feature narrative - see `ProfileTest.bx`), not xUnit-style `test` functions, to match the rest of the suite.
