---
title: Implantação
order: 5
icon: phosphor-duotone:cloud-arrow-up
summary: Build de produção, Docker, BoxLang MiniServer, e uma checklist de lançamento.
tags: [deployment]
---

# Implantação

## Build de produção

```bash frame="terminal" title="Terminal"
npm run build
```

Compila e aplica fingerprint ao frontend em `public/includes/` - veja [Frontend](guides/frontend.md#vite-configuration).

## Docker

Um `Dockerfile` e ficheiros Compose específicos por base de dados residem em `resources/docker/`. O MySQL é a predefinição; estão disponíveis alternativas para PostgreSQL e MSSQL, os outros destinos testados em CI. O MariaDB pode utilizar a configuração do MySQL e o driver JDBC `mysql`. O `box.json` também define os scripts `docker:build`, `docker:run`, `docker:bash`, e `docker:stack` (executados com `box run-script <name>`) como atalhos para os comandos de um único argumento abaixo - não substituem a instalação obrigatória da BoxLang CLI para comandos `box` locais, e não têm relação com `npm run` (não existe `npm run docker:*`).

### Desenvolvimento local com Docker Compose

`resources/docker/docker-compose.yml` executa a aplicação (construída a partir de `resources/docker/Dockerfile.dev`, que instala o CommandBox nativamente sobre a imagem oficial `ortussolutions/boxlang:cli`, para que a versão do motor corresponda ao `.bvmrc`) juntamente com um contentor MySQL 8, com todo o repositório montado (bind mount) no contentor da aplicação para que as alterações feitas no anfitrião se apliquem sem necessidade de reconstrução - não é necessária nenhuma instalação local de BoxLang/MySQL. Execute `docker compose` diretamente (em vez de através do script do pacote `docker:stack`) para que comandos de várias palavras, como `up -d`, sejam corretamente passados:

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.yml up -d
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box migrate seed run
```

Visite `http://127.0.0.1:8080`. O MySQL está acessível a partir do anfitrião em `127.0.0.1:3406` (escolhido para evitar colisão com um MySQL/MariaDB já em execução na porta `3306`); o contentor da aplicação comunica com ele através da rede interna do Docker na porta real do MySQL, `3306`.

O ficheiro compose não executa o Vite - inicie-o separadamente no anfitrião para obter HMR:

```bash frame="terminal" title="Terminal"
npm install
npm run dev
```

Está também disponível um ficheiro Compose específico para MSSQL, para testar contra o SQL Server 2022. Instala o driver `bx-mssql` no contentor da aplicação, cria a base de dados `cbgenesis`, e mantém os seus dados em `resources/docker/.db/mssql/`:

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.mssql.yml up -d
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box migrate seed run
```

A aplicação continua disponível em `http://127.0.0.1:8080`; o SQL Server está acessível a partir do anfitrião em `127.0.0.1:1434`. A palavra-passe `sa` predefinida destina-se apenas a testes locais. Defina `MSSQL_SA_PASSWORD` antes de iniciar o stack para a substituir. Pare este stack com:

```bash frame="terminal" title="Terminal"
docker compose -f resources/docker/docker-compose.mssql.yml down
```

A alternativa em PostgreSQL utiliza o PostgreSQL 16, publica a porta `5433` no anfitrião, e instala automaticamente o `bx-postgresql`:

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.postgresql.yml up -d
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box migrate seed run
```

O ficheiro Compose predefinido para MySQL permanece inalterado. Pare qualquer uma das alternativas com o respetivo ficheiro Compose e `down`.

```bash frame="terminal" title="Terminal"
docker compose -f resources/docker/docker-compose.yml down
```

### Imagem de produção

```bash frame="terminal" title="Terminal"
box run-script docker:build
box run-script docker:run
```

Construa o frontend antes de criar uma imagem de produção:

```bash linenums="1"
npm run build
```

## BoxLang MiniServer

Uma alternativa ao servidor de desenvolvimento `bx-cli` para executar diretamente a aplicação compilada:

```bash frame="terminal" title="Terminal"
cd my-app
boxlang-miniserver --port 8080 --webroot ./public --dev
```

O MiniServer não disponibiliza `box install`, migrações, ou comandos do TestBox. Utilize a [BoxLang CLI](guides/command-line.md) obrigatória para essas tarefas.

## Checklist de produção

::: stepper
::: step "Definir o ambiente"
`ENVIRONMENT=production` e `BOXLANG_DEBUG=false` no `.env`.
:::
::: step "Configurar um e-mail real"
Aponte `app/config/modules/cbmailservices.bx` para um driver real de SMTP/Postmark/SendGrid - veja [E-mail](guides/email.md#protocol-by-environment).
:::
::: step "Rodar a palavra-passe de administrador semeada" color="warning"
O seeder cria `admin@cbgenesis.com` / `test`, marcado como pendente de reposição. Iniciar sessão com essas credenciais não concede uma sessão: é enviado diretamente para o formulário de reposição de palavra-passe e tem de definir uma nova palavra-passe primeiro. O hash de arranque é público (vem incluído no repositório), pelo que nunca deve limpar essa marcação para continuar a usar `test`. Veja [Primeiros Passos](getting-started.md#scaffold-your-app).
:::
::: step "Decidir quem pode reinicializar a framework"
`reinitPassword` lê `COLDBOX_REINIT_PASSWORD` a partir do ambiente. Deixe-a **por definir** em produção e cada arranque recorre a um novo UUID aleatório que ninguém conhece, o que fecha completamente o `?fwreinit`. Defina-a apenas se precisar de reinicializar uma instância em execução, e trate-a como uma credencial. Defini-la como uma cadeia vazia deixa a reinicialização aberta a qualquer pessoa, razão pela qual `development()` faz exatamente isso e a produção não deve fazê-lo.
:::
::: step "Ativar HTTPS"
Através da configuração SSL em `server.json`, ou do seu proxy reverso / load balancer preferido.
:::
::: step "Decidir se deve confiar nos cabeçalhos do proxy" color="warning"
`cbTrustProxyHeaders` está **ativo** por predefinição, correspondendo a uma implantação típica atrás de um proxy reverso ou load balancer. Se a aplicação estiver diretamente exposta à internet, desative-o - veja [Implantar atrás de um proxy reverso](#deploying-behind-a-reverse-proxy). Trocar isto ao contrário ou anula a limitação de taxa ou quebra-a para todos os que estão atrás do proxy.
:::
::: step "Atualizar a configuração da relying party das passkeys" color="warning"
`app/config/modules/cbsecurity-passkeys.bx` vem com placeholders apenas para desenvolvimento (`relyingPartyId: "localhost"`, `allowedOrigins: ["http://localhost:8080"]`). Defina-os para o seu domínio real de produção antes do lançamento, ou o registo de passkeys irá falhar - veja [Segurança e Permissões](guides/security.md#known-issues).
:::
::: step "Construir o frontend"
`npm run build` para obter os assets minificados e com fingerprint.
:::
::: step "Bloquear o /healthcheck" color="danger"
Remova ou restrinja o endpoint público `/healthcheck` se não deve ser acessível a partir do exterior da sua infraestrutura.
:::
:::

## Implantar atrás de um proxy reverso

O `RateLimiter`, o registo de auditoria, e os e-mails de segurança de "reposição pedida a partir do IP" leem todos o IP de quem chama através do `getRealIP()` do `cbsecurity`. Essa função tem duas fontes possíveis para o IP, e só você - a pessoa que implanta esta aplicação - sabe qual é a correta para a sua configuração:

- **O endereço do socket em bruto** (`cgi.remote_addr`) - correto quando a aplicação está diretamente exposta à internet. Se houver um proxy reverso à frente, este será sempre o endereço do próprio proxy, e não o do visitante.
- **Os cabeçalhos de pedido `X-Forwarded-For` / `X-Cluster-Client-IP`** - corretos apenas quando algo à frente da aplicação (nginx, um load balancer, uma CDN) remove o que quer que o cliente tenha enviado e define o cabeçalho por si próprio. Se nada fizer isso, qualquer chamador pode definir este cabeçalho como quiser, incluindo um valor diferente a cada pedido.

A definição `cbTrustProxyHeaders` (predefinição `true`, editável em `/settings`) escolhe entre estas duas opções. Deixá-la ativa quando não está, de facto, atrás de um proxy que higieniza o cabeçalho reabre exatamente o contorno de limitação de taxa que ela existe para fechar - um chamador pode forjar um novo valor de `X-Forwarded-For` em cada tentativa de início de sessão e nunca ser bloqueado. Desativá-la quando *está* atrás de tal proxy faz com que todos os visitantes partilhem o IP do proxy - um chamador bloqueado bloqueia todos os que estão atrás dele, e o registo de auditoria regista o endereço do proxy para todas as ações.

Se implantar diretamente exposto à internet, sem nada à frente da aplicação, desative isto. Se implantar atrás de um proxy reverso, confirme que este de facto sobrescreve o `X-Forwarded-For` (em vez de acrescentar a, ou simplesmente deixar passar, um valor fornecido pelo cliente) antes de manter esta opção ativa.

::: cards
::: card title="Configuração" icon="phosphor-duotone:gear-six" href="guides/configuration.md"
Todas as variáveis de ambiente e definições de módulo referidas acima.
:::
::: card title="Segurança e Permissões" icon="phosphor-duotone:shield-check" href="guides/security.md"
Verifique novamente a firewall e a configuração de CSRF antes de entrar em produção.
:::
:::
