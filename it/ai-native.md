---
title: Progettato per lo sviluppo assistito dall'AI
order: 3
icon: phosphor-duotone:robot
summary: Perché partire da cbGenesis costa un numero di token misurabilmente inferiore e produce codice più coerente rispetto a far costruire a un agente AI la tua autenticazione, RBAC e pannello admin partendo da un repository vuoto.
tags: [ai, agents, skills, productivity]
---

# Progettato per lo sviluppo assistito dall'AI

Ogni app seria oggi viene costruita con un agente di coding AI da qualche parte nel processo. La domanda non è se ne userai uno - è se quell'agente parte da un repository vuoto e deve *indovinare* le tue convenzioni a ogni sessione, oppure parte da un codebase che gli dice già esattamente come si fanno le cose qui.

cbGenesis è costruito per il secondo caso.

## Il vero costo di "costruiscilo e basta con l'AI"

Dare a un agente un'app ColdBox vuota e chiedergli autenticazione, RBAC, un pannello admin, protezione CSRF e una suite di test non costa solo il tempo dell'agente - costa token, e costa coerenza. Senza un codebase a cui ancorarsi, un agente:

- Esplora il progetto (vuoto), non trova nulla, e o inventa le proprie convenzioni o ti fa una dozzina di domande di chiarimento.
- Ri-deriva ogni volta la stessa infrastruttura sensibile alla sicurezza - autenticazione di sessione, verifica CSRF, controlli sui permessi - senza alcuna garanzia che ne colga le parti sottili (finestre di rotazione, controlli deny-by-default, guardie contro le self-action) che qui sono state scoperte grazie a incidenti reali.
- Non ha nulla da imitare, quindi ogni file che scrive può discostarsi un po' di più dall'ultimo - due funzionalità costruite a due settimane di distanza iniziano a sembrare provenienti da codebase diversi.

cbGenesis fornisce tutto questo già costruito, testato e - fondamentale per un agente AI - **documentato come skill leggibili da macchina**, non solo prosa che un umano deve tradurre in istruzioni.

## Cosa viene fornito specificamente per gli agenti

- **`AGENTS.md`** nella root del repository - l'unico file che la maggior parte degli strumenti per agenti (Claude Code, Copilot, Cursor e altri) carica automaticamente, che descrive la struttura dell'app, gli handler, gli interceptor e le convenzioni prima che l'agente scriva una riga di codice.
- **Oltre 90 skill sul framework**, installate automaticamente dalla CLI di ColdBox, che coprono BoxLang, ColdBox, CommandBox, TestBox, WireBox e ogni modulo incluso (cbSecurity, cbORM, qb, cbMailServices) - pattern di implementazione passo-passo che un agente carica su richiesta invece di indovinare da dati di addestramento che potrebbero precedere l'API attuale.
- **Sei skill specifiche di cbGenesis** (`.agents/skills-custom/`) che catturano ciò che le skill del framework *non possono* sapere - il modello di permessi `resource:action` di questa app, il suo contratto frontend `fetchWithCsrf()`, l'esatta forma entità/servizio/handler/rotta/componente che segue una nuova funzionalità qui, il suo vero meccanismo di isolamento dei test e la sua suddivisione tra variabili d'ambiente e impostazioni su database. Vedi [Estendere l'app](guides/extending.md) per l'elenco completo.
- **Server di documentazione MCP live** per ogni framework e modulo dello stack, in modo che un agente controlli la documentazione attuale invece di affidarsi a un training cutoff.

Niente di tutto questo è un trucco di "prompt engineering". È la stessa cosa che rende una nuova assunzione umana produttiva più in fretta: un codebase con convenzioni degne di essere copiate, e una mappa di dove trovarle.

## L'abbiamo misurato, non solo dichiarato

Le affermazioni sulla produttività dell'AI sono a buon mercato. Quindi abbiamo eseguito un test reale e riproducibile invece di limitarci ad asserire un numero.

**Il compito:** aggiungere una risorsa CRUD completa ("Tags") a questo esatto codebase cbGenesis - un'entità ORM, un servizio, un handler JSON protetto da permessi, una rotta e un componente frontend Alpine.js con la corretta gestione del CSRF. Lo stesso compito ben definito, dato a due agenti indipendenti, sullo stesso commit, con lo stesso modello.

**Condizione A - solo esplorazione.** All'agente è stato detto di non consultare nessuna delle skill personalizzate di cbGenesis e ha dovuto decodificare da solo le convenzioni: quali file definiscono il formato dei permessi, come i handler esistenti strutturano una risposta JSON, come il frontend recupera da un token CSRF obsoleto, dove vengono registrate le rotte.

**Condizione B - assistito da skill.** L'agente è stato indirizzato prima verso le tre skill personalizzate rilevanti (`cbgenesis-crud-resource`, `cbgenesis-csrf-frontend`, `cbgenesis-rbac-permissions`) e ha implementato direttamente sulla base di quanto indicato.

Entrambi gli agenti hanno prodotto una vertical slice completa e funzionante. Ecco cosa è costato:

| | Solo esplorazione | Assistito da skill |
|---|---|---|
| **Token** | 129.672 | **113.995** |
| **Chiamate a strumenti** | 38 | **22** |
| **Tempo reale** | 208s | **137s** |

Sono **12% di token in meno**, **42% di chiamate a strumenti in meno** e **34% di tempo in meno** per lo stesso ambito, in una singola esecuzione misurata. Il divario di token da solo sottostima il vantaggio: ogni invocazione di agente porta con sé un overhead fisso e considerevole (prompt di sistema, definizioni degli strumenti) identico in entrambe le condizioni, quindi quasi tutta quella riduzione proviene dal lavoro *specifico del compito* - la parte che è realmente esplorazione contro esecuzione diretta.

**Onestà sulla metodologia:** questa è stata una sola esecuzione per condizione, non un benchmark mediato, quindi tratta le percentuali esatte come indicative piuttosto che come una garanzia - i tuoi risultati varieranno con la complessità del compito e il modello. Entrambe le condizioni avevano comunque a disposizione la panoramica di base del progetto `AGENTS.md` di cbGenesis (la maggior parte degli strumenti per agenti la carica automaticamente e non c'è un modo pulito per nasconderla), quindi anche la condizione "solo esplorazione" non lavorava nel buio *totale* - doveva comunque trovare da sola gli specifici pattern di implementazione. Esegui tu stesso il confronto su un compito che ti interessa; preferiammo che tu lo verifichi piuttosto che prendere per buona la nostra parola.

Il divario nelle chiamate a strumenti è il numero più rivelatore: 38 contro 22 non è "l'agente ha pensato un po' meno", è la differenza tra *leggere metà del codebase per trovare il pattern* e *leggere il pattern*.

## Il caso al di là dei token

I token sono la cosa facile da misurare. Il vantaggio più difficile da quantificare è ciò che non accade: un agente che costruisce un flusso di login, un controllo di permessi o un modulo protetto da CSRF sopra cbGenesis eredita pattern già rafforzati contro errori reali (un token CSRF obsoleto che scarta silenziosamente l'input di un utente, una relazione di permessi che smette silenziosamente di essere ripulita, una guardia contro le self-action applicata in modo incoerente) - errori che questo progetto ha effettivamente commesso, corretto e poi codificato in una skill in modo che un agente non li commetta di nuovo sul tuo progetto.

Costruire "da zero con l'AI" significa che ognuna di quelle lezioni deve essere riappresa, per ogni progetto, nel modo difficile. Partire da cbGenesis significa che sono già pagate.

## Dove andare adesso

::: cards
::: card title="Per iniziare" icon="phosphor-duotone:rocket-launch" href="getting-started.md"
Installa, configura, esegui le migrazioni e avvia l'app in locale.
:::
::: card title="Estendere l'app" icon="phosphor-duotone:puzzle-piece" href="guides/extending.md"
Guarda le skill personalizzate nel loro contesto - cosa coprono e come aggiungere le tue man mano che l'app cresce.
:::
::: card title="Sicurezza e permessi" icon="phosphor-duotone:shield-check" href="guides/security.md"
Il modello `resource:action`, il CSRF e le convenzioni che le skill sopra codificano.
:::
:::
