---
name: agora-quality
description: Tests et vérification des parcours utilisateurs d'AGORA. À utiliser après chaque modification et avant de rendre compte au fondateur.
---

# AGORA — qualité

## À exécuter 
1. `npm run typecheck`
2. `npm test` — toute règle de `src/domain/` modifiée doit avoir un test.
3. `npm run build && npm run build:artifact`
4. Parcours dans le navigateur préinstallé (Playwright, profil iPhone, thèmes clair et sombre) sur `dist-artifact/agora.html` :
   - accueil → dossier → onglet Sources ;
   - consultation ouverte : voter, recharger, le vote persiste ; consultation close : pas de bulletin ;
   - débat : argument trop court refusé, lien `javascript:` refusé, publication, signalement ;
   - administration : masquer → motif visible → contestation → rétablissement → journal ;
   - proposition : formulaire vide refusé, création, affichage ;
   - profil : thème, liste des participations, effacement ;
   - chaque route : aucun défilement horizontal à 390 px, aucune erreur console.
5. Regarder au moins une capture claire et une sombre.

## Compte rendu
Dire exactement ce qui a été exécuté et le résultat chiffré. Un test non lancé est annoncé comme non lancé. Un échec est cité avec sa sortie.
