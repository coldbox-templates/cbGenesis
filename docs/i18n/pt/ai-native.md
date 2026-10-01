---
title: Construído para o Desenvolvimento Assistido por IA
order: 3
icon: phosphor-duotone:robot
summary: Por que começar a partir do cbGenesis custa, de forma mensurável, menos tokens e produz código mais consistente do que pedir a um agente de IA para construir a sua autenticação, RBAC, e painel de administração a partir de um repositório vazio.
tags: [ai, agents, skills, productivity]
---

# Construído para o desenvolvimento assistido por IA

Hoje em dia, todas as aplicações a sério são construídas com um agente de IA de programação algures no processo. A questão não é se vai usar um - é se esse agente parte de um repositório vazio e tem de *adivinhar* as suas convenções a cada sessão, ou se parte de uma base de código que já lhe diz exatamente como as coisas são feitas aqui.

O cbGenesis foi construído para o segundo caso.

## O custo real de "simplesmente construir com IA"

Entregar a um agente uma aplicação ColdBox vazia e pedir-lhe autenticação, RBAC, um painel de administração, proteção CSRF, e um conjunto de testes não custa apenas o tempo do agente - custa tokens, e custa consistência. Sem uma base de código à qual se ancorar, um agente:

- Explora o projeto (vazio), não encontra nada, e ou inventa as suas próprias convenções ou faz-lhe uma dúzia de perguntas de esclarecimento.
- Volta a derivar a mesma infraestrutura sensível em termos de segurança - autenticação de sessão, verificação de CSRF, verificações de permissões - todas as vezes, sem garantia de acertar nos detalhes subtis (janelas de rotação, verificações de negação por predefinição, proteções contra auto-ação) que aqui só foram descobertos através de incidentes reais.
- Não tem nada a imitar, pelo que cada ficheiro que escreve se pode afastar um pouco mais do anterior - funcionalidades construídas com duas semanas de intervalo começam a parecer vindas de bases de código diferentes.

O cbGenesis já vem com tudo isto construído, testado, e - de forma crítica para um agente de IA - **documentado como skills legíveis por máquina**, e não apenas prosa que um humano tem de traduzir em instruções.

## O que vem incluído especificamente para agentes

- **`AGENTS.md`** na raiz do repositório - o único ficheiro que a maioria das ferramentas de agentes (Claude Code, Copilot, Cursor, e outras) carrega automaticamente, descrevendo a estrutura da aplicação, os handlers, os interceptors, e as convenções antes de o agente escrever uma única linha de código.
- **Mais de 90 skills de framework**, instaladas automaticamente pela ColdBox CLI, cobrindo BoxLang, ColdBox, CommandBox, TestBox, WireBox, e todos os módulos incluídos (cbSecurity, cbORM, qb, cbMailServices) - padrões de implementação passo a passo que um agente carrega conforme necessário, em vez de adivinhar a partir de dados de treino que podem ser anteriores à API atual.
- **Seis skills específicas do cbGenesis** (`.agents/skills-custom/`) que captam aquilo que as skills de framework *não conseguem* saber - o próprio modelo de permissões `resource:action` desta aplicação, o seu contrato de frontend `fetchWithCsrf()`, a forma exata como entidade/serviço/handler/rota/componente de uma nova funcionalidade deve seguir aqui, o seu verdadeiro mecanismo de isolamento de testes, e a divisão entre variável de ambiente e base de dados nas definições. Veja [Estender a Aplicação](guides/extending.md) para a lista completa.
- **Servidores de documentação MCP ao vivo** para cada framework e módulo do stack, para que um agente consulte a documentação atual em vez de depender de um corte de conhecimento de treino.

Nada disto é um truque de "engenharia de prompts". É a mesma coisa que torna um novo colaborador humano produtivo mais depressa: uma base de código com convenções que valem a pena copiar, e um mapa de onde as encontrar.

## Medimos, não nos limitámos a afirmar

Afirmações sobre produtividade de IA são baratas. Por isso, em vez de afirmar um número, fizemos um teste real e reproduzível.

**A tarefa:** adicionar um recurso CRUD completo ("Tags") a esta mesma base de código do cbGenesis - uma entidade ORM, um serviço, um handler JSON protegido por permissões, uma rota, e um componente de frontend em Alpine.js com o tratamento correto de CSRF. A mesma tarefa bem definida, dada a dois agentes independentes, no mesmo commit, com o mesmo modelo.

**Condição A - apenas exploração.** Ao agente foi dito para não consultar nenhuma das skills personalizadas do cbGenesis, tendo de fazer engenharia reversa das convenções por si próprio: que ficheiros definem o formato das permissões, como os handlers existentes moldam uma resposta JSON, como o frontend recupera de um token CSRF desatualizado, onde as rotas são registadas.

**Condição B - assistida por skills.** O agente foi direcionado primeiro para as três skills personalizadas relevantes (`cbgenesis-crud-resource`, `cbgenesis-csrf-frontend`, `cbgenesis-rbac-permissions`) e implementou diretamente a partir do que estas diziam.

Ambos os agentes produziram uma fatia vertical completa e funcional. Eis o que custou:

| | Apenas exploração | Assistido por skills |
|---|---|---|
| **Tokens** | 129.672 | **113.995** |
| **Chamadas a ferramentas** | 38 | **22** |
| **Tempo total** | 208s | **137s** |

Isso são **menos 12% de tokens**, **menos 42% de chamadas a ferramentas**, e **menos 34% de tempo** para o mesmo âmbito de trabalho, numa única execução medida. A diferença de tokens, por si só, subestima o ganho: cada invocação de agente transporta um custo fixo elevado (prompt de sistema, definições de ferramentas) que é idêntico em ambas as condições, pelo que quase toda essa redução vem do trabalho *específico da tarefa* - a parte que é, de facto, exploração versus execução direta.

**Sendo transparentes quanto à metodologia:** foi uma execução por condição, não um benchmark com médias, pelo que deve encarar as percentagens exatas como indicativas e não como uma garantia - os resultados variam consoante a complexidade da tarefa e o modelo. Ambas as condições tinham à disposição o `AGENTS.md` base do cbGenesis (a maioria das ferramentas de agentes carrega-o automaticamente e não há forma limpa de o esconder), pelo que mesmo a condição de "apenas exploração" não partiu de uma escuridão *total* - ainda assim teve de descobrir por si própria os padrões de implementação específicos. Execute a comparação você mesmo numa tarefa que lhe interesse; preferimos que a verifique a que confie na nossa palavra.

A diferença nas chamadas a ferramentas é o número mais revelador: 38 contra 22 não é "o agente pensou um pouco menos", é a diferença entre *ler metade da base de código para encontrar o padrão* e *ler diretamente o padrão*.

## O argumento para além dos tokens

Os tokens são a coisa fácil de medir. O ganho mais difícil de quantificar é aquilo que não acontece: um agente que constrói um fluxo de início de sessão, uma verificação de permissões, ou um formulário protegido por CSRF sobre o cbGenesis herda padrões que já foram reforçados contra erros reais (um token CSRF desatualizado a descartar silenciosamente os dados de um utilizador, uma relação de permissões a falhar silenciosamente na limpeza, uma proteção contra auto-ação aplicada de forma inconsistente) - erros que este projeto já cometeu, corrigiu, e depois codificou numa skill para que um agente não os volte a cometer no seu projeto.

Construir "do zero com IA" significa que cada uma dessas lições tem de ser reaprendida, por projeto, da maneira difícil. Começar a partir do cbGenesis significa que já estão pagas.

## Para onde ir a seguir

::: cards
::: card title="Primeiros Passos" icon="phosphor-duotone:rocket-launch" href="getting-started.md"
Instale, configure, migre, e execute a aplicação localmente.
:::
::: card title="Estender a Aplicação" icon="phosphor-duotone:puzzle-piece" href="guides/extending.md"
Veja as skills personalizadas em contexto - o que cobrem, e como adicionar as suas próprias à medida que a aplicação cresce.
:::
::: card title="Segurança e Permissões" icon="phosphor-duotone:shield-check" href="guides/security.md"
O modelo `resource:action`, o CSRF, e as convenções que as skills acima codificam.
:::
:::
