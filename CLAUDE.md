# AGORA — règles durables

Signature : « La place publique, réinventée. » Plateforme citoyenne indépendante, pluraliste,
liée intellectuellement au laboratoire « 6EME REPUBLIC » mais distincte de lui.
Principe : nous n'avons pas besoin d'être d'accord pour réfléchir ensemble.

## Travailler avec le fondateur

- Il pilote depuis un iPhone. Réduis au minimum ses manipulations techniques.
- Réponds en français. Décide seul des choix techniques ordinaires ; ne propose pas de menu de bibliothèques.
- Construis et montre : après chaque cycle, republie l'aperçu (voir « Aperçu ») et donne
  ce qui est construit, les tests réellement exécutés, les limites, ce qui est visible, la prochaine action.
- Ne dis jamais qu'une chose a été exécutée, testée ou déployée si ce n'est pas le cas.
- Demande une validation explicite avant : déploiement public, connexion à un service externe,
  toute dépense, toute collecte de données réelles.

## Règles produit non négociables

- **Pluralisme** : AGORA n'impose aucune conclusion. Tout sujet présente des arguments pour et contre.
- **Aucune invention** : ni source, ni citation, ni statistique, ni avis d'expert. Chaque fait d'un dossier
  renvoie à une source. Un contenu rédigé par IA porte le statut `brouillon-ia` jusqu'à relecture humaine
  et l'interface l'affiche.
- **Données fictives étiquetées** : tout vote, participant ou contenu de démonstration est signalé (`DemoTag`).
- **Consultations** : indicatives, jamais présentées comme un scrutin officiel ni comme représentatives.
  POUR / CONTRE / BLANC ; le blanc est une participation, distinct de l'abstention (non mesurée).
  Ne jamais prétendre garantir « un vote par personne » sans dispositif d'identification.
- **Reformulation si le blanc est en tête** : règle à l'étude, réservée aux consultations portant sur le
  modèle 6EME REPUBLIC (`rule: 'reformulation-si-blanc'`). Ne pas la généraliser.
- **Débats** : popularité ≠ véracité. Modération motivée, publique, contestable, journalisée.
- **Propositions** : les statuts (Proposée → En discussion → En analyse → En consultation → Conclusion)
  sont internes à AGORA, pas des décisions publiques.
- **Données personnelles** : minimisation. Lecture sans compte. Les votes sont des opinions politiques
  (donnée sensible RGPD) : jamais publics. Aucun justificatif d'identité dans une démo.
- **Neutralité visuelle** : POUR, CONTRE et BLANC ont le même gabarit (taille, graisse, forme, place).
  Aucune couleur d'état (succès, erreur), aucune coche ou croix pour désigner une position. L'ordre des
  colonnes d'arguments alterne d'une consultation à l'autre. Aucun choix n'est présélectionné.
- **Parcours de consultation** : Découvrir → Comprendre → Choisir → Confirmer → Résultats → Débattre.
  Rien n'est enregistré avant l'écran de confirmation. Tant qu'une personne n'a pas voté, les résultats
  d'une consultation ouverte restent masqués par défaut, mais elle peut les afficher sans voter.
- **Personnalisation** : questionnaire facultatif, jamais bloquant. Les recommandations reposent sur les
  thèmes cochés, jamais sur les votes, les soutiens ou les arguments : `recommend()` ne les reçoit pas.
  Chaque recommandation affiche sa raison. La liste complète des consultations reste toujours accessible.
  En dessous de 15 ans, ni l'âge ni la situation ne sont conservés. AGORA n'envoie aucune notification :
  ne jamais écrire le contraire tant qu'aucun service n'existe.
- **IA** : AGORA fonctionne sans IA. Jamais de clé d'API dans le frontend ou le dépôt, jamais d'API payante
  sans accord, jamais de contenu privé envoyé à un tiers. Toute synthèse IA est étiquetée.

## Technique

- React 19 + TypeScript + Vite + Tailwind v4. PWA (manifest). Pas de backend pour l'instant.
- Couches (ne pas les mélanger) :
  - `src/domain/` logique métier pure et testée (comptage, cycle de vie, validation) ;
  - `src/data/` données de démonstration + `StorageAdapter` (local aujourd'hui, API demain) ;
  - `src/app/` routeur par ancre (`#nom` ou `#nom-id`), store, coquille ;
  - `src/ui/kit.tsx` composants communs ; `src/features/` un fichier par espace ;
  - `src/services/ai.ts` point d'extension IA, désactivé.
  - `src/domain/preferences.ts` thèmes, questionnaire, recommandations (sans accès aux votes).
  - `src/domain/search.ts` recherche locale (sans accents, tous les mots requis, pas de classement par popularité).
- Stockage local : deux clés séparées, `agora.demo.v1` (participations, schéma `v: 2`) et
  `agora.preferences.v1` (personnalisation). Tout changement de schéma passe par `migrate()` dans
  `src/data/storage.ts`, avec un test : on ne supprime jamais un vote ni une contribution existants.
  Des données illisibles sont mises de côté (`agora.demo.sauvegarde`), pas écrasées.
- Couleurs : uniquement via les jetons de `src/index.css` (clair + sombre). Couleurs de participation :
  quatre jetons par choix (aplat, `-ink`, `-soft`, `on-`), contrastes vérifiés par `src/ui/contrast.test.ts`. Polices : Plus Jakarta Sans
  (interface), Fraunces (titres éditoriaux).
- Identité : les planches du fondateur font foi (REF-14 accueil, REF-10 design system, REF-15 composants,
  REF-12 graphiques, REF-01/09 logo). Ne jamais inventer d'identité ni remplacer un élément fourni par un
  équivalent générique. Logo, icônes et photos vivent dans `public/assets/` et passent par
  `src/ui/brand.tsx` (`BrandLogo`, `ReferenceIcon`, `EditorialImage`). Toute photo est sous licence libre,
  créditée dans `src/data/media.ts`. Détails et décisions en attente : skill `agora-design`.
- On reproduit la composition des maquettes, jamais leurs contenus d'exemple (sujets, chiffres, actualités).
- Accessibilité : cibles tactiles ≥ 44 px, focus visible, libellés, contrastes AA, `prefers-reduced-motion`.
- Le prototype local n'est pas une plateforme multi-utilisateurs sécurisée : ne jamais le présenter ainsi.
  En version connectée, toute permission se vérifie côté serveur.

## Commandes

- `npm test` — tests unitaires (Vitest). `npm run typecheck`. `npm run build`.
- `npm run build:artifact` — produit `dist-artifact/agora.html`, page autonome.

## Aperçu sur iPhone

Après `npm run build:artifact`, publie `dist-artifact/agora.html` avec l'outil Artifact (avec
`root: public` et la liste `files` des fichiers de `public/assets/` utilisés, sinon logo et photos manquent),
en passant `url: https://claude.ai/artifact/ThUPtNLZxVb9vxV4swFLbu` pour conserver la même adresse. Contraintes de l'aperçu : ancres simples
uniquement, pas de `confirm()`/`alert()`, pas de téléchargement, pas de service worker.

## Skills du projet

`.claude/skills/` : `agora-design`, `agora-architecture`, `agora-development`, `agora-security`, `agora-quality`.

## Mise en ligne

Dépôt public `chichsurg/Agora`. Toute évolution se prépare sur une branche et passe par une pull request :
ne jamais pousser sur `main` ni fusionner sans l'accord explicite du fondateur.
Chaque push sur `main` lance les tests puis publie sur GitHub Pages
(`.github/workflows/pages.yml`) : https://chichsurg.github.io/Agora/
Le dépôt est public : n'y place jamais de secret ni de donnée personnelle.

## Sources et réseau

L'environnement cloud ne peut pas ouvrir les sites officiels français (réseau filtré) : recouper les faits
par recherche web, et laisser le dossier en `brouillon-ia` tant qu'un humain n'a pas relu.
Les tests vérifient que chaque fait cite une source existante et que chaque dossier présente les deux côtés.
