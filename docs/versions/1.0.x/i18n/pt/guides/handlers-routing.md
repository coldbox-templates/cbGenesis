---
title: Handlers e Rotas
order: 1
icon: phosphor-duotone:signpost
summary: Todos os handlers, as suas ações, e como o Router.bx liga os URLs a eles.
tags: [guides, handlers, routing]
---

# Handlers e Rotas

## Mapa de handlers

| Handler | Base | Propósito |
|---|---|---|
| [`AuditLog.bx`](#auditlog) | `BaseSecureHandler` | Navegação, exportação, e purga do registo de auditoria |
| [`Assets.bx`](#assets) | `EventHandler` | Serve em stream os avatares dos utilizadores e o logótipo de marca |
| [`Auth.bx`](#auth) | `EventHandler` | Início de sessão, registo, convites, reposição de palavra-passe - tudo público |
| [`BaseSecureHandler.bx`](#basesecurehandler) | `RestHandler` | Classe base para todos os handlers de administração |
| [`Dashboard.bx`](#dashboard) | `BaseSecureHandler` | A página de destino autenticada |
| `Main.bx` | `EventHandler` | Handler de eventos implícitos - veja [Arquitetura](../architecture.md#request-lifecycle) |
| [`Permissions.bx`](#permissions) | `BaseSecureHandler` | CRUD dos slugs de permissão |
| [`Profile.bx`](#profile) | `BaseSecureHandler` | Perfil de autoatendimento, palavra-passe, tokens de API, passkeys |
| [`Roles.bx`](#roles) | `BaseSecureHandler` | CRUD de funções + atribuição de utilizadores |
| [`Settings.bx`](#settings) | `BaseSecureHandler` | Registo de definições da aplicação |
| [`Users.bx`](#users) | `BaseSecureHandler` | Administração de utilizadores |

### `BaseSecureHandler`

Todos os handlers protegidos estendem `BaseSecureHandler`, cujo `preHandler` [verifica o CSRF em todos os pedidos que alteram estado](#csrf-verification), força o layout `Admin`, e redireciona para `profile/passkey-required` quando `cbRequirePasskey` está ativo e o utilizador não tem nenhuma. Também fornece auxiliares partilhados (`getApiResults()`, `ensureSortDirection()`, `getPagination()`):

```boxlang title="app/handlers/BaseSecureHandler.bx" linenums="1"
component extends="coldbox.system.RestHandler" {

    function preHandler( event, rc, prc ){
        // ...CSRF verification, deny-by-default...
        event.setLayout( "Admin" );
        // ...passkey enforcement...
    }

}
```

Construir um novo handler protegido começa sempre da mesma forma:

```boxlang title="Example: a new secured handler" linenums="1"
component extends="BaseSecureHandler" secured {

    function index( event, rc, prc ){
        prc.pageTitle = "My Page";
        event.setView( "myhandler/index" );
    }

}
```

### `AuditLog`

`@secured("auditlog:admin,auditlog:read")` ao nível da classe; todas as ações exceto `index` são `@remote`:

- `index`, `search`, `show` - navegar e filtrar o registo de auditoria
- `export` - `@secured("auditlog:admin,auditlog:export")`, transmite CSV
- `purge` - `@secured("auditlog:admin,auditlog:delete")`, elimina entradas anteriores a uma data limite
- `clear` - `@secured("auditlog:admin")`, elimina todas as entradas

### `Assets`

Sem anotação `@secured` ao nível da classe - transmite ficheiros binários a partir do disco privado `assets` do cbfs (veja [Base de Dados e ORM](database-orm.md) e `app/config/modules/cbfs.bx`), que fica fora da raiz pública e é, de outra forma, inacessível:

- `avatar` - `@secured` (qualquer utilizador autenticado), transmite a variante `sm`/`lg` JPEG do avatar de um utilizador
- `logo` - público, transmite a variante `sm`/`lg` PNG do logótipo de marca, para que o ecrã de início de sessão e outras páginas de visitante o possam renderizar

Ambas as ações devolvem 404 (em vez de erro) para uma forma não reconhecida de `userId`/`size`, ou quando o ficheiro pedido simplesmente não existe, para que quem chama não consiga distinguir "sem avatar" de "utilizador inexistente" apenas pela forma da resposta. O redimensionamento, o recorte, e o armazenamento passam pelo `ImageService` (`app/models/system/ImageService.bx`), invocado via `getInstance()` dentro de cada ação, em vez de uma propriedade `@inject` - veja o docblock em `Assets.bx` para saber porquê (uma particularidade da ordem de arranque do WireBox com a construção de singletons desencadeada por handlers).

### `Auth`

Sem anotação `@secured` - estas ações têm de continuar acessíveis a visitantes:

- `login` / `doLogin` (GET/POST) - verificado por CSRF, chama `securityService.login()`, suporta `rememberMe`
- `register` / `doRegister` - controlado pela definição `cbAllowRegistration`
- `checkEmailAvailability` - endpoint JSON para verificações em tempo real da disponibilidade de e-mail
- `verifyRegistration` - consome um token de ação `PURPOSE_REGISTRATION`
- `activateInvitation` / `doActivateInvitation` - define uma palavra-passe para um utilizador convidado, criado por um administrador
- `forgotPassword` / `doForgotPassword` - controlado por `cbAllowForgotPassword`
- `resetPassword` / `doResetPassword` - valida o token de reposição, define uma nova palavra-passe
- `verifyEmailChange` - consome um token de ação `PURPOSE_EMAIL_CHANGE`
- `logout` - chama `securityService.logout()`

`preHandler` redireciona um visitante já autenticado diretamente para o dashboard, e define o layout a partir de `prc.settings.cbLoginLayout` (`AuthSplit` por predefinição - veja [`guides/security.md`](security.md)); `verifyEmailChange` e `logout` estão isentos desse redirecionamento, para que se mantenham acessíveis quer o visitante esteja ou não já autenticado.

### `Dashboard`

`@secured` (qualquer utilizador autenticado, sem exigir uma permissão específica):

- `index` - a página inicial do dashboard
- `notAuthorized` - o alvo de `invalidAuthorizationEvent`, mostrado quando a um utilizador autenticado falta uma permissão exigida

### `Permissions`

`@secured("permissions:admin,permissions:read")` ao nível da classe:

- `index`
- `create` - `@secured("permissions:admin,permissions:write")`
- `update` / `delete` - `@remote`, com as mesmas permissões de escrita/eliminação

### `Profile`

Ações de autoatendimento `@secured` para o utilizador atual, todas endpoints AJAX `@remote` exceto `index`:

- `index`, `passkeyRequired`
- `save`, `doPasswordChange`
- `requestEmailChange` / `cancelEmailChange` - inicia/cancela uma alteração de e-mail pendente, confirmada através de `Auth.verifyEmailChange`
- `listTokens` / `createToken` / `updateToken` / `deleteToken` - tokens de API
- `listPasskeys` / `updatePasskey` / `deletePasskey`
- `uploadAvatar` / `deleteAvatar` - aceita a imagem como um URI de dados em base64 em `rc.avatar` (o BoxLang não tem um interpretador de multipart/form-data, pelo que os carregamentos viajam como JSON), descodificado via `BaseSecureHandler.decodeDataUri()`; devolvido em stream por `Assets.avatar`

Todas estas ações são verificadas por CSRF através de `BaseSecureHandler`, a menos que sejam acedidas através de um método HTTP seguro - veja [Verificação de CSRF](#csrf-verification).

### `Roles`

`@secured("roles:admin,roles:read")` ao nível da classe; todas as ações exceto `index` são `@remote`:

- `index`
- `create` / `update` / `delete` - `@secured("roles:admin,roles:write"` / `"...:delete")`
- `users` / `availableUsers` - lista os utilizadores atribuídos/disponíveis para uma função
- `addUser` / `removeUser` - `@secured("roles:admin")`

### `Settings`

`@secured("settings:admin,settings:read")` ao nível da classe:

- `index`
- `registry` / `registrySearch` - registo de definições paginado
- `createRegistry` / `updateRegistry` / `toggleRegistryStatus` / `deleteRegistry` - `settings:admin,settings:write`
- `save` - gravação em lote das definições principais
- `uploadLogo` / `deleteLogo` - `settings:admin,settings:write`, com a mesma convenção de URI de dados em base64 que `Profile.uploadAvatar`; guarda/restaura a definição `cbAppLogo` e devolve em stream via `Assets.logo`
- Utilitários de administração (todos `settings:admin`): `clearTemplateCache`, `clearSessionsCache`, `revokeRememberTokens`, `flushSettingsCache`

### `Users`

`@secured("users:admin,users:read")` ao nível da classe:

- `index`, `search`
- `create` / `update` / `delete` / `resendInvitation` - `users:admin,users:write` / `...:delete`
- `show` - `users:read`
- Apenas administração (`users:admin`): `updateProfile`, `setStatus`, `resetPassword`, `verify`, `revokeRememberTokens`, `addRole`/`removeRole`, `addPermission`/`removePermission`, `savePreferences`, `revokeToken`/`revokeAllTokens`

`ensureNotSelf()` protege várias destas ações, impedindo que um administrador se despromova ou remova as suas próprias funções.

<figure>
	<img src="../assets/screenshots/users.png" alt="A página de administração de Utilizadores">
	<figcaption>A página de administração de Utilizadores.</figcaption>
</figure>

## Verificação de CSRF

`app/config/modules/cbsecurity.bx` define `csrf.enableAutoVerifier: false`, pelo que não existe um interceptor global. Em vez disso, `BaseSecureHandler.preHandler()` verifica o CSRF em regime de **negação por predefinição**, para todos os handlers que o estendem:

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

O que isto significa quando estende um handler protegido:

- **Não há adesão opcional.** Qualquer ação acedida via `POST`, `PUT`, `PATCH`, ou `DELETE` tem de transportar um `rc.csrf` válido, desde o dia em que a adicionar. Não há nenhuma lista por handler a lembrar de atualizar.
- **Os métodos seguros estão isentos.** `GET`, `HEAD`, e `OPTIONS` não devem alterar estado, pelo que não representam risco de CSRF, e `OPTIONS` (preflight de CORS) não pode sequer transportar um token. Se um método seguro no seu código alterar estado, esse é o bug a corrigir.
- **`onInvalidCSRF()` pode ser substituído.** A implementação base aborta com uma falha de autorização, que é o que os endpoints JSON/AJAX pretendem - todas as mutações em `Permissions` já são desse tipo, submetidas através de `fetchWithCsrf()` (veja [Frontend](frontend.md#csrf-on-mutating-requests)), que recupera de um token desatualizado sem precisar de um redirecionamento. `Settings` ainda o substitui, para mostrar uma mensagem flash e redirecionar as submissões dos seus formulários nativos, para que um browser receba uma página em vez de um 403 simples. Substitua-o no seu próprio handler quando este renderizar HTML em vez de JSON.

!!! note "`Auth` não é um handler protegido"
    `Auth` estende `coldbox.system.EventHandler`, e não `BaseSecureHandler`, porque as suas ações são executadas para visitantes não autenticados e, por isso, não podem herdar a verificação acima. Cada ação que altera estado verifica o seu próprio token: `doLogin`, `doRegister`, `doActivateInvitation`, `doForgotPassword`, `doResetPassword`, e `logout`.

## Mapa de rotas (`app/config/Router.bx`)

Todas as rotas são declaradas numa única função `configure()`:

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

Veja [Referência: Mapa de Rotas](../reference/routes.md) para a tabela completa de todos os métodos, URLs, ações-alvo, e permissões exigidas.

::: cards
::: card title="Mapa de Rotas" icon="phosphor-duotone:map-trifold" href="../reference/routes.md"
A tabela completa de método/URL/handler/permissão.
:::
::: card title="Segurança e Permissões" icon="phosphor-duotone:shield-check" href="security.md"
Como o `@secured` se liga à firewall e ao modelo de permissões.
:::
::: card title="Estender a Aplicação" icon="phosphor-duotone:puzzle-piece" href="extending.md"
Adicione um novo handler, rota, e vista, seguindo estas mesmas convenções.
:::
:::
