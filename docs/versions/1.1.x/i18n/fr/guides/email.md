---
title: Email
order: 5
icon: phosphor-duotone:envelope
summary: Modèles d'email basés sur des jetons, envoyés via cbmailservices.
tags: [guides, email]
---

# Email

Les modèles d'email utilisent [cbmailservices](https://coldbox-mailservices.ortusbooks.com) avec de simples espaces réservés `@token@`, remplacés au moment de l'envoi :

```html title="app/email_templates/password_verification.bxm" linenums="1"
<h1>Reset Your Password</h1>
<p>Click the link below to reset your password:</p>
<a href="@linkToken@">Reset Password</a>
<p>This link expires @expiration@.</p>
```

Envoyé depuis un appel de service :

```boxlang title="Sending a templated email" linenums="1"
mailService.newMail()
    .config( from = "noreply@app.com", to = user.getEmail(), subject = "Reset Password" )
    .setBodyTokens( { linkToken: resetLink, expiration: "in 60 minutes" } )
    .setBodyTemplate( "password_verification" )
    .send();
```

## Modèles livrés

| Modèle | Envoyé quand |
|---|---|
| `user_welcome.bxm` | Un nouveau compte est créé |
| `registration_verification.bxm` | Un nouveau compte doit vérifier son email |
| `password_verification.bxm` | Un lien de réinitialisation de mot de passe est demandé |
| `password_reset.bxm` | Confirmation après un changement de mot de passe |
| `email_change_confirmation.bxm` | Un utilisateur demande un changement d'email - envoyé à la nouvelle adresse pour la confirmer |
| `email_change_notice.bxm` | Un utilisateur demande un changement d'email - envoyé à l'ancienne adresse à titre d'information |

## Protocole selon l'environnement

!!! note "Protocole fichiers en développement"
    En développement, `app/config/modules/cbmailservices.bx` écrit les emails sortants sur disque au lieu de les envoyer - rien ne quitte votre machine pendant que vous développez. Configurez un vrai fournisseur SMTP (Postmark, SendGrid, ou SMTP simple) pour la production - voir [Déploiement](../deployment.md#production-checklist).

## Visualiseur de journal d'emails (développement)

Chaque email écrit sur disque par le protocole fichiers peut être consulté sur **`/cbmailservices/log`** pendant que l'application s'exécute en développement. C'est une page de cbmailservices lui-même (pas un handler cbGenesis), qui liste chaque message envoyé avec un aperçu rendu et une vue du code source brut du HTML réellement généré :

<figure>
    <img src="../assets/screenshots/mail-log.png" alt="The cbMailServices Log viewer, showing a rendered preview of a verification email">
    <figcaption>Aperçu - l'email rendu, exactement comme un destinataire le verrait.</figcaption>
</figure>

<figure>
    <img src="../assets/screenshots/mail-log-source.png" alt="The cbMailServices Log viewer's Source tab, showing the raw HTML of a sent email">
    <figcaption>Source - le HTML/métadonnées brut que cbmailservices a écrit sur disque.</figcaption>
</figure>

Le visualiseur n'apparaît qu'en développement : `Log.cfc` vérifie `controller.getSetting( "environment" ) == "development"` à chaque action et renvoie sinon une 404, donc il n'y a rien à désactiver avant le déploiement.

### Comment il trouve vos emails

Le service de journal ne lit pas un dossier fixe - il inspecte chaque mailer enregistré dans le paramètre `mailers` de `app/config/modules/cbmailservices.bx`, et liste les messages de tout mailer utilisant le protocole `File` :

```boxlang title="app/config/modules/cbmailservices.bx" linenums="1"
mailers : {
    "default" : { class : "BXMail" },
    "files" : { class : "File", properties : { filePath : "/app/logs" } }
},
```

cbGenesis fournit ce mailer `files` par défaut, et `development()` dans le même fichier bascule `defaultProtocol` sur `"files"` - ainsi chaque email envoyé par l'application tant que `environment` vaut `development` y atterrit automatiquement, sans rien à configurer en plus.

Pour le pointer vers un autre dossier, ou ajouter un second mailer basé sur des fichiers pour tester une autre configuration isolément, ajoutez ou modifiez une entrée sous `mailers` avec `class: "File"` et un `filePath` ; le visualiseur détecte tout mailer correspondant, pas seulement `files`.

### Gestion des messages

L'interface et ses routes JSON sous-jacentes prennent en charge le nettoyage, utile quand une exécution de tests laisse une pile de messages :

| Action | Route |
|---|---|
| Lister les messages (JSON) | `GET /cbmailservices/log/messages` |
| Voir un message (JSON) | `GET /cbmailservices/log/message/:id` |
| Supprimer un message | `DELETE /cbmailservices/log/message/:id` |
| Supprimer un ensemble spécifique | `DELETE /cbmailservices/log/messages` avec `{ "ids": [...] }` |
| Tout supprimer | `DELETE /cbmailservices/log/messages` avec `{ "all": true }` |
