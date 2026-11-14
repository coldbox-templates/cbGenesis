---
title: Handler e Routing
order: 1
icon: phosphor-duotone:signpost
summary: Ogni handler, le sue azioni, e come Router.bx collega gli URL ad essi.
tags: [guides, handlers, routing]
---

# Handler e Routing

## Mappa degli handler

| Handler | Base | Scopo |
|---|---|---|
| [`AuditLog.bx`](#auditlog) | `BaseSecureHandler` | Navigazione, esportazione e purga del registro di audit |
| [`Assets.bx`](#assets) | `EventHandler` | Distribuisce in streaming gli avatar utente e il logo del branding |
| [`Auth.bx`](#auth) | `EventHandler` | Login, registrazione, inviti, reset password - tutto pubblico |
| [`BaseSecureHandler.bx`](#basesecurehandler) | `RestHandler` | Classe base per ogni handler admin |
| [`Dashboard.bx`](#dashboard) | `BaseSecureHandler` | La pagina di destinazione autenticata |
| `Main.bx` | `EventHandler` | Handler a evento implicito - vedi [Architettura](../architecture.md#request-lifecycle) |
| [`Permissions.bx`](#permissions) | `BaseSecureHandler` | CRUD degli slug dei permessi |
| [`Profile.bx`](#profile) | `BaseSecureHandler` | Profilo self-service, password, token API, passkey |
| [`Roles.bx`](#roles) | `BaseSecureHandler` | CRUD dei ruoli + assegnazione utenti |
| [`Settings.bx`](#settings) | `BaseSecureHandler` | Registro delle impostazioni dell'app |
| [`Users.bx`](#users) | `BaseSecureHandler` | Amministrazione utenti |

### `BaseSecureHandler`

Ogni handler protetto estende `BaseSecureHandler`, il cui `preHandler` [verifica il CSRF su ogni richiesta che cambia stato](#csrf-verification), forza il layout `Admin`, e reindirizza a `profile/passkey-required` quando `cbRequirePasskey` è attivo e l'utente non ne ha nessuna. Fornisce anche helper condivisi (`getApiResults()`, `ensureSortDirection()`, `getPagination()`):

```boxlang title="app/handlers/BaseSecureHandler.bx" linenums="1"
component extends="coldbox.system.RestHandler" {

    function preHandler( event, rc, prc ){
        // ...CSRF verification, deny-by-default...
        event.setLayout( "Admin" );
        // ...passkey enforcement...
    }

}
```

Costruire un nuovo handler protetto inizia sempre nello stesso modo:

```boxlang title="Example: a new secured handler" linenums="1"
component extends="BaseSecureHandler" secured {

    function index( event, rc, prc ){
        prc.pageTitle = "My Page";
        event.setView( "myhandler/index" );
    }

}
```

### `AuditLog`

`@secured("auditlog:admin,auditlog:read")` a livello di classe; ogni azione tranne `index` è `@remote`:

- `index`, `search`, `show` - sfoglia e filtra il registro di audit
- `export` - `@secured("auditlog:admin,auditlog:export")`, distribuisce in streaming un CSV
- `purge` - `@secured("auditlog:admin,auditlog:delete")`, elimina le voci più vecchie di una data limite
- `clear` - `@secured("auditlog:admin")`, elimina ogni voce

### `Assets`

Nessuna annotazione `@secured` a livello di classe - distribuisce in streaming file binari dal disco privato cbfs `assets` (vedi [Database e ORM](database-orm.md) e `app/config/modules/cbfs.bx`), che si trova al di fuori della webroot ed è altrimenti irraggiungibile:

- `avatar` - `@secured` (qualsiasi utente autenticato), distribuisce in streaming la variante JPEG `sm`/`lg` dell'avatar di un utente
- `logo` - pubblico, distribuisce in streaming la variante PNG `sm`/`lg` del logo del branding così la schermata di login e altre pagine per ospiti possono renderizzarlo

Entrambe le azioni restituiscono 404 (piuttosto che errore) per una forma `userId`/`size` non riconosciuta o quando il file richiesto semplicemente non esiste, così un chiamante non può distinguere "nessun avatar" da "nessun utente del genere" solo dalla forma della risposta. Il ridimensionamento, il ritaglio e l'archiviazione passano attraverso `ImageService` (`app/models/system/ImageService.bx`), invocato tramite `getInstance()` dentro ogni azione piuttosto che una proprietà `@inject` - vedi il docblock su `Assets.bx` per il perché (una stranezza dell'ordine di boot di WireBox con la costruzione di singleton innescata dall'handler).

### `Auth`

Nessuna annotazione `@secured` - queste azioni devono restare raggiungibili dagli ospiti:

- `login` / `doLogin` (GET/POST) - verificato CSRF, chiama `securityService.login()`, supporta `rememberMe`
- `register` / `doRegister` - controllato dall'impostazione `cbAllowRegistration`
- `checkEmailAvailability` - endpoint JSON per controlli live sulla disponibilità dell'email
- `verifyRegistration` - consuma un token azione `PURPOSE_REGISTRATION`
- `activateInvitation` / `doActivateInvitation` - imposta una password per un utente invitato, creato dall'admin
- `forgotPassword` / `doForgotPassword` - controllato da `cbAllowForgotPassword`
- `resetPassword` / `doResetPassword` - valida il token di reset, imposta una nuova password
- `verifyEmailChange` - consuma un token azione `PURPOSE_EMAIL_CHANGE`
- `logout` - chiama `securityService.logout()`

`preHandler` reindirizza un visitatore già autenticato direttamente alla dashboard, e imposta il layout da `prc.settings.cbLoginLayout` (`AuthSplit` per default - vedi [`guides/security.md`](security.md)); `verifyEmailChange` e `logout` sono esentati da quel reindirizzamento così restano raggiungibili indipendentemente dal fatto che il visitatore sia già autenticato.

### `Dashboard`

`@secured` (qualsiasi utente autenticato, nessun permesso specifico richiesto):

- `index` - la home della dashboard
- `notAuthorized` - l'obiettivo di `invalidAuthorizationEvent`, mostrato quando a un utente autenticato manca un permesso richiesto

### `Permissions`

`@secured("permissions:admin,permissions:read")` a livello di classe:

- `index`
- `create` - `@secured("permissions:admin,permissions:write")`
- `update` / `delete` - `@remote`, stessi permessi di scrittura/eliminazione

### `Profile`

Azioni self-service `@secured` per l'utente corrente, tutte endpoint AJAX `@remote` tranne `index`:

- `index`, `passkeyRequired`
- `save`, `doPasswordChange`
- `requestEmailChange` / `cancelEmailChange` - avvia/annulla un cambio email in sospeso, confermato tramite `Auth.verifyEmailChange`
- `listTokens` / `createToken` / `updateToken` / `deleteToken` - token API
- `listPasskeys` / `updatePasskey` / `deletePasskey`
- `uploadAvatar` / `deleteAvatar` - accetta l'immagine come URI dati base64 in `rc.avatar` (BoxLang non ha un parser multipart/form-data, quindi i caricamenti viaggiano come JSON), decodificata tramite `BaseSecureHandler.decodeDataUri()`; distribuita in streaming di ritorno da `Assets.avatar`

Ognuna di queste è verificata per il CSRF da `BaseSecureHandler` a meno che non sia raggiunta tramite un metodo HTTP sicuro - vedi [Verifica CSRF](#csrf-verification).

### `Roles`

`@secured("roles:admin,roles:read")` a livello di classe; ogni azione tranne `index` è `@remote`:

- `index`
- `create` / `update` / `delete` - `@secured("roles:admin,roles:write"` / `"...:delete")`
- `users` / `availableUsers` - elenca gli utenti su/disponibili per un ruolo
- `addUser` / `removeUser` - `@secured("roles:admin")`

### `Settings`

`@secured("settings:admin,settings:read")` a livello di classe:

- `index`
- `registry` / `registrySearch` - registro delle impostazioni paginato
- `createRegistry` / `updateRegistry` / `toggleRegistryStatus` / `deleteRegistry` - `settings:admin,settings:write`
- `save` - salvataggio bulk delle impostazioni core
- `uploadLogo` / `deleteLogo` - `settings:admin,settings:write`, stessa convenzione URI dati base64 di `Profile.uploadAvatar`; memorizza/ripristina l'impostazione `cbAppLogo` e distribuisce in streaming tramite `Assets.logo`
- Utility admin (tutte `settings:admin`): `clearTemplateCache`, `clearSessionsCache`, `revokeRememberTokens`, `flushSettingsCache`

### `Users`

`@secured("users:admin,users:read")` a livello di classe:

- `index`, `search`
- `create` / `update` / `delete` / `resendInvitation` - `users:admin,users:write` / `...:delete`
- `show` - `users:read`
- Solo admin (`users:admin`): `updateProfile`, `setStatus`, `resetPassword`, `verify`, `revokeRememberTokens`, `addRole`/`removeRole`, `addPermission`/`removePermission`, `savePreferences`, `revokeToken`/`revokeAllTokens`

`ensureNotSelf()` protegge diverse di queste per impedire a un admin di retrocedere o rimuovere i propri stessi ruoli.

<figure>
	<img src="../assets/screenshots/users.png" alt="The Users admin page">
	<figcaption>La pagina admin Utenti.</figcaption>
</figure>

## Verifica CSRF

`app/config/modules/cbsecurity.bx` imposta `csrf.enableAutoVerifier: false`, quindi non c'è un interceptor globale. Invece, `BaseSecureHandler.preHandler()` verifica il CSRF **deny-by-default** per ogni handler che lo estende:

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

Cosa significa questo quando estendi un handler protetto:

- **Non ci si iscrive volontariamente.** Qualsiasi azione raggiunta via `POST`, `PUT`, `PATCH`, o `DELETE` deve portare un `rc.csrf` valido, fin dal giorno in cui la aggiungi. Non c'è nessuna lista per handler da ricordarsi di aggiornare.
- **I metodi sicuri sono esentati.** `GET`, `HEAD`, e `OPTIONS` non devono cambiare stato, quindi non comportano rischio CSRF, e `OPTIONS` (preflight CORS) non può trasportare affatto un token. Se un metodo sicuro nel tuo codice cambia stato, quello è il bug da correggere.
- **`onInvalidCSRF()` è sovrascrivibile.** L'implementazione base termina con un fallimento di autorizzazione, che è ciò che vogliono gli endpoint JSON/AJAX - ogni mutazione in `Permissions` ora è una di queste, inviata tramite `fetchWithCsrf()` (vedi [Frontend](frontend.md#csrf-on-mutating-requests)), che recupera da un token obsoleto invece di richiedere un reindirizzamento. `Settings` continua a sovrascriverlo per mostrare un messaggio flash e reindirizzare i suoi invii di form nativi, così un browser form riceve una pagina invece di un semplice 403. Sovrascrivilo nel tuo handler quando renderizza HTML invece di JSON.

!!! note "`Auth` non è un handler protetto"
    `Auth` estende `coldbox.system.EventHandler`, non `BaseSecureHandler`, perché le sue azioni vengono eseguite per visitatori non autenticati e quindi non possono ereditare il controllo di cui sopra. Ogni azione che cambia stato verifica il proprio token: `doLogin`, `doRegister`, `doActivateInvitation`, `doForgotPassword`, `doResetPassword`, e `logout`.

## Mappa delle rotte (`app/config/Router.bx`)

Tutte le rotte sono dichiarate in un'unica funzione `configure()`:

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

Vedi [Riferimento: Mappa delle rotte](../reference/routes.md) per la tabella completa di ogni metodo, URL, azione target, e permesso richiesto.

::: cards
::: card title="Mappa delle rotte" icon="phosphor-duotone:map-trifold" href="../reference/routes.md"
La tabella completa metodo/URL/handler/permesso.
:::
::: card title="Sicurezza e permessi" icon="phosphor-duotone:shield-check" href="security.md"
Come `@secured` si collega al firewall e al modello di permessi.
:::
::: card title="Estendere l'app" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Aggiungi un nuovo handler, rotta, e vista seguendo queste stesse convenzioni.
:::
:::
