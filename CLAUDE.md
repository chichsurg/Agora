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
- Couleurs : uniquement via les jetons de `src/index.css` (clair + sombre). Polices : Plus Jakarta Sans
  (interface), Fraunces (titres éditoriaux).
- Accessibilité : cibles tactiles ≥ 44 px, focus visible, libellés, contrastes AA, `prefers-reduced-motion`.
- Le prototype local n'est pas une plateforme multi-utilisateurs sécurisée : ne jamais le présenter ainsi.
  En version connectée, toute permission se vérifie côté serveur.

## Commandes

- `npm test` — tests unitaires (Vitest). `npm run typecheck`. `npm run build`.
- `npm run build:artifact` — produit `dist-artifact/agora.html`, page autonome.

## Aperçu sur iPhone

Après `npm run build:artifact`, publie `dist-artifact/agora.html` avec l'outil Artifact,
toujours depuis ce même chemin, pour conserver la même adresse. Contraintes de l'aperçu : ancres simples
uniquement, pas de `confirm()`/`alert()`, pas de téléchargement, pas de service worker.

## Skills du projet

`.claude/skills/` : `agora-design`, `agora-architecture`, `agora-development`, `agora-security`, `agora-quality`.

## Mise en ligne

Dépôt public `chichsurg/agora`. Chaque push sur `main` lance les tests puis publie sur GitHub Pages
(`.github/workflows/pages.yml`) : https://chichsurg.github.io/agora/
Le dépôt est public : n'y place jamais de secret ni de donnée personnelle.
