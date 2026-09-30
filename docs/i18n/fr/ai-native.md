---
title: Conçu pour le développement assisté par IA
order: 3
icon: phosphor-duotone:robot
summary: Pourquoi démarrer depuis cbGenesis coûte mesurablement moins de tokens et produit un code plus cohérent que de faire construire votre authentification, votre RBAC et votre panneau d'administration par un agent IA à partir d'un dépôt vide.
tags: [ai, agents, skills, productivity]
---

# Conçu pour le développement assisté par IA

Aujourd'hui, toute application sérieuse est construite avec un agent de codage IA quelque part dans la boucle. La question n'est pas de savoir si vous en utiliserez un - c'est de savoir si cet agent démarre depuis un dépôt vide et doit *deviner* vos conventions à chaque session, ou s'il démarre depuis une base de code qui lui indique déjà exactement comment les choses se font ici.

cbGenesis est conçu pour le second cas.

## Le coût réel de « construisez-le avec l'IA, c'est tout »

Confier à un agent une application ColdBox vide et lui demander l'authentification, le RBAC, un panneau d'administration, la protection CSRF, et une suite de tests ne vous coûte pas seulement le temps de l'agent - cela coûte des tokens, et cela coûte de la cohérence. Sans base de code pour s'ancrer, un agent :

- Explore le projet (vide), ne trouve rien, et soit invente ses propres conventions, soit vous pose une dizaine de questions de clarification.
- Redérive à chaque fois la même plomberie sensible à la sécurité - authentification de session, vérification CSRF, contrôles de permissions - sans aucune garantie qu'il en saisisse correctement les subtilités (fenêtres de rotation, contrôles par défaut restrictifs, protections contre les auto-actions) que de véritables incidents ont permis de découvrir ici.
- N'a rien à imiter, donc chaque fichier qu'il écrit peut dériver un peu plus loin du précédent - deux fonctionnalités construites à deux semaines d'intervalle finissent par ressembler à deux bases de code différentes.

cbGenesis livre tout cela déjà construit, testé et - c'est essentiel pour un agent IA - **documenté sous forme de skills lisibles par une machine**, pas seulement de la prose qu'un humain doit traduire en instructions.

## Ce qui est livré spécifiquement pour les agents

- **`AGENTS.md`** à la racine du dépôt - le seul fichier que la plupart des outils d'agent (Claude Code, Copilot, Cursor, et d'autres) chargent automatiquement, décrivant la structure de l'application, ses handlers, ses intercepteurs, et ses conventions avant que l'agent n'écrive la moindre ligne de code.
- **Plus de 90 skills de framework**, installées automatiquement par le CLI ColdBox, couvrant BoxLang, ColdBox, CommandBox, TestBox, WireBox, et chaque module embarqué (cbSecurity, cbORM, qb, cbMailServices) - des patrons d'implémentation étape par étape qu'un agent charge à la demande plutôt que de deviner à partir de données d'entraînement potentiellement antérieures à l'API actuelle.
- **Six skills spécifiques à cbGenesis** (`.agents/skills-custom/`) qui capturent ce que les skills de framework *ne peuvent pas* savoir - le modèle de permissions `resource:action` propre à cette application, son contrat frontend `fetchWithCsrf()`, la forme exacte entité/service/handler/route/composant que suit une nouvelle fonctionnalité ici, son véritable mécanisme d'isolation des tests, et sa répartition entre variable d'environnement et paramètres en base de données. Voir [Étendre l'application](guides/extending.md) pour la liste complète.
- **Des serveurs de documentation MCP en direct** pour chaque framework et module de la pile, afin qu'un agent consulte la documentation actuelle plutôt que de se fier à une date limite d'entraînement.

Rien de tout cela n'est une astuce de « prompt engineering ». C'est la même chose qui rend une nouvelle recrue humaine productive plus rapidement : une base de code dont les conventions valent la peine d'être copiées, et une carte pour savoir où les trouver.

## Nous l'avons mesuré, pas seulement affirmé

Les affirmations sur la productivité de l'IA ne coûtent rien. Nous avons donc mené un test réel et reproductible plutôt que d'avancer un chiffre.

**La tâche :** ajouter une ressource CRUD complète (« Tags ») à cette base de code cbGenesis exacte - une entité ORM, un service, un handler JSON protégé par permission, une route, et un composant frontend Alpine.js avec une gestion CSRF correcte. La même tâche bien définie, confiée à deux agents indépendants, sur le même commit, avec le même modèle.

**Condition A - exploration seule.** On a dit à l'agent de ne consulter aucune des skills personnalisées de cbGenesis et il a dû rétro-ingénierer les conventions lui-même : quels fichiers définissent le format des permissions, comment les handlers existants façonnent une réponse JSON, comment le frontend se remet d'un jeton CSRF périmé, où les routes sont enregistrées.

**Condition B - assistée par skills.** L'agent a été orienté d'abord vers les trois skills personnalisées pertinentes (`cbgenesis-crud-resource`, `cbgenesis-csrf-frontend`, `cbgenesis-rbac-permissions`) et a implémenté directement à partir de ce qu'elles indiquaient.

Les deux agents ont produit une tranche verticale complète et fonctionnelle. Voici ce que cela a coûté :

| | Exploration seule | Assistée par skills |
|---|---|---|
| **Tokens** | 129 672 | **113 995** |
| **Appels d'outils** | 38 | **22** |
| **Temps réel** | 208 s | **137 s** |

Cela représente **12 % de tokens en moins**, **42 % d'appels d'outils en moins**, et **34 % de temps en moins** pour une portée identique, sur une seule exécution mesurée. L'écart de tokens à lui seul sous-estime le gain : chaque invocation d'agent porte un coût fixe et important (prompt système, définitions d'outils) qui est identique dans les deux conditions, donc la quasi-totalité de cette réduction provient de la partie spécifique à la tâche - la part qui relève réellement de l'exploration par opposition à l'exécution directe.

**Pour être honnête sur la méthodologie :** il s'agit d'une seule exécution par condition, pas d'un benchmark moyenné, donc traitez les pourcentages exacts comme indicatifs plutôt que comme une garantie - votre expérience variera selon la complexité de la tâche et le modèle. Les deux conditions disposaient tout de même de la vue d'ensemble de base `AGENTS.md` de cbGenesis (la plupart des outils d'agent la chargent automatiquement et il n'existe pas de moyen propre de la masquer), donc même la condition « exploration seule » ne travaillait pas dans le *noir total* - elle devait quand même aller trouver elle-même les patrons d'implémentation spécifiques. Reproduisez la comparaison vous-même sur une tâche qui vous tient à cœur ; nous préférons que vous le vérifiiez plutôt que de nous croire sur parole.

L'écart du nombre d'appels d'outils est le chiffre le plus révélateur : 38 contre 22, ce n'est pas « l'agent a un peu moins réfléchi », c'est la différence entre *lire la moitié de la base de code pour trouver le patron* et *lire le patron*.

## L'argument au-delà des tokens

Les tokens sont la chose facile à mesurer. Le gain le plus difficile à quantifier, c'est ce qui ne se produit pas : un agent qui construit un flux de connexion, un contrôle de permission, ou un formulaire protégé par CSRF sur cbGenesis hérite de patrons déjà endurcis contre de véritables erreurs (un jeton CSRF périmé qui écarte silencieusement la saisie d'un utilisateur, une relation de permission qui échoue silencieusement à se nettoyer, une protection contre les auto-actions appliquée de façon incohérente) - des erreurs que ce projet a réellement commises, corrigées, puis encodées dans une skill pour qu'un agent ne les refasse pas sur votre projet.

Construire « à partir de zéro avec l'IA » signifie que chacune de ces leçons doit être réapprise, par projet, à la dure. Démarrer depuis cbGenesis signifie qu'elles sont déjà payées.

## Où aller ensuite

::: cards
::: card title="Démarrage" icon="phosphor-duotone:rocket-launch" href="getting-started.md"
Installer, configurer, migrer, et exécuter l'application en local.
:::
::: card title="Étendre l'application" icon="phosphor-duotone:puzzle-piece" href="guides/extending.md"
Voir les skills personnalisées en contexte - ce qu'elles couvrent, et comment ajouter les vôtres à mesure que l'application grandit.
:::
::: card title="Sécurité & Permissions" icon="phosphor-duotone:shield-check" href="guides/security.md"
Le modèle `resource:action`, le CSRF, et les conventions encodées par les skills ci-dessus.
:::
:::
