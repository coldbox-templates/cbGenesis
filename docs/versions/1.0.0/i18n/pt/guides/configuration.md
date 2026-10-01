---
title: Configuração
order: 7
icon: phosphor-duotone:gear-six
summary: Variáveis de ambiente, definições da framework, e configuração por módulo.
tags: [guides, configuration]
---

# Configuração

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha os seus próprios valores - lidos em qualquer parte da aplicação via `getSystemSetting( "VAR_NAME", "default" )`:

| Variável | Propósito |
|---|---|
| `APPNAME` | Nome de exibição da aplicação |
| `ENVIRONMENT` | `development` ou `production` |
| `ASSET_URL` | Prefixo de URL público para os assets de produção do Vite (predefinição `/includes`) |
| `BOXLANG_DEBUG` | Ativa a saída de depuração do BoxLang |
| `DB_CONNECTIONSTRING` | Cadeia de ligação JDBC completa |
| `DB_DRIVER` | Driver de base de dados, em minúsculas, correspondendo a um módulo de driver JDBC `bx-*` (`mysql` para MySQL ou MariaDB, `mssql`, `postgresql`, `h2`, `oracle`, `sqlite`) - o `onServerInitialInstall` do `server.json` instala o `bx-${DB_DRIVER}` no primeiro arranque do servidor |
| `DB_HOST` / `DB_PORT` / `DB_DATABASE` | Detalhes de ligação à base de dados |
| `DB_SCHEMA` | Esquema visado pelo executor de migrações (`.cbmigrations.json`); deixe em branco para motores sem esquema |
| `DB_USER` / `DB_PASSWORD` | Credenciais da base de dados |
| `JWT_SECRET` | Chave de assinatura para o suporte de JWT do `cbsecurity` |
| `COOKIE_ENCRYPTION_KEY` | Chave de encriptação para o armazenamento de cookies do `cbstorages`. Só importa depois de `useEncryption` estar ativado (desativado por predefinição) - defina-a antes de o fazer, ou a chave regenera-se a cada arranque e invalida silenciosamente os cookies previamente encriptados |
| `CBFS_ASSETS_DISK_PATH` | Caminho no sistema de ficheiros para o disco `assets` do cbfs, que guarda os avatares e o logótipo de marca (predefinição `<app-root>/.cbfs`) |
| `COLDBOX_REINIT_PASSWORD` | Palavra-passe exigida por `?fwreinit`. Não definida significa um valor aleatório novo a cada arranque, pelo que a reinicialização fica fechada - veja [Implantação](../deployment.md#production-checklist) |
| `COLDBOX_SESSION_TIMEOUT` | Tempo limite da cache de sessão, em minutos, para o armazenamento de sessão do `cbstorages` (predefinição `60`) |

## Definições da framework (`app/config/Coldbox.bx`)

| Definição | Valor |
|---|---|
| `defaultEvent` | `Auth.login` — os visitantes não autenticados aterram na página de início de sessão |
| `requestStartHandler` | `Main.onRequestStart` |
| `applicationStartHandler` | `Main.onAppInit` |
| `exceptionHandler` | `Main.onException` |
| `modulesExternalLocation` | `["/modules"]` |
| `autoMapModels` | `true` |
| `jsonPayloadToRC` | `true` |
| `reinitPassword` | `COLDBOX_REINIT_PASSWORD`, ou um novo UUID aleatório a cada arranque quando não está definida |

Uma sobreposição do ambiente `development()` ativa o template de erro Whoops, a recarga de singletons do WireBox, o modo de depuração do ColdBox, e limpa o `reinitPassword`, para que `?fwreinit=1` funcione localmente sem uma palavra-passe. O LogBox está configurado com um appender de consola mais um appender de ficheiro rotativo, que escreve em `app/logs`.

## Definições da aplicação vs. configuração da framework

Duas coisas diferentes residem ambas sob `app/config/`, e é fácil confundi-las:

::: columns
::: column
**A configuração da framework** (`Coldbox.bx`, `Router.bx`, `WireBox.bx`, `CacheBox.bx`, `Scheduler.bx`) é estática, baseada em ficheiros, e as alterações só têm efeito no próximo `?fwreinit`.
:::
::: column
**As definições da aplicação** (`cbAppName`, `cbAllowRegistration`, `cbMinPasswordLength`, ...) são guardadas na base de dados, editáveis pelo administrador em `/settings`, definidas em `SettingService.static.DEFAULTS`, e colocadas em cache com um TTL de 2 horas.
:::
:::

`SettingService.preFlightCheck()` (chamado a partir de `Main.onAppInit`) semeia na base de dados, no arranque, qualquer predefinição em falta, pelo que adicionar uma nova chave a `DEFAULTS` já é suficiente para que ela apareça. Uma definição também pode ser substituída de duas outras formas, ambas lidas por `loadConfigOverrides()`/`loadEnvironmentOverrides()`:

- Qualquer chave com o prefixo `cb*` colocada em `variables.settings` do `Coldbox.bx`
- Qualquer variável de ambiente com o prefixo `genesis_*`

## Configuração de módulos

Cada módulo instalado tem o seu próprio ficheiro de definições em `app/config/modules/`:

| Módulo | Definições principais |
|---|---|
| **cbsecurity** | fornecedor cbauth, CSRF (rotativo, 30 min), firewall com deteção de anotações `@secured`, cabeçalhos de segurança, JWT (HS512, 60 min) — veja [Segurança e Permissões](security.md) |
| **cbauth** | `UserService` como fornecedor de identidade, armazenamento de sessão baseado em cache |
| **cbmailservices** | protocolo BXMail em produção, protocolo de ficheiros em desenvolvimento — veja [E-mail](email.md) |
| **cborm** | injeção de entidades ativada, paginação `maxRows: 25` / `maxRowsLimit: 500` |
| **cbfs** | disco `assets` (fornecedor `Local` por predefinição, caminho a partir de `CBFS_ASSETS_DISK_PATH`) - guarda os avatares e o logótipo de marca, servidos em stream por `Assets.bx` — veja [Frontend](frontend.md#avatars-branding-logo) |
| **cbstorages** | armazenamento em cache (cache de sessões, tempo limite a partir de `COLDBOX_SESSION_TIMEOUT`, predefinição 60 min), armazenamento de cookies (encriptação desativada por predefinição) |
| **cbsecurity-passkeys** | configuração de relying party WebAuthn para início de sessão com passkey - `relyingPartyId`/`allowedOrigins` são valores placeholder de `localhost` que **tem de** alterar antes de ir para produção, veja [Implantação](../deployment.md#production-checklist) |
| **mementifier** | datas ISO8601, auto-inclusões do ORM, conversão para UTC |

::: cards
::: card title="Segurança e Permissões" icon="phosphor-duotone:shield-check" href="security.md"
A configuração completa da firewall do cbsecurity, em contexto.
:::
::: card title="Implantação" icon="phosphor-duotone:cloud-arrow-up" href="../deployment.md"
Quais destas definições realmente importam para um lançamento em produção.
:::
:::
