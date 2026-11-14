---
title: BoxLang CLI
order: 0
icon: phosphor-duotone:terminal-window
summary: Instale o BoxLang e utilize o fluxo de trabalho nativo bx-cli do BoxLang para dependências, servidores, migrações, e testes.
tags: [guides, setup, cli, boxlang]
---

# BoxLang CLI

O CBGenesis é uma aplicação BoxLang. Os seus comandos `box` têm de ser fornecidos pelo módulo nativo `bx-cli` do BoxLang. A distribuição comum do CommandBox baseada em Lucee não é suportada para este template.

## Instalação obrigatória

Instale o BoxLang com o instalador rápido ou com o BVM, e depois instale o `bx-cli`:

=== "Instalador rápido"
    ```bash linenums="1"
    /bin/bash -c "$(curl -fsSL https://install.boxlang.io)"
    ```

    Para instalar com um runtime Java 21 quando o Java ainda não está disponível:

    ```bash linenums="1"
    curl -fsSL https://install.boxlang.io | bash -s -- --with-jre
    ```

=== "BVM"
    ```bash linenums="1"
    curl -fsSL https://install-bvm.boxlang.io | bash
    bvm install latest
    bvm use latest
    ```

Depois de o BoxLang estar disponível, instale o módulo CLI:

```bash linenums="1"
install-bx-module bx-cli
box version
```

Reinicie o terminal se o `box` não for encontrado imediatamente após a instalação. Não instale o executável padrão do CommandBox baseado em Lucee juntamente com este fluxo de trabalho; isso pode fazer com que sejam selecionados o motor e os módulos de comandos errados.

## Comandos diários

Execute estes comandos a partir da raiz do projeto. Todos são executados pelo `bx-cli`:

| Comando | Propósito |
|---|---|
| `box install` | Instala as dependências do `box.json` em `lib/` |
| `box server start` | Inicia o servidor web BoxLang na porta `8080` |
| `box server stop` | Para o servidor do projeto |
| `box migrate up` | Aplica as migrações de base de dados pendentes |
| `box migrate down` | Reverte o lote de migração mais recente |
| `box migrate reset` | Reverte todas as migrações e volta a aplicá-las |
| `box migrate seed run` | Executa os dados de seed: a função `Admin`, as suas 20 permissões, e o utilizador administrador pendente de reposição |
| `box testbox run` | Executa o conjunto de testes do TestBox - veja [Testes](testing.md#running-tests) para filtragem |
| `box task run path/to/task.cfc` | Executa uma tarefa do CommandBox através do `bx-cli` |
| `box coldbox ai refresh` | Sincroniza as diretrizes e skills de IA em `.agents/` com os seus módulos instalados |
| `box run-script format` | Formata o código-fonte BoxLang (`app/`, `tests/specs/`, `*.bx` na raiz) |
| `box run-script format:check` | Verifica a formatação sem escrever alterações |

O frontend utiliza o Node.js separadamente:

```bash linenums="1"
npm install
npm run dev
npm run build
npm run lint
npm run lint:scss
```

## Sequência da primeira execução

```bash linenums="1"
install-bx-module bx-cli
box install
npm install
cp .env.example .env
box migrate up
box migrate seed run
box server start
npm run dev
```

O servidor utiliza o `server.json` para selecionar `boxlang@1`, a raiz pública `public/`, a porta `8080`, e os módulos BoxLang instalados no primeiro arranque. Veja [Primeiros Passos](../getting-started.md) para a configuração da base de dados e [Configuração](configuration.md) para as variáveis de ambiente.

## Resolução de problemas

- **`box: command not found`**: confirme que o BoxLang está instalado, reinicie o terminal, e garanta que a diretoria do instalador está no `PATH`.
- **Mensagens do Lucee ou de um motor CFML**: está a ser utilizado o executável comum do CommandBox. Remova-o do `PATH`, reinstale o BoxLang, e execute `install-bx-module bx-cli`.
- **Comandos do projeto em falta**: execute `box version` a partir da raiz do projeto e depois `box install`, para que as dependências em `box.json` fiquem disponíveis.
- **Erros de ligação à base de dados**: verifique o `.env`, garanta que a base de dados existe, e instale/inicie o driver JDBC através da configuração do servidor BoxLang.
