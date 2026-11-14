---
title: Email
order: 5
icon: phosphor-duotone:envelope
summary: Template email basati su token, inviati tramite cbmailservices.
tags: [guides, email]
---

# Email

I template email usano [cbmailservices](https://coldbox-mailservices.ortusbooks.com) con semplici segnaposto `@token@`, sostituiti al momento dell'invio:

```html title="app/email_templates/password_verification.bxm" linenums="1"
<h1>Reset Your Password</h1>
<p>Click the link below to reset your password:</p>
<a href="@linkToken@">Reset Password</a>
<p>This link expires @expiration@.</p>
```

Inviato da una chiamata al servizio:

```boxlang title="Sending a templated email" linenums="1"
mailService.newMail()
    .config( from = "noreply@app.com", to = user.getEmail(), subject = "Reset Password" )
    .setBodyTokens( { linkToken: resetLink, expiration: "in 60 minutes" } )
    .setBodyTemplate( "password_verification" )
    .send();
```

## Template forniti

| Template | Inviato quando |
|---|---|
| `user_welcome.bxm` | Viene creato un nuovo account |
| `registration_verification.bxm` | Un nuovo account necessita di verifica email |
| `password_verification.bxm` | Viene richiesto un link di reset password |
| `password_reset.bxm` | Conferma dopo un cambio password |
| `email_change_confirmation.bxm` | Un utente richiede un cambio email - inviato al nuovo indirizzo per confermarlo |
| `email_change_notice.bxm` | Un utente richiede un cambio email - inviato al vecchio indirizzo come avviso |

## Protocollo per ambiente

!!! note "Protocollo file in sviluppo"
    In sviluppo, `app/config/modules/cbmailservices.bx` scrive la posta in uscita su disco invece di inviarla - nulla lascia la tua macchina mentre stai sviluppando. Configura un provider SMTP reale (Postmark, SendGrid, o SMTP semplice) per la produzione - vedi [Deployment](../deployment.md#production-checklist).

## Visualizzatore del log email (sviluppo)

Ogni email scritta su disco dal protocollo file può essere sfogliata su **`/cbmailservices/log`** mentre l'app è in esecuzione in sviluppo. È una pagina di cbmailservices stesso (non un handler di cbGenesis), che elenca ogni messaggio inviato con un'anteprima renderizzata e una vista del sorgente grezzo dell'HTML effettivamente generato:

<figure>
    <img src="../assets/screenshots/mail-log.png" alt="The cbMailServices Log viewer, showing a rendered preview of a verification email">
    <figcaption>Anteprima - l'email renderizzata, esattamente come la vedrebbe un destinatario.</figcaption>
</figure>

<figure>
    <img src="../assets/screenshots/mail-log-source.png" alt="The cbMailServices Log viewer's Source tab, showing the raw HTML of a sent email">
    <figcaption>Sorgente - l'HTML/metadati grezzi che cbmailservices ha scritto su disco.</figcaption>
</figure>

Il visualizzatore compare solo in sviluppo: `Log.cfc` controlla `controller.getSetting( "environment" ) == "development"` a ogni azione e restituisce altrimenti un 404, quindi non c'è nulla da disabilitare prima del deployment.

### Come trova la tua posta

Il servizio di log non legge una cartella fissa - ispeziona ogni mailer registrato nell'impostazione `mailers` di `app/config/modules/cbmailservices.bx`, ed elenca i messaggi di qualsiasi mailer che usa il protocollo `File`:

```boxlang title="app/config/modules/cbmailservices.bx" linenums="1"
mailers : {
    "default" : { class : "BXMail" },
    "files" : { class : "File", properties : { filePath : "/app/logs" } }
},
```

cbGenesis fornisce quel mailer `files` pronto all'uso, e `development()` nello stesso file imposta `defaultProtocol` su `"files"` - così ogni email che l'app invia mentre `environment` è `development` finisce lì automaticamente, senza nulla da configurare in più.

Per puntarlo a una cartella diversa, o per aggiungere un secondo mailer basato su file per testare un'altra configurazione in isolamento, aggiungi o modifica una voce sotto `mailers` con `class: "File"` e un `filePath`; il visualizzatore recepisce qualsiasi mailer che corrisponda, non solo `files`.

### Gestire i messaggi

Sia l'interfaccia sia le sue rotte JSON sottostanti supportano la pulizia, utile quando un'esecuzione di test lascia un cumulo di messaggi:

| Azione | Rotta |
|---|---|
| Elenca messaggi (JSON) | `GET /cbmailservices/log/messages` |
| Visualizza un messaggio (JSON) | `GET /cbmailservices/log/message/:id` |
| Elimina un messaggio | `DELETE /cbmailservices/log/message/:id` |
| Elimina un insieme specifico | `DELETE /cbmailservices/log/messages` con `{ "ids": [...] }` |
| Elimina tutto | `DELETE /cbmailservices/log/messages` con `{ "all": true }` |
