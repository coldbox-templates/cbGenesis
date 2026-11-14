---
title: Frontend
order: 4
icon: phosphor-duotone:palette
summary: Viste BXM renderizzate lato server, piccoli componenti Alpine.js e una pipeline SCSS/JS compilata da Vite.
tags: [guides, frontend, alpine, vite]
---

# Frontend

## Come si combina il tutto

Il frontend è un'applicazione **ibrida server-rendered + Alpine.js** - nessuna SPA, nessun router lato client:

::: stepper
::: step "I layout ColdBox forniscono la struttura"
`Admin.bxm`, `AuthSplit.bxm` e simili in `app/layouts/` renderizzano il frame HTML.
:::
::: step "I template BXM si renderizzano lato server"
Le viste in `app/views/` si renderizzano con i dati `rc`/`prc` già risolti dall'handler.
:::
::: step "Alpine.js aggiunge interattività"
Piccoli componenti `x-data` gestiscono form, modali, drawer e toggle - senza bisogno di uno step di build per componente.
:::
::: step "Vite compila gli asset" color="success"
SCSS + JS da `resources/assets/` compilano in `public/includes/`, serviti al prefisso `ASSET_URL`.
:::
:::

## Architettura Alpine.js

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

Ogni componente è un modulo indipendente che restituisce un oggetto Alpine `x-data`:

=== "Componente"
    ```js title="resources/assets/js/components/ui/MessageBox.js" linenums="1"
    export default () => ( {
        visible: true,
        init() {
            setTimeout( () => this.visible = false, 5000 );
        }
    } );
    ```
=== "Utilizzo in una vista"
    ```html title="app/views/_components/ui/messagebox.bxm" linenums="1"
    <div x-data="messageBox" x-show="visible" x-transition>
        <!-- alert content -->
    </div>
    ```

## Struttura SCSS

```text title="resources/assets/scss/ layout" linenums="1"
app.scss
  ├── _variables.scss   Bootstrap variable overrides
  ├── bootstrap          Full Bootstrap 5.3 import
  ├── _base.scss         CSS custom properties (light/dark theme)
  ├── components/        9 component partials
  ├── layouts/            Admin + Auth layout partials
  └── views/              Page-specific styles
```

## Configurazione Vite

`vite.config.mjs` usa il plugin `coldbox()` di [`coldbox-vite-plugin`](https://github.com/coldbox-modules/coldbox-vite-plugin):

- Entry point: `resources/assets/scss/app.scss` e `resources/assets/js/App.js`
- `refresh: appRefreshPaths` — ricaricamento completo automatico su modifiche a handler/viste
- `publicDirectory: "public/includes"` — dove atterrano gli asset compilati
- Preprocessore SCSS con flag `silenceDeprecations` per le versioni più recenti di Dart Sass (import, global-builtin, color-functions, if-function)

```bash frame="terminal" title="Terminal"
npm run dev        # Server di sviluppo Vite con HMR
npm run build      # Build di produzione → public/includes/
npm run lint       # Controllo ESLint su resources/assets/js
npm run lint:fix   # Correzione automatica ESLint
npm run lint:scss  # Stylelint su resources/assets/scss
```

!!! note "ASSET_URL"
    In produzione, gli URL degli asset compilati sono preceduti dalla variabile d'ambiente `ASSET_URL` (`.env.example` la imposta per default a `/includes`) - vedi [Configurazione](configuration.md#environment-variables).

## Componenti di vista renderizzati lato server

Questi partial BXM vivono sotto `app/views/_components/` e vengono renderizzati con l'helper `view()` di ColdBox. Sono intenzionalmente focalizzati sulla presentazione: passa i valori tramite la struct `args` e mantieni la logica di business negli handler o nei servizi.

### Shell dell'applicazione

| Partial | Scopo e input |
|---|---|
| `_components/app/includes` | Metadati del documento, prevenzione FOUC per tema/sidebar, script delle passkey, e CSS/JS di Vite. `title` opzionale. Includi una sola volta in `<head>`. |
| `_components/app/sidebar` | Navigazione admin, link Users/Roles/Permissions/Audit Log sensibili ai permessi, sottomenu impostazioni e footer della sidebar. Legge `prc.authUser`; includi da `Admin.bxm`. |
| `_components/app/sidebar-brand` | Link logo/nome dell'applicazione usato dalla sidebar. |
| `_components/app/sidebar-footer` | Riepilogo dell'utente autenticato e azioni profilo/disconnessione usate dalla sidebar. |
| `_components/app/topbar` | Toggle sidebar, toggle tema, breadcrumb, menu utente e azione di disconnessione. Legge `prc.authUser` e `prc.title`. |
| `_components/app/topbar-breadcrumbs` | Breadcrumb della dashboard renderizzato dentro la topbar. Estendi quando aggiungi navigazione più profonda. |
| `_components/app/topbar-notifications` | Slot/componente di notifica della topbar per le notifiche dell'applicazione. |
| `_components/app/footer` | Copyright e link del footer. `classes` opzionale. Legge `prc.settings.cbCopyrightNotice`. |

### Partial di autenticazione

| Partial | Scopo e input |
|---|---|
| `_components/auth/footer` | Footer usato dai layout di autenticazione. |
| `_components/auth/passwordInput` | Campo password riutilizzabile con toggle di visibilità e indicazioni sulla robustezza della password. |

### Partial UI

| Partial | Scopo e input |
|---|---|
| `_components/ui/modal` | Dialog generico Alpine che renderizza una vista annidata opzionale. `id` richiesto dovrebbe essere univoco; supporta `title`, `openExpression`, `closeExpression`, `contentView` e `contentArgs`. |
| `_components/ui/drawer` | Dialog sul lato destro con focus-trap, chiusura tramite backdrop/Escape e `contentView`/`contentArgs` opzionali; inizializza anche `drawer()`. |
| `_components/ui/confirm` | Dialog di conferma con messaggio statico o legato ad Alpine, espressioni conferma/annulla, etichette, icona, classe pulsante ed espressione disabled. |
| `_components/ui/messagebox` | Alert informazione/successo/avviso/errore che può essere chiuso. Supporta `message`/`title` statici o `messageExpression`/`typeExpression`/`dismissAction` dinamici, più `autoDismiss` e `classes`. |
| `_components/ui/globalProgress` | Barra di progresso globale accessibile. Includi una volta per layout; controllata da `$progress.start()`, `$progress.set()`, e `$progress.stop()`. |
| `_components/ui/globalToast` | Stack di toast globale. Includi una volta per layout; accetta `duration`, `position`, e `maxVisible`, e riceve notifiche da `$toast()`. |
| `_components/ui/avatar` | Renderizza l'immagine avatar di un utente quando `hasAvatar` è true, altrimenti ricade sulle `initials`. Visualizzazione read-only usata dalla sidebar, dalla topbar, dall'elenco Users e dalla pagina di dettaglio Users — vedi [Avatar e logo del branding](#avatars-branding-logo). |
| `_components/ui/logo` | Partial riutilizzabile del logo/branding dell'applicazione. |
| `_components/ui/passwordMeter` | Misuratore della policy password usato accanto ai campi password. |
| `_components/ui/progressbar` | Partial di barra di progresso inline per un valore numerico locale. |
| `_components/ui/switch` | Partial di controllo switch accessibile per le impostazioni booleane. |

## Componenti e store Alpine

`resources/assets/js/App.js` registra globalmente i seguenti nomi con Alpine. Usali come `x-data="name"` o `x-data="name(...)"` nelle viste BXM. I componenti dei form fanno richieste remote verso le rotte handler corrispondenti e si aspettano il token CSRF fornito dalla loro vista, inviato tramite `fetchWithCsrf()` (vedi [CSRF sulle richieste che modificano dati](#csrf-on-mutating-requests)).

### Shell dell'applicazione e autenticazione

| Nome Alpine | Sorgente | Responsabilità |
|---|---|---|
| `adminBody` | `components/app/AdminBody.js` | Comportamento della shell della pagina admin ed eventi di layout globali. |
| `sidebarBrand` | `components/app/SidebarBrand.js` | Interazioni del brand nella sidebar. |
| `footer` | `components/app/Footer.js` | Stato del footer e comportamento dell'anno corrente. |
| `authForm` | `components/auth/AuthForm.js` | Invio del login, validazione, remember-me ed errori. |
| `registerForm` | `components/auth/RegisterForm.js` | Validazione della registrazione, disponibilità email e invio. |
| `forgotPasswordForm` | `components/auth/ForgotPasswordForm.js` | Stato e feedback della richiesta di password dimenticata. |
| `passwordResetForm` | `components/auth/PasswordResetForm.js` | Invio e validazione del token di reset password. |

### Form admin e profilo

| Nome Alpine | Sorgente | Responsabilità |
|---|---|---|
| `usersForm` | `components/security/UsersForm.js` | Elenco utenti, ricerca, paginazione, invito, stato e azioni admin. |
| `userDetailForm` | `components/security/UserDetailForm.js` | Profilo utente, ruolo, permesso, preferenza, token e azioni di verifica. |
| `rolesForm` | `components/security/RolesForm.js` | CRUD dei ruoli e assegnazione/rimozione di utenti e permessi. |
| `permissionsForm` | `components/security/PermissionsForm.js` | Elenco dei permessi e operazioni CRUD. |
| `auditLogForm` | `components/security/AuditLogForm.js` | Filtro di audit, paginazione, drawer di dettaglio, esportazione CSV, purge e azioni di clear. |
| `settingsForm` | `components/settings/SettingsForm.js` | Modifica delle impostazioni core dell'applicazione e feedback relativo alla cache. |
| `logoUploader` | `components/settings/LogoUploader.js` | Caricamento/rimozione del logo del branding per il campo "App Logo Path", accanto al suo input URL manuale esistente e all'anteprima live — vedi [Avatar e logo del branding](#avatars-branding-logo). |
| `settingsRegistryForm` | `components/settings/SettingsRegistryForm.js` | Ricerca nel registro, paginazione, creazione/aggiornamento, abilitazione/disabilitazione e azioni di eliminazione. |
| `profileForm` | `components/profile/ProfileForm.js` | Campi del profilo, policy password, gestione dei token API, il sotto-form di richiesta/annullamento del cambio email, e caricamento/rimozione dell'avatar. |
| `preferencesForm` | `components/profile/PreferencesForm.js` | Persistenza delle preferenze utente. |
| `passkeyOnboarding` | `components/profile/PasskeyOnboarding.js` | Registrazione delle passkey e onboarding obbligatorio delle passkey. |

### Componenti UI e API globali

| Nome Alpine | Sorgente | Responsabilità |
|---|---|---|
| `messageBox` | `components/ui/MessageBox.js` | Visibilità dell'alert e chiusura temporizzata opzionale. |
| `passwordMeter` | `components/ui/PasswordMeter.js` | Visualizzazione dei requisiti e della robustezza della password. |
| `passwordStrength` | `components/ui/PasswordStrength.js` | Calcolo ed etichette della robustezza della password. |
| `switchComponent` | `components/ui/Switch.js` | Stato del toggle e gestione del cambiamento. |
| `drawer` | `components/ui/Drawer.js` | Ciclo di vita del drawer e comportamento del focus. |
| `globalProgress` | `components/ui/GlobalProgress.js` | Eventi di progresso e valore di progresso corrente. |
| `globalToast` | `components/ui/GlobalToast.js` | Coda dei toast, chiusura, mappatura del tipo e limiti dello stack. |

Il sorgente contiene anche `Header.js`, `Sidebar.js`, `TopBarNotifications.js`, e `Logo.js`. I loro export sono disponibili per import locali, ma non sono attualmente registrati da `App.js`; registrali con `Alpine.data()` prima di usarli come componenti `x-data` globali.

### Store, utility e proprietà magiche

| API | Sorgente | Utilizzo |
|---|---|---|
| `$store.theme` | `stores/theme.js` | Modalità chiara/scura, `data-bs-theme`, e persistenza localStorage. |
| `$store.sidebar` | `stores/sidebar.js` | Collasso desktop, apertura/chiusura mobile, e persistenza localStorage. |
| `$formatDate`, `$formatDateTime`, `$relativeDate` | `utils/dateFormat.js` | Visualizzazione coerente delle date con fallback. |
| `$countLabel` | `utils/countLabel.js` | Etichette di conteggio singolare/plurale. |
| `$sortClass`, `$sortIcon` | `utils/sort.js` | Intestazioni di tabella ordinabili e indicatori. |
| `$passwordMeetsPolicy` | `utils/passwordPolicy.js` | Verifica i requisiti password configurati. |
| `$isEmail` | `App.js` | Controllo leggero del formato email. |
| `$toast` / `$progress` | `components/ui/GlobalToast.js`, `GlobalProgress.js` | API globali di notifica e progresso. |
| `$focus` / `$copy` | `App.js` | Mette a fuoco un discendente dopo gli aggiornamenti di Alpine; copia testo tramite l'API clipboard del browser. |
| `createRemoteListing()` | `utils/listing.js` | Stato condiviso per elenchi remoti, caricamento, paginazione e gestione errori. |
| `fetchWithCsrf()`, `refreshCsrfToken()` | `utils/csrf.js` | Invia una richiesta che modifica dati con il token CSRF del componente, recuperando una volta da un token obsoleto. |

`AlpinePlugins.js` installa Collapse, Focus, Mask e Persist. `passkeys.js` fornisce l'integrazione WebAuthn lato browser. Mantieni documentate qui le nuove API browser riutilizzabili e aggiungi la loro registrazione/importazione in `App.js` quando sono globali.

### CSRF sulle richieste che modificano dati

Ogni azione di componente che invia una richiesta non-`GET` passa attraverso `fetchWithCsrf()` (`utils/csrf.js`) invece di chiamare direttamente `fetch()`. Questo è l'unico punto incapsulato in cui vengono costruite le richieste che modificano dati, quindi il comportamento di recupero del token - e qualsiasi cosa vi venga aggiunta in seguito (hook di richiesta/risposta, header globali, telemetria) - deve cambiare solo qui piuttosto che in ogni componente che modifica lo stato.

**Perché deve recuperare affatto.** Il `csrfToken` di un componente viene incorporato una sola volta, quando la sua vista viene renderizzata. Il server può invalidarlo mentre la pagina è ancora aperta, in due modi che la documentazione stessa di cbcsrf segnala: `csrfField()` (il mixin dietro ogni input nascosto `csrf`) forza la rotazione del token della sessione al suo primo utilizzo per richiesta, quindi qualsiasi pagina che lo renderizza - Settings, la pagina di passkey richiesta, le pagine di auth - invalida silenziosamente il token seduto in ogni altra scheda aperta; e un token scade un tempo fisso dopo essere stato *creato*, non dopo il caricamento della pagina, quindi una pagina renderizzata tardi nella vita di un token può essere servita con solo pochi secondi rimasti. In entrambi i casi, il token incorporato di un componente può diventare obsoleto prima che l'utente finisca di digitare.

**Il contratto:**

```js title="resources/assets/js/utils/csrf.js" linenums="1"
export async function fetchWithCsrf( component, url, method, buildRequest ) { /* ... */ }
export async function refreshCsrfToken( component ) { /* ... */ }
```

- `component` è l'istanza del componente Alpine (passa `this`). Deve esporre una proprietà mutabile `csrfToken` - `fetchWithCsrf()` la legge per costruire la richiesta e, in un nuovo tentativo dopo token obsoleto, la sovrascrive con il token corrente della sessione tramite `refreshCsrfToken()`.
- `buildRequest( csrfToken )` restituisce i campi `RequestInit` specifici del metodo (`headers`, `body`, `credentials`, ecc.) per il token dato. Viene chiamato di nuovo al nuovo tentativo, quindi deve costruire il body ogni volta da capo piuttosto che chiudere su un valore calcolato una sola volta - questo è ciò che permette allo stesso helper di coprire allo stesso modo body `URLSearchParams`, `JSON.stringify()`, e `FormData`.
- Su un 403, `fetchWithCsrf()` chiama `refreshCsrfToken()` e, se ha ottenuto un token genuinamente nuovo, ripete la richiesta una volta con `buildRequest()` chiamato di nuovo. Un secondo 403 (ad es. un vero fallimento di autorizzazione, o una sessione scaduta del tutto) viene restituito così com'è - i chiamanti hanno comunque bisogno della loro normale gestione degli errori per quel caso.

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

Solo le letture `GET`/`HEAD` saltano `fetchWithCsrf()` e chiamano direttamente `fetch()` - non trasportano alcun token CSRF e non possono ricevere un 403 per questo motivo. Un pugno di endpoint del modulo cbSecurity (le rotte della cerimonia passkey WebAuthn) vengono anch'essi chiamati con `fetch()` semplice: si autenticano tramite la cerimonia WebAuthn stessa, non tramite il token CSRF di questa app, quindi sono fuori dall'ambito di questo helper. Ogni altra mutazione in `resources/assets/js/components/` passa attraverso `fetchWithCsrf()`; mantieni i nuovi componenti form coerenti con questo quando aggiungono una richiesta che cambia lo stato del server.

## Avatar e logo del branding

Gli avatar degli utenti e il logo del branding dell'applicazione sono memorizzati sul disco privato cbfs `assets` (vedi [Configurazione](configuration.md#module-configuration)) e distribuiti in streaming da `Assets.bx` (vedi [Handler e Routing](handlers-routing.md#assets)) piuttosto che serviti come file statici.

<figure>
	<img src="../assets/screenshots/profile.png" alt="The Profile page, showing the avatar upload and assigned role">
	<figcaption>La pagina Profilo, che mostra il caricamento dell'avatar e il ruolo assegnato.</figcaption>
</figure>

- **La visualizzazione** passa attraverso il partial `_components/ui/avatar`: renderizza `<img src="/avatars/:userId/:size">` quando `hasAvatar` è true, e altrimenti ricade su uno `<span>` con le iniziali. È collegata alla sidebar, alla topbar, e alla tabella dell'elenco Users (campo `hasAvatar` proiettato lato server), e in linea nella pagina di dettaglio Users (toggle `x-show`/`x-cloak` su `user.hasAvatar`, poiché l'avatar di quella pagina si trova dentro una scheda riepilogativa guidata da Alpine piuttosto che in un partial statico).
- **Il caricamento/rimozione** dell'avatar dell'utente corrente vive nella pagina Profilo, gestito da `profileForm` (`ProfileForm.js`): un input file nascosto legge l'immagine selezionata come URI dati base64 (`readFileAsDataUrl()`) e lo invia a `POST /profile/avatar`; `DELETE /profile/avatar` lo rimuove. Entrambi incrementano un contatore `version` usato come parametro di query per l'invalidamento della cache sull'URL in streaming, poiché il percorso del file stesso non cambia tra i caricamenti.
- **Il logo del branding** riceve lo stesso trattamento di caricamento/rimozione nella pagina Impostazioni, tramite il componente `logoUploader` (`LogoUploader.js`) contro `POST`/`DELETE /settings/logo`. Sostituisce il valore dell'input di testo dell'impostazione `cbAppLogo` con il percorso in streaming (`/branding/logo/lg`) al caricamento, e ripristina il default configurato alla rimozione — l'input di testo URL manuale e l'anteprima `<img>` live continuano a funzionare esattamente come prima per chiunque voglia puntare `cbAppLogo` a un URL esterno.
- Entrambi gli endpoint di caricamento accettano le stesse forme: le immagini sono decodificate lato server con `BaseSecureHandler.decodeDataUri()`, poi ridimensionate/ritagliate in varianti `sm`/`lg` JPEG (avatar) o PNG (logo) da `ImageService` (`app/models/system/ImageService.bx`).

::: cards
::: card title="Estendere l'app" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Aggiungi un nuovo componente Alpine e un partial SCSS per la tua pagina admin.
:::
::: card title="Deployment" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Costruire e distribuire il bundle frontend di produzione.
:::
:::
