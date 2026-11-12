---
name: agora-design
description: Direction artistique, qualité mobile et accessibilité d'AGORA. À utiliser avant de créer ou modifier un écran, un composant ou un texte d'interface.
---

# AGORA — design

## Identité
- Bleu nuit `#0F1B3D`, ivoire `#F6F4EF`, indigo `#6246EA`, lavande `#A78BFA` / `#E9E6FF`, sable. Rappel tricolore discret (un filet, jamais un aplat).
- Logo : fichiers de `public/assets/brand/`, extraits du logo original (REF-01) et vérifiés par superposition. Toujours passer par `BrandLogo` (`src/ui/brand.tsx`). Ne jamais redessiner l'arche en code, la déformer ou la recolorer. Version sur fond sombre : mot « AGORA » en blanc, conforme à REF-09, à confirmer par le fondateur.
- Icônes de la charte (`public/assets/icons/` : `agora`, `charte`, `debats`, `le-projet`, `sources`) : PNG originaux, affichés tels quels via `ReferenceIcon`. Les utiliser quand le sens correspond ; pour le reste (barres de navigation, actions), Lucide en trait de 1,9.
- Plus Jakarta Sans pour l'interface ; Fraunces pour les titres éditoriaux (h1, questions de consultation, chiffres clés) seulement.
- Photographies : bienvenues dans le hero, les cartes éditoriales et les miniatures (REF-14, REF-15), via `EditorialImage`. Conditions : licence libre vérifiée, auteur et licence inscrits dans `src/data/media.ts` (affichés dans les crédits), image décorative (`alt=""`) qui ne porte jamais seule l'information. Jamais de photo sur un bulletin de vote, jamais de photo présentée comme celle de participants, jamais d'image générée présentée comme réelle, jamais de morceau de planche de référence collé dans l'interface.

## Références visuelles (sources de vérité)
- REF-14 : accueil desktop et mobile. REF-10 : design system. REF-15 : composants. REF-12 : graphiques. REF-01/09 : logo.
- Reproduire la composition, pas le contenu : les sujets, compteurs, actualités et pourcentages des maquettes sont des exemples. On n'affiche que les données réelles du prototype, étiquetées.
- Les modèles de REF-12 sans donnée correspondante (cartes régionales, comparaisons européennes, évolutions en %) ne sont pas construits.

## Décisions en attente du fondateur (ne pas trancher seul)
- Charte : REF-10 (Plus Jakarta Sans, Fraunces, `#F6F4EF`, `#0F1B3D`) contre la charte produit antérieure (Manrope, Inter, `#F6F5F1`, `#141B35`, abricot `#F2B99E`). Le dépôt suit REF-10.
- Palette de participation ci-dessus, et le fait que POUR partage le violet de la marque.
- Libellés de navigation : « Dossiers » occupe la place d'« Actualité » de REF-14.
- Titre d'accueil « Des citoyens. Des idées. Une République à construire. » : texte éditorial ; la signature reste « La place publique, réinventée. ».

## Règles
1. Toute couleur passe par un jeton de `src/index.css` (`bg-surface`, `text-ink2`, `text-accentink`…). Vérifier clair ET sombre.
2. Couleurs de participation (palette de travail, à valider par le fondateur) : POUR violet `#6246EA`, CONTRE terracotta `#B94E34`, BLANC gris `#C0C5CE`. Chaque choix a quatre jetons (`--pour`, `--pour-ink`, `--pour-soft`, `--on-pour`, etc.) en clair et en sombre ; passer par `CHOICE_TONE` (`src/ui/kit.tsx`).
   - Même gabarit pour les trois choix : taille, graisse, forme, emplacement. Jamais de vert/rouge, de coche « bon » ou de croix « mauvais ».
   - Le gris BLANC n'atteint pas 3:1 sur fond clair : il porte toujours un liseré `--blanc-edge` (barres, anneau, pastilles).
   - Le terracotta est proche d'une couleur d'erreur : ne jamais l'associer à une icône d'alerte ; `--alert` reste réservé aux erreurs.
   - Le violet POUR est aussi la couleur de marque : les retours neutres (vote enregistré, étape en cours) n'utilisent pas le fond du choix opposé, et le bandeau « Vote enregistré » est en encre neutre.
   - `npm test` vérifie les contrastes AA et l'équivalence de poids entre POUR et CONTRE : ne pas changer une couleur sans que ce test passe.
3. Mobile d'abord (390 px) et tableau de bord large (1440 px) : comparer les captures à REF-14 à ces deux largeurs. Cibles tactiles ≥ 44 px (`min-h-11`). Aucun défilement horizontal.
4. Réutiliser `Button`, `Card`, `Badge`, `Section`, `PageHeader`, `Notice`, `Field`, `VoteBars`, `BrandLogo`, `ReferenceIcon`, `EditorialImage` avant de créer un composant.
5. Les cartes sont réservées aux objets cliquables ou autonomes ; le texte courant reste sur le fond.
6. Animations brèves, désactivées par `prefers-reduced-motion`.

## Accessibilité (WCAG 2.1 AA)
- Un seul `h1` par écran (`PageHeader`), hiérarchie de titres continue.
- Chaque champ a un `label` et un `id` ; erreurs reliées par `aria-describedby`.
- L'information ne repose jamais sur la couleur seule (libellé + valeur).
- États : `aria-pressed`, `aria-current`, `aria-selected` selon le cas.

## Rédaction
Français clair, phrases courtes, vouvoiement. Un bouton dit ce qu'il fait (« Enregistrer mon vote »). Une erreur dit quoi corriger. Toute donnée fictive porte un `DemoTag`.
