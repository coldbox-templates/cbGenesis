# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added a rate limiting administration page with live counters, traffic history, settings, and controls for blocking and excluding IP addresses, CIDR ranges, and users.
- Added automatic blocking for repeatedly throttled IPs and a bounded, configurable history of blocked requests.
- Added an emergency pause for attempt limits, an environment-variable break-glass override, and a server-wide per-IP ceiling with an emergency lockdown mode.
- Added a honeypot to the registration form to discourage automated submissions.

### Changed

- A rate limit window of `0` no longer disables attempt throttling: the window must be 1 to 86400 seconds, a stored `0` falls back to 300, and the emergency pause or `RATE_LIMITING_ENABLED` is the way to switch it off.
- Replaced the previous rate limiter with fixed-window `AppThrottle` middleware for authentication and profile SSO routes, including convention URLs; SSO callbacks are also throttled.
- Raised the minimum dependency versions to ColdBox 8.3 and cbSecurity 3.9, and corrected the framework and TestBox install paths.
- Updated the documentation theme, database initialization instructions, and rate limiting documentation.

### Fixed

- Made rate-limit counting atomic for concurrent requests and limited audit entries to the first blocked request per window.
- Corrected the login form submission to use the throttled route.
- Improved CI dependency installation and test reporting.

## [1.0.0] - 2026-10-01

- First Release

[unreleased]: https://github.com/coldbox-templates/cbGenesis/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/coldbox-templates/cbGenesis/compare/66b7421f9c17dc56fa58fb365216b3bc6f81bce0...v1.0.0
