---
title: Versionshinweise
order: 3
icon: phosphor-duotone:note
summary: Änderungen der 1.1.x-Reihe.
tags: [reference, releases]
---

# Versionshinweise

## 1.1.0

### Hinzugefügt

- **Verwaltung der Ratenbegrenzung:** Zähler, Verlauf und häufigste Verursacher anzeigen sowie IP-Sperren, Ausnahmen und Einstellungen unter System > Rate Limiting verwalten.
- **Automatische Sperren und Verlauf:** Wiederholte Verstöße sperren und einen begrenzten stündlichen Verlauf speichern.
- **Notfallsteuerung:** Versuchslimits pausieren, `RATE_LIMITING_ENABLED` als Notfallumgehung verwenden und eine siteweite IP-Obergrenze mit Lockdown aktivieren.
- **Registrierungs-Honeypot:** Automatisierte Registrierungen mit ausgefülltem verborgenem Feld abweisen.

### Geändert

- `AppThrottle` ersetzt den bisherigen Limiter durch feste Zeitfenster für Authentifizierungs- und Profil-SSO-Routen; der cbSSO-Callback und konventionsbasierte Authentifizierungs-URLs werden ebenfalls begrenzt.
- Die Mindestversionen wurden auf ColdBox 8.3 und cbSecurity 3.9 angehoben; die Installationspfade für Framework und TestBox wurden korrigiert.
- Dokumentationsthema, Datenbankinitialisierung und Dokumentation der Ratenbegrenzung wurden aktualisiert.

### Behoben

- Versuche werden atomar gezählt; nur die erste blockierte Anfrage pro Zeitfenster wird protokolliert.
- Das Anmeldeformular verwendet die durch den Limiter geschützte Route.
- Abhängigkeitsinstallation und Testberichte in CI wurden verbessert.

Siehe [Ratenbegrenzung](../guides/security.md#rate-limiting) und das [Änderungsprotokoll](https://github.com/coldbox-templates/cbGenesis/blob/development/changelog.md).
