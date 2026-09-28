# Security Policy

The **cbGenesis** team takes security seriously. Because cbGenesis provides a production-ready application foundation that includes authentication, authorization, SSO, passkeys, API tokens, and other security-sensitive functionality, we appreciate responsible disclosure of potential vulnerabilities.

## Supported Versions

Security updates are provided for the latest released version of cbGenesis.

| Version | Supported |
| ------- | --------- |
| Latest release | :white_check_mark: |
| Development / snapshot builds | :x: |
| Older releases | :x: |

We strongly recommend keeping cbGenesis and its dependencies up to date.

Applications generated from cbGenesis become independent projects. Security updates made to cbGenesis are **not automatically applied to applications previously generated from the template**. 
Application owners are responsible for reviewing cbGenesis security updates and applying relevant changes to their applications.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub Issues, Discussions, or other public channels.**

Instead, report vulnerabilities privately using **GitHub Security Advisories** for the cbGenesis repository:

1. Navigate to the **Security** tab of the cbGenesis GitHub repository.
2. Select **Advisories**.
3. Select **Report a vulnerability**.
4. Provide as much information as possible about the vulnerability.

A useful report should include:

- A description of the vulnerability.
- The affected cbGenesis version or commit.
- Steps to reproduce the issue.
- The potential security impact.
- Any proof-of-concept code or requests, if applicable.
- Suggested remediation, if known.

## What to Expect

After receiving a security report, the cbGenesis maintainers will:

- Acknowledge receipt of the report as soon as reasonably possible.
- Investigate and validate the reported vulnerability.
- Keep the reporter informed of significant progress.
- Develop and test a fix when the vulnerability is confirmed.
- Coordinate disclosure and release of the fix when appropriate.

If the report is determined not to represent a security vulnerability, we will explain our reasoning and may recommend opening a regular GitHub issue instead.

## Responsible Disclosure

We ask security researchers to give the cbGenesis maintainers reasonable time to investigate and remediate confirmed vulnerabilities before publicly disclosing them.

Please avoid accessing, modifying, or deleting data that does not belong to you while researching potential vulnerabilities.

We appreciate the efforts of the security community in helping keep cbGenesis and applications built with it secure.
