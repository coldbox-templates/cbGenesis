---
title: Deployment
order: 5
icon: phosphor-duotone:cloud-arrow-up
summary: Build di produzione, Docker, BoxLang MiniServer e una checklist di go-live.
tags: [deployment]
---

# Deployment

## Build di produzione

```bash frame="terminal" title="Terminal"
npm run build
```

Compila e appone il fingerprint al frontend in `public/includes/` - vedi [Frontend](guides/frontend.md#vite-configuration).

## Docker

Un `Dockerfile` e file Compose specifici per database vivono in `resources/docker/`. MySQL è il default; le alternative PostgreSQL e MSSQL sono fornite per gli altri target testati in CI. MariaDB può usare la configurazione MySQL e il driver JDBC `mysql`. `box.json` definisce anche gli script `docker:build`, `docker:run`, `docker:bash` e `docker:stack` (eseguili con `box run-script <name>`) come scorciatoie per i comandi a singolo argomento qui sotto - non sostituiscono l'installazione richiesta della CLI di BoxLang per i comandi `box` locali, e non sono correlati a `npm run` (non esiste `npm run docker:*`).

### Sviluppo locale con Docker Compose

`resources/docker/docker-compose.yml` esegue l'app (costruita da `resources/docker/Dockerfile.dev`, che installa CommandBox in modo nativo sopra l'immagine ufficiale `ortussolutions/boxlang:cli` in modo che la versione del motore corrisponda a `.bvmrc`) insieme a un container MySQL 8, con l'intero repository montato come bind mount nel container dell'app così le modifiche sull'host si applicano senza un rebuild - nessuna installazione locale di BoxLang/MySQL richiesta. Esegui `docker compose` direttamente (piuttosto che tramite lo script del pacchetto `docker:stack`) in modo che comandi multi-parola come `up -d` vengano passati correttamente:

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.yml up -d
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.yml exec coldbox_app box migrate seed run
```

Visita `http://127.0.0.1:8080`. MySQL è raggiungibile dall'host su `127.0.0.1:3406` (scelta per evitare collisioni con un MySQL/MariaDB già in esecuzione su `3306`); il container dell'app comunica con esso sulla rete Docker interna sulla porta reale di MySQL, `3306`.

Il file compose non esegue Vite - avvialo separatamente sull'host per l'HMR:

```bash frame="terminal" title="Terminal"
npm install
npm run dev
```

È disponibile anche un file Compose specifico per MSSQL, per testare contro SQL Server 2022. Installa il driver `bx-mssql` nel container dell'app, crea il database `cbgenesis` e mantiene i suoi dati sotto `resources/docker/.db/mssql/`:

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.mssql.yml up -d
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.mssql.yml exec coldbox_app box migrate seed run
```

L'applicazione resta disponibile su `http://127.0.0.1:8080`; SQL Server è raggiungibile dall'host su `127.0.0.1:1434`. La password `sa` predefinita è pensata solo per i test locali. Imposta `MSSQL_SA_PASSWORD` prima di avviare lo stack per sovrascriverla. Ferma questo stack con:

```bash frame="terminal" title="Terminal"
docker compose -f resources/docker/docker-compose.mssql.yml down
```

L'alternativa PostgreSQL usa PostgreSQL 16, pubblica la porta host `5433` e installa automaticamente `bx-postgresql`:

```bash frame="terminal" title="Terminal"
npm install
npm run build
docker compose -f resources/docker/docker-compose.postgresql.yml up -d
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box install
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box migrate up
docker compose -f resources/docker/docker-compose.postgresql.yml exec coldbox_app box migrate seed run
```

Il file Compose MySQL predefinito rimane invariato. Ferma una delle alternative con il file Compose corrispondente e `down`.

```bash frame="terminal" title="Terminal"
docker compose -f resources/docker/docker-compose.yml down
```

### Immagine di produzione

```bash frame="terminal" title="Terminal"
box run-script docker:build
box run-script docker:run
```

Costruisci il frontend prima di creare un'immagine di produzione:

```bash linenums="1"
npm run build
```

## BoxLang MiniServer

Un'alternativa al server di sviluppo `bx-cli` per eseguire direttamente l'app compilata:

```bash frame="terminal" title="Terminal"
cd my-app
boxlang-miniserver --port 8080 --webroot ./public --dev
```

Il MiniServer non fornisce `box install`, le migrazioni o i comandi TestBox. Usa la [CLI di BoxLang](guides/command-line.md) richiesta per quei compiti.

## Checklist di produzione

::: stepper
::: step "Imposta l'ambiente"
`ENVIRONMENT=production` e `BOXLANG_DEBUG=false` in `.env`.
:::
::: step "Configura l'email reale"
Punta `app/config/modules/cbmailservices.bx` verso un driver SMTP/Postmark/SendGrid reale - vedi [Email](guides/email.md#protocol-by-environment).
:::
::: step "Ruota la password admin seminata" color="warning"
Il seeder crea `admin@cbgenesis.com` / `test`, contrassegnato come reset-pending. Accedere con essa non concede una sessione: vieni inviato direttamente al modulo di reimpostazione password e devi impostare una nuova password prima. L'hash di bootstrap è pubblico (viene distribuito nel repository), quindi non rimuovere mai quel flag per continuare a usare `test`. Vedi [Per iniziare](getting-started.md#scaffold-your-app).
:::
::: step "Decidi chi può reinizializzare il framework"
`reinitPassword` legge `COLDBOX_REINIT_PASSWORD` dall'ambiente. Lascialo **non impostato** in produzione e ogni avvio ricadrà su un nuovo UUID casuale che nessuno conosce, il che chiude completamente `?fwreinit`. Impostalo solo se devi reinizializzare un'istanza in esecuzione, e trattalo come una credenziale. Impostarlo a una stringa vuota lascia il reinit aperto a chiunque, motivo per cui `development()` fa esattamente questo e la produzione non deve farlo.
:::
::: step "Abilita HTTPS"
Tramite la configurazione SSL in `server.json`, o il tuo reverse proxy / load balancer di scelta.
:::
::: step "Decidi se fidarti degli header del proxy" color="warning"
`cbTrustProxyHeaders` è **attivo** per default, il che corrisponde a un tipico deployment dietro un reverse proxy o load balancer. Se l'app è invece direttamente esposta a internet, disattivalo - vedi [Distribuire dietro un reverse proxy](#deploying-behind-a-reverse-proxy). Sbagliare questa scelta vanifica il rate limiting oppure lo rompe per tutti quelli dietro il proxy.
:::
::: step "Aggiorna la configurazione della relying party per le passkey" color="warning"
`app/config/modules/cbsecurity-passkeys.bx` viene distribuito con segnaposto solo per lo sviluppo (`relyingPartyId: "localhost"`, `allowedOrigins: ["http://localhost:8080"]`). Impostali sul tuo dominio di produzione reale prima del go-live, altrimenti la registrazione delle passkey fallirà - vedi [Sicurezza e permessi](guides/security.md#known-issues).
:::
::: step "Costruisci il frontend"
`npm run build` per asset minificati e con fingerprint.
:::
::: step "Blocca /healthcheck" color="danger"
Rimuovi o limita l'endpoint pubblico `/healthcheck` se non deve essere raggiungibile dall'esterno della tua infrastruttura.
:::
:::

## Distribuire dietro un reverse proxy

`RateLimiter`, il registro di audit e le email di sicurezza "reset richiesto dall'IP" leggono tutti l'IP del chiamante tramite `getRealIP()` di `cbsecurity`. Quella funzione ha due possibili fonti per l'IP, e solo tu - la persona che distribuisce questa app - sai quale sia quella corretta per la tua configurazione:

- **L'indirizzo socket grezzo** (`cgi.remote_addr`) - corretto quando l'app è direttamente esposta a internet. Se davanti c'è un reverse proxy, questo è sempre l'indirizzo del proxy stesso, non quello del visitatore.
- **Gli header di richiesta `X-Forwarded-For` / `X-Cluster-Client-IP`** - corretti solo quando qualcosa davanti all'app (nginx, un load balancer, una CDN) rimuove qualunque valore inviato dal client e imposta l'header da sé. Se nulla fa questo, qualsiasi chiamante può impostare questo header a piacere, incluso un valore diverso a ogni richiesta.

L'impostazione `cbTrustProxyHeaders` (default `true`, modificabile in `/settings`) sceglie tra i due. Lasciarla attiva quando in realtà non sei dietro un proxy che sanifica l'header riapre esattamente il bypass del rate limit che esiste per chiudere - un chiamante può falsificare un nuovo valore di `X-Forwarded-For` a ogni tentativo di login e non essere mai bloccato. Disattivarla quando *sei* effettivamente dietro un proxy simile significa che ogni visitatore condivide l'IP del proxy - un chiamante bloccato blocca tutti quelli dietro di esso, e il registro di audit registra l'indirizzo del proxy per ogni azione.

Se distribuisci direttamente esposto a internet, senza nulla davanti all'app, disattivala. Se distribuisci dietro un reverse proxy, conferma che sovrascriva effettivamente `X-Forwarded-For` (piuttosto che aggiungervisi o lasciar passare un valore fornito dal client) prima di lasciarla attiva.

::: cards
::: card title="Configurazione" icon="phosphor-duotone:gear-six" href="guides/configuration.md"
Ogni variabile d'ambiente e impostazione di modulo menzionata sopra.
:::
::: card title="Sicurezza e permessi" icon="phosphor-duotone:shield-check" href="guides/security.md"
Ricontrolla la configurazione del firewall e del CSRF prima di andare in produzione.
:::
:::
