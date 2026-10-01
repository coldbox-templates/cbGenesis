---
title: Frontend
order: 4
icon: phosphor-duotone:palette
summary: Vistas BXM renderizadas no servidor, pequenos componentes Alpine.js, e um pipeline SCSS/JS compilado pelo Vite.
tags: [guides, frontend, alpine, vite]
---

# Frontend

## Como se encaixa tudo

O frontend é uma aplicação **híbrida, renderizada no servidor + Alpine.js** - sem SPA, sem router do lado do cliente:

::: stepper
::: step "Os layouts do ColdBox fornecem a estrutura"
`Admin.bxm`, `AuthSplit.bxm`, e afins, em `app/layouts/`, renderizam a moldura HTML.
:::
::: step "Os templates BXM renderizam no lado do servidor"
As vistas em `app/views/` renderizam com os dados `rc`/`prc` já resolvidos pelo handler.
:::
::: step "O Alpine.js adiciona interatividade"
Pequenos componentes `x-data` tratam formulários, modais, drawers, e toggles - sem necessidade de build por componente.
:::
::: step "O Vite compila os assets" color="success"
SCSS + JS de `resources/assets/` compilam para `public/includes/`, servidos sob o prefixo `ASSET_URL`.
:::
:::

## Arquitetura do Alpine.js

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

Cada componente é um módulo autónomo que devolve um objeto `x-data` do Alpine:

=== "Componente"
    ```js title="resources/assets/js/components/ui/MessageBox.js" linenums="1"
    export default () => ( {
        visible: true,
        init() {
            setTimeout( () => this.visible = false, 5000 );
        }
    } );
    ```
=== "Utilização numa vista"
    ```html title="app/views/_components/ui/messagebox.bxm" linenums="1"
    <div x-data="messageBox" x-show="visible" x-transition>
        <!-- alert content -->
    </div>
    ```

## Estrutura SCSS

```text title="resources/assets/scss/ layout" linenums="1"
app.scss
  ├── _variables.scss   Bootstrap variable overrides
  ├── bootstrap          Full Bootstrap 5.3 import
  ├── _base.scss         CSS custom properties (light/dark theme)
  ├── components/        9 component partials
  ├── layouts/            Admin + Auth layout partials
  └── views/              Page-specific styles
```

## Configuração do Vite

`vite.config.mjs` utiliza o plugin `coldbox()` do [`coldbox-vite-plugin`](https://github.com/coldbox-modules/coldbox-vite-plugin):

- Pontos de entrada: `resources/assets/scss/app.scss` e `resources/assets/js/App.js`
- `refresh: appRefreshPaths` — recarregamento total automático nas alterações a handlers/vistas
- `publicDirectory: "public/includes"` — onde ficam os assets compilados
- Pré-processador SCSS com flags `silenceDeprecations` para versões mais recentes do Dart Sass (import, global-builtin, color-functions, if-function)

```bash frame="terminal" title="Terminal"
npm run dev        # Servidor de desenvolvimento Vite com HMR
npm run build      # Build de produção → public/includes/
npm run lint       # Verificação ESLint em resources/assets/js
npm run lint:fix   # Correção automática do ESLint
npm run lint:scss  # Stylelint em resources/assets/scss
```

!!! note "ASSET_URL"
    Em produção, os URLs dos assets compilados são prefixados com a variável de ambiente `ASSET_URL` (o `.env.example` define-a por predefinição como `/includes`) - veja [Configuração](configuration.md#environment-variables).

## Componentes de vista renderizados no servidor

Estes partials BXM residem em `app/views/_components/` e são renderizados com o auxiliar `view()` do ColdBox. São propositadamente focados na apresentação: passe valores através da struct `args` e mantenha a lógica de negócio em handlers ou serviços.

### Estrutura da aplicação

| Partial | Propósito e entradas |
|---|---|
| `_components/app/includes` | Metadados do documento, prevenção de FOUC de tema/barra lateral, script das passkeys, e CSS/JS do Vite. `title` opcional. Incluir uma vez em `<head>`. |
| `_components/app/sidebar` | Navegação de administração, ligações a Users/Roles/Permissions/Audit Log sensíveis a permissões, submenu de definições, e rodapé da barra lateral. Lê `prc.authUser`; incluir a partir de `Admin.bxm`. |
| `_components/app/sidebar-brand` | Ligação com o logótipo/nome da aplicação, utilizada pela barra lateral. |
| `_components/app/sidebar-footer` | Resumo do utilizador autenticado e ações de perfil/terminar sessão, utilizados pela barra lateral. |
| `_components/app/topbar` | Alternador da barra lateral, alternador de tema, breadcrumbs, menu do utilizador, e ação de terminar sessão. Lê `prc.authUser` e `prc.title`. |
| `_components/app/topbar-breadcrumbs` | Breadcrumb do dashboard, renderizado dentro da topbar. Estenda ao adicionar navegação mais profunda. |
| `_components/app/topbar-notifications` | Slot/componente de notificações da topbar, para notificações da aplicação. |
| `_components/app/footer` | Direitos de autor e ligações do rodapé. `classes` opcional. Lê `prc.settings.cbCopyrightNotice`. |

### Partials de autenticação

| Partial | Propósito e entradas |
|---|---|
| `_components/auth/footer` | Rodapé utilizado pelos layouts de autenticação. |
| `_components/auth/passwordInput` | Campo de palavra-passe reutilizável, com alternância de visibilidade e indicadores de robustez de palavra-passe. |

### Partials de interface

| Partial | Propósito e entradas |
|---|---|
| `_components/ui/modal` | Diálogo Alpine genérico que renderiza uma vista aninhada opcional. O `id` obrigatório deve ser único; suporta `title`, `openExpression`, `closeExpression`, `contentView`, e `contentArgs`. |
| `_components/ui/drawer` | Diálogo lateral direito com focus trap, fecho por backdrop/Escape, e `contentView`/`contentArgs` opcionais; também inicializa `drawer()`. |
| `_components/ui/confirm` | Diálogo de confirmação com mensagem estática ou ligada ao Alpine, expressões de confirmação/cancelamento, rótulos, ícone, classe do botão, e expressão de desativação. |
| `_components/ui/messagebox` | Alerta de informação/sucesso/aviso/erro que pode ser dispensado. Suporta `message`/`title` estáticos ou `messageExpression`/`typeExpression`/`dismissAction` dinâmicos, além de `autoDismiss` e `classes`. |
| `_components/ui/globalProgress` | Barra de progresso global e acessível. Incluir uma vez por layout; controlada por `$progress.start()`, `$progress.set()`, e `$progress.stop()`. |
| `_components/ui/globalToast` | Pilha global de toasts. Incluir uma vez por layout; aceita `duration`, `position`, e `maxVisible`, e recebe notificações de `$toast()`. |
| `_components/ui/avatar` | Renderiza a imagem de avatar de um utilizador quando `hasAvatar` é verdadeiro, recorrendo a `initials` caso contrário. Apresentação apenas de leitura, utilizada na barra lateral, na topbar, na listagem de Utilizadores, e na página de detalhe de Utilizadores — veja [Avatares e logótipo de marca](#avatars-branding-logo). |
| `_components/ui/logo` | Partial reutilizável do logótipo/branding da aplicação. |
| `_components/ui/passwordMeter` | Medidor de política de palavra-passe utilizado junto aos campos de palavra-passe. |
| `_components/ui/progressbar` | Partial de barra de progresso em linha, para um valor numérico local. |
| `_components/ui/switch` | Partial de controlo de switch acessível, para definições booleanas. |

## Componentes e stores do Alpine

`resources/assets/js/App.js` regista globalmente no Alpine os seguintes nomes. Utilize-os como `x-data="name"` ou `x-data="name(...)"` nas vistas BXM. Os componentes de formulário fazem pedidos remotos às rotas de handler correspondentes e esperam o token CSRF fornecido pela sua vista, enviado através de `fetchWithCsrf()` (veja [CSRF em pedidos que alteram estado](#csrf-on-mutating-requests)).

### Estrutura da aplicação e autenticação

| Nome Alpine | Origem | Responsabilidade |
|---|---|---|
| `adminBody` | `components/app/AdminBody.js` | Comportamento da estrutura da página de administração e eventos globais de layout. |
| `sidebarBrand` | `components/app/SidebarBrand.js` | Interações da marca na barra lateral. |
| `footer` | `components/app/Footer.js` | Estado do rodapé e comportamento do ano atual. |
| `authForm` | `components/auth/AuthForm.js` | Submissão de início de sessão, validação, "lembrar-me", e erros. |
| `registerForm` | `components/auth/RegisterForm.js` | Validação de registo, disponibilidade de e-mail, e submissão. |
| `forgotPasswordForm` | `components/auth/ForgotPasswordForm.js` | Estado e feedback do pedido de esquecimento de palavra-passe. |
| `passwordResetForm` | `components/auth/PasswordResetForm.js` | Submissão e validação do token de reposição de palavra-passe. |

### Formulários de administração e de perfil

| Nome Alpine | Origem | Responsabilidade |
|---|---|---|
| `usersForm` | `components/security/UsersForm.js` | Listagem de utilizadores, pesquisa, paginação, convite, estado, e ações de administração. |
| `userDetailForm` | `components/security/UserDetailForm.js` | Perfil do utilizador, função, permissão, preferência, token, e ações de verificação. |
| `rolesForm` | `components/security/RolesForm.js` | CRUD de funções e atribuição/remoção de utilizadores e permissões. |
| `permissionsForm` | `components/security/PermissionsForm.js` | Listagem de permissões e operações de CRUD. |
| `auditLogForm` | `components/security/AuditLogForm.js` | Filtragem de auditoria, paginação, drawer de detalhe, exportação CSV, purga, e ações de limpeza. |
| `settingsForm` | `components/settings/SettingsForm.js` | Edição das definições principais da aplicação e feedback relacionado com a cache. |
| `logoUploader` | `components/settings/LogoUploader.js` | Carregamento/remoção do logótipo de marca para o campo "App Logo Path", juntamente com o seu campo manual de URL e pré-visualização em direto já existentes — veja [Avatares e logótipo de marca](#avatars-branding-logo). |
| `settingsRegistryForm` | `components/settings/SettingsRegistryForm.js` | Pesquisa, paginação, criação/atualização, ativação/desativação, e eliminação no registo. |
| `profileForm` | `components/profile/ProfileForm.js` | Campos de perfil, política de palavra-passe, gestão de tokens de API, o subformulário de pedido/cancelamento de alteração de e-mail, e carregamento/remoção de avatar. |
| `preferencesForm` | `components/profile/PreferencesForm.js` | Persistência das preferências do utilizador. |
| `passkeyOnboarding` | `components/profile/PasskeyOnboarding.js` | Registo de passkeys e onboarding obrigatório de passkey. |

### Componentes de interface e APIs globais

| Nome Alpine | Origem | Responsabilidade |
|---|---|---|
| `messageBox` | `components/ui/MessageBox.js` | Visibilidade do alerta e dispensa temporizada opcional. |
| `passwordMeter` | `components/ui/PasswordMeter.js` | Exibição dos requisitos e da robustez da palavra-passe. |
| `passwordStrength` | `components/ui/PasswordStrength.js` | Cálculo e rótulos da robustez da palavra-passe. |
| `switchComponent` | `components/ui/Switch.js` | Estado de alternância e tratamento de alterações. |
| `drawer` | `components/ui/Drawer.js` | Ciclo de vida do drawer e comportamento de foco. |
| `globalProgress` | `components/ui/GlobalProgress.js` | Eventos de progresso e valor de progresso atual. |
| `globalToast` | `components/ui/GlobalToast.js` | Fila de toasts, dispensa, mapeamento de tipos, e limites da pilha. |

O código-fonte também contém `Header.js`, `Sidebar.js`, `TopBarNotifications.js`, e `Logo.js`. As suas exportações estão disponíveis para importações locais, mas não estão atualmente registadas pelo `App.js`; registe-as com `Alpine.data()` antes de as utilizar como componentes `x-data` globais.

### Stores, utilitários, e propriedades mágicas

| API | Origem | Utilização |
|---|---|---|
| `$store.theme` | `stores/theme.js` | Modo claro/escuro, `data-bs-theme`, e persistência no localStorage. |
| `$store.sidebar` | `stores/sidebar.js` | Colapso no desktop, abrir/fechar no mobile, e persistência no localStorage. |
| `$formatDate`, `$formatDateTime`, `$relativeDate` | `utils/dateFormat.js` | Exibição consistente de datas, com alternativas de recurso. |
| `$countLabel` | `utils/countLabel.js` | Rótulos de contagem no singular/plural. |
| `$sortClass`, `$sortIcon` | `utils/sort.js` | Cabeçalhos de tabela ordenáveis e respetivos indicadores. |
| `$passwordMeetsPolicy` | `utils/passwordPolicy.js` | Verifica os requisitos de palavra-passe configurados. |
| `$isEmail` | `App.js` | Verificação ligeira do formato de e-mail. |
| `$toast` / `$progress` | `components/ui/GlobalToast.js`, `GlobalProgress.js` | APIs globais de notificação e de progresso. |
| `$focus` / `$copy` | `App.js` | Foca um descendente após as atualizações do Alpine; copia texto através da API de área de transferência do browser. |
| `createRemoteListing()` | `utils/listing.js` | Estado partilhado de listagem remota, carregamento, paginação, e tratamento de erros. |
| `fetchWithCsrf()`, `refreshCsrfToken()` | `utils/csrf.js` | Envia um pedido que altera estado com o token CSRF do componente, recuperando uma vez de um token desatualizado. |

`AlpinePlugins.js` instala o Collapse, o Focus, o Mask, e o Persist. `passkeys.js` fornece a integração WebAuthn do lado do browser. Mantenha aqui documentadas as novas APIs reutilizáveis do browser, e adicione o seu registo/importação ao `App.js` quando forem globais.

### CSRF em pedidos que alteram estado

Toda a ação de um componente que envia um pedido não-`GET` passa por `fetchWithCsrf()` (`utils/csrf.js`) em vez de chamar `fetch()` diretamente. Este é o único local encapsulado onde os pedidos que alteram estado são construídos, pelo que o comportamento de recuperação do token - e tudo o que lhe for adicionado mais tarde (hooks de pedido/resposta, cabeçalhos globais, telemetria) - só tem de mudar aqui, em vez de em cada componente que, por acaso, altera estado.

**Porque é que tem sequer de recuperar.** O `csrfToken` de um componente é embutido uma única vez, quando a sua vista é renderizada. O servidor pode invalidá-lo enquanto a página ainda está aberta, de duas formas que a própria documentação do cbcsrf assinala: `csrfField()` (o mixin por trás de todos os campos ocultos `csrf`) força a rotação do token da sessão na sua primeira utilização por pedido, pelo que qualquer página que o renderize - Settings, a página de passkey obrigatória, as páginas de autenticação - invalida silenciosamente o token que está em qualquer outro separador aberto; e um token expira um tempo fixo depois de ter sido *criado*, não depois de a página ter sido carregada, pelo que uma página renderizada tarde na vida de um token pode receber um com apenas segundos restantes. De uma forma ou de outra, o token embutido de um componente pode ficar desatualizado antes de o utilizador terminar de escrever.

**O contrato:**

```js title="resources/assets/js/utils/csrf.js" linenums="1"
export async function fetchWithCsrf( component, url, method, buildRequest ) { /* ... */ }
export async function refreshCsrfToken( component ) { /* ... */ }
```

- `component` é a instância do componente Alpine (passe `this`). Tem de expor uma propriedade mutável `csrfToken` - `fetchWithCsrf()` lê-a para construir o pedido e, numa nova tentativa por token desatualizado, sobrescreve-a com o token atual da sessão via `refreshCsrfToken()`.
- `buildRequest( csrfToken )` devolve os campos `RequestInit` específicos do método (`headers`, `body`, `credentials`, etc.) para o token dado. É chamado novamente na nova tentativa, pelo que tem de construir o corpo de novo de cada vez, em vez de capturar um valor calculado apenas uma vez - é isto que permite ao mesmo auxiliar cobrir corpos `URLSearchParams`, `JSON.stringify()`, e `FormData` por igual.
- Num 403, `fetchWithCsrf()` chama `refreshCsrfToken()` e, se obtiver um token genuinamente novo, reenvia o pedido uma vez com `buildRequest()` chamado novamente. Um segundo 403 (por exemplo, uma falha de autorização real, ou uma sessão que expirou por completo) é devolvido tal como está - quem chama ainda precisa do seu tratamento de erro normal para esse caso.

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

Apenas as leituras `GET`/`HEAD` ignoram `fetchWithCsrf()` e chamam `fetch()` diretamente - não transportam nenhum token CSRF e não podem receber um 403 por essa razão. Um punhado de endpoints do módulo cbSecurity (as rotas da cerimónia WebAuthn de passkeys) também são chamados com `fetch()` simples: autenticam-se através da própria cerimónia WebAuthn, e não através do token CSRF desta aplicação, pelo que estão fora do âmbito deste auxiliar. Todas as outras mutações em `resources/assets/js/components/` passam por `fetchWithCsrf()`; mantenha os novos componentes de formulário consistentes com isto, quando adicionarem um pedido que altere o estado do servidor.

## Avatares e logótipo de marca

Os avatares dos utilizadores e o logótipo de marca da aplicação são guardados no disco privado `assets` do cbfs (veja [Configuração](configuration.md#module-configuration)) e servidos em stream por `Assets.bx` (veja [Handlers e Rotas](handlers-routing.md#assets)), em vez de servidos como ficheiros estáticos.

<figure>
	<img src="../assets/screenshots/profile.png" alt="A página de Perfil, mostrando o carregamento de avatar e a função atribuída">
	<figcaption>A página de Perfil, mostrando o carregamento de avatar e a função atribuída.</figcaption>
</figure>

- **A exibição** passa pelo partial `_components/ui/avatar`: renderiza `<img src="/avatars/:userId/:size">` quando `hasAvatar` é verdadeiro, e recorre a um `<span>` com iniciais caso contrário. Está ligado à barra lateral, à topbar, e à tabela de listagem de Utilizadores (campo `hasAvatar` projetado pelo servidor), e diretamente na página de detalhe de Utilizadores (alternância `x-show`/`x-cloak` sobre `user.hasAvatar`, já que o avatar dessa página está dentro de um cartão-resumo controlado por Alpine, e não num partial estático).
- **O carregamento/remoção** do próprio avatar do utilizador atual reside na página de Perfil, gerido por `profileForm` (`ProfileForm.js`): um campo de ficheiro oculto lê a imagem selecionada como um URI de dados em base64 (`readFileAsDataUrl()`) e envia-o para `POST /profile/avatar`; `DELETE /profile/avatar` remove-o. Ambos incrementam um contador `version`, utilizado como parâmetro de consulta para evitar cache no URL em stream, já que o próprio caminho do ficheiro não muda entre carregamentos.
- **O logótipo de marca** recebe o mesmo tratamento de carregamento/remoção na página de Definições, através do componente `logoUploader` (`LogoUploader.js`), contra `POST`/`DELETE /settings/logo`. Substitui o valor do campo de texto da definição `cbAppLogo` pelo caminho em stream (`/branding/logo/lg`) ao carregar, e restaura a predefinição configurada ao remover — o campo de texto manual de URL e a pré-visualização `<img>` em direto continuam a funcionar exatamente como antes, para quem preferir apontar `cbAppLogo` para um URL externo.
- Ambos os endpoints de carregamento aceitam os mesmos formatos: as imagens são descodificadas no lado do servidor por `BaseSecureHandler.decodeDataUri()`, e depois redimensionadas/recortadas em variantes `sm`/`lg` JPEG (avatar) ou PNG (logótipo) pelo `ImageService` (`app/models/system/ImageService.bx`).

::: cards
::: card title="Estender a Aplicação" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Adicione um novo componente Alpine e um partial SCSS para a sua própria página de administração.
:::
::: card title="Implantação" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Construir e lançar o pacote de frontend de produção.
:::
:::
