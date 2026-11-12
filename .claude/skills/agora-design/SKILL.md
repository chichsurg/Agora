---
name: agora-design
description: Direction artistique, qualité mobile et accessibilité d'AGORA. À utiliser avant de créer ou modifier un écran, un composant ou un texte d'interface.
---

# AGORA — design

## Identité
- Bleu nuit `#0F1B3D`, ivoire `#F6F4EF`, indigo `#6246EA`, lavande `#A78BFA` / `#E9E6FF`, sable. Rappel tricolore discret (un filet, jamais un aplat).
- Symbole : l'arche (`Arch` dans `src/ui/kit.tsx`), provisoire tant que le logo vectoriel officiel n'est pas fourni. Ne pas la déformer ni la recolorer.
- Plus Jakarta Sans pour l'interface ; Fraunces pour les titres éditoriaux (h1, questions de consultation, chiffres clés) seulement.
- Pas de photo ni d'illustration générée : motifs d'arche et aplats.

## Règles
1. Toute couleur passe par un jeton de `src/index.css` (`bg-surface`, `text-ink2`, `text-accentink`…). Vérifier clair ET sombre.
2. POUR = indigo, CONTRE = encre, BLANC = sable. Jamais vert/rouge : aucun choix n'est « le bon ».
3. Mobile d'abord (390 px). Cibles tactiles ≥ 44 px (`min-h-11`). Aucun défilement horizontal.
4. Réutiliser `Button`, `Card`, `Badge`, `Section`, `PageHeader`, `Notice`, `Field`, `VoteBars` avant de créer un composant.
5. Les cartes sont réservées aux objets cliquables ou autonomes ; le texte courant reste sur le fond.
6. Animations brèves, désactivées par `prefers-reduced-motion`.

## Accessibilité (WCAG 2.1 AA)
- Un seul `h1` par écran (`PageHeader`), hiérarchie de titres continue.
- Chaque champ a un `label` et un `id` ; erreurs reliées par `aria-describedby`.
- L'information ne repose jamais sur la couleur seule (libellé + valeur).
- États : `aria-pressed`, `aria-current`, `aria-selected` selon le cas.

## Rédaction
Français clair, phrases courtes, vouvoiement. Un bouton dit ce qu'il fait (« Enregistrer mon vote »). Une erreur dit quoi corriger. Toute donnée fictive porte un `DemoTag`.
