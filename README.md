# AGORA — la place publique, réinventée

Prototype de démonstration d'une plateforme citoyenne pluraliste : dossiers sourcés, consultations
(pour / contre / blanc), débats, propositions, résultats, profil et administration.

**État : prototype local.** Votes et participants fictifs, données enregistrées dans le navigateur,
ni serveur ni compte. Ce n'est pas une plateforme multi-utilisateurs sécurisée.

```bash
npm install
npm run dev             # développement
npm test                # tests unitaires
npm run build           # PWA statique dans dist/
npm run build:artifact  # page autonome dist-artifact/agora.html (aperçu)
```

Architecture, règles produit et méthode : voir `CLAUDE.md` et `.claude/skills/agora-*`.
