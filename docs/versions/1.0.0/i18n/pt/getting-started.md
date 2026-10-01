---
title: Primeiros Passos
order: 2
icon: phosphor-duotone:rocket-launch
summary: Instale o BoxLang, clone o template, configure a sua base de dados, e abra o ecrã de início de sessão.
tags: [guides, setup]
---

# Primeiros Passos

## Requisitos do sistema

- **Java 21+** (JDK ou JRE)
- **BoxLang 1.17+**
- **CommandBox 7+** (`bx-cli`)
- **Node.js 22+** (para o frontend com Vite)
- **Uma base de dados suportada**: MySQL 8+ (predefinição), MariaDB, PostgreSQL, SQLite, Oracle, ou MSSQL
- Qualquer sistema operativo

## Instalar o BoxLang

=== "Instalador rápido"

	### MacOS e Linux

	```bash frame="terminal" title="Terminal"
	# macOS & Linux
	/bin/bash -c "$(curl -fsSL https://install.boxlang.io)"

	# ...com instalação automática do Java 21
	curl -fsSL https://install.boxlang.io | bash -s -- --with-jre
	```

	### Windows

	```powershell frame="terminal" title="PowerShell (Windows)"
	powershell -NoExit -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://install-windows.boxlang.io'))"
	```

=== "BVM (gestor de versões)"

	Utilize antes o [BVM](https://boxlang.ortusbooks.com) se precisar de alternar entre várias versões do BoxLang:

	```bash frame="terminal" title="Terminal"
	curl -fsSL https://install-bvm.boxlang.io | bash

	bvm install latest && bvm use latest
	```

	Verifique a instalação:

	```bash frame="terminal" title="Terminal"
	boxlang --version
	```

!!! danger "Utilize o bx-cli, não o CommandBox comum"
    O CBGenesis é um template BoxLang. Não instale a distribuição padrão do CommandBox baseada em Lucee. Depois de instalar o BoxLang com o instalador rápido ou com o BVM, instale o módulo CLI nativo do BoxLang. Isto é obrigatório antes de executar `box install`, `box server`, `box migrate`, ou `box testbox`:

    ```bash frame="terminal" title="Terminal"
    install-bx-module bx-cli
    ```

    Verifique que a BoxLang CLI está ativa:

    ```bash frame="terminal" title="Terminal"
    box version
    ```

    Os programadores que já utilizam a distribuição do CommandBox baseada em Lucee devem limpar os artefactos em cache para garantir que estão a executar as versões mais recentes dos módulos necessários:

    ```bash frame="terminal" title="Terminal"
    box artifacts clean
    ```

    Se o `box` não for encontrado após a instalação, reinicie o terminal ou adicione ao seu `PATH` a diretoria indicada pelo instalador.

## Estruturar a sua aplicação

Entre na Shell do CommandBox digitando primeiro `box`:

::: stepper
::: step "Instalar a ColdBox CLI mais recente"
```bash frame="terminal" title="Terminal"
install coldbox-cli
```
:::

::: step "Criar a aplicação CBGenesis"
```bash frame="terminal" title="Terminal"
coldbox create app name="my-app" skeleton="cbgenesis"
```
:::

::: step "Instalar as dependências Node"
```bash frame="terminal" title="Terminal"
!npm install
```
:::

::: step "Atualizar Credenciais e Configuração da Base de Dados"
Abra o ficheiro `.env` no seu editor de texto preferido e atualize as credenciais da base de dados adequadamente. O template vem pré-configurado para MySQL. MySQL, MariaDB, PostgreSQL, e MSSQL são os destinos de base de dados suportados e testados. O `onServerInitialInstall` do `server.json` instala o módulo do driver JDBC correspondente à sua definição `DB_DRIVER` (`bx-${DB_DRIVER}`, com predefinição `bx-mysql`) na primeira vez que executar `box server start`. Para utilizar outra base de dados, defina `DB_DRIVER` no `.env` **antes** desse primeiro arranque do servidor
:::

::: step "Migrar e Semear"

Depois de definir o seu `.env`, execute os seguintes comandos para inicializar e semear a base de dados. Deverá transferir automaticamente os drivers necessários para ligar a CLI à base de dados configurada. Se houver algum problema na ligação, garanta que o `DB_DRIVER` correto está definido e que o módulo do driver JDBC correspondente está instalado.

```bash frame="terminal" title="Terminal"
migrate init
migrate up --seed
```

??? tip "O que cria o seeder?"
    `resources/database/seeds/AdminData.bx` cria uma função **Admin** com todas as 20 permissões incorporadas, e um utilizador administrador:

    | Campo | Valor |
    |---|---|
    | E-mail | `admin@cbgenesis.com` |
    | Palavra-passe | `test` (pendente de reposição) |

    Esta conta é semeada como pendente de reposição, pelo que iniciar sessão com `test` não lhe dá uma sessão - leva-o diretamente ao formulário de reposição de palavra-passe para escolher uma palavra-passe real. Isto é deliberado: o hash de arranque vem incluído neste repositório e é público. Veja a [checklist de produção](deployment.md#production-checklist).

:::

::: step "Atualizar as suas Skills de IA"

O CBGenesis vem com diretrizes de IA, skills, e ficheiros de agente pré-configurados em `.agents/`, para que assistentes como o GitHub Copilot, o Cursor, e o Claude Code obtenham contexto preciso sobre ColdBox e BoxLang. São gerados pelo módulo `coldbox-cli` que instalou no passo de estruturação. Atualize-os depois de estruturar o projeto, para que as diretrizes e skills correspondam aos seus módulos instalados:

```bash frame="terminal" title="Terminal"
coldbox ai refresh
```

Execute `coldbox ai refresh` novamente sempre que instalar, atualizar, ou remover módulos do CommandBox, para que as diretrizes e skills específicas de cada módulo sejam recolhidas.

??? tip "Descubra e faça a gestão das suas integrações de IA"
    ```bash frame="terminal" title="Terminal"
    coldbox ai --help         # Descubra os comandos de IA disponíveis
    coldbox ai info           # Mostra as diretrizes, skills, agentes, e servidores MCP instalados
    coldbox ai skills list    # Lista as skills disponíveis
    coldbox ai agents --help  # Adicione, atualize, ou remova ficheiros de configuração de agentes de IA
    ```
:::

::: step "Iniciar o servidor" color="success"

```bash frame="terminal" title="Terminal"
server start
```

Este é o comando de servidor da BoxLang CLI. A primeira execução instala os módulos BoxLang listados em `server.json` (`bx-esapi`, `bx-password-encrypt`, `bx-mail`, `bx-orm`, o driver JDBC selecionado por `DB_DRIVER`, e `bx-image`).

??? tip "Trocar de driver depois de o servidor já ter arrancado uma vez"
    `onServerInitialInstall` só dispara no primeiríssimo arranque de um servidor, pelo que alterar `DB_DRIVER` depois não reinstala o driver por si só. Execute `server forget` (que limpa o estado de instalação do servidor) antes de o iniciar novamente, para que o novo driver seja instalado:

    ```bash frame="terminal" title="Terminal"
    server forget
    server start
    ```
:::
::: step "Iniciar o Vite (num segundo terminal)" color="success"
```bash frame="terminal" title="Terminal"
npm run dev
```
:::
:::

## Abrir a aplicação

Visite **[http://127.0.0.1:8080](http://127.0.0.1:8080)** - vai aterrar na página de início de sessão. Inicie sessão com as credenciais de administrador semeadas acima.

<figure>
	<img src="assets/screenshots/login.png" alt="O ecrã de início de sessão, a utilizar o layout AuthSplit predefinido">
	<figcaption>O ecrã de início de sessão a utilizar o layout <code>AuthSplit</code> predefinido.</figcaption>
</figure>

Depois de entrar, vai aterrar no dashboard, com a barra lateral de administração pronta para Utilizadores, Funções, Permissões, Registo de Auditoria, e Definições:

<figure>
	<img src="assets/screenshots/dashboard.png" alt="O painel principal de administração após iniciar sessão">
	<figcaption>O painel principal de administração após iniciar sessão.</figcaption>
</figure>

::: cards
::: card title="Arquitetura" icon="phosphor-duotone:tree-structure" href="architecture.md"
Veja como `public/`, `app/`, `resources/`, e `lib/` se encaixam, e percorra o ciclo de vida do pedido.
:::
::: card title="Segurança e Permissões" icon="phosphor-duotone:shield-check" href="guides/security.md"
Compreenda o fluxo de início de sessão e o modelo de permissões `resource:action` antes de adicionar a sua primeira página protegida.
:::
::: card title="Estender a Aplicação" icon="phosphor-duotone:puzzle-piece" href="guides/extending.md"
Pronto para construir? Comece aqui para os passos exatos para adicionar um novo módulo CRUD.
:::
:::
