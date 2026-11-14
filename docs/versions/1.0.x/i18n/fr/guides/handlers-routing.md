---
title: Handlers & Routage
order: 1
icon: phosphor-duotone:signpost
summary: Chaque handler, ses actions, et comment Router.bx relie les URL à ceux-ci.
tags: [guides, handlers, routing]
---

# Handlers & Routage

## Carte des handlers

| Handler | Base | Objet |
|---|---|---|
| [`AuditLog.bx`](#auditlog) | `BaseSecureHandler` | Parcours, export, et purge du journal d'audit |
| [`Assets.bx`](#assets) | `EventHandler` | Diffuse les avatars utilisateur et le logo de marque |
| [`Auth.bx`](#auth) | `EventHandler` | Connexion, inscription, invitations, réinitialisation de mot de passe - tout public |
| [`BaseSecureHandler.bx`](#basesecurehandler) | `RestHandler` | Classe de base pour chaque handler d'administration |
| [`Dashboard.bx`](#dashboard) | `BaseSecureHandler` | La page d'accueil authentifiée |
| `Main.bx` | `EventHandler` | Handler d'événement implicite - voir [Architecture](../architecture.md#request-lifecycle) |
| [`Permissions.bx`](#permissions) | `BaseSecureHandler` | CRUD des slugs de permission |
| [`Profile.bx`](#profile) | `BaseSecureHandler` | Profil en libre-service, mot de passe, jetons API, passkeys |
| [`Roles.bx`](#roles) | `BaseSecureHandler` | CRUD des rôles + assignation d'utilisateurs |
| [`Settings.bx`](#settings) | `BaseSecureHandler` | Registre des paramètres de l'application |
| [`Users.bx`](#users) | `BaseSecureHandler` | Administration des utilisateurs |

### `BaseSecureHandler`

Chaque handler protégé étend `BaseSecureHandler`, dont le `preHandler` [vérifie le CSRF sur chaque requête modifiant l'état](#csrf-verification), impose la mise en page `Admin`, et redirige vers `profile/passkey-required` lorsque `cbRequirePasskey` est activé et que l'utilisateur n'en a aucune. Il fournit aussi des helpers partagés (`getApiResults()`, `ensureSortDirection()`, `getPagination()`) :

```boxlang title="app/handlers/BaseSecureHandler.bx" linenums="1"
component extends="coldbox.system.RestHandler" {

    function preHandler( event, rc, prc ){
        // ...CSRF verification, deny-by-default...
        event.setLayout( "Admin" );
        // ...passkey enforcement...
    }

}
```

Créer un nouveau handler sécurisé commence toujours de la même façon :

```boxlang title="Example: a new secured handler" linenums="1"
component extends="BaseSecureHandler" secured {

    function index( event, rc, prc ){
        prc.pageTitle = "My Page";
        event.setView( "myhandler/index" );
    }

}
```

### `AuditLog`

`@secured("auditlog:admin,auditlog:read")` au niveau de la classe ; toutes les actions sauf `index` sont `@remote` :

- `index`, `search`, `show` - parcourir et filtrer le journal d'audit
- `export` - `@secured("auditlog:admin,auditlog:export")`, diffuse un CSV
- `purge` - `@secured("auditlog:admin,auditlog:delete")`, supprime les entrées antérieures à une date limite
- `clear` - `@secured("auditlog:admin")`, supprime toutes les entrées

### `Assets`

Aucune annotation `@secured` au niveau de la classe - il diffuse des fichiers binaires depuis le disque cbfs privé `assets` (voir [Base de données & ORM](database-orm.md) et `app/config/modules/cbfs.bx`), qui se trouve hors de la racine web et est autrement inaccessible :

- `avatar` - `@secured` (tout utilisateur authentifié), diffuse la variante JPEG `sm`/`lg` de l'avatar d'un utilisateur
- `logo` - public, diffuse la variante PNG `sm`/`lg` du logo de marque afin que l'écran de connexion et d'autres pages invitées puissent l'afficher

Les deux actions renvoient un 404 (plutôt qu'une erreur) pour une forme de `userId`/`size` non reconnue ou lorsque le fichier demandé n'existe tout simplement pas, afin qu'un appelant ne puisse pas distinguer « pas d'avatar » de « aucun utilisateur de ce type » à partir de la seule forme de la réponse. Le redimensionnement, le recadrage, et le stockage passent par `ImageService` (`app/models/system/ImageService.bx`), invoqué via `getInstance()` à l'intérieur de chaque action plutôt qu'une propriété `@inject` - voir le docblock de `Assets.bx` pour la raison (une particularité de l'ordre de démarrage de WireBox avec la construction de singleton déclenchée par le handler).

### `Auth`

Aucune annotation `@secured` - ces actions doivent rester accessibles aux invités :

- `login` / `doLogin` (GET/POST) - vérifié CSRF, appelle `securityService.login()`, prend en charge `rememberMe`
- `register` / `doRegister` - conditionné par le paramètre `cbAllowRegistration`
- `checkEmailAvailability` - point de terminaison JSON pour les vérifications de disponibilité d'email en direct
- `verifyRegistration` - consomme un jeton d'action `PURPOSE_REGISTRATION`
- `activateInvitation` / `doActivateInvitation` - définit un mot de passe pour un utilisateur invité, créé par un administrateur
- `forgotPassword` / `doForgotPassword` - conditionné par `cbAllowForgotPassword`
- `resetPassword` / `doResetPassword` - valide le jeton de réinitialisation, définit un nouveau mot de passe
- `verifyEmailChange` - consomme un jeton d'action `PURPOSE_EMAIL_CHANGE`
- `logout` - appelle `securityService.logout()`

`preHandler` redirige un visiteur déjà authentifié directement vers le tableau de bord, et définit la mise en page à partir de `prc.settings.cbLoginLayout` (`AuthSplit` par défaut - voir [`guides/security.md`](security.md)) ; `verifyEmailChange` et `logout` sont exemptés de cette redirection afin qu'ils restent accessibles que le visiteur soit déjà authentifié ou non.

### `Dashboard`

`@secured` (tout utilisateur authentifié, aucune permission spécifique requise) :

- `index` - l'accueil du tableau de bord
- `notAuthorized` - la cible de `invalidAuthorizationEvent`, affichée lorsqu'un utilisateur authentifié manque d'une permission requise

### `Permissions`

`@secured("permissions:admin,permissions:read")` au niveau de la classe :

- `index`
- `create` - `@secured("permissions:admin,permissions:write")`
- `update` / `delete` - `@remote`, mêmes permissions d'écriture/suppression

### `Profile`

Actions en libre-service `@secured` pour l'utilisateur courant, toutes des points de terminaison AJAX `@remote` sauf `index` :

- `index`, `passkeyRequired`
- `save`, `doPasswordChange`
- `requestEmailChange` / `cancelEmailChange` - démarre/annule un changement d'email en attente, confirmé via `Auth.verifyEmailChange`
- `listTokens` / `createToken` / `updateToken` / `deleteToken` - jetons API
- `listPasskeys` / `updatePasskey` / `deletePasskey`
- `uploadAvatar` / `deleteAvatar` - accepte l'image en URI de données base64 dans `rc.avatar` (BoxLang n'a pas d'analyseur multipart/form-data, donc les téléversements voyagent en JSON), décodée via `BaseSecureHandler.decodeDataUri()` ; renvoyée par `Assets.avatar`

Chacune de ces actions est vérifiée CSRF par `BaseSecureHandler` sauf si elle est atteinte via une méthode HTTP sûre - voir [Vérification CSRF](#csrf-verification).

### `Roles`

`@secured("roles:admin,roles:read")` au niveau de la classe ; toutes les actions sauf `index` sont `@remote` :

- `index`
- `create` / `update` / `delete` - `@secured("roles:admin,roles:write"` / `"...:delete")`
- `users` / `availableUsers` - liste les utilisateurs assignés/disponibles pour un rôle
- `addUser` / `removeUser` - `@secured("roles:admin")`

### `Settings`

`@secured("settings:admin,settings:read")` au niveau de la classe :

- `index`
- `registry` / `registrySearch` - registre des paramètres paginé
- `createRegistry` / `updateRegistry` / `toggleRegistryStatus` / `deleteRegistry` - `settings:admin,settings:write`
- `save` - sauvegarde groupée des paramètres principaux
- `uploadLogo` / `deleteLogo` - `settings:admin,settings:write`, même convention d'URI de données base64 que `Profile.uploadAvatar` ; stocke/restaure le paramètre `cbAppLogo` et le renvoie via `Assets.logo`
- Utilitaires d'administration (tous `settings:admin`) : `clearTemplateCache`, `clearSessionsCache`, `revokeRememberTokens`, `flushSettingsCache`

### `Users`

`@secured("users:admin,users:read")` au niveau de la classe :

- `index`, `search`
- `create` / `update` / `delete` / `resendInvitation` - `users:admin,users:write` / `...:delete`
- `show` - `users:read`
- Réservé aux administrateurs (`users:admin`) : `updateProfile`, `setStatus`, `resetPassword`, `verify`, `revokeRememberTokens`, `addRole`/`removeRole`, `addPermission`/`removePermission`, `savePreferences`, `revokeToken`/`revokeAllTokens`

`ensureNotSelf()` protège plusieurs de ces actions pour empêcher un administrateur de rétrograder ou de retirer ses propres rôles.

<figure>
	<img src="../assets/screenshots/users.png" alt="The Users admin page">
	<figcaption>La page d'administration des Utilisateurs.</figcaption>
</figure>

## Vérification CSRF

`app/config/modules/cbsecurity.bx` définit `csrf.enableAutoVerifier: false`, donc il n'y a pas d'intercepteur global. À la place, `BaseSecureHandler.preHandler()` vérifie le CSRF **par défaut restrictif** pour chaque handler qui en hérite :

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

Ce que cela signifie lorsque vous étendez un handler sécurisé :

- **Vous n'avez pas à y adhérer explicitement.** Toute action atteinte via `POST`, `PUT`, `PATCH`, ou `DELETE` doit porter un `rc.csrf` valide, dès le jour où vous l'ajoutez. Il n'existe pas de liste par handler à penser à mettre à jour.
- **Les méthodes sûres sont exemptées.** `GET`, `HEAD`, et `OPTIONS` ne doivent pas modifier l'état, elles ne présentent donc aucun risque CSRF, et `OPTIONS` (préflight CORS) ne peut porter aucun jeton du tout. Si une méthode sûre de votre code modifie l'état, c'est le bug à corriger.
- **`onInvalidCSRF()` est surchargeable.** L'implémentation de base interrompt avec un échec d'autorisation, ce que veulent les points de terminaison JSON/AJAX - chaque mutation dans `Permissions` en fait désormais partie, soumise via `fetchWithCsrf()` (voir [Frontend](frontend.md#csrf-on-mutating-requests)), qui se rétablit à partir d'un jeton périmé sans avoir besoin de redirection. `Settings` la surcharge encore pour afficher un message flash et rediriger ses soumissions de formulaire natives, afin qu'un navigateur reçoive une page plutôt qu'un simple 403. Surchargez-la dans votre propre handler lorsqu'il rend du HTML plutôt que du JSON.

!!! note "`Auth` n'est pas un handler sécurisé"
    `Auth` étend `coldbox.system.EventHandler`, pas `BaseSecureHandler`, car ses actions s'exécutent pour des visiteurs non authentifiés et ne peuvent donc pas hériter du contrôle ci-dessus. Chaque action modifiant l'état vérifie son propre jeton : `doLogin`, `doRegister`, `doActivateInvitation`, `doForgotPassword`, `doResetPassword`, et `logout`.

## Carte des routes (`app/config/Router.bx`)

Toutes les routes sont déclarées dans une seule fonction `configure()` :

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

Voir [Référence : Carte des routes](../reference/routes.md) pour le tableau complet de chaque méthode, URL, action cible, et permission requise.

::: cards
::: card title="Carte des routes" icon="phosphor-duotone:map-trifold" href="../reference/routes.md"
Le tableau complet méthode/URL/handler/permission.
:::
::: card title="Sécurité & Permissions" icon="phosphor-duotone:shield-check" href="security.md"
Comment `@secured` s'articule avec le pare-feu et le modèle de permissions.
:::
::: card title="Étendre l'application" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Ajouter un nouveau handler, une route, et une vue en suivant ces mêmes conventions.
:::
:::
