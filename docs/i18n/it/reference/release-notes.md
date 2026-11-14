---
title: Note di rilascio
order: 3
icon: phosphor-duotone:note
summary: Modifiche della serie 1.1.x.
tags: [reference, releases]
---

# Note di rilascio

## 1.1.0

### Aggiunto

- **Amministrazione dei limiti:** visualizza contatori, cronologia e principali responsabili; gestisci blocchi ed esclusioni IP e impostazioni in System > Rate Limiting.
- **Blocco automatico e cronologia:** blocca i trasgressori recidivi e conserva una cronologia oraria limitata.
- **Controlli di emergenza:** sospendi i limiti dei tentativi, usa `RATE_LIMITING_ENABLED` come esclusione di emergenza e applica un limite globale per IP con modalità lockdown.
- **Honeypot di registrazione:** rifiuta le registrazioni automatizzate che compilano il campo nascosto.

### Modificato

- Il middleware `AppThrottle` sostituisce il precedente limitatore con finestre fisse per le route di autenticazione e SSO del profilo; sono limitati anche il callback cbSSO e gli URL di autenticazione basati sulle convenzioni.
- Le versioni minime sono ColdBox 8.3 e cbSecurity 3.9; sono corretti i percorsi di installazione del framework e di TestBox.
- Sono aggiornati il tema della documentazione, l'inizializzazione del database e la documentazione sui limiti.

### Corretto

- Il conteggio dei tentativi è atomico e viene registrata solo la prima richiesta bloccata per finestra.
- Il modulo di accesso usa la route protetta dal limitatore.
- Sono migliorati l'installazione delle dipendenze e i report dei test in CI.

Vedi [Limitazione delle richieste](../guides/security.md#rate-limiting) e il [registro delle modifiche](https://github.com/coldbox-templates/cbGenesis/blob/development/changelog.md).
