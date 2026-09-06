# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Self-service email change: a signed-in user requests a new address from their profile, confirms it from a token emailed to the new address, and the old address gets a heads-up notice. Backed by a new nullable `pendingEmail` column and a `PURPOSE_EMAIL_CHANGE` action token. ([#24](https://github.com/coldbox-templates/cbGenesis/pull/24))
- `COLDBOX_REINIT_PASSWORD` environment variable for `?fwreinit`. Left unset, each boot falls back to a random UUID, which closes framework reinit rather than leaving it open. ([#28](https://github.com/coldbox-templates/cbGenesis/pull/28))

### Changed

- CSRF verification is now deny-by-default. `BaseSecureHandler.preHandler()` rejects any request into a secured handler that is not `GET`, `HEAD`, or `OPTIONS` and does not carry a valid `rc.csrf`, replacing the per-handler `static.csrfVerify` opt-in maps. Handlers that render HTML override `onInvalidCSRF()` to flash and redirect instead of returning a bare 403. ([#35](https://github.com/coldbox-templates/cbGenesis/pull/35))
- The seeded `admin@cbgenesis.com` account is created reset-pending. The bootstrap password hash ships in this repository and is public, so signing in with it no longer grants a session; it sends you straight to the reset-password form. ([#29](https://github.com/coldbox-templates/cbGenesis/pull/29))
- The password policy (`cbMinPasswordLength` plus upper, lower, digit, and special character) and a confirmation-match check are now enforced on password reset, not just on registration. ([#34](https://github.com/coldbox-templates/cbGenesis/pull/34))

### Fixed

- Self-service registration and admin invitations were both broken: `doRegister` called a non-existent `.validate()` on the user entity, and the `email` field was silently dropped by the entity's population exclude list. ([#31](https://github.com/coldbox-templates/cbGenesis/pull/31))
- Every validation error path in the handlers returned a 500 instead of the validation messages, calling the singular `getValidationResult()` where cborm defines `getValidationResults()`. ([#30](https://github.com/coldbox-templates/cbGenesis/pull/30))
- Changing your password from the profile page always failed: `isValidPassword()` was called on `securityService`, which does not define it, instead of `settingService`. ([#32](https://github.com/coldbox-templates/cbGenesis/pull/32))
- `RoleService.deleteRole()` threw a `MissingMethodException` and, once reachable, a Hibernate cascade error. It now clears the role from its assigned users on the owning side of the relationship and flushes before deleting. ([#33](https://github.com/coldbox-templates/cbGenesis/pull/33))
- The LogBox rolling file appender was declared outside the `appenders` key, so it was never registered and nothing was written to `app/logs`. ([#27](https://github.com/coldbox-templates/cbGenesis/pull/27))
- Mementifier's date mask setting was misspelled, so entity mementos ignored the configured format. ([#26](https://github.com/coldbox-templates/cbGenesis/pull/26))
- `ormReload()` ran on every request in development rather than only on an authenticated framework reinit. ([#28](https://github.com/coldbox-templates/cbGenesis/pull/28))

[Unreleased]: https://github.com/coldbox-templates/cbGenesis/compare/v1.0.0...HEAD
