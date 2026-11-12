import type { Argument, Consultation, Debate, Dossier, Proposal } from '../domain/types'

// DONNÉES DE DÉMONSTRATION.
// Votes, participants, arguments et propositions sont fictifs.
// Le contenu du dossier est un brouillon rédigé avec assistance IA : chaque fait renvoie
// à une source publique, mais l'ensemble doit être relu par un humain avant publication.

const DAY = 86_400_000
const at = (days: number) => new Date(Date.now() + days * DAY).toISOString()

export const dossiers: Dossier[] = [
  {
    id: 'participation-citoyenne',
    photo: 'soufflot',
    title: 'La participation citoyenne',
    theme: 'Démocratie',
    summary:
      "Référendum, tirage au sort, pétitions, débat public : quels outils permettent aux citoyens de peser sur les décisions entre deux élections, et avec quelles limites ?",
    editorial: 'brouillon-ia',
    updatedAt: at(-2),
    facts: [
      {
        text: "L'article 3 de la Constitution de 1958 dispose que « la souveraineté nationale appartient au peuple qui l'exerce par ses représentants et par la voie du référendum ».",
        sourceIds: ['constitution'],
      },
      {
        text: "Le dernier référendum national s'est tenu le 29 mai 2005, sur le traité établissant une Constitution pour l'Europe. Le « non » l'a emporté.",
        sourceIds: ['conseil-constitutionnel'],
      },
      {
        text: "Depuis la révision constitutionnelle de 2008, l'article 11 prévoit un référendum d'initiative partagée : il doit être proposé par un cinquième des parlementaires et soutenu par un dixième des électeurs inscrits.",
        sourceIds: ['constitution'],
      },
      {
        text: 'La Convention citoyenne pour le climat a réuni 150 personnes tirées au sort entre octobre 2019 et juin 2020. Elle a remis 149 propositions.',
        sourceIds: ['ccc'],
      },
      {
        text: "La Convention citoyenne sur la fin de vie, organisée par le Conseil économique, social et environnemental (CESE), a réuni 184 personnes tirées au sort entre décembre 2022 et avril 2023.",
        sourceIds: ['cese'],
      },
      {
        text: "La Commission nationale du débat public (CNDP) a été créée par la loi du 2 février 1995. Elle organise la participation du public sur les grands projets ayant un impact sur l'environnement.",
        sourceIds: ['cndp'],
      },
      {
        text: 'Depuis la loi organique du 15 janvier 2021, le CESE peut être saisi par une pétition réunissant 150 000 signatures de personnes âgées de 16 ans et plus.',
        sourceIds: ['cese'],
      },
    ],
    issues: [
      {
        title: 'Qui participe réellement ?',
        text: "Les dispositifs ouverts à tous attirent surtout des personnes déjà engagées. Le tirage au sort cherche à corriger ce biais, mais il ne concerne que peu de monde à la fois.",
      },
      {
        title: 'Que deviennent les avis rendus ?',
        text: "Une consultation sans suite visible peut décourager. La question du lien entre la parole citoyenne et la décision finale est centrale.",
      },
      {
        title: 'Comment articuler participation et représentation ?',
        text: 'Les élus tiennent leur légitimité du vote. Les dispositifs participatifs peuvent la compléter ou entrer en tension avec elle.',
      },
      {
        title: "Comment garantir une information équilibrée ?",
        text: "La qualité d'une délibération dépend des informations fournies aux participants et de la pluralité des intervenants entendus.",
      },
    ],
    viewpoints: [
      {
        title: 'Renforcer la démocratie directe',
        text: "Selon cette approche, les citoyens doivent pouvoir déclencher eux-mêmes un référendum et trancher les grandes questions. Elle met en avant la souveraineté populaire et la confiance.",
      },
      {
        title: 'Développer la démocratie délibérative',
        text: "Cette approche privilégie des assemblées tirées au sort, qui prennent le temps de s'informer et de débattre avant de formuler un avis. Elle met en avant la qualité de la discussion.",
      },
      {
        title: 'Consolider la démocratie représentative',
        text: "Cette approche estime que la décision doit rester aux élus, responsables devant les électeurs, et que la participation doit surtout éclairer leur travail.",
      },
      {
        title: 'Agir d’abord à l’échelle locale',
        text: "Cette approche considère que la participation est plus concrète dans la commune ou le quartier : budgets participatifs, conseils de quartier, concertations de projet.",
      },
    ],
    argsFor: [
      { title: 'Légitimité', text: "Associer les citoyens aux décisions peut renforcer leur acceptation, y compris lorsqu'elles sont difficiles." },
      { title: 'Diversité des points de vue', text: "Des participants aux parcours variés peuvent faire émerger des problèmes ou des solutions que les décideurs n'avaient pas identifiés." },
      { title: 'Contrôle entre deux élections', text: 'Des outils de participation permanents donnent aux citoyens un moyen de se faire entendre sans attendre le prochain scrutin.' },
    ],
    argsAgainst: [
      { title: 'Représentativité limitée', text: "Les participants volontaires ne reflètent pas l'ensemble de la population. Leurs avis ne peuvent pas être présentés comme ceux de tous." },
      { title: 'Complexité des sujets', text: 'Certains sujets techniques demandent du temps et une expertise que tous les dispositifs ne permettent pas de mobiliser.' },
      { title: 'Risque de déception', text: "Si les avis ne sont pas suivis d'effet, la participation peut accroître la défiance au lieu de la réduire." },
      { title: 'Responsabilité diluée', text: 'Quand la décision est partagée, il devient plus difficile de savoir qui doit en répondre.' },
    ],
    expertAnalyses: [],
    sources: [
      { id: 'constitution', title: 'Texte intégral de la Constitution du 4 octobre 1958', publisher: 'Conseil constitutionnel', url: 'https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur' },
      { id: 'conseil-constitutionnel', title: 'Référendums : décisions et proclamations des résultats', publisher: 'Conseil constitutionnel', url: 'https://www.conseil-constitutionnel.fr' },
      { id: 'ccc', title: 'Site de la Convention citoyenne pour le climat', publisher: 'Convention citoyenne pour le climat', url: 'https://www.conventioncitoyennepourleclimat.fr' },
      { id: 'cese', title: 'Conventions citoyennes et pétitions', publisher: 'Conseil économique, social et environnemental', url: 'https://www.lecese.fr' },
      { id: 'cndp', title: 'Missions et histoire de la CNDP', publisher: 'Commission nationale du débat public', url: 'https://www.debatpublic.fr' },
    ],
  },
  {
    id: 'vote-blanc',
    photo: 'luxembourg',
    title: 'Le vote blanc',
    theme: 'Institutions',
    summary:
      "Voter blanc, c'est se déplacer sans choisir aucun candidat ni aucune réponse. Ce vote est décompté à part depuis 2014, mais il ne pèse pas sur le résultat. Faut-il aller plus loin ?",
    editorial: 'brouillon-ia',
    updatedAt: at(0),
    facts: [
      {
        text: "La loi du 21 février 2014 « visant à reconnaître le vote blanc aux élections » a modifié l'article L. 65 du code électoral : les bulletins blancs sont décomptés séparément des bulletins nuls et annexés au procès-verbal.",
        sourceIds: ['loi-2014'],
      },
      {
        text: "Selon cette même loi, les bulletins blancs n'entrent pas en compte pour la détermination des suffrages exprimés. Ils ne modifient donc ni les pourcentages obtenus par les candidats ni le calcul de la majorité.",
        sourceIds: ['loi-2014'],
      },
      {
        text: "Une enveloppe ne contenant aucun bulletin est assimilée à un vote blanc. Avant 2014, elle était classée parmi les votes nuls.",
        sourceIds: ['loi-2014', 'an-rapport'],
      },
      {
        text: "Au second tour de l'élection présidentielle de 2017, plus de 3 millions de bulletins blancs ont été décomptés, soit environ 8,5 % des votants.",
        sourceIds: ['resultats-2017'],
      },
      {
        text: "Plusieurs propositions de loi visant à compter les votes blancs parmi les suffrages exprimés ont été déposées au Parlement. À la date de rédaction de ce dossier, nous n'avons trouvé aucune trace de l'adoption de l'une d'elles ; ce point reste à confirmer lors de la relecture.",
        sourceIds: ['an-rapport'],
      },
    ],
    issues: [
      { title: 'Que signifie un vote blanc ?', text: "Il peut exprimer un refus de l'offre proposée, une hésitation ou une protestation. Le bulletin lui-même ne permet pas de distinguer ces intentions." },
      { title: 'Blanc, nul, abstention', text: "Le vote blanc est un acte de participation. Le vote nul correspond à un bulletin irrégulier. L'abstention consiste à ne pas voter. Les trois sont comptés séparément." },
      { title: 'Quel effet sur le résultat ?', text: "Compter les blancs parmi les suffrages exprimés changerait le calcul de la majorité. Il faudrait alors décider ce qui se passe si aucune option n'atteint le seuil requis." },
    ],
    viewpoints: [
      { title: 'Le compter comme un suffrage exprimé', text: "Selon cette approche, un électeur qui se déplace pour dire qu'aucune option ne lui convient exprime bien un choix, qui devrait peser dans le résultat." },
      { title: 'Conserver le décompte séparé', text: "Selon cette approche, une élection sert à désigner quelqu'un ou à trancher une question. Le décompte séparé informe sans empêcher la décision." },
      { title: 'Lui donner un effet au-delà d’un seuil', text: "Selon cette approche, le vote blanc ne devrait avoir de conséquence, par exemple un nouveau scrutin ou une question reformulée, que s'il dépasse un niveau fixé à l'avance." },
    ],
    argsFor: [
      { title: 'Reconnaissance', text: 'Donner un effet au vote blanc reconnaîtrait la démarche de ceux qui participent sans adhérer à aucune option.' },
      { title: 'Participation', text: "Certains abstentionnistes pourraient revenir voter s'ils savaient que leur refus est pris en compte." },
      { title: 'Signal aux candidats', text: "Un niveau élevé de votes blancs, visible dans le résultat, inciterait à revoir l'offre politique ou la question posée." },
    ],
    argsAgainst: [
      { title: 'Risque de blocage', text: "Si les blancs comptent, une élection pourrait ne désigner personne, et il faudrait la recommencer sans garantie d'un autre résultat." },
      { title: 'Légitimité de l’élu', text: "Un candidat élu avec moins de la moitié des suffrages, blancs compris, pourrait voir sa légitimité contestée." },
      { title: 'Message ambigu', text: "Le vote blanc agrège des motivations très différentes. Lui attribuer un sens unique serait une interprétation." },
    ],
    expertAnalyses: [],
    sources: [
      { id: 'loi-2014', title: 'Loi n° 2014-172 du 21 février 2014 visant à reconnaître le vote blanc aux élections', publisher: 'Légifrance', url: 'https://www.legifrance.gouv.fr' },
      { id: 'an-rapport', title: 'Rapport de la commission des lois n° 1291 (16e législature)', publisher: 'Assemblée nationale', url: 'https://www.assemblee-nationale.fr/dyn/16/rapports/cion_lois/l16b1291_rapport-fond.pdf' },
      { id: 'resultats-2017', title: "Résultats définitifs du second tour de l'élection présidentielle 2017", publisher: 'Gouvernement (info.gouv.fr)', url: 'https://www.info.gouv.fr/resultats-definitifs-du-second-tour-de-l-election-presidentielle-2017-etablis-par-le-conseil' },
    ],
  },
]

/** Thèmes annoncés, sans contenu pour l'instant. */
export const upcomingDossiers = ['Éducation', 'Environnement', 'Économie']

export const consultations: Consultation[] = [
  {
    id: 'ric',
    title: "Référendum d'initiative citoyenne",
    question: "Faut-il permettre aux citoyens de déclencher eux-mêmes un référendum national ?",
    context:
      "Aujourd'hui, un référendum national ne peut être organisé qu'à l'initiative du Président de la République ou, depuis 2008, par une procédure partagée entre parlementaires et électeurs. Cette consultation porte sur le principe d'une initiative réservée aux seuls citoyens.",
    dossierId: 'participation-citoyenne',
    opensAt: at(-9),
    closesAt: at(12),
    rule: 'standard',
    argsFor: [
      { title: 'Souveraineté', text: 'Les citoyens pourraient mettre un sujet à l’ordre du jour sans dépendre des élus.' },
      { title: 'Participation', text: 'La possibilité de décider directement pourrait encourager l’intérêt pour la vie publique.' },
    ],
    argsAgainst: [
      { title: 'Questions binaires', text: 'Un référendum réduit des sujets complexes à une réponse par oui ou par non.' },
      { title: 'Seuils et garde-fous', text: 'Sans conditions précises, le dispositif pourrait être utilisé contre des droits fondamentaux ou multiplier les scrutins.' },
    ],
    seed: { pour: 612, contre: 398, blanc: 230 },
    seedDaily: [96, 141, 118, 152, 133, 160, 147, 139, 154],
  },
  {
    id: 'assemblee-tiree-au-sort',
    title: 'Assemblée citoyenne permanente',
    question: 'Faut-il créer une assemblée citoyenne permanente, composée de personnes tirées au sort ?',
    context:
      "Des conventions citoyennes ont été réunies ponctuellement en France. Cette consultation porte sur l'idée d'une assemblée permanente, renouvelée régulièrement, chargée de rendre des avis publics.",
    dossierId: 'participation-citoyenne',
    opensAt: at(-3),
    closesAt: at(18),
    rule: 'standard',
    argsFor: [
      { title: 'Diversité sociale', text: 'Le tirage au sort peut réunir des profils rarement présents parmi les élus.' },
      { title: 'Temps de délibération', text: 'Une assemblée dédiée peut s’informer longuement avant de se prononcer.' },
    ],
    argsAgainst: [
      { title: 'Légitimité', text: 'Des personnes tirées au sort n’ont reçu aucun mandat des électeurs et ne rendent pas de comptes.' },
      { title: 'Influence des organisateurs', text: 'Le choix des experts entendus et des questions posées peut orienter les conclusions.' },
    ],
    seed: { pour: 148, contre: 131, blanc: 44 },
    seedDaily: [92, 121, 110],
  },
  {
    id: 'vote-blanc-6r',
    title: 'Reconnaissance du vote blanc',
    question: 'Modèle 6EME REPUBLIC : le vote blanc doit-il pouvoir imposer la reformulation d’une question ?',
    context:
      "Cette consultation porte sur une règle proposée par le laboratoire 6EME REPUBLIC. Elle applique elle-même cette règle à titre d'étude : si le vote blanc arrive en tête, la question est considérée comme à reformuler.",
    dossierId: 'vote-blanc',
    opensAt: at(-40),
    closesAt: at(-10),
    rule: 'reformulation-si-blanc',
    argsFor: [
      { title: 'Un message clair', text: 'Le vote blanc exprimerait un refus de la question telle qu’elle est posée, et pas seulement une hésitation.' },
    ],
    argsAgainst: [
      { title: 'Risque de blocage', text: 'Une question pourrait être renvoyée plusieurs fois sans qu’aucune décision ne soit prise.' },
    ],
    seed: { pour: 310, contre: 295, blanc: 402 },
    seedDaily: [22, 41, 38, 30, 35, 44, 29, 31, 40, 36, 33, 28, 39, 37, 30, 34, 42, 31, 27, 36, 33, 38, 29, 35, 32, 30, 34, 31, 28, 33],
  },
  {
    id: 'participation-16-ans',
    title: 'Participation dès 16 ans',
    question: 'Faut-il ouvrir les consultations locales aux jeunes dès 16 ans ?',
    context: "Certaines démarches, comme les pétitions adressées au CESE, sont déjà ouvertes dès 16 ans. Cette consultation porte sur l'extension de ce principe aux consultations locales.",
    dossierId: 'participation-citoyenne',
    opensAt: at(6),
    closesAt: at(27),
    rule: 'standard',
    argsFor: [{ title: 'Apprentissage', text: 'Participer tôt peut installer une habitude durable d’engagement.' }],
    argsAgainst: [{ title: 'Cohérence', text: 'L’âge de la majorité civile et électorale reste fixé à 18 ans.' }],
    seed: { pour: 0, contre: 0, blanc: 0 },
    seedDaily: [],
  },
]

export const debates: Debate[] = [
  {
    id: 'tirage-au-sort',
    photo: 'invalides',
    title: "Le tirage au sort peut-il compléter l'élection ?",
    prompt: "Assemblées citoyennes, jurys, conventions : le hasard est-il un bon moyen de désigner celles et ceux qui délibèrent ?",
    dossierId: 'participation-citoyenne',
  },
  {
    id: 'suites-des-consultations',
    photo: 'assemblee',
    title: 'Que doit devenir un avis citoyen ?',
    prompt: "Un avis rendu par des citoyens doit-il obliger les décideurs à répondre, à voter, ou seulement les éclairer ?",
    dossierId: 'participation-citoyenne',
  },
]

const arg = (id: string, debateId: string, author: string, stance: Argument['stance'], text: string, days: number, supports: number, extra: Partial<Argument> = {}): Argument => ({
  id, debateId, author, stance, text, createdAt: at(-days), supports, demo: true, ...extra,
})

export const demoArguments: Argument[] = [
  arg('a1', 'tirage-au-sort', 'Camille (démo)', 'pour',
    "Le tirage au sort donne une place à des personnes qui ne se seraient jamais présentées à une élection. Une assemblée qui ressemble davantage à la population peut repérer des angles morts.", 4, 128),
  arg('a2', 'tirage-au-sort', 'Thomas (démo)', 'contre',
    "Un élu peut être sanctionné au scrutin suivant. Une personne tirée au sort ne répond de rien devant personne. Cela pose un problème si l'assemblée fait plus que donner un avis.", 3, 97),
  arg('a3', 'tirage-au-sort', 'Inès (démo)', 'nuance',
    "Tout dépend du rôle confié. Pour rendre un avis public et argumenté, le tirage au sort fonctionne. Pour voter la loi, la question de la responsabilité se pose autrement.", 3, 141,
    { sourceUrl: 'https://www.lecese.fr' }),
  arg('a4', 'tirage-au-sort', 'Marc (démo)', 'contre',
    "D'accord sur la diversité, mais qui choisit les experts entendus ? Celui qui organise les auditions pèse sur la conclusion.", 2, 56, { parentId: 'a1' }),
  arg('a5', 'tirage-au-sort', 'Camille (démo)', 'pour',
    "C'est un vrai risque. Un comité de garants pluraliste et la publication de la liste des auditions permettent de le réduire.", 2, 38, { parentId: 'a1' }),
  arg('a6', 'suites-des-consultations', 'Léa (démo)', 'pour',
    "Au minimum, les décideurs devraient répondre publiquement, point par point, dans un délai fixé à l'avance. Sans réponse, pourquoi participer une seconde fois ?", 5, 112),
  arg('a7', 'suites-des-consultations', 'Hugo (démo)', 'contre',
    "Rendre l'avis contraignant reviendrait à donner le dernier mot à un groupe que personne n'a élu. Une obligation de réponse motivée me paraît suffisante.", 4, 84),
  arg('a8', 'suites-des-consultations', 'Nadia (démo)', 'nuance',
    "On pourrait distinguer selon les sujets : avis simple pour les questions techniques, vote obligatoire du Parlement pour les propositions les plus soutenues.", 1, 63),
]

export const demoProposals: Proposal[] = [
  {
    id: 'compte-rendu-public',
    title: 'Publier un compte rendu après chaque consultation locale',
    problem: "Après une consultation, les participants ne savent souvent pas ce que leurs contributions sont devenues.",
    solution: "Rendre obligatoire, dans un délai de trois mois, un compte rendu public indiquant les propositions retenues, écartées, et pourquoi.",
    benefits: 'Plus de confiance, et une incitation à participer de nouveau.',
    risks: "Charge de travail supplémentaire pour les petites communes. Risque de comptes rendus rédigés de façon trop générale.",
    sources: '',
    status: 'discussion',
    author: 'Léa (démo)',
    createdAt: at(-12),
    supports: 246,
    demo: true,
  },
  {
    id: 'jury-petitions',
    title: 'Un jury citoyen pour examiner les pétitions les plus soutenues',
    problem: "Les pétitions qui atteignent un seuil élevé de signatures ne débouchent pas toujours sur un examen approfondi.",
    solution: "Tirer au sort un jury de citoyens chargé d'auditionner les auteurs de la pétition et de rendre un avis public.",
    benefits: 'Un examen contradictoire et visible des demandes les plus soutenues.',
    risks: "Coût d'organisation. Un avis du jury pourrait être perçu comme une décision alors qu'il n'en est pas une.",
    sources: '',
    status: 'analyse',
    author: 'Inès (démo)',
    createdAt: at(-20),
    supports: 198,
    demo: true,
  },
  {
    id: 'kit-budget-communal',
    title: 'Un kit pédagogique pour comprendre le budget de sa commune',
    problem: 'Les documents budgétaires sont publics mais difficiles à lire pour un non-spécialiste.',
    solution: 'Proposer un modèle de présentation simplifiée que chaque commune pourrait remplir et publier.',
    benefits: 'Des débats locaux mieux informés.',
    risks: 'Une présentation simplifiée peut masquer des choix importants si elle est mal conçue.',
    sources: '',
    status: 'proposee',
    author: 'Marc (démo)',
    createdAt: at(-4),
    supports: 87,
    demo: true,
  },
]
