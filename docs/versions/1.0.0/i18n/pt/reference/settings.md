---
title: Definições da Aplicação
order: 2
icon: phosphor-duotone:sliders
summary: As definições guardadas na base de dados e editáveis pelo administrador, definidas em SettingService.static.DEFAULTS.
tags: [reference, configuration, settings]
---

# Definições da Aplicação

Estas residem em `SettingService.static.DEFAULTS`, são semeadas no arranque por `preFlightCheck()`, colocadas em cache com um TTL de 2 horas, e editáveis em `/settings` por qualquer pessoa com a permissão `settings:write` (ou `settings:admin`) — veja [Configuração](../guides/configuration.md#app-settings-vs-framework-config).

<figure>
	<img src="../assets/screenshots/settings.png" alt="A página de Definições Globais de administração">
	<figcaption>A página de Definições Globais de administração.</figcaption>
</figure>

## Autenticação e registo

| Definição | Propósito |
|---|---|
| `cbLoginLayout` | Layout utilizado nas páginas de autenticação (`AuthSplit` por predefinição; escolha entre `AuthCenter` ou `AuthSplit`) |
| `cbAllowRegistration` | Ativa/desativa o registo por autoatendimento |
| `cbAllowForgotPassword` | Ativa/desativa o fluxo de esquecimento de palavra-passe |
| `cbAllowRememberMe` | Ativa/desativa o cookie "lembrar-me" |
| `cbRememberMeDays` | Durante quanto tempo um token de "lembrar-me" permanece válido (predefinição: `14`) |
| `cbRequirePasskey` | Obriga ao registo de uma passkey antes de aceder à área de administração |

### Seleção do layout de início de sessão

A página **Settings** expõe `cbLoginLayout` como um seletor:

| Valor | Layout | Aparência |
|---|---|---|
| `AuthSplit` | `app/layouts/AuthSplit.bxm` | Início de sessão em dois painéis: marca/funcionalidades à esquerda e o formulário à direita. Em ecrãs pequenos, colapsa para o formulário com marca compacta. Esta é a predefinição. |
| `AuthCenter` | `app/layouts/AuthCenter.bxm` | Cartão de autenticação centrado, com o logótipo, o formulário, e o rodapé de autenticação. |

Selecione **Auth Center** ou **Auth Split** em `/settings`, guarde as definições, e recarregue a página de autenticação. O handler chama `event.setLayout( prc.settings.cbLoginLayout )`, pelo que o layout selecionado se aplica ao início de sessão, ao registo, à ativação de convites, e às páginas de recuperação de palavra-passe. Também pode definir o valor diretamente na base de dados, ou adicionar um nome de layout personalizado em `app/layouts/`, se a sua aplicação fornecer esse layout.

## Política de palavra-passe e tokens

| Definição | Propósito |
|---|---|
| `cbMinPasswordLength` | Comprimento mínimo da palavra-passe (predefinição: `8`). `SettingService.isValidPassword()` também exige uma letra maiúscula, uma letra minúscula, um dígito, e um carácter especial, e todos os percursos do lado do servidor que definem uma palavra-passe (registo, ativação de convite, reposição, e alteração no perfil) executam-na |
| `cbPasswordResetExpiration` | Validade do token de reposição, em minutos (predefinição: `60`) |
| `cbInvitationExpiration` | Validade do token de convite, em dias (predefinição: `7`) |
| `cbRegistrationVerificationExpiration` | Validade do token de verificação de registo, em horas (predefinição: `24`) |
| `cbApiTokenMaxValidityMonths` | Duração máxima com que um token de API pode ser emitido (predefinição: `12`) |
| `cbAuditLogRetentionDays` | Idade, em dias, a partir da qual a tarefa diária agendada elimina definitivamente as entradas do registo de auditoria (predefinição: `90`). `0` desativa a purga - veja [Tarefas Agendadas](../architecture.md#scheduled-tasks) |
| `cbRateLimitMaxAttempts` | Tentativas permitidas por IP, por endpoint, antes de o `RateLimiter` bloquear o início de sessão/registo/reposição de palavra-passe (predefinição: `5`) - veja [Limitação de taxa](../guides/security.md#rate-limiting) |
| `cbRateLimitWindowSeconds` | Janela de limitação de taxa, em segundos (predefinição: `300`). `0` desativa completamente a limitação de taxa |
| `cbTrustProxyHeaders` | Se o `RateLimiter`, o registo de auditoria, e os e-mails de segurança confiam nos cabeçalhos `X-Forwarded-For`/`X-Cluster-Client-IP` para o IP de quem chama (predefinição: `true`, já que esta aplicação é tipicamente implantada atrás de um proxy reverso ou load balancer). Desative isto apenas se a aplicação estiver diretamente exposta à internet, sem nada à frente dela - veja [Implantação atrás de um proxy](../deployment.md#deploying-behind-a-reverse-proxy) |
| `cbEncryptionKey` / `cbSaltingKey` | Chaves de encriptação/salting utilizadas pela camada de segurança |

## Marca e aparência

| Definição | Propósito |
|---|---|
| `cbAppName` | Nome de exibição da aplicação |
| `cbAppLogo` | Logótipo mostrado na barra lateral de administração. Ou um URL introduzido manualmente, ou `/branding/logo/lg` após um carregamento via Settings — veja [Avatares e logótipo de marca](../guides/frontend.md#avatars-branding-logo) |
| `cbAppTagline` | Frase de destaque mostrada junto ao logótipo |
| `cbAppBrandTagline` | Rótulo de marca curto, mostrado na área de marca da barra lateral |
| `cbCopyrightNotice` | Texto de direitos de autor renderizado pelo rodapé da aplicação |
| `cbDefaultTheme` | Tema claro/escuro predefinido para novos visitantes |

## E-mail

| Definição | Propósito |
|---|---|
| `cbDefaultEmail` | Endereço "de" predefinido para o correio de saída |
| `cbMailHost` / `cbMailPort` | Anfitrião/porta SMTP |
| `cbMailUsername` / `cbMailPassword` | Credenciais SMTP |
| `cbMailTLS` / `cbMailSSL` | Indicadores de segurança de transporte |

## Registo de auditoria

| Definição | Propósito |
|---|---|
| `cbAuditLogRetentionDays` | Número de dias durante os quais os registos de auditoria são retidos pela purga agendada. Defina como `0` para desativar a purga automática (predefinição: `90`). |

## Segredos e encriptação

| Definição | Propósito |
|---|---|
| `cbEncryptionKey` | Segredo de encriptação AES utilizado pela camada de segurança/armazenamento. Substitua o valor de desenvolvimento gerado automaticamente por um segredo estável em produção. |
| `cbSaltingKey` | Sal utilizado pelas operações de segurança. Mantenha-o estável e secreto em produção. |

::: page-link href="../guides/configuration.md"
:::

::: page-link href="../guides/extending.md"
:::
