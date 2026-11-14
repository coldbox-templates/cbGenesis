---
title: Frontend
order: 4
icon: phosphor-duotone:palette
summary: Vues BXM rendues côté serveur, petits composants Alpine.js, et un pipeline SCSS/JS compilé par Vite.
tags: [guides, frontend, alpine, vite]
---

# Frontend

## Comment tout s'articule

Le frontend est une application **hybride rendue côté serveur + Alpine.js** - pas de SPA, pas de routeur côté client :

::: stepper
::: step "Les mises en page ColdBox fournissent la coque"
`Admin.bxm`, `AuthSplit.bxm`, et leurs semblables dans `app/layouts/` rendent le cadre HTML.
:::
::: step "Les templates BXM se rendent côté serveur"
Les vues dans `app/views/` se rendent avec les données `rc`/`prc` déjà résolues par le handler.
:::
::: step "Alpine.js ajoute l'interactivité"
De petits composants `x-data` gèrent les formulaires, les modales, les tiroirs, et les bascules - sans étape de build par composant.
:::
::: step "Vite compile les assets" color="success"
Le SCSS + JS de `resources/assets/` compile dans `public/includes/`, servi au préfixe `ASSET_URL`.
:::
:::

## Architecture Alpine.js

```text title="resources/assets/js/ layout" linenums="1"
App.js (entry)
  ├── Registers all Alpine stores + components
  ├── Imports Bootstrap JS + Phosphor icons + Tippy.js
  │
  ├── Stores ($store.*)
  │   ├── theme.js     → dark/light mode, syncs data-bs-theme + localStorage
  │   └── sidebar.js   → collapse/open, mobile overlay, localStorage persistence
  │
  └── Components (x-data)
      ├── auth/        → AuthForm, RegisterForm, ForgotPasswordForm, PasswordResetForm
    ├── security/     → AuditLogForm, PermissionsForm, RolesForm, UserDetailForm, UsersForm
    ├── profile/      → PasskeyOnboarding, PreferencesForm, ProfileForm
    ├── settings/     → SettingsForm, SettingsRegistryForm
    └── ui/           → Drawer, GlobalProgress, GlobalToast, Logo, MessageBox, PasswordMeter, PasswordStrength, Switch
```

Chaque composant est un module autonome retournant un objet Alpine `x-data` :

=== "Composant"
    ```js title="resources/assets/js/components/ui/MessageBox.js" linenums="1"
    export default () => ( {
        visible: true,
        init() {
            setTimeout( () => this.visible = false, 5000 );
        }
    } );
    ```
=== "Utilisation dans une vue"
    ```html title="app/views/_components/ui/messagebox.bxm" linenums="1"
    <div x-data="messageBox" x-show="visible" x-transition>
        <!-- alert content -->
    </div>
    ```

## Structure SCSS

```text title="resources/assets/scss/ layout" linenums="1"
app.scss
  ├── _variables.scss   Bootstrap variable overrides
  ├── bootstrap          Full Bootstrap 5.3 import
  ├── _base.scss         CSS custom properties (light/dark theme)
  ├── components/        9 component partials
  ├── layouts/            Admin + Auth layout partials
  └── views/              Page-specific styles
```

## Configuration Vite

`vite.config.mjs` utilise le plugin `coldbox()` de [`coldbox-vite-plugin`](https://github.com/coldbox-modules/coldbox-vite-plugin) :

- Points d'entrée : `resources/assets/scss/app.scss` et `resources/assets/js/App.js`
- `refresh: appRefreshPaths` — rechargement complet automatique lors des changements de handler/vue
- `publicDirectory: "public/includes"` — où atterrissent les assets construits
- Préprocesseur SCSS avec des drapeaux `silenceDeprecations` pour les versions récentes de Dart Sass (import, global-builtin, color-functions, if-function)

```bash frame="terminal" title="Terminal"
npm run dev        # Vite dev server with HMR
npm run build      # Production build → public/includes/
npm run lint       # ESLint check on resources/assets/js
npm run lint:fix   # ESLint auto-fix
npm run lint:scss  # Stylelint on resources/assets/scss
```

!!! note "ASSET_URL"
    En production, les URL des assets compilés sont préfixées par la variable d'environnement `ASSET_URL` (`.env.example` la définit par défaut à `/includes`) - voir [Configuration](configuration.md#environment-variables).

## Composants de vue rendus côté serveur

Ces partials BXM vivent sous `app/views/_components/` et sont rendus avec le helper `view()` de ColdBox. Ils sont volontairement centrés sur la présentation : faites passer les valeurs par la structure `args` et gardez la logique métier dans les handlers ou les services.

### Coque de l'application

| Partial | Objet et entrées |
|---|---|
| `_components/app/includes` | Métadonnées du document, prévention du FOUC pour le thème/la barre latérale, script des passkeys, et CSS/JS Vite. `title` optionnel. À inclure une fois dans `<head>`. |
| `_components/app/sidebar` | Navigation d'administration, liens Utilisateurs/Rôles/Permissions/Journal d'audit sensibles aux permissions, sous-menu des paramètres, et pied de barre latérale. Lit `prc.authUser` ; à inclure depuis `Admin.bxm`. |
| `_components/app/sidebar-brand` | Lien logo/nom de l'application utilisé par la barre latérale. |
| `_components/app/sidebar-footer` | Résumé de l'utilisateur authentifié et actions profil/déconnexion utilisées par la barre latérale. |
| `_components/app/topbar` | Bascule de la barre latérale, bascule de thème, fil d'Ariane, menu utilisateur, et action de déconnexion. Lit `prc.authUser` et `prc.title`. |
| `_components/app/topbar-breadcrumbs` | Fil d'Ariane du tableau de bord rendu dans la barre supérieure. À étendre lors de l'ajout d'une navigation plus profonde. |
| `_components/app/topbar-notifications` | Emplacement/composant de notifications de la barre supérieure pour les notifications applicatives. |
| `_components/app/footer` | Copyright et liens de pied de page. `classes` optionnel. Lit `prc.settings.cbCopyrightNotice`. |

### Partials d'authentification

| Partial | Objet et entrées |
|---|---|
| `_components/auth/footer` | Pied de page utilisé par les mises en page d'authentification. |
| `_components/auth/passwordInput` | Champ de mot de passe réutilisable avec bascule de visibilité et indications de robustesse du mot de passe. |

### Partials d'interface

| Partial | Objet et entrées |
|---|---|
| `_components/ui/modal` | Boîte de dialogue Alpine générique qui rend une vue imbriquée optionnelle. L'`id` requis doit être unique ; prend en charge `title`, `openExpression`, `closeExpression`, `contentView`, et `contentArgs`. |
| `_components/ui/drawer` | Boîte de dialogue à piège de focus sur le côté droit avec fermeture par arrière-plan/Échap et `contentView`/`contentArgs` optionnels ; initialise aussi `drawer()`. |
| `_components/ui/confirm` | Boîte de dialogue de confirmation avec message statique ou lié à Alpine, expressions de confirmation/annulation, libellés, icône, classe de bouton, et expression de désactivation. |
| `_components/ui/messagebox` | Alerte info/succès/avertissement/erreur pouvant être rejetée. Prend en charge `message`/`title` statiques ou `messageExpression`/`typeExpression`/`dismissAction` dynamiques, plus `autoDismiss` et `classes`. |
| `_components/ui/globalProgress` | Barre de progression globale accessible. À inclure une fois par mise en page ; contrôlée par `$progress.start()`, `$progress.set()`, et `$progress.stop()`. |
| `_components/ui/globalToast` | Pile de toasts globale. À inclure une fois par mise en page ; accepte `duration`, `position`, et `maxVisible`, et reçoit les notifications de `$toast()`. |
| `_components/ui/avatar` | Rend l'image d'avatar d'un utilisateur lorsque `hasAvatar` est vrai, avec repli sur des `initials` sinon. Affichage en lecture seule utilisé par la barre latérale, la barre supérieure, la liste des Utilisateurs, et la page de détail des Utilisateurs — voir [Avatars & logo de marque](#avatars-branding-logo). |
| `_components/ui/logo` | Partial réutilisable de logo/marque de l'application. |
| `_components/ui/passwordMeter` | Indicateur de politique de mot de passe utilisé à côté des champs de mot de passe. |
| `_components/ui/progressbar` | Partial de barre de progression en ligne pour une valeur numérique locale. |
| `_components/ui/switch` | Partial de contrôle bascule accessible pour les paramètres booléens. |

## Composants et stores Alpine

`resources/assets/js/App.js` enregistre les noms suivants globalement auprès d'Alpine. Utilisez-les comme `x-data="name"` ou `x-data="name(...)"` dans les vues BXM. Les composants de formulaire effectuent des requêtes distantes vers les routes de handler correspondantes et attendent le jeton CSRF fourni par leur vue, envoyé via `fetchWithCsrf()` (voir [CSRF sur les requêtes mutatives](#csrf-on-mutating-requests)).

### Coque de l'application et authentification

| Nom Alpine | Source | Responsabilité |
|---|---|---|
| `adminBody` | `components/app/AdminBody.js` | Comportement de la coque de la page d'administration et événements de mise en page globaux. |
| `sidebarBrand` | `components/app/SidebarBrand.js` | Interactions de la marque dans la barre latérale. |
| `footer` | `components/app/Footer.js` | État du pied de page et comportement de l'année en cours. |
| `authForm` | `components/auth/AuthForm.js` | Soumission de connexion, validation, se souvenir de moi, et erreurs. |
| `registerForm` | `components/auth/RegisterForm.js` | Validation d'inscription, disponibilité de l'email, et soumission. |
| `forgotPasswordForm` | `components/auth/ForgotPasswordForm.js` | État et retour de la demande de mot de passe oublié. |
| `passwordResetForm` | `components/auth/PasswordResetForm.js` | Soumission et validation du jeton de réinitialisation de mot de passe. |

### Formulaires d'administration et de profil

| Nom Alpine | Source | Responsabilité |
|---|---|---|
| `usersForm` | `components/security/UsersForm.js` | Liste des utilisateurs, recherche, pagination, invitation, statut, et actions d'administration. |
| `userDetailForm` | `components/security/UserDetailForm.js` | Profil utilisateur, rôle, permission, préférence, jeton, et actions de vérification. |
| `rolesForm` | `components/security/RolesForm.js` | CRUD des rôles et assignation/retrait d'utilisateurs et de permissions. |
| `permissionsForm` | `components/security/PermissionsForm.js` | Liste des permissions et opérations CRUD. |
| `auditLogForm` | `components/security/AuditLogForm.js` | Filtrage d'audit, pagination, tiroir de détail, export CSV, purge, et actions d'effacement. |
| `settingsForm` | `components/settings/SettingsForm.js` | Édition des paramètres principaux de l'application et retour lié au cache. |
| `logoUploader` | `components/settings/LogoUploader.js` | Téléversement/suppression du logo de marque pour le champ « Chemin du logo de l'application », en complément de son champ de saisie manuelle d'URL existant et de son aperçu en direct — voir [Avatars & logo de marque](#avatars-branding-logo). |
| `settingsRegistryForm` | `components/settings/SettingsRegistryForm.js` | Recherche dans le registre, pagination, création/mise à jour, activation/désactivation, et actions de suppression. |
| `profileForm` | `components/profile/ProfileForm.js` | Champs de profil, politique de mot de passe, gestion des jetons API, le sous-formulaire de demande/annulation de changement d'email, et téléversement/suppression d'avatar. |
| `preferencesForm` | `components/profile/PreferencesForm.js` | Persistance des préférences utilisateur. |
| `passkeyOnboarding` | `components/profile/PasskeyOnboarding.js` | Enregistrement de passkey et intégration obligatoire de passkey. |

### Composants d'interface et API globales

| Nom Alpine | Source | Responsabilité |
|---|---|---|
| `messageBox` | `components/ui/MessageBox.js` | Visibilité des alertes et rejet temporisé optionnel. |
| `passwordMeter` | `components/ui/PasswordMeter.js` | Affichage des exigences et de la robustesse du mot de passe. |
| `passwordStrength` | `components/ui/PasswordStrength.js` | Calcul de la robustesse du mot de passe et libellés. |
| `switchComponent` | `components/ui/Switch.js` | État de bascule et gestion des changements. |
| `drawer` | `components/ui/Drawer.js` | Cycle de vie du tiroir et comportement de focus. |
| `globalProgress` | `components/ui/GlobalProgress.js` | Événements de progression et valeur de progression courante. |
| `globalToast` | `components/ui/GlobalToast.js` | File d'attente de toasts, rejet, correspondance de type, et limites de pile. |

Le code source contient aussi `Header.js`, `Sidebar.js`, `TopBarNotifications.js`, et `Logo.js`. Leurs exports sont disponibles pour des imports locaux, mais ils ne sont pas actuellement enregistrés par `App.js` ; enregistrez-les avec `Alpine.data()` avant de les utiliser comme composants `x-data` globaux.

### Stores, utilitaires, et propriétés magiques

| API | Source | Utilisation |
|---|---|---|
| `$store.theme` | `stores/theme.js` | Mode clair/sombre, `data-bs-theme`, et persistance localStorage. |
| `$store.sidebar` | `stores/sidebar.js` | Réduction sur bureau, ouverture/fermeture mobile, et persistance localStorage. |
| `$formatDate`, `$formatDateTime`, `$relativeDate` | `utils/dateFormat.js` | Affichage cohérent des dates avec valeurs de repli. |
| `$countLabel` | `utils/countLabel.js` | Libellés de comptage singulier/pluriel. |
| `$sortClass`, `$sortIcon` | `utils/sort.js` | En-têtes de tableau triables et indicateurs. |
| `$passwordMeetsPolicy` | `utils/passwordPolicy.js` | Vérifie les exigences de mot de passe configurées. |
| `$isEmail` | `App.js` | Vérification légère du format d'email. |
| `$toast` / `$progress` | `components/ui/GlobalToast.js`, `GlobalProgress.js` | API globales de notification et de progression. |
| `$focus` / `$copy` | `App.js` | Donner le focus à un descendant après les mises à jour Alpine ; copier du texte via l'API presse-papiers du navigateur. |
| `createRemoteListing()` | `utils/listing.js` | État partagé de liste distante, chargement, pagination, et gestion des erreurs. |
| `fetchWithCsrf()`, `refreshCsrfToken()` | `utils/csrf.js` | Envoie une requête mutative avec le jeton CSRF du composant, en se rétablissant une fois à partir d'un jeton périmé. |

`AlpinePlugins.js` installe Collapse, Focus, Mask, et Persist. `passkeys.js` fournit l'intégration WebAuthn côté navigateur. Gardez ici la documentation des nouvelles API navigateur réutilisables et ajoutez leur enregistrement/import à `App.js` lorsqu'elles sont globales.

### CSRF sur les requêtes mutatives

Chaque action de composant qui envoie une requête non-`GET` passe par `fetchWithCsrf()` (`utils/csrf.js`) plutôt que d'appeler `fetch()` directement. C'est l'unique endroit encapsulé où les requêtes mutatives sont construites, si bien que le comportement de récupération du jeton - et tout ce qui lui sera ajouté plus tard (crochets de requête/réponse, en-têtes globaux, télémétrie) - n'a besoin de changer qu'ici plutôt que dans chaque composant qui mute l'état.

**Pourquoi il doit se rétablir.** Le `csrfToken` d'un composant est intégré une seule fois, au rendu de sa vue. Le serveur peut l'invalider pendant que la page est encore ouverte, de deux façons que la documentation de cbcsrf mentionne elle-même : `csrfField()` (le mixin derrière chaque champ caché `csrf`) force la rotation du jeton de la session à sa première utilisation par requête, donc toute page qui le rend - Paramètres, la page de passkey requise, les pages d'authentification - invalide silencieusement le jeton présent dans tout autre onglet ouvert ; et un jeton expire un temps fixe après sa *création*, pas après le chargement de la page, donc une page rendue tard dans la vie d'un jeton peut en recevoir un avec seulement quelques secondes restantes. Dans les deux cas, le jeton intégré d'un composant peut devenir périmé avant que l'utilisateur ait fini de saisir.

**Le contrat :**

```js title="resources/assets/js/utils/csrf.js" linenums="1"
export async function fetchWithCsrf( component, url, method, buildRequest ) { /* ... */ }
export async function refreshCsrfToken( component ) { /* ... */ }
```

- `component` est l'instance du composant Alpine (passez `this`). Elle doit exposer une propriété `csrfToken` mutable - `fetchWithCsrf()` la lit pour construire la requête et, en cas de nouvelle tentative sur jeton périmé, l'écrase avec le jeton actuel de la session via `refreshCsrfToken()`.
- `buildRequest( csrfToken )` retourne les champs `RequestInit` spécifiques à la méthode (`headers`, `body`, `credentials`, etc.) pour le jeton donné. Elle est rappelée lors de la nouvelle tentative, donc elle doit reconstruire le corps à chaque fois plutôt que de fermer sur une valeur calculée une seule fois - c'est ce qui permet au même helper de couvrir aussi bien les corps `URLSearchParams`, `JSON.stringify()`, et `FormData`.
- Sur un 403, `fetchWithCsrf()` appelle `refreshCsrfToken()` et, s'il a obtenu un jeton véritablement nouveau, rejoue la requête une fois avec `buildRequest()` rappelée. Un second 403 (par ex. un véritable échec d'autorisation, ou une session entièrement expirée) est retourné tel quel - les appelants ont toujours besoin de leur gestion d'erreur normale pour ce cas.

```js title="A urlencoded mutation" linenums="1"
const response = await fetchWithCsrf( this, "/permissions", "POST", ( csrf ) => ( {
	headers : { "Content-Type": "application/x-www-form-urlencoded" },
	body    : new URLSearchParams( { permission: this.form.permission, csrf } ),
} ) );
```

```js title="A FormData mutation built from a rendered <form>" linenums="1"
const response = await fetchWithCsrf( this, form.action, "POST", ( csrf ) => {
	const formData = new FormData( form );
	formData.set( "csrf", csrf );
	return { body: formData, credentials: "same-origin", headers: { Accept: "application/json" } };
} );
```

Seules les lectures `GET`/`HEAD` évitent `fetchWithCsrf()` et appellent `fetch()` directement - elles ne portent aucun jeton CSRF et ne peuvent pas renvoyer un 403 pour cette raison. Une poignée de points de terminaison du module cbSecurity (les routes de la cérémonie de passkey WebAuthn) sont également appelées avec un `fetch()` simple : elles s'authentifient via la cérémonie WebAuthn elle-même, pas via le jeton CSRF de cette application, elles sont donc hors du périmètre de ce helper. Toute autre mutation dans `resources/assets/js/components/` passe par `fetchWithCsrf()` ; gardez les nouveaux composants de formulaire cohérents avec cela lorsqu'ils ajoutent une requête qui change l'état du serveur.

## Avatars & logo de marque

Les avatars utilisateur et le logo de marque de l'application sont stockés sur le disque cbfs privé `assets` (voir [Configuration](configuration.md#module-configuration)) et diffusés par `Assets.bx` (voir [Handlers & Routage](handlers-routing.md#assets)) plutôt que servis comme fichiers statiques.

<figure>
	<img src="../assets/screenshots/profile.png" alt="The Profile page, showing the avatar upload and assigned role">
	<figcaption>La page Profil, montrant le téléversement d'avatar et le rôle assigné.</figcaption>
</figure>

- **L'affichage** passe par le partial `_components/ui/avatar` : il rend `<img src="/avatars/:userId/:size">` lorsque `hasAvatar` est vrai, et se rabat sur un `<span>` d'initiales sinon. Il est câblé dans la barre latérale, la barre supérieure, et le tableau de liste des Utilisateurs (champ `hasAvatar` projeté côté serveur), et en ligne dans la page de détail des Utilisateurs (bascule `x-show`/`x-cloak` sur `user.hasAvatar`, car l'avatar de cette page se trouve dans une carte récapitulative pilotée par Alpine plutôt que dans un partial statique).
- **Le téléversement/suppression** de l'avatar de l'utilisateur courant vit sur la page Profil, géré par `profileForm` (`ProfileForm.js`) : un champ de fichier caché lit l'image sélectionnée comme un URI de données en base64 (`readFileAsDataUrl()`) et l'envoie à `POST /profile/avatar` ; `DELETE /profile/avatar` la supprime. Les deux incrémentent un compteur `version` utilisé comme paramètre de requête anti-cache sur l'URL diffusée, puisque le chemin de fichier lui-même ne change pas entre les téléversements.
- **Le logo de marque** reçoit le même traitement de téléversement/suppression sur la page Paramètres, via le composant `logoUploader` (`LogoUploader.js`) contre `POST`/`DELETE /settings/logo`. Il remplace la valeur du champ de saisie texte du paramètre `cbAppLogo` par le chemin diffusé (`/branding/logo/lg`) au téléversement, et restaure la valeur par défaut configurée à la suppression — le champ de saisie texte d'URL manuelle et l'aperçu `<img>` en direct continuent de fonctionner exactement comme avant pour quiconque souhaite pointer `cbAppLogo` vers une URL externe à la place.
- Les deux points de terminaison de téléversement acceptent les mêmes formats : les images sont décodées côté serveur avec `BaseSecureHandler.decodeDataUri()`, puis redimensionnées/recadrées en variantes JPEG `sm`/`lg` (avatar) ou PNG (logo) par `ImageService` (`app/models/system/ImageService.bx`).

::: cards
::: card title="Étendre l'application" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Ajouter un nouveau composant Alpine et un partial SCSS pour votre propre page d'administration.
:::
::: card title="Déploiement" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Construire et livrer le bundle frontend de production.
:::
:::
