---
name: agora-architecture
description: Structure logicielle d'AGORA et contrôle de sa maintenabilité. À utiliser pour ajouter un module, déplacer du code, préparer le backend ou relire l'architecture.
---

# AGORA — architecture

## Couches et sens des dépendances
`features → ui, app, domain, data` · `app → domain, data` · `data → domain` · `domain → rien`.

- `src/domain/` : types et fonctions pures. Aucune importation de React, du DOM ou du stockage. Toute règle de comptage, de cycle de vie ou de validation vit ici, avec ses tests.
- `src/data/` : `demo.ts` (données fictives) et `storage.ts` (`StorageAdapter`).
- `src/app/` : `router.ts`, `store.ts` (seul endroit qui écrit l'état), `App.tsx`.
- `src/services/` : intégrations externes derrière une interface, désactivables.

## Contrôles avant de valider
1. Une règle métier dans un composant ? La descendre dans `domain/` et la tester.
2. Un composant appelle `localStorage` ? Passer par le store.
3. Une nouvelle route ? L'ajouter à `STATIC` ou `WITH_ID` dans `router.ts` + un test.
4. Une dépendance ajoutée ? Justifier qu'elle remplace plus de code qu'elle n'en apporte.

## Passage à la version connectée (phase 4, soumis à validation du fondateur)
- Cible : PostgreSQL + authentification + politiques d'accès par ligne (Supabase est l'option étudiée).
- Remplacer `localAdapter` par des appels API ; le store et l'interface gardent leur forme.
- Les votes sont stockés séparément de l'identité publique ; les agrégats sont calculés côté serveur.
- Aucune permission décidée côté client. `adminMode` local disparaît.
