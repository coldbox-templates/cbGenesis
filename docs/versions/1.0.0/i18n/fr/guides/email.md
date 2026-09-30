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
