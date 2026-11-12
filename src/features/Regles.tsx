import { PageHeader } from '../ui/kit'

const RULES: { title: string; items: string[] }[] = [
  {
    title: 'Ce prototype',
    items: [
      'Les votes, les participants, les arguments et les propositions affichés au départ sont fictifs. Ils servent à montrer le fonctionnement.',
      "Il n'y a ni serveur ni compte : ce que vous saisissez reste dans votre navigateur et n'est vu par personne d'autre.",
      'Le dossier « La participation citoyenne » a été rédigé avec assistance IA à partir de sources publiques. Il attend une relecture humaine.',
    ],
  },
  {
    title: 'Pluralisme',
    items: [
      "AGORA ne défend aucune conclusion politique. Chaque sujet présente des arguments favorables et défavorables.",
      "AGORA est liée intellectuellement au laboratoire 6EME REPUBLIC, mais reste un projet distinct.",
      "Aucune source, citation, statistique ou analyse d'expert n'est inventée. Une information non vérifiée est signalée comme telle.",
    ],
  },
  {
    title: 'Consultations et comptage',
    items: [
      "Une consultation AGORA est indicative. Ce n'est pas un scrutin officiel et elle n'entraîne aucune décision publique.",
      'Trois choix : pour, contre, blanc. Le vote blanc est une participation, distincte de l’abstention.',
      'Les pourcentages sont calculés sur toutes les participations, votes blancs compris. L’abstention n’est ni comptée ni estimée.',
      'Les participants sont volontaires : les résultats ne sont pas représentatifs de la population.',
      "Sans vérification d'identité, AGORA ne peut pas garantir un vote par personne. Un vrai scrutin exigerait une architecture, des audits et un cadre juridique spécifiques.",
      'La reformulation lorsque le vote blanc arrive en tête est une règle à l’étude, limitée aux consultations portant sur le modèle 6EME REPUBLIC.',
    ],
  },
  {
    title: 'Débats et modération',
    items: [
      'On critique les idées, pas les personnes. Injures, attaques personnelles, publicité et hors-sujet peuvent être masqués.',
      "Un signalement est examiné par un modérateur. Il ne masque rien automatiquement.",
      'Toute décision de modération affiche son motif et peut être contestée.',
      "Le nombre de soutiens d'un argument mesure l'adhésion, pas l'exactitude.",
      'Les opérations de modération sont inscrites dans un journal.',
    ],
  },
  {
    title: 'Vos données',
    items: [
      'La lecture est libre, sans compte.',
      'Vos votes relèvent de vos opinions politiques : ils ne sont jamais affichés publiquement.',
      'Vous pouvez consulter, copier et effacer vos données depuis votre profil.',
      "Aucun justificatif d'identité n'est demandé, et aucun contenu n'est envoyé à un service d'IA.",
    ],
  },
]

export function Regles() {
  return (
    <>
      <PageHeader eyebrow="Transparence" title="Règles d'AGORA" intro="Comment fonctionnent les consultations, la modération et la gestion de vos données." />
      {RULES.map((r) => (
        <section key={r.title} className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-ink">{r.title}</h2>
          <ul className="flex max-w-[68ch] list-disc flex-col gap-1.5 pl-5 text-[0.97rem] text-ink2">
            {r.items.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </section>
      ))}
    </>
  )
}
