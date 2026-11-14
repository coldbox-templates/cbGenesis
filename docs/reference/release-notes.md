---
title: Release Notes
order: 3
icon: phosphor-duotone:note
summary: Changes in the 1.1.x release series.
tags: [reference, releases]
---

# Release Notes

## 1.1.0

### Added

- **Rate limiting administration:** View counters, history and top offenders; manage IP blocks and exclusions; and change settings at System > Rate Limiting.
- **Automatic blocking and history:** Block repeat offenders and retain bounded, hourly request history.
- **Emergency controls:** Pause attempt limits, use `RATE_LIMITING_ENABLED` as a break-glass override, and apply a site-wide per-IP ceiling with an emergency lockdown.
- **Registration honeypot:** Reject automated registrations that fill in the hidden field.

### Changed

- Replaced the previous limiter with fixed-window `AppThrottle` middleware for authentication and profile SSO routes, and throttled the cbSSO callback. Authentication convention URLs are protected too.
- Raised the minimum versions to ColdBox 8.3 and cbSecurity 3.9, and corrected the framework and TestBox install paths.
- Updated the documentation theme, database initialization instructions, and rate limiting documentation.

### Fixed

- Made attempt counting atomic and limited audit entries to the first blocked request per window.
- Corrected the login form submission to use the throttled route.
- Improved CI dependency installation and test reporting.

See [Rate limiting](../guides/security.md#rate-limiting) for configuration, route middleware, and deployment considerations. The [changelog](https://github.com/coldbox-templates/cbGenesis/blob/development/changelog.md) tracks changes across all releases.
