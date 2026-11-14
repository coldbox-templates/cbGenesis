---
title: Notes de version
order: 3
icon: phosphor-duotone:note
summary: Modifications de la série 1.1.x.
tags: [reference, releases]
---

# Notes de version

## 1.1.0

### Ajouté

- **Administration des limites :** consultez les compteurs, l'historique et les principaux auteurs ; gérez les blocages et exclusions d'IP et les paramètres dans System > Rate Limiting.
- **Blocage automatique et historique :** bloquez les récidivistes et conservez un historique horaire borné.
- **Commandes d'urgence :** suspendez les limites de tentatives, utilisez `RATE_LIMITING_ENABLED` comme dérogation d'urgence et appliquez un plafond global par IP avec un mode de confinement.
- **Honeypot d'inscription :** rejette les inscriptions automatisées qui remplissent le champ masqué.

### Modifié

- Le middleware `AppThrottle` remplace l'ancien limiteur par des fenêtres fixes pour les routes d'authentification et SSO du profil ; le callback cbSSO et les URL d'authentification par convention sont également limités.
- Les versions minimales passent à ColdBox 8.3 et cbSecurity 3.9 ; les chemins d'installation du framework et de TestBox sont corrigés.
- Le thème de documentation, l'initialisation de la base de données et la documentation des limites sont actualisés.

### Corrigé

- Les tentatives sont comptées de façon atomique et seule la première requête bloquée de chaque fenêtre est auditée.
- Le formulaire de connexion utilise la route protégée par le limiteur.
- L'installation des dépendances et les rapports de tests en CI sont améliorés.

Voir [Limitation de débit](../guides/security.md#rate-limiting) et le [journal des modifications](https://github.com/coldbox-templates/cbGenesis/blob/development/changelog.md).
