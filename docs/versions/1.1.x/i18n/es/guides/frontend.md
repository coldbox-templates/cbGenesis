---
title: Frontend
order: 4
icon: phosphor-duotone:palette
summary: Vistas BXM renderizadas en el servidor, pequeños componentes de Alpine.js, y un pipeline SCSS/JS compilado con Vite.
tags: [guides, frontend, alpine, vite]
---

# Frontend

## Cómo encaja todo

El frontend es una aplicación **híbrida, renderizada en el servidor + Alpine.js** - sin SPA, sin enrutador del lado del cliente:

::: stepper
::: step "Los layouts de ColdBox proporcionan la estructura"
`Admin.bxm`, `AuthSplit.bxm`, y afines en `app/layouts/` renderizan el marco HTML.
:::
::: step "Las plantillas BXM se renderizan en el servidor"
Las vistas en `app/views/` se renderizan con los datos de `rc`/`prc` ya resueltos por el handler.
:::
::: step "Alpine.js añade interactividad"
Pequeños componentes `x-data` manejan formularios, modales, cajones y interruptores - sin necesidad de un paso de compilación por componente.
:::
::: step "Vite compila los assets" color="success"
SCSS + JS de `resources/assets/` se compilan en `public/includes/`, servidos con el prefijo `ASSET_URL`.
:::
:::

## Arquitectura de Alpine.js

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

Cada componente es un módulo independiente que devuelve un objeto `x-data` de Alpine:

=== "Componente"
    ```js title="resources/assets/js/components/ui/MessageBox.js" linenums="1"
    export default () => ( {
        visible: true,
        init() {
            setTimeout( () => this.visible = false, 5000 );
        }
    } );
    ```
=== "Uso en una vista"
    ```html title="app/views/_components/ui/messagebox.bxm" linenums="1"
    <div x-data="messageBox" x-show="visible" x-transition>
        <!-- alert content -->
    </div>
    ```

## Estructura SCSS

```text title="resources/assets/scss/ layout" linenums="1"
app.scss
  ├── _variables.scss   Bootstrap variable overrides
  ├── bootstrap          Full Bootstrap 5.3 import
  ├── _base.scss         CSS custom properties (light/dark theme)
  ├── components/        9 component partials
  ├── layouts/            Admin + Auth layout partials
  └── views/              Page-specific styles
```

## Configuración de Vite

`vite.config.mjs` usa el plugin `coldbox()` de [`coldbox-vite-plugin`](https://github.com/coldbox-modules/coldbox-vite-plugin):

- Puntos de entrada: `resources/assets/scss/app.scss` y `resources/assets/js/App.js`
- `refresh: appRefreshPaths` — recarga completa automática en cambios de handler/vista
- `publicDirectory: "public/includes"` — dónde aterrizan los assets compilados
- Preprocesador SCSS con marcas `silenceDeprecations` para las versiones más nuevas de Dart Sass (import, global-builtin, color-functions, if-function)

```bash frame="terminal" title="Terminal"
npm run dev        # Vite dev server with HMR
npm run build      # Production build → public/includes/
npm run lint       # ESLint check on resources/assets/js
npm run lint:fix   # ESLint auto-fix
npm run lint:scss  # Stylelint on resources/assets/scss
```

!!! note "ASSET_URL"
    En producción, las URLs de los assets compilados llevan el prefijo de la variable de entorno `ASSET_URL` (`.env.example` la predetermina a `/includes`) - consulta [Configuración](configuration.md#environment-variables).

## Componentes de vista renderizados en el servidor

Estos parciales BXM viven bajo `app/views/_components/` y se renderizan con el helper `view()` de ColdBox. Están intencionalmente enfocados en presentación: pasa valores a través del struct `args` y mantén la lógica de negocio en handlers o servicios.

### Estructura de la aplicación

| Parcial | Propósito y entradas |
|---|---|
| `_components/app/includes` | Metadatos del documento, prevención de FOUC de tema/barra lateral, script de passkey, y CSS/JS de Vite. `title` opcional. Inclúyelo una vez en `<head>`. |
| `_components/app/sidebar` | Navegación de administración, enlaces de Usuarios/Roles/Permisos/Registro de Auditoría conscientes de permisos, submenú de configuración, y pie de la barra lateral. Lee `prc.authUser`; inclúyelo desde `Admin.bxm`. |
| `_components/app/sidebar-brand` | Enlace del logo/nombre de la aplicación usado por la barra lateral. |
| `_components/app/sidebar-footer` | Resumen del usuario autenticado y acciones de perfil/cierre de sesión usadas por la barra lateral. |
| `_components/app/topbar` | Alternador de la barra lateral, alternador de tema, migas de pan, menú de usuario, y acción de cierre de sesión. Lee `prc.authUser` y `prc.title`. |
| `_components/app/topbar-breadcrumbs` | Miga de pan del panel de control renderizada dentro de la barra superior. Extiéndela al agregar navegación más profunda. |
| `_components/app/topbar-notifications` | Ranura/componente de notificaciones de la barra superior para notificaciones de la aplicación. |
| `_components/app/footer` | Copyright y enlaces de pie de página. `classes` opcional. Lee `prc.settings.cbCopyrightNotice`. |

### Parciales de autenticación

| Parcial | Propósito y entradas |
|---|---|
| `_components/auth/footer` | Pie de página usado por los layouts de autenticación. |
| `_components/auth/passwordInput` | Campo de contraseña reutilizable con alternador de visibilidad y afordancias de fortaleza de contraseña. |

### Parciales de interfaz

| Parcial | Propósito y entradas |
|---|---|
| `_components/ui/modal` | Diálogo genérico de Alpine que renderiza una vista anidada opcional. El `id` requerido debe ser único; admite `title`, `openExpression`, `closeExpression`, `contentView`, y `contentArgs`. |
| `_components/ui/drawer` | Diálogo con trampa de foco lateral derecho, con cierre por fondo/Escape y `contentView`/`contentArgs` opcionales; también inicializa `drawer()`. |
| `_components/ui/confirm` | Diálogo de confirmación con mensaje estático o vinculado a Alpine, expresiones de confirmar/cancelar, etiquetas, ícono, clase de botón, y expresión de deshabilitado. |
| `_components/ui/messagebox` | Alerta descartable de información/éxito/advertencia/error. Admite `message`/`title` estáticos o `messageExpression`/`typeExpression`/`dismissAction` dinámicos, más `autoDismiss` y `classes`. |
| `_components/ui/globalProgress` | Barra de progreso global accesible. Inclúyela una vez por layout; controlada por `$progress.start()`, `$progress.set()`, y `$progress.stop()`. |
| `_components/ui/globalToast` | Pila global de notificaciones toast. Inclúyela una vez por layout; acepta `duration`, `position`, y `maxVisible`, y recibe notificaciones de `$toast()`. |
| `_components/ui/avatar` | Renderiza la imagen de avatar de un usuario cuando `hasAvatar` es verdadero, recurriendo a `initials` en caso contrario. Visualización de solo lectura usada por la barra lateral, la barra superior, el listado de Usuarios, y la página de detalle de Usuarios — consulta [Avatares y logo de marca](#avatars-branding-logo). |
| `_components/ui/logo` | Parcial reutilizable de logo/marca de la aplicación. |
| `_components/ui/passwordMeter` | Medidor de política de contraseñas usado junto a los campos de contraseña. |
| `_components/ui/progressbar` | Parcial de barra de progreso en línea para un valor numérico local. |
| `_components/ui/switch` | Parcial de control de interruptor accesible para ajustes booleanos. |

## Componentes y stores de Alpine

`resources/assets/js/App.js` registra los siguientes nombres globalmente con Alpine. Úsalos como `x-data="name"` o `x-data="name(...)"` en las vistas BXM. Los componentes de formulario hacen solicitudes remotas a las rutas de handler correspondientes y esperan el token CSRF suministrado por su vista, enviado a través de `fetchWithCsrf()` (consulta [CSRF en solicitudes que modifican datos](#csrf-on-mutating-requests)).

### Estructura de la aplicación y autenticación

| Nombre de Alpine | Fuente | Responsabilidad |
|---|---|---|
| `adminBody` | `components/app/AdminBody.js` | Comportamiento de la estructura de la página de administración y eventos globales de layout. |
| `sidebarBrand` | `components/app/SidebarBrand.js` | Interacciones de la marca en la barra lateral. |
| `footer` | `components/app/Footer.js` | Estado del pie de página y comportamiento del año actual. |
| `authForm` | `components/auth/AuthForm.js` | Envío de inicio de sesión, validación, recordarme, y errores. |
| `registerForm` | `components/auth/RegisterForm.js` | Validación de registro, disponibilidad de correo electrónico, y envío. |
| `forgotPasswordForm` | `components/auth/ForgotPasswordForm.js` | Estado y retroalimentación de la solicitud de contraseña olvidada. |
| `passwordResetForm` | `components/auth/PasswordResetForm.js` | Envío y validación del token de restablecimiento de contraseña. |

### Formularios de administración y perfil

| Nombre de Alpine | Fuente | Responsabilidad |
|---|---|---|
| `usersForm` | `components/security/UsersForm.js` | Listado de usuarios, búsqueda, paginación, invitación, estado, y acciones de administración. |
| `userDetailForm` | `components/security/UserDetailForm.js` | Perfil de usuario, rol, permiso, preferencia, token, y acciones de verificación. |
| `rolesForm` | `components/security/RolesForm.js` | CRUD de roles y asignación/eliminación de usuarios y permisos. |
| `permissionsForm` | `components/security/PermissionsForm.js` | Listado de permisos y operaciones CRUD. |
| `auditLogForm` | `components/security/AuditLogForm.js` | Filtrado de auditoría, paginación, cajón de detalle, exportación CSV, purga, y acciones de limpieza. |
| `settingsForm` | `components/settings/SettingsForm.js` | Edición de ajustes centrales de la aplicación y retroalimentación relacionada con la caché. |
| `logoUploader` | `components/settings/LogoUploader.js` | Subida/eliminación del logo de marca para el campo "App Logo Path", junto a su entrada de URL manual existente y vista previa en vivo — consulta [Avatares y logo de marca](#avatars-branding-logo). |
| `settingsRegistryForm` | `components/settings/SettingsRegistryForm.js` | Búsqueda de registro, paginación, creación/actualización, habilitar/deshabilitar, y acciones de eliminación. |
| `profileForm` | `components/profile/ProfileForm.js` | Campos de perfil, política de contraseñas, gestión de tokens de API, el subformulario de solicitud/cancelación de cambio de correo electrónico, y subida/eliminación de avatar. |
| `preferencesForm` | `components/profile/PreferencesForm.js` | Persistencia de preferencias de usuario. |
| `passkeyOnboarding` | `components/profile/PasskeyOnboarding.js` | Registro de passkey e incorporación de passkey requerida. |

### Componentes de interfaz y APIs globales

| Nombre de Alpine | Fuente | Responsabilidad |
|---|---|---|
| `messageBox` | `components/ui/MessageBox.js` | Visibilidad de alertas y descarte temporizado opcional. |
| `passwordMeter` | `components/ui/PasswordMeter.js` | Visualización de requisitos y fortaleza de contraseña. |
| `passwordStrength` | `components/ui/PasswordStrength.js` | Cálculo de fortaleza de contraseña y etiquetas. |
| `switchComponent` | `components/ui/Switch.js` | Estado de alternancia y manejo de cambios. |
| `drawer` | `components/ui/Drawer.js` | Ciclo de vida del cajón y comportamiento de foco. |
| `globalProgress` | `components/ui/GlobalProgress.js` | Eventos de progreso y valor de progreso actual. |
| `globalToast` | `components/ui/GlobalToast.js` | Cola de toasts, descarte, mapeo de tipos, y límites de la pila. |

El código fuente también contiene `Header.js`, `Sidebar.js`, `TopBarNotifications.js`, y `Logo.js`. Sus exportaciones están disponibles para importaciones locales, pero actualmente no están registradas por `App.js`; regístralas con `Alpine.data()` antes de usarlas como componentes globales `x-data`.

### Stores, utilidades, y propiedades mágicas

| API | Fuente | Uso |
|---|---|---|
| `$store.theme` | `stores/theme.js` | Modo claro/oscuro, `data-bs-theme`, y persistencia en localStorage. |
| `$store.sidebar` | `stores/sidebar.js` | Colapso en escritorio, apertura/cierre en móvil, y persistencia en localStorage. |
| `$formatDate`, `$formatDateTime`, `$relativeDate` | `utils/dateFormat.js` | Visualización de fecha consistente con valores de respaldo. |
| `$countLabel` | `utils/countLabel.js` | Etiquetas de conteo singular/plural. |
| `$sortClass`, `$sortIcon` | `utils/sort.js` | Encabezados de tabla ordenables e indicadores. |
| `$passwordMeetsPolicy` | `utils/passwordPolicy.js` | Verifica los requisitos de contraseña configurados. |
| `$isEmail` | `App.js` | Verificación ligera de formato de correo electrónico. |
| `$toast` / `$progress` | `components/ui/GlobalToast.js`, `GlobalProgress.js` | APIs globales de notificación y progreso. |
| `$focus` / `$copy` | `App.js` | Enfoca un descendiente después de que Alpine se actualiza; copia texto a través de la API del portapapeles del navegador. |
| `createRemoteListing()` | `utils/listing.js` | Estado compartido de listado remoto, carga, paginación, y manejo de errores. |
| `fetchWithCsrf()`, `refreshCsrfToken()` | `utils/csrf.js` | Envía una solicitud que modifica datos con el token CSRF del componente, recuperándose una vez de un token caducado. |

`AlpinePlugins.js` instala Collapse, Focus, Mask, y Persist. `passkeys.js` provee la integración WebAuthn del lado del navegador. Mantén documentadas aquí las nuevas APIs reutilizables del navegador y añade su registro/importación a `App.js` cuando sean globales.

### CSRF en solicitudes que modifican datos

Cada acción de componente que envía una solicitud no-`GET` pasa por `fetchWithCsrf()` (`utils/csrf.js`) en lugar de llamar a `fetch()` directamente. Este es el único lugar encapsulado donde se construyen las solicitudes que modifican datos, de modo que el comportamiento de recuperación de tokens -y cualquier cosa que se le añada después (hooks de solicitud/respuesta, encabezados globales, telemetría)- solo tiene que cambiar aquí en lugar de en cada componente que resulte modificar el estado.

**Por qué tiene que recuperarse en absoluto.** El `csrfToken` de un componente se incrusta una sola vez, cuando se renderiza su vista. El servidor puede invalidarlo mientras la página sigue abierta, de dos maneras que la propia documentación de cbcsrf señala: `csrfField()` (el mixin detrás de cada input oculto `csrf`) fuerza la rotación del token de la sesión en su primer uso por solicitud, así que cualquier página que lo renderice -Configuración, la página de passkey requerido, las páginas de autenticación- invalida silenciosamente el token que está en cada otra pestaña abierta; y un token expira un tiempo fijo después de que fue *creado*, no después de que la página se cargó, así que una página renderizada tarde en la vida de un token puede recibir uno con solo segundos restantes. De cualquier manera, el token incrustado de un componente puede caducar antes de que el usuario termine de escribir.

**El contrato:**

```js title="resources/assets/js/utils/csrf.js" linenums="1"
export async function fetchWithCsrf( component, url, method, buildRequest ) { /* ... */ }
export async function refreshCsrfToken( component ) { /* ... */ }
```

- `component` es la instancia del componente Alpine (pasa `this`). Debe exponer una propiedad `csrfToken` mutable - `fetchWithCsrf()` la lee para construir la solicitud y, en un reintento por token caducado, la sobrescribe con el token actual de la sesión vía `refreshCsrfToken()`.
- `buildRequest( csrfToken )` devuelve los campos de `RequestInit` específicos del método (`headers`, `body`, `credentials`, etc.) para el token dado. Se vuelve a llamar en el reintento, así que debe construir el cuerpo de nuevo cada vez en lugar de capturar un valor calculado una sola vez - esto es lo que permite que el mismo helper cubra por igual cuerpos `URLSearchParams`, `JSON.stringify()`, y `FormData`.
- Ante un 403, `fetchWithCsrf()` llama a `refreshCsrfToken()` y, si obtuvo un token genuinamente nuevo, repite la solicitud una vez con `buildRequest()` llamado de nuevo. Un segundo 403 (por ejemplo, un fallo de autorización real, o una sesión que ha expirado por completo) se devuelve tal cual - los llamantes aún necesitan su manejo de errores normal para ese caso.

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

Solo las lecturas `GET`/`HEAD` se saltan `fetchWithCsrf()` y llaman a `fetch()` directamente - no llevan token CSRF y no pueden devolver 403 por ese motivo. Un puñado de endpoints del módulo cbSecurity (las rutas de la ceremonia WebAuthn de passkey) también se llaman con `fetch()` simple: se autentican a través de la propia ceremonia WebAuthn, no con el token CSRF de esta aplicación, así que quedan fuera del alcance de este helper. Toda otra mutación en `resources/assets/js/components/` pasa por `fetchWithCsrf()`; mantén los nuevos componentes de formulario consistentes con eso cuando agreguen una solicitud que cambie el estado del servidor.

## Avatares y logo de marca

Los avatares de usuario y el logo de marca de la aplicación se almacenan en el disco privado `assets` de cbfs (consulta [Configuración](configuration.md#module-configuration)) y son transmitidos por `Assets.bx` (consulta [Handlers y enrutamiento](handlers-routing.md#assets)) en lugar de servirse como archivos estáticos.

<figure>
	<img src="../assets/screenshots/profile.png" alt="The Profile page, showing the avatar upload and assigned role">
	<figcaption>La página de Perfil, mostrando la subida de avatar y el rol asignado.</figcaption>
</figure>

- **La visualización** pasa por el parcial `_components/ui/avatar`: renderiza `<img src="/avatars/:userId/:size">` cuando `hasAvatar` es verdadero, y recurre a un `<span>` de iniciales en caso contrario. Está conectado a la barra lateral, la barra superior, y la tabla de listado de Usuarios (campo `hasAvatar` proyectado por el servidor), y en línea en la página de detalle de Usuarios (alternando `x-show`/`x-cloak` sobre `user.hasAvatar`, ya que el avatar de esa página se encuentra dentro de una tarjeta de resumen manejada por Alpine en lugar de un parcial estático).
- **La subida/eliminación** del propio avatar del usuario actual vive en la página de Perfil, gestionada por `profileForm` (`ProfileForm.js`): una entrada de archivo oculta lee la imagen seleccionada como un URI de datos en base64 (`readFileAsDataUrl()`) y lo publica en `POST /profile/avatar`; `DELETE /profile/avatar` lo elimina. Ambos incrementan un contador `version` usado como parámetro de consulta anti-caché en la URL transmitida, ya que la ruta del archivo en sí no cambia entre subidas.
- **El logo de marca** recibe el mismo tratamiento de subida/eliminación en la página de Configuración, a través del componente `logoUploader` (`LogoUploader.js`) contra `POST`/`DELETE /settings/logo`. Reemplaza el valor de la entrada de texto del ajuste `cbAppLogo` con la ruta transmitida (`/branding/logo/lg`) al subir, y restaura el valor predeterminado configurado al eliminar - la entrada de texto de URL manual y la vista previa en vivo de `<img>` siguen funcionando exactamente igual para quien quiera apuntar `cbAppLogo` a una URL externa en su lugar.
- Ambos endpoints de subida aceptan las mismas formas: las imágenes se decodifican del lado del servidor con `BaseSecureHandler.decodeDataUri()`, y luego se redimensionan/recortan en variantes JPEG (avatar) `sm`/`lg` o PNG (logo) mediante `ImageService` (`app/models/system/ImageService.bx`).

::: cards
::: card title="Extendiendo la aplicación" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Agrega un nuevo componente Alpine y un parcial SCSS para tu propia página de administración.
:::
::: card title="Despliegue" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Construyendo y poniendo en producción el paquete de frontend.
:::
:::
