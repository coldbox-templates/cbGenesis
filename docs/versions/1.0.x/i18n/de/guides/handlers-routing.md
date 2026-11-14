---
title: Handler & Routing
order: 1
icon: phosphor-duotone:signpost
summary: Jeder Handler, seine Aktionen und wie Router.bx URLs mit ihnen verdrahtet.
tags: [guides, handlers, routing]
---

# Handler & Routing

## Handler-Übersicht

| Handler | Basis | Zweck |
|---|---|---|
| [`AuditLog.bx`](#auditlog) | `BaseSecureHandler` | Durchsuchen, Exportieren und Bereinigen des Audit-Trails |
| [`Assets.bx`](#assets) | `EventHandler` | Streamt Benutzer-Avatare und das Branding-Logo |
| [`Auth.bx`](#auth) | `EventHandler` | Login, Registrierung, Einladungen, Passwort-Zurücksetzung - alles öffentlich |
| [`BaseSecureHandler.bx`](#basesecurehandler) | `RestHandler` | Basisklasse für jeden Admin-Handler |
| [`Dashboard.bx`](#dashboard) | `BaseSecureHandler` | Die authentifizierte Startseite |
| `Main.bx` | `EventHandler` | Impliziter Event-Handler - siehe [Architektur](../architecture.md#request-lifecycle) |
| [`Permissions.bx`](#permissions) | `BaseSecureHandler` | CRUD für Berechtigungs-Slugs |
| [`Profile.bx`](#profile) | `BaseSecureHandler` | Self-Service-Profil, Passwort, API-Tokens, Passkeys |
| [`Roles.bx`](#roles) | `BaseSecureHandler` | Rollen-CRUD + Benutzerzuweisung |
| [`Settings.bx`](#settings) | `BaseSecureHandler` | App-Einstellungsregistrierung |
| [`Users.bx`](#users) | `BaseSecureHandler` | Benutzerverwaltung |

### `BaseSecureHandler`

Jeder geschützte Handler erweitert `BaseSecureHandler`, dessen `preHandler` [CSRF bei jedem zustandsändernden Request verifiziert](#csrf-verification), das `Admin`-Layout erzwingt und zu `profile/passkey-required` umleitet, wenn `cbRequirePasskey` aktiv ist und der Benutzer keinen Passkey hat. Er stellt außerdem gemeinsame Hilfsmethoden bereit (`getApiResults()`, `ensureSortDirection()`, `getPagination()`):

```boxlang title="app/handlers/BaseSecureHandler.bx" linenums="1"
component extends="coldbox.system.RestHandler" {

    function preHandler( event, rc, prc ){
        // ...CSRF verification, deny-by-default...
        event.setLayout( "Admin" );
        // ...passkey enforcement...
    }

}
```

Einen neuen geschützten Handler zu bauen, beginnt jedes Mal gleich:

```boxlang title="Example: a new secured handler" linenums="1"
component extends="BaseSecureHandler" secured {

    function index( event, rc, prc ){
        prc.pageTitle = "My Page";
        event.setView( "myhandler/index" );
    }

}
```

### `AuditLog`

`@secured("auditlog:admin,auditlog:read")` auf Klassenebene; jede Aktion außer `index` ist `@remote`:

- `index`, `search`, `show` - den Audit-Trail durchsuchen und filtern
- `export` - `@secured("auditlog:admin,auditlog:export")`, streamt CSV
- `purge` - `@secured("auditlog:admin,auditlog:delete")`, löscht Einträge älter als ein Cutoff-Datum
- `clear` - `@secured("auditlog:admin")`, löscht jeden Eintrag

### `Assets`

Keine `@secured`-Annotation auf Klassenebene - es streamt binäre Dateien von der privaten cbfs-`assets`-Disk (siehe [Datenbank & ORM](database-orm.md) und `app/config/modules/cbfs.bx`), die außerhalb des Webroots liegt und sonst nicht erreichbar ist:

- `avatar` - `@secured` (jeder authentifizierte Benutzer), streamt die `sm`/`lg`-Avatar-JPEG-Variante eines Benutzers
- `logo` - öffentlich, streamt die `sm`/`lg`-Branding-Logo-PNG-Variante, sodass der Login-Bildschirm und andere Gast-Seiten sie rendern können

Beide Aktionen geben einen 404 (statt eines Fehlers) für eine nicht erkannte `userId`/`size`-Form zurück oder wenn die angeforderte Datei schlicht nicht existiert, sodass ein Aufrufer "kein Avatar" nicht allein anhand der Antwortform von "kein solcher Benutzer" unterscheiden kann. Skalierung, Zuschneiden und Speicherung laufen über `ImageService` (`app/models/system/ImageService.bx`), aufgerufen über `getInstance()` innerhalb jeder Aktion statt einer `@inject`-Eigenschaft - siehe den Docblock auf `Assets.bx` für den Grund (eine WireBox-Boot-Reihenfolge-Eigenheit bei handler-ausgelöster Singleton-Konstruktion).

### `Auth`

Keine `@secured`-Annotation - diese Aktionen müssen für Gäste erreichbar bleiben:

- `login` / `doLogin` (GET/POST) - CSRF-verifiziert, ruft `securityService.login()` auf, unterstützt `rememberMe`
- `register` / `doRegister` - abhängig von der Einstellung `cbAllowRegistration`
- `checkEmailAvailability` - JSON-Endpunkt für Live-Prüfungen der E-Mail-Verfügbarkeit
- `verifyRegistration` - verbraucht ein `PURPOSE_REGISTRATION`-Aktions-Token
- `activateInvitation` / `doActivateInvitation` - setzt ein Passwort für einen eingeladenen, admin-erstellten Benutzer
- `forgotPassword` / `doForgotPassword` - abhängig von `cbAllowForgotPassword`
- `resetPassword` / `doResetPassword` - validiert das Reset-Token, setzt ein neues Passwort
- `verifyEmailChange` - verbraucht ein `PURPOSE_EMAIL_CHANGE`-Aktions-Token
- `logout` - ruft `securityService.logout()` auf

`preHandler` leitet einen bereits authentifizierten Besucher direkt zum Dashboard um und setzt das Layout aus `prc.settings.cbLoginLayout` (`AuthSplit` standardmäßig - siehe [`guides/security.md`](security.md)); `verifyEmailChange` und `logout` sind von dieser Umleitung ausgenommen, damit sie erreichbar bleiben, egal ob der Besucher bereits authentifiziert ist.

### `Dashboard`

`@secured` (jeder authentifizierte Benutzer, keine bestimmte Berechtigung erforderlich):

- `index` - die Dashboard-Startseite
- `notAuthorized` - das Ziel von `invalidAuthorizationEvent`, gezeigt, wenn einem authentifizierten Benutzer eine erforderliche Berechtigung fehlt

### `Permissions`

`@secured("permissions:admin,permissions:read")` auf Klassenebene:

- `index`
- `create` - `@secured("permissions:admin,permissions:write")`
- `update` / `delete` - `@remote`, dieselben Schreib-/Löschberechtigungen

### `Profile`

`@secured`-Self-Service-Aktionen für den aktuellen Benutzer, alle `@remote`-AJAX-Endpunkte außer `index`:

- `index`, `passkeyRequired`
- `save`, `doPasswordChange`
- `requestEmailChange` / `cancelEmailChange` - startet/bricht eine ausstehende E-Mail-Änderung ab, bestätigt über `Auth.verifyEmailChange`
- `listTokens` / `createToken` / `updateToken` / `deleteToken` - API-Tokens
- `listPasskeys` / `updatePasskey` / `deletePasskey`
- `uploadAvatar` / `deleteAvatar` - akzeptiert das Bild als base64-Data-URI in `rc.avatar` (BoxLang hat keinen multipart/form-data-Parser, daher reisen Uploads als JSON), dekodiert über `BaseSecureHandler.decodeDataUri()`; zurückgestreamt von `Assets.avatar`

Jede dieser Aktionen wird von `BaseSecureHandler` CSRF-verifiziert, es sei denn, sie wird über eine sichere HTTP-Methode erreicht - siehe [CSRF-Verifizierung](#csrf-verification).

### `Roles`

`@secured("roles:admin,roles:read")` auf Klassenebene; jede Aktion außer `index` ist `@remote`:

- `index`
- `create` / `update` / `delete` - `@secured("roles:admin,roles:write"` / `"...:delete")`
- `users` / `availableUsers` - Benutzer einer Rolle bzw. für eine Rolle verfügbare Benutzer auflisten
- `addUser` / `removeUser` - `@secured("roles:admin")`

### `Settings`

`@secured("settings:admin,settings:read")` auf Klassenebene:

- `index`
- `registry` / `registrySearch` - paginierte Einstellungsregistrierung
- `createRegistry` / `updateRegistry` / `toggleRegistryStatus` / `deleteRegistry` - `settings:admin,settings:write`
- `save` - Massenspeicherung der Kerneinstellungen
- `uploadLogo` / `deleteLogo` - `settings:admin,settings:write`, dieselbe base64-Data-URI-Konvention wie `Profile.uploadAvatar`; speichert/stellt die `cbAppLogo`-Einstellung wieder her und streamt über `Assets.logo` zurück
- Admin-Hilfsmittel (alle `settings:admin`): `clearTemplateCache`, `clearSessionsCache`, `revokeRememberTokens`, `flushSettingsCache`

### `Users`

`@secured("users:admin,users:read")` auf Klassenebene:

- `index`, `search`
- `create` / `update` / `delete` / `resendInvitation` - `users:admin,users:write` / `...:delete`
- `show` - `users:read`
- Nur Admin (`users:admin`): `updateProfile`, `setStatus`, `resetPassword`, `verify`, `revokeRememberTokens`, `addRole`/`removeRole`, `addPermission`/`removePermission`, `savePreferences`, `revokeToken`/`revokeAllTokens`

`ensureNotSelf()` schützt mehrere dieser Aktionen davor, dass ein Admin die eigenen Rollen herabstuft oder entfernt.

<figure>
	<img src="../assets/screenshots/users.png" alt="The Users admin page">
	<figcaption>Die Users-Admin-Seite.</figcaption>
</figure>

## CSRF-Verifizierung

`app/config/modules/cbsecurity.bx` setzt `csrf.enableAutoVerifier: false`, sodass es keinen globalen Interceptor gibt. Stattdessen verifiziert `BaseSecureHandler.preHandler()` CSRF **deny-by-default** für jeden Handler, der ihn erweitert:

```boxlang title="app/handlers/BaseSecureHandler.bx (excerpt)" linenums="1"
static {
    // The safe methods of RFC 9110, exempt from CSRF verification below.
    SAFE_HTTP_METHODS = "GET,HEAD,OPTIONS"
}

function preHandler( event, rc, prc ) {
    if (
        !static.SAFE_HTTP_METHODS.listFindNoCase( event.getHTTPMethod() )
        && !csrfVerify( rc.csrf ?: "" )
    ) {
        return onInvalidCSRF( argumentCollection = arguments )
    }
    // ...
}
```

Was das bedeutet, wenn du einen gesicherten Handler erweiterst:

- **Du meldest dich nicht opt-in an.** Jede Aktion, die über `POST`, `PUT`, `PATCH` oder `DELETE` erreicht wird, muss ab dem Tag, an dem du sie hinzufügst, ein gültiges `rc.csrf` mitführen. Es gibt keine handler-spezifische Liste, die aktuell gehalten werden müsste.
- **Sichere Methoden sind ausgenommen.** `GET`, `HEAD` und `OPTIONS` dürfen den Zustand nicht ändern, tragen also kein CSRF-Risiko, und `OPTIONS` (CORS-Preflight) kann überhaupt kein Token mitführen. Wenn eine sichere Methode in deinem Code doch den Zustand ändert, ist das der zu behebende Fehler.
- **`onInvalidCSRF()` ist überschreibbar.** Die Basisimplementierung bricht mit einem Autorisierungsfehler ab, was für die JSON-/AJAX-Endpunkte gewünscht ist - jede Mutation in `Permissions` ist inzwischen eine davon, übermittelt über `fetchWithCsrf()` (siehe [Frontend](frontend.md#csrf-on-mutating-requests)), das sich von einem veralteten Token erholt, statt eine Umleitung zu benötigen. `Settings` überschreibt sie weiterhin, um eine Nachricht anzuzeigen und native Formular-Posts umzuleiten, sodass ein Browser-Formular eine Seite statt eines nackten 403 erhält. Überschreibe sie in deinem eigenen Handler, wenn er HTML statt JSON rendert.

!!! note "`Auth` ist kein gesicherter Handler"
    `Auth` erweitert `coldbox.system.EventHandler`, nicht `BaseSecureHandler`, weil seine Aktionen für nicht authentifizierte Besucher laufen und daher die obige Prüfung nicht erben können. Jede zustandsändernde Aktion verifiziert ihr eigenes Token: `doLogin`, `doRegister`, `doActivateInvitation`, `doForgotPassword`, `doResetPassword` und `logout`.

## Routen-Übersicht (`app/config/Router.bx`)

Alle Routen werden in einer `configure()`-Funktion deklariert:

```boxlang title="app/config/Router.bx (excerpt)" linenums="1"
route( "/healthcheck" ).to( () => "Ok!" );

get( "dashboard" ).to( "Dashboard.index" );

resources( "permissions", parameterName = "permissionId" );

route( "roles/:roleId/available-users" ).to( "Roles.availableUsers" );
route( "roles/:roleId/users" ).toAction( { POST: "addUser" } );
route( "roles/:roleId/users/:userId" ).toAction( { DELETE: "removeUser" } );
resources( "roles", parameterName = "roleId" );

resources( "users", parameterName = "userId" );

route( "profile" ).toAction( { GET: "index", POST: "save" } );

// @app_routes@  ← insertion point for module/scaffold-generated routes

route( ":handler/:action?" ).end(); // conventions-based catch-all
```

Siehe [Referenz: Routen-Übersicht](../reference/routes.md) für die vollständige Tabelle jeder Methode, URL, Zielaktion und erforderlichen Berechtigung.

::: cards
::: card title="Routen-Übersicht" icon="phosphor-duotone:map-trifold" href="../reference/routes.md"
Die vollständige Tabelle aus Methode/URL/Handler/Berechtigung.
:::
::: card title="Sicherheit & Berechtigungen" icon="phosphor-duotone:shield-check" href="security.md"
Wie `@secured` mit der Firewall und dem Berechtigungsmodell zusammenhängt.
:::
::: card title="Die App erweitern" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Einen neuen Handler, eine Route und eine View nach denselben Konventionen hinzufügen.
:::
:::
