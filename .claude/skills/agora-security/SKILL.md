---
name: agora-security
description: Analyse de sécurité, de confidentialité (RGPD) et d'intégrité des consultations d'AGORA. À utiliser avant toute fonctionnalité touchant aux comptes, aux votes, à la modération, à l'administration, à un service externe ou à un déploiement.
---

# AGORA — sécurité et confiance

## Questions à poser à chaque changement
1. Quelle donnée personnelle est créée ? Est-elle nécessaire ? Qui peut la lire ?
2. Une opinion politique (vote, soutien) devient-elle visible d'un tiers ? Si oui : refuser.
3. Une permission est-elle décidée côté client ? Si oui : c'est une démo, l'afficher ; jamais en version connectée.
4. Une entrée utilisateur atteint-elle le DOM, une URL ou une requête sans validation ?
5. Un secret approche-t-il du dépôt ou du frontend ?
6. Une affirmation de l'interface promet-elle plus que ce que le système garantit (unicité du vote, représentativité, caractère officiel) ?

## Personnalisation et opinions politiques
- Les préférences (thèmes, rythme, situation, âge) vivent dans `agora.preferences.v1`, à part des votes. Ne jamais les fusionner, ni les exporter ensemble vers un tiers.
- `recommend()` ne reçoit ni votes, ni soutiens, ni arguments. Toute évolution qui lui en donnerait l'accès est refusée : ce serait déduire une orientation politique.
- Situation et âge ne servent pas aux recommandations. En version connectée : consentement distinct, statistiques agrégées seulement, seuils d'effectif minimum.
- Moins de 15 ans : ni âge ni situation conservés (`sanitizePreferences`). Avant toute ouverture publique : avis juridique sur les mineurs.
- Aucune notification n'existe : l'interface parle de « rythme », jamais d'envoi.

## État du prototype (à ne pas survendre)
- Stockage local uniquement : pas d'authentification, pas d'unicité du vote, administration ouverte à tous.
- Entrées bornées (`validateProposal`, `validateArgument`), liens filtrés (`safeUrl`), rendu échappé par React.

## Exigences de la version connectée
- Authentification éprouvée ; contrôle d'accès par ligne ; rôles vérifiés par le serveur.
- Votes : table séparée, sans lien lisible avec le profil public ; résultats agrégés seulement ; journal d'intégrité.
- Limitation de débit, protection anti-automates, journal d'administration non modifiable.
- RGPD : base légale et consentement explicite pour les opinions politiques, registre, durée de conservation, export et effacement, hébergement UE, analyse d'impact (AIPD) avant ouverture.
- Avant tout usage public : audit externe. Un scrutin à valeur institutionnelle sort du périmètre et exige un cadre juridique propre.

## Interdits
Collecter une pièce d'identité en démo · envoyer du contenu privé à un fournisseur d'IA · déployer ou ouvrir un compte externe sans accord explicite du fondateur.
