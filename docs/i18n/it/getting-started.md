---
title: Per iniziare
order: 2
icon: phosphor-duotone:rocket-launch
summary: Installa BoxLang, clona il template, configura il tuo database e apri la schermata di login.
tags: [guides, setup]
---

# Per iniziare

## Requisiti di sistema

- **Java 21+** (JDK o JRE)
- **BoxLang 1.17+**
- **CommandBox 7+** (`bx-cli`)
- **Node.js 22+** (per il frontend Vite)
- **Un database supportato**: MySQL 8+ (default), MariaDB, PostgreSQL, SQLite, Oracle o MSSQL
- Qualsiasi sistema operativo

## Installare BoxLang

=== "Installer rapido"

	### MacOS e Linux

	```bash frame="terminal" title="Terminal"
	# macOS & Linux
	/bin/bash -c "$(curl -fsSL https://install.boxlang.io)"

	# ...con installazione automatica di Java 21
	curl -fsSL https://install.boxlang.io | bash -s -- --with-jre
	```

	### Windows

	```powershell frame="terminal" title="PowerShell (Windows)"
	powershell -NoExit -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://install-windows.boxlang.io'))"
	```

=== "BVM (version manager)"

	Usa [BVM](https://boxlang.ortusbooks.com) invece se devi passare tra più versioni di BoxLang:

	```bash frame="terminal" title="Terminal"
	curl -fsSL https://install-bvm.boxlang.io | bash

	bvm install latest && bvm use latest
	```

	Verifica l'installazione:

	```bash frame="terminal" title="Terminal"
	boxlang --version
	```

!!! danger "Usa bx-cli, non il normale CommandBox"
    CBGenesis è un template BoxLang. Non installare la normale distribuzione CommandBox basata su Lucee. Dopo aver installato BoxLang con l'installer rapido o BVM, installa il modulo CLI nativo di BoxLang. Questo è richiesto prima di eseguire `box install`, `box server`, `box migrate` o `box testbox`:

    ```bash frame="terminal" title="Terminal"
    install-bx-module bx-cli
    ```

    Verifica che la CLI di BoxLang sia attiva:

    ```bash frame="terminal" title="Terminal"
    box version
    ```

    Gli sviluppatori che attualmente usano la distribuzione CommandBox basata su Lucee dovrebbero ripulire gli artefatti in cache per assicurarsi di eseguire le versioni più recenti dei moduli richiesti:

    ```bash frame="terminal" title="Terminal"
    box artifacts clean
    ```

    Se `box` non viene trovato dopo l'installazione, riavvia il terminale o aggiungi la directory indicata dall'installer al tuo `PATH`.

## Fai lo scaffold della tua app

Entra nella CommandBox Shell digitando prima `box`:

::: stepper
::: step "Installa l'ultima ColdBox CLI"
```bash frame="terminal" title="Terminal"
install coldbox-cli
```
:::

::: step "Crea l'app CBGenesis"
```bash frame="terminal" title="Terminal"
coldbox create app name="my-app" skeleton="cbgenesis"
```
:::

::: step "Installa le dipendenze Node"
```bash frame="terminal" title="Terminal"
!npm install
```
:::

::: step "Aggiorna le credenziali e la configurazione del database"
Apri il file `.env` nel tuo editor di testo preferito e aggiorna di conseguenza le credenziali del database. Il template è pre-configurato per MySQL. MySQL, MariaDB, PostgreSQL e MSSQL sono target di database supportati e testati. `onServerInitialInstall` di `server.json` installa il modulo driver JDBC corrispondente alla tua impostazione `DB_DRIVER` (`bx-${DB_DRIVER}`, con default `bx-mysql`) al primo avvio di `box server start`. Per usare un altro database, imposta `DB_DRIVER` in `.env` **prima** di quel primo avvio del server
:::

::: step "Migra e semina"

Una volta impostato il tuo `.env`, esegui i seguenti comandi per inizializzare e seminare il database. Dovrebbe scaricare automaticamente i driver necessari per collegare la CLI al database configurato. Se ci sono problemi di connessione, assicurati che sia impostato il `DB_DRIVER` corretto e che il modulo driver JDBC corrispondente sia installato.

```bash frame="terminal" title="Terminal"
migrate init
migrate up --seed
```

??? tip "Cosa crea il seeder?"
    `resources/database/seeds/AdminData.bx` crea un ruolo **Admin** con tutti i 20 permessi integrati, e un utente admin:

    | Campo | Valore |
    |---|---|
    | Email | `admin@cbgenesis.com` |
    | Password | `test` (reset-pending) |

    Questo account viene seminato come reset-pending, quindi accedere con `test` non ti dà una sessione - ti porta direttamente al modulo di reimpostazione password per sceglierne una reale. Questo è intenzionale: l'hash di bootstrap viene distribuito in questo repository ed è pubblico. Vedi la [checklist di produzione](deployment.md#production-checklist).

:::

::: step "Aggiorna le tue AI Skill"

CBGenesis fornisce linee guida AI, skill e file per agenti pre-configurati in `.agents/`, così assistenti come GitHub Copilot, Cursor e Claude Code ottengono un contesto ColdBox e BoxLang accurato. Sono generati dal modulo `coldbox-cli` che hai installato nel passaggio di scaffolding. Aggiornali dopo lo scaffolding in modo che le linee guida e le skill corrispondano ai tuoi moduli installati:

```bash frame="terminal" title="Terminal"
coldbox ai refresh
```

Esegui di nuovo `coldbox ai refresh` ogni volta che installi, aggiorni o rimuovi moduli CommandBox in modo che le linee guida e le skill specifiche dei moduli vengano recepite.

??? tip "Scopri e gestisci le tue integrazioni AI"
    ```bash frame="terminal" title="Terminal"
    coldbox ai --help         # Scopri i comandi AI disponibili
    coldbox ai info           # Mostra le linee guida, skill, agenti e server MCP installati
    coldbox ai skills list    # Elenca le skill disponibili
    coldbox ai agents --help  # Aggiungi, aggiorna o rimuovi i file di configurazione degli agenti AI
    ```
:::

::: step "Avvia il server" color="success"

```bash frame="terminal" title="Terminal"
server start
```

Questo è il comando server della CLI di BoxLang. La prima esecuzione installa i moduli BoxLang elencati in `server.json` (`bx-esapi`, `bx-password-encrypt`, `bx-mail`, `bx-orm`, il driver JDBC selezionato da `DB_DRIVER`, e `bx-image`).

??? tip "Cambiare driver dopo che il server è già stato avviato una volta"
    `onServerInitialInstall` si attiva solo al primo avvio in assoluto di un server, quindi cambiare `DB_DRIVER` in seguito non reinstallerà da solo il driver. Esegui `server forget` (che cancella lo stato di installazione del server) prima di riavviarlo in modo che il nuovo driver venga installato:

    ```bash frame="terminal" title="Terminal"
    server forget
    server start
    ```
:::
::: step "Avvia Vite (in un secondo terminale)" color="success"
```bash frame="terminal" title="Terminal"
npm run dev
```
:::
:::

## Apri l'app

Visita **[http://127.0.0.1:8080](http://127.0.0.1:8080)** - atterrerai sulla pagina di login. Accedi con le credenziali admin seminate sopra.

<figure>
	<img src="assets/screenshots/login.png" alt="The login screen, using the default AuthSplit layout">
	<figcaption>La schermata di login usando il layout predefinito <code>AuthSplit</code>.</figcaption>
</figure>

Una volta entrato, atterrerai sulla dashboard, con la sidebar admin pronta per Utenti, Ruoli, Permessi, Registro di audit e Impostazioni:

<figure>
	<img src="assets/screenshots/dashboard.png" alt="The admin dashboard after signing in">
	<figcaption>Il pannello admin dopo l'accesso.</figcaption>
</figure>

::: cards
::: card title="Architettura" icon="phosphor-duotone:tree-structure" href="architecture.md"
Vedi come `public/`, `app/`, `resources/` e `lib/` si combinano, e percorri il ciclo di vita della richiesta.
:::
::: card title="Sicurezza e permessi" icon="phosphor-duotone:shield-check" href="guides/security.md"
Comprendi il flusso di login e il modello di permessi `resource:action` prima di aggiungere la tua prima pagina protetta.
:::
::: card title="Estendere l'app" icon="phosphor-duotone:puzzle-piece" href="guides/extending.md"
Pronto a costruire? Inizia qui per i passi esatti per aggiungere un nuovo modulo CRUD.
:::
:::
