---
name: agora-development
description: Procédure d'implémentation d'une fonctionnalité ou d'un composant AGORA. À utiliser pour tout développement.
---

# AGORA — développement

1. Lire `CLAUDE.md` (règles produit) et le fichier `src/features/` concerné.
2. Modèle d'abord : type dans `domain/types.ts`, logique pure + test dans `domain/`.
3. Données : étendre `data/demo.ts` (fictif, étiqueté) et, si l'utilisateur écrit, `Persisted` dans `data/storage.ts` + une action dans `app/store.ts`.
4. Interface : composer avec `ui/kit.tsx` ; prévoir l'état vide, l'erreur de saisie et le cas « introuvable ».
5. Vérifier : `npm run typecheck && npm test && npm run build:artifact`.
6. Republier l'aperçu (même chemin `dist-artifact/agora.html`) et rendre compte en français.

## Conventions
- TypeScript strict, pas de `any`. Composants fonction, un fichier par espace fonctionnel.
- Liens internes : `href('nom')` / `href('nom', id)`, jamais de chaîne `#...` écrite à la main.
- Texte utilisateur rendu par React uniquement (jamais `dangerouslySetInnerHTML`). Liens saisis : `safeUrl`.
- Pas de `confirm()`/`alert()` : confirmation dans la page.
- Commits en français, à l'impératif, une intention par commit.
