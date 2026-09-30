---
title: CLI di BoxLang
order: 0
icon: phosphor-duotone:terminal-window
summary: Installa BoxLang e usa il workflow nativo bx-cli di BoxLang per dipendenze, server, migrazioni e test.
tags: [guides, setup, cli, boxlang]
---

# CLI di BoxLang

CBGenesis è un'applicazione BoxLang. I suoi comandi `box` devono essere forniti dal modulo nativo `bx-cli` di BoxLang. La normale distribuzione CommandBox basata su Lucee non è supportata per questo template.

## Installazione richiesta

Installa BoxLang con l'installer rapido oppure BVM, quindi installa `bx-cli`:

=== "Installer rapido"
    ```bash linenums="1"
    /bin/bash -c "$(curl -fsSL https://install.boxlang.io)"
    ```

    Per installare con un runtime Java 21 quando Java non è già disponibile:

    ```bash linenums="1"
    curl -fsSL https://install.boxlang.io | bash -s -- --with-jre
    ```

=== "BVM"
    ```bash linenums="1"
    curl -fsSL https://install-bvm.boxlang.io | bash
    bvm install latest
    bvm use latest
    ```

Dopo che BoxLang è disponibile, installa il modulo CLI:

```bash linenums="1"
install-bx-module bx-cli
box version
```

Riavvia il terminale se `box` non viene trovato subito dopo l'installazione. Non installare l'eseguibile standard CommandBox basato su Lucee insieme a questo workflow; può causare la selezione del runtime e dei moduli di comando sbagliati.

## Comandi quotidiani

Esegui questi dalla root del progetto. Sono tutti eseguiti da `bx-cli`:

| Comando | Scopo |
|---|---|
| `box install` | Installa le dipendenze di `box.json` in `lib/` |
| `box server start` | Avvia il server web BoxLang sulla porta `8080` |
| `box server stop` | Ferma il server del progetto |
| `box migrate up` | Applica le migrazioni del database in sospeso |
| `box migrate down` | Annulla l'ultimo batch di migrazioni |
| `box migrate reset` | Annulla tutte le migrazioni e le riapplica |
| `box migrate seed run` | Esegue i dati seed: il ruolo `Admin`, i suoi 20 permessi e l'utente admin reset-pending |
| `box testbox run` | Esegue la suite TestBox - vedi [Testing](testing.md#running-tests) per il filtraggio |
| `box task run path/to/task.cfc` | Esegue un task di CommandBox tramite `bx-cli` |
| `box coldbox ai refresh` | Sincronizza le linee guida e le skill AI in `.agents/` con i tuoi moduli installati |
| `box run-script format` | Formatta il sorgente BoxLang (`app/`, `tests/specs/`, `*.bx` nella root) |
| `box run-script format:check` | Verifica la formattazione senza scrivere modifiche |

Il frontend usa Node.js separatamente:

```bash linenums="1"
npm install
npm run dev
npm run build
npm run lint
npm run lint:scss
```

## Sequenza di prima esecuzione

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

Il server usa `server.json` per selezionare `boxlang@1`, la webroot `public/`, la porta `8080` e i moduli BoxLang installati al primo avvio. Vedi [Per iniziare](../getting-started.md) per la configurazione del database e [Configurazione](configuration.md) per le variabili d'ambiente.

## Risoluzione dei problemi

- **`box: command not found`**: conferma che BoxLang sia installato, riavvia il terminale e assicurati che la directory dell'installer sia nel `PATH`.
- **Messaggi del motore Lucee o CFML**: si sta usando il normale eseguibile CommandBox. Rimuovilo dal `PATH`, reinstalla BoxLang ed esegui `install-bx-module bx-cli`.
- **Comandi di progetto mancanti**: esegui `box version` dalla root del progetto e poi `box install` in modo che le dipendenze in `box.json` siano disponibili.
- **Errori di connessione al database**: verifica `.env`, assicurati che il database esista e installa/avvia il driver JDBC tramite la configurazione del server BoxLang.
