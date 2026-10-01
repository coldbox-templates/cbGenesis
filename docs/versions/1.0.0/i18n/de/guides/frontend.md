---
title: Frontend
order: 4
icon: phosphor-duotone:palette
summary: Serverseitig gerenderte BXM-Views, kleine Alpine.js-Komponenten und eine mit Vite kompilierte SCSS/JS-Pipeline.
tags: [guides, frontend, alpine, vite]
---

# Frontend

## Wie es zusammenpasst

Das Frontend ist eine **hybride, serverseitig gerenderte + Alpine.js**-Anwendung - keine SPA, kein clientseitiger Router:

::: stepper
::: step "ColdBox-Layouts liefern das Gerüst"
`Admin.bxm`, `AuthSplit.bxm` und ähnliche in `app/layouts/` rendern den HTML-Rahmen.
:::
::: step "BXM-Templates rendern serverseitig"
Views in `app/views/` rendern mit `rc`/`prc`-Daten, die der Handler bereits aufgelöst hat.
:::
::: step "Alpine.js fügt Interaktivität hinzu"
Kleine `x-data`-Komponenten übernehmen Formulare, Modals, Drawer und Umschalter - kein Build-Schritt pro Komponente nötig.
:::
::: step "Vite kompiliert die Assets" color="success"
SCSS + JS aus `resources/assets/` werden zu `public/includes/` kompiliert, ausgeliefert unter dem `ASSET_URL`-Präfix.
:::
:::

## Alpine.js-Architektur

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

Jede Komponente ist ein eigenständiges Modul, das ein Alpine-`x-data`-Objekt zurückgibt:

=== "Komponente"
    ```js title="resources/assets/js/components/ui/MessageBox.js" linenums="1"
    export default () => ( {
        visible: true,
        init() {
            setTimeout( () => this.visible = false, 5000 );
        }
    } );
    ```
=== "Verwendung in einer View"
    ```html title="app/views/_components/ui/messagebox.bxm" linenums="1"
    <div x-data="messageBox" x-show="visible" x-transition>
        <!-- alert content -->
    </div>
    ```

## SCSS-Struktur

```text title="resources/assets/scss/ layout" linenums="1"
app.scss
  ├── _variables.scss   Bootstrap variable overrides
  ├── bootstrap          Full Bootstrap 5.3 import
  ├── _base.scss         CSS custom properties (light/dark theme)
  ├── components/        9 component partials
  ├── layouts/            Admin + Auth layout partials
  └── views/              Page-specific styles
```

## Vite-Konfiguration

`vite.config.mjs` verwendet [`coldbox-vite-plugin`](https://github.com/coldbox-modules/coldbox-vite-plugin)s `coldbox()`-Plugin:

- Einstiegspunkte: `resources/assets/scss/app.scss` und `resources/assets/js/App.js`
- `refresh: appRefreshPaths` — automatischer vollständiger Reload bei Handler-/View-Änderungen
- `publicDirectory: "public/includes"` — wohin gebaute Assets gelangen
- SCSS-Präprozessor mit `silenceDeprecations`-Flags für neueres Dart Sass (import, global-builtin, color-functions, if-function)

```bash frame="terminal" title="Terminal"
npm run dev        # Vite dev server with HMR
npm run build      # Production build → public/includes/
npm run lint       # ESLint check on resources/assets/js
npm run lint:fix   # ESLint auto-fix
npm run lint:scss  # Stylelint on resources/assets/scss
```

!!! note "ASSET_URL"
    In der Produktion werden kompilierte Asset-URLs mit der Umgebungsvariable `ASSET_URL` vorangestellt (`.env.example` setzt standardmäßig `/includes`) - siehe [Konfiguration](configuration.md#environment-variables).

## Serverseitig gerenderte View-Komponenten

Diese BXM-Partials liegen unter `app/views/_components/` und werden mit ColdBoxs `view()`-Helfer gerendert. Sie sind bewusst präsentationsfokussiert: Werte über den `args`-Struct durchreichen und Geschäftslogik in Handlern oder Services belassen.

### Anwendungsgerüst

| Partial | Zweck und Eingaben |
|---|---|
| `_components/app/includes` | Dokument-Metadaten, Theme-/Sidebar-FOUC-Vermeidung, Passkey-Skript und Vite-CSS/JS. Optionales `title`. Einmal im `<head>` einbinden. |
| `_components/app/sidebar` | Admin-Navigation, berechtigungsbewusste Links zu Users/Roles/Permissions/Audit Log, Einstellungs-Untermenü und Sidebar-Footer. Liest `prc.authUser`; wird aus `Admin.bxm` eingebunden. |
| `_components/app/sidebar-brand` | Anwendungslogo-/Namens-Link, verwendet von der Sidebar. |
| `_components/app/sidebar-footer` | Zusammenfassung des authentifizierten Benutzers sowie Profil-/Abmelde-Aktionen, verwendet von der Sidebar. |
| `_components/app/topbar` | Sidebar-Umschalter, Theme-Umschalter, Breadcrumbs, Benutzermenü und Abmelde-Aktion. Liest `prc.authUser` und `prc.title`. |
| `_components/app/topbar-breadcrumbs` | Dashboard-Breadcrumb, gerendert innerhalb der Topbar. Erweitern beim Hinzufügen tieferer Navigation. |
| `_components/app/topbar-notifications` | Topbar-Benachrichtigungsslot/-Komponente für Anwendungsbenachrichtigungen. |
| `_components/app/footer` | Copyright und Footer-Links. Optionale `classes`. Liest `prc.settings.cbCopyrightNotice`. |

### Authentifizierungs-Partials

| Partial | Zweck und Eingaben |
|---|---|
| `_components/auth/footer` | Footer, verwendet von den Authentifizierungs-Layouts. |
| `_components/auth/passwordInput` | Wiederverwendbares Passwortfeld mit Sichtbarkeits-Umschalter und Passwortstärke-Hinweisen. |

### UI-Partials

| Partial | Zweck und Eingaben |
|---|---|
| `_components/ui/modal` | Generischer Alpine-Dialog, der optional eine verschachtelte View rendert. Erforderliches `id` sollte eindeutig sein; unterstützt `title`, `openExpression`, `closeExpression`, `contentView` und `contentArgs`. |
| `_components/ui/drawer` | Rechtsseitiger, fokusgesperrter Dialog mit Backdrop-/Escape-Schließen und optionalem `contentView`/`contentArgs`; initialisiert außerdem `drawer()`. |
| `_components/ui/confirm` | Bestätigungsdialog mit statischer oder Alpine-gebundener Nachricht, Bestätigen-/Abbrechen-Ausdrücken, Beschriftungen, Icon, Button-Klasse und Disabled-Ausdruck. |
| `_components/ui/messagebox` | Schließbarer Info-/Erfolgs-/Warn-/Fehler-Hinweis. Unterstützt statische `message`/`title` oder dynamische `messageExpression`/`typeExpression`/`dismissAction`, plus `autoDismiss` und `classes`. |
| `_components/ui/globalProgress` | Global zugänglicher Fortschrittsbalken. Einmal pro Layout einbinden; gesteuert über `$progress.start()`, `$progress.set()` und `$progress.stop()`. |
| `_components/ui/globalToast` | Globaler Toast-Stapel. Einmal pro Layout einbinden; akzeptiert `duration`, `position` und `maxVisible`, und erhält Benachrichtigungen von `$toast()`. |
| `_components/ui/avatar` | Rendert das Avatarbild eines Benutzers, wenn `hasAvatar` wahr ist, andernfalls einen Fallback auf `initials`. Reine Anzeige-Komponente, verwendet von Sidebar, Topbar, Users-Auflistung und Users-Detailseite — siehe [Avatare & Branding-Logo](#avatars-branding-logo). |
| `_components/ui/logo` | Wiederverwendbares Anwendungslogo-/Branding-Partial. |
| `_components/ui/passwordMeter` | Passwortrichtlinien-Messgerät neben Passwortfeldern. |
| `_components/ui/progressbar` | Inline-Fortschrittsbalken-Partial für einen lokalen numerischen Wert. |
| `_components/ui/switch` | Barrierefreies Switch-Steuerelement-Partial für boolesche Einstellungen. |

## Alpine-Komponenten und Stores

`resources/assets/js/App.js` registriert die folgenden Namen global bei Alpine. Verwende sie als `x-data="name"` oder `x-data="name(...)"` in BXM-Views. Formular-Komponenten senden Remote-Requests an die passenden Handler-Routen und erwarten das CSRF-Token, das von ihrer View geliefert wird, gesendet über `fetchWithCsrf()` (siehe [CSRF bei mutierenden Requests](#csrf-on-mutating-requests)).

### Anwendungsgerüst und Authentifizierung

| Alpine-Name | Quelle | Verantwortung |
|---|---|---|
| `adminBody` | `components/app/AdminBody.js` | Verhalten des Admin-Seitengerüsts und globale Layout-Events. |
| `sidebarBrand` | `components/app/SidebarBrand.js` | Interaktionen der Sidebar-Marke. |
| `footer` | `components/app/Footer.js` | Footer-Status und aktuelles-Jahr-Verhalten. |
| `authForm` | `components/auth/AuthForm.js` | Login-Übermittlung, Validierung, Remember-me und Fehler. |
| `registerForm` | `components/auth/RegisterForm.js` | Registrierungsvalidierung, E-Mail-Verfügbarkeit und Übermittlung. |
| `forgotPasswordForm` | `components/auth/ForgotPasswordForm.js` | Status und Feedback für die Passwort-vergessen-Anfrage. |
| `passwordResetForm` | `components/auth/PasswordResetForm.js` | Übermittlung und Validierung des Passwort-Reset-Tokens. |

### Admin- und Profil-Formulare

| Alpine-Name | Quelle | Verantwortung |
|---|---|---|
| `usersForm` | `components/security/UsersForm.js` | Benutzerauflistung, Suche, Pagination, Einladung, Status und Admin-Aktionen. |
| `userDetailForm` | `components/security/UserDetailForm.js` | Benutzerprofil, Rolle, Berechtigung, Präferenz, Token und Verifizierungsaktionen. |
| `rolesForm` | `components/security/RolesForm.js` | Rollen-CRUD und Zuweisen/Entfernen von Benutzern und Berechtigungen. |
| `permissionsForm` | `components/security/PermissionsForm.js` | Berechtigungsauflistung und CRUD-Operationen. |
| `auditLogForm` | `components/security/AuditLogForm.js` | Audit-Filterung, Pagination, Detail-Drawer, CSV-Export, Bereinigung und Löschaktionen. |
| `settingsForm` | `components/settings/SettingsForm.js` | Bearbeitung der zentralen Anwendungseinstellungen und Cache-bezogenes Feedback. |
| `logoUploader` | `components/settings/LogoUploader.js` | Upload/Entfernen des Branding-Logos für das Feld "App Logo Path", neben dessen bestehendem manuellen URL-Eingabefeld und Live-Vorschau — siehe [Avatare & Branding-Logo](#avatars-branding-logo). |
| `settingsRegistryForm` | `components/settings/SettingsRegistryForm.js` | Registry-Suche, Pagination, Erstellen/Aktualisieren, Aktivieren/Deaktivieren und Löschaktionen. |
| `profileForm` | `components/profile/ProfileForm.js` | Profilfelder, Passwortrichtlinie, API-Token-Verwaltung, das Unterformular für Anfrage/Abbruch der E-Mail-Änderung sowie Avatar-Upload/-Entfernen. |
| `preferencesForm` | `components/profile/PreferencesForm.js` | Persistierung der Benutzerpräferenzen. |
| `passkeyOnboarding` | `components/profile/PasskeyOnboarding.js` | Passkey-Registrierung und erforderliches Passkey-Onboarding. |

### UI-Komponenten und globale APIs

| Alpine-Name | Quelle | Verantwortung |
|---|---|---|
| `messageBox` | `components/ui/MessageBox.js` | Sichtbarkeit von Hinweisen und optionale zeitgesteuerte Ausblendung. |
| `passwordMeter` | `components/ui/PasswordMeter.js` | Anzeige von Passwortanforderung und -stärke. |
| `passwordStrength` | `components/ui/PasswordStrength.js` | Berechnung der Passwortstärke und Beschriftungen. |
| `switchComponent` | `components/ui/Switch.js` | Umschalt-Status und Änderungsbehandlung. |
| `drawer` | `components/ui/Drawer.js` | Drawer-Lebenszyklus und Fokusverhalten. |
| `globalProgress` | `components/ui/GlobalProgress.js` | Fortschritts-Events und aktueller Fortschrittswert. |
| `globalToast` | `components/ui/GlobalToast.js` | Toast-Warteschlange, Ausblenden, Typ-Zuordnung und Stapelgrenzen. |

Der Quellcode enthält außerdem `Header.js`, `Sidebar.js`, `TopBarNotifications.js` und `Logo.js`. Ihre Exporte stehen für lokale Imports zur Verfügung, sind aber derzeit nicht bei `App.js` registriert; registriere sie mit `Alpine.data()`, bevor du sie als globale `x-data`-Komponenten verwendest.

### Stores, Hilfsfunktionen und magische Eigenschaften

| API | Quelle | Verwendung |
|---|---|---|
| `$store.theme` | `stores/theme.js` | Hell-/Dunkelmodus, `data-bs-theme` und localStorage-Persistenz. |
| `$store.sidebar` | `stores/sidebar.js` | Desktop-Einklappen, mobiles Öffnen/Schließen und localStorage-Persistenz. |
| `$formatDate`, `$formatDateTime`, `$relativeDate` | `utils/dateFormat.js` | Konsistente Datumsanzeige mit Fallbacks. |
| `$countLabel` | `utils/countLabel.js` | Beschriftungen für Singular/Plural-Anzahl. |
| `$sortClass`, `$sortIcon` | `utils/sort.js` | Sortierbare Tabellenkopfzeilen und Indikatoren. |
| `$passwordMeetsPolicy` | `utils/passwordPolicy.js` | Prüft die konfigurierten Passwortanforderungen. |
| `$isEmail` | `App.js` | Leichtgewichtige Prüfung des E-Mail-Formats. |
| `$toast` / `$progress` | `components/ui/GlobalToast.js`, `GlobalProgress.js` | Globale Benachrichtigungs- und Fortschritts-APIs. |
| `$focus` / `$copy` | `App.js` | Fokussiert ein Nachfahren-Element nach Alpine-Updates; kopiert Text über die Browser-Zwischenablage-API. |
| `createRemoteListing()` | `utils/listing.js` | Gemeinsamer Zustand für Remote-Auflistungen, Ladezustand, Pagination und Fehlerbehandlung. |
| `fetchWithCsrf()`, `refreshCsrfToken()` | `utils/csrf.js` | Sendet einen mutierenden Request mit dem CSRF-Token der Komponente und erholt sich einmalig von einem veralteten Token. |

`AlpinePlugins.js` installiert Collapse, Focus, Mask und Persist. `passkeys.js` stellt die browserseitige WebAuthn-Integration bereit. Halte neue wiederverwendbare Browser-APIs hier dokumentiert und füge ihre Registrierung/ihren Import zu `App.js` hinzu, wenn sie global sind.

### CSRF bei mutierenden Requests

Jede Komponenten-Aktion, die einen nicht-`GET`-Request sendet, geht über `fetchWithCsrf()` (`utils/csrf.js`), statt `fetch()` direkt aufzurufen. Dies ist der eine gekapselte Ort, an dem mutierende Requests gebaut werden, sodass sich das Token-Wiederherstellungsverhalten - und alles, was später hinzugefügt wird (Request-/Response-Hooks, globale Header, Telemetrie) - nur hier ändern muss, statt in jeder Komponente, die zufällig den Status ändert.

**Warum sich überhaupt erholt werden muss.** Der `csrfToken` einer Komponente wird einmalig eingebettet, wenn ihre View gerendert wird. Der Server kann ihn ungültig machen, während die Seite noch geöffnet ist, auf zwei Arten, die cbcsrfs eigene Dokumentation nennt: `csrfField()` (der Mixin hinter jedem versteckten `csrf`-Eingabefeld) erzwingt bei seiner ersten Verwendung pro Request eine Rotation des Session-Tokens, sodass jede Seite, die es rendert - Settings, die Passkey-erforderlich-Seite, die Auth-Seiten - stillschweigend das Token in jedem anderen geöffneten Tab ungültig macht; und ein Token läuft eine feste Zeit nach seiner *Erstellung* ab, nicht nach dem Laden der Seite, sodass eine spät im Leben eines Tokens gerenderte Seite eines mit nur noch Sekunden Restlaufzeit ausgeliefert bekommen kann. So oder so kann das eingebettete Token einer Komponente veralten, bevor der Benutzer mit dem Tippen fertig ist.

**Der Vertrag:**

```js title="resources/assets/js/utils/csrf.js" linenums="1"
export async function fetchWithCsrf( component, url, method, buildRequest ) { /* ... */ }
export async function refreshCsrfToken( component ) { /* ... */ }
```

- `component` ist die Alpine-Komponenteninstanz (übergib `this`). Sie muss eine veränderliche `csrfToken`-Eigenschaft bereitstellen - `fetchWithCsrf()` liest sie, um den Request zu bauen, und überschreibt sie bei einem Retry wegen abgelaufenem Token mit dem aktuellen Token der Session via `refreshCsrfToken()`.
- `buildRequest( csrfToken )` liefert die methodenspezifischen `RequestInit`-Felder (`headers`, `body`, `credentials` usw.) für das gegebene Token. Sie wird beim Retry erneut aufgerufen, muss also den Body jedes Mal frisch aufbauen, statt einen einmal berechneten Wert einzuschließen - das erlaubt es demselben Helfer, `URLSearchParams`-, `JSON.stringify()`- und `FormData`-Bodys gleichermaßen abzudecken.
- Bei einem 403 ruft `fetchWithCsrf()` `refreshCsrfToken()` auf und wiederholt, falls es tatsächlich ein neues Token erhalten hat, den Request einmal mit erneut aufgerufenem `buildRequest()`. Ein zweiter 403 (z. B. ein echter Autorisierungsfehler oder eine vollständig abgelaufene Session) wird unverändert zurückgegeben - Aufrufer brauchen dafür weiterhin ihre normale Fehlerbehandlung.

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

Nur `GET`/`HEAD`-Lesezugriffe überspringen `fetchWithCsrf()` und rufen `fetch()` direkt auf - sie tragen kein CSRF-Token und können deshalb keinen 403 dafür bekommen. Eine Handvoll cbSecurity-Modul-Endpunkte (die WebAuthn-Passkey-Zeremonie-Routen) werden ebenfalls mit reinem `fetch()` aufgerufen: Sie authentifizieren sich über die WebAuthn-Zeremonie selbst, nicht über das CSRF-Token dieser App, und liegen daher außerhalb des Geltungsbereichs dieses Helfers. Jede andere Mutation in `resources/assets/js/components/` geht über `fetchWithCsrf()`; halte neue Formular-Komponenten damit konsistent, wenn sie einen Request hinzufügen, der den Server-Status ändert.

## Avatare & Branding-Logo

Benutzer-Avatare und das Branding-Logo der Anwendung werden auf der privaten cbfs-`assets`-Disk gespeichert (siehe [Konfiguration](configuration.md#module-configuration)) und von `Assets.bx` ausgeliefert (siehe [Handler & Routing](handlers-routing.md#assets)), statt als statische Dateien bereitgestellt zu werden.

<figure>
	<img src="../assets/screenshots/profile.png" alt="The Profile page, showing the avatar upload and assigned role">
	<figcaption>Die Profilseite, mit Avatar-Upload und zugewiesener Rolle.</figcaption>
</figure>

- **Anzeige** läuft über das Partial `_components/ui/avatar`: Es rendert `<img src="/avatars/:userId/:size">`, wenn `hasAvatar` wahr ist, und fällt andernfalls auf ein Initialen-`<span>` zurück. Es ist in Sidebar, Topbar und die Users-Auflistungstabelle eingebunden (serverseitig projiziertes `hasAvatar`-Feld) sowie inline auf der Users-Detailseite (`x-show`/`x-cloak`-Umschaltung basierend auf `user.hasAvatar`, da der Avatar dieser Seite in einer Alpine-gesteuerten Zusammenfassungskarte statt in einem statischen Partial sitzt).
- **Upload/Entfernen** des eigenen Avatars des aktuellen Benutzers liegt auf der Profilseite, verwaltet von `profileForm` (`ProfileForm.js`): Ein verstecktes Datei-Eingabefeld liest das gewählte Bild als base64-Data-URI (`readFileAsDataUrl()`) und sendet es per POST an `POST /profile/avatar`; `DELETE /profile/avatar` entfernt ihn. Beide erhöhen einen `version`-Zähler, der als Cache-Busting-Query-Parameter für die ausgelieferte URL verwendet wird, da sich der Dateipfad selbst zwischen Uploads nicht ändert.
- **Das Branding-Logo** erhält dieselbe Upload-/Entfernen-Behandlung auf der Settings-Seite, über die `logoUploader`-Komponente (`LogoUploader.js`) gegen `POST`/`DELETE /settings/logo`. Beim Upload ersetzt es den Textfeld-Wert der Einstellung `cbAppLogo` durch den ausgelieferten Pfad (`/branding/logo/lg`), und stellt beim Entfernen den konfigurierten Standard wieder her — das manuelle URL-Textfeld und die Live-`<img>`-Vorschau funktionieren weiterhin genau wie zuvor für jeden, der `cbAppLogo` stattdessen auf eine externe URL zeigen lassen möchte.
- Beide Upload-Endpunkte akzeptieren dieselben Formen: Bilder werden serverseitig mit `BaseSecureHandler.decodeDataUri()` dekodiert und dann von `ImageService` (`app/models/system/ImageService.bx`) in `sm`/`lg`-JPEG-Varianten (Avatar) oder PNG-Varianten (Logo) skaliert/zugeschnitten.

::: cards
::: card title="Die App erweitern" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Eine neue Alpine-Komponente und ein SCSS-Partial für deine eigene Admin-Seite hinzufügen.
:::
::: card title="Deployment" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Das Bauen und Ausliefern des Produktions-Frontend-Bundles.
:::
:::
