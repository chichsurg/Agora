import { ArrowRight, Menu, MessageSquare, PieChart, Search } from 'lucide-react'
import { href } from '../app/router'
import { allArguments, allProposals, useStore } from '../app/store'
import { consultations, debates, dossiers } from '../data/demo'
import type { PhotoId } from '../data/media'
import { statusLabel } from '../domain/proposals'
import { daysLeft, phase, total, withVote } from '../domain/tally'
import { asset, BrandLogo, EditorialImage, ReferenceIcon, type ReferenceIconName } from '../ui/brand'
import { ago, Badge, DemoTag, LinkButton, num, Section } from '../ui/kit'

// Composition de REF-14 : scène architecturale, titre éditorial, consultation en cours,
// accès rapides, sujets illustrés et fil latéral. Les contenus viennent des données réelles
// du prototype : aucun sujet, compteur ou actualité n'est ajouté pour ressembler à la maquette.

const DAY = 86_400_000

const QUICK: { label: string; hint: string; icon: ReferenceIconName; to: string }[] = [
  { label: "S'informer", hint: 'Dossiers sourcés', icon: 'sources', to: href('dossiers') },
  { label: 'Débattre', hint: 'Arguments pour et contre', icon: 'debats', to: href('debats') },
  { label: 'Participer', hint: 'Votez, pour, contre ou blanc', icon: 'agora', to: href('consultations') },
  { label: 'Comprendre', hint: 'Le projet, ses règles', icon: 'le-projet', to: href('regles') },
]

const more = (to: string, label = 'Voir tout') => (
  <a href={to} className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-accentink">
    {label} <ArrowRight size={15} aria-hidden="true" />
  </a>
)

export function Home() {
  const s = useStore()
  const now = new Date()
  const open = consultations.filter((c) => phase(c, now) === 'ouverte')
  const featured = open[0]
  const args = allArguments(s)
  const proposals = allProposals(s)
  const participations = consultations.reduce((n, c) => n + total(withVote(c.seed, s.votes[c.id]?.choice)), 0)

  const subjects: { key: string; kind: string; title: string; meta: string; count?: number; photo: PhotoId; to: string }[] = [
    ...dossiers.map((d) => ({ key: d.id, kind: 'Dossier', title: d.title, meta: `${d.facts.length} faits sourcés`, photo: d.photo, to: href('dossier', d.id) })),
    ...debates.map((d) => {
      const n = args.filter((a) => a.debateId === d.id).length
      return { key: d.id, kind: 'Débat', title: d.title, meta: `${n} arguments`, count: n, photo: d.photo, to: href('debat', d.id) }
    }),
  ]

  const upcoming = consultations.find((c) => phase(c, now) === 'a-venir')
  const closed = consultations.find((c) => phase(c, now) === 'close')
  const latestDossier = [...dossiers].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0]
  const feed: { key: string; label: string; title: string; when: string; to: string; photo?: PhotoId; icon?: ReferenceIconName }[] = [
    { key: 'd', label: 'Dossier', title: latestDossier.title, when: `Mis à jour ${ago(latestDossier.updatedAt)}`, to: href('dossier', latestDossier.id), photo: latestDossier.photo },
    ...(upcoming ? [{ key: 'u', label: 'Consultation à venir', title: upcoming.title, when: `Ouvre dans ${daysLeft(upcoming.opensAt, now)} jours`, to: href('consultation', upcoming.id), icon: 'agora' as const }] : []),
    ...(closed ? [{ key: 'c', label: 'Résultat', title: closed.title, when: `Close ${ago(closed.closesAt)}`, to: href('consultation', closed.id), icon: 'le-projet' as const }] : []),
    ...(proposals[0] ? [{ key: 'p', label: 'Proposition', title: proposals[0].title, when: `Déposée ${ago(proposals[0].createdAt)}`, to: href('proposition', proposals[0].id), icon: 'charte' as const }] : []),
  ]

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:gap-x-7">
      <div className="contents lg:flex lg:min-w-0 lg:flex-col">
        {/* Scène d'ouverture */}
        <section aria-labelledby="page-title" className="hero relative isolate order-1 flex min-h-[38rem] flex-col overflow-hidden text-white lg:-mr-[24.25rem] lg:min-h-[27rem] lg:rounded-[1.75rem]">
          <img src={asset('photos/invalides-dome.jpg')} alt="" className="hero-photo absolute -z-20 max-w-none object-cover" />
          <div className="hero-veil absolute inset-0 -z-10" />

          {/* Barre haute mobile : menu, logo, recherche */}
          <div className="gutter grid grid-cols-[2.75rem_1fr_2.75rem] items-start pt-3 lg:hidden" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}>
            <a href={href('plus')} aria-label="Tous les espaces" className="grid size-11 place-items-center rounded-full text-night"><Menu size={26} aria-hidden="true" /></a>
            <a href={href('accueil')} aria-label="AGORA, accueil" className="justify-self-center"><BrandLogo variant="stacked" tone="navy" /></a>
            <a href={href('recherche')} aria-label="Rechercher" className="grid size-11 place-items-center rounded-full text-night"><Search size={24} aria-hidden="true" /></a>
          </div>

          {/* Recherche (grand écran) */}
          <a href={href('recherche')} className="search-pill mt-6 ml-[26%] hidden h-12 w-[26rem] max-w-[46%] items-center justify-between rounded-full px-5 text-sm lg:flex">
            Rechercher un sujet, une idée, une source… <Search size={18} aria-hidden="true" />
          </a>

          <div className="gutter mt-auto flex flex-col gap-4 pb-14 lg:mt-5 lg:gap-3.5 lg:px-12 lg:pr-[25.5rem] lg:pb-30">
            <div className="flex items-start justify-between gap-8">
              <div className="flex flex-col gap-3">
                <p className="eyebrow text-white/85">La place publique, réinventée.</p>
                <h1 id="page-title" tabIndex={-1} className="font-serif text-[2.7rem] leading-[1.05] font-semibold outline-none lg:text-[3.05rem]">
                  Des citoyens.<br />Des idées.<br />Une République<br />à construire.
                </h1>
                <p className="text-lg text-white/90">Informez-vous. Débattez. Participez.</p>
              </div>
              <p className="mt-10 hidden max-w-[15rem] shrink-0 text-lg leading-snug text-white/90 xl:block">
                « Nous n'avons pas besoin d'être d'accord pour réfléchir ensemble. »
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href={href('debats')} className="h-13 rounded-full! px-8">Explorer les débats</LinkButton>
              <LinkButton href={href('regles')} className="h-13 rounded-full! border border-white/70 bg-transparent px-8 text-white hover:bg-white/10">Découvrir le projet</LinkButton>
            </div>
            <a href={href('regles')} className="self-start rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">Prototype · données fictives</a>
          </div>
          <span aria-hidden="true" className="hero-curve absolute inset-x-0 -bottom-px h-9 lg:hidden" />
        </section>

        <div className="gutter relative z-10 order-2 flex flex-col gap-8 pt-3 lg:-mt-24 lg:px-7 lg:pt-0">
          <nav aria-label="Accès rapide" className="hidden sm:block">
            <ul className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {QUICK.map((q) => (
                <li key={q.label}>
                  <a href={q.to} className="flex h-full items-center gap-2 rounded-2xl border border-line bg-surface px-2.5 py-4 shadow-card hover:bg-surface2">
                    <ReferenceIcon name={q.icon} className="p-0!" />
                    <span className="min-w-0">
                      <span className="block text-[0.95rem] font-bold text-ink">{q.label}</span>
                      <span className="block text-sm leading-snug text-ink3">{q.hint}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <Section id="h-sujets" title="Sujets à la une" action={more(href('dossiers'))}>
            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
              {subjects.map((x) => (
                <li key={x.key}>
                  <a href={x.to} className="flex h-full overflow-hidden rounded-2xl border border-line bg-surface shadow-card hover:bg-surface2 sm:flex-col">
                    <EditorialImage photo={x.photo} className="h-auto w-28 shrink-0 self-stretch sm:h-32 sm:w-full" />
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5 p-3.5 sm:p-4">
                      <span className="eyebrow text-accentink">{x.kind}</span>
                      <span className="font-bold leading-snug text-ink">{x.title}</span>
                      <span className="num mt-auto flex items-center gap-1.5 pt-1 text-sm text-ink3">
                        {x.count !== undefined && <MessageSquare size={14} aria-hidden="true" />}
                        {x.meta}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="flex flex-wrap items-center gap-2 text-sm text-ink3"><DemoTag label="Arguments fictifs" /> Les débats affichent des interventions de démonstration.</p>
          </Section>
        </div>

        <div className="gutter order-4 flex flex-col gap-8 pt-8 lg:px-7">
          <Section id="h-props" title="Propositions citoyennes" action={more(href('propositions'))}>
            <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
              {proposals.slice(0, 3).map((p) => (
                <li key={p.id}>
                  <a href={href('proposition', p.id)} className="flex flex-col gap-1 p-4 hover:bg-surface2">
                    <span className="font-semibold text-ink">{p.title}</span>
                    <span className="text-sm text-ink3">{statusLabel(p.status)} · {num(p.supports)} soutiens</span>
                  </a>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="h-chiffres" title="La participation en chiffres" action={<DemoTag />}>
            <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {[
                [num(participations), 'participations aux consultations'],
                [String(open.length), 'consultations ouvertes'],
                [String(args.length), 'arguments publiés'],
                [String(proposals.length), 'propositions déposées'],
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl bg-surface2 p-4">
                  <dd className="num font-serif text-3xl font-medium text-ink">{v}</dd>
                  <dt className="mt-1 text-sm text-ink2">{l}</dt>
                </div>
              ))}
            </dl>
            <a href={href('resultats')} className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-accentink">
              <PieChart size={16} aria-hidden="true" /> Voir les résultats et leur méthode
            </a>
          </Section>
        </div>
      </div>

      {/* Colonne latérale : consultation en cours et fil d'activité */}
      <aside className="gutter relative z-10 order-3 flex flex-col gap-7 pt-8 lg:px-0 lg:pt-20 lg:pr-7">
        {featured && (
          <section aria-labelledby="h-consult" className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5 shadow-card">
            <h2 id="h-consult" className="text-lg font-bold text-ink">Consultation en cours</h2>
            <div className="relative overflow-hidden rounded-2xl">
              <EditorialImage photo="assemblee" className="h-36 w-full" position="50% 40%" />
              <span className="absolute bottom-2.5 left-2.5 rounded-md bg-white px-2 py-0.5 text-[0.68rem] font-bold tracking-wider text-[#0f1b3d] uppercase">{dossiers.find((d) => d.id === featured.dossierId)?.theme ?? 'Consultation'}</span>
            </div>
            <p className="text-[1.15rem] leading-snug font-bold text-ink">{featured.question}</p>
            <div className="flex flex-col gap-1.5">
              <p className="num flex justify-between text-sm text-ink2">
                <span>Fin dans {daysLeft(featured.closesAt, now)} jours</span>
                <span>Jour {elapsed(featured.opensAt, now)} sur {duration(featured.opensAt, featured.closesAt)}</span>
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface2" aria-hidden="true">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round((elapsed(featured.opensAt, now) / duration(featured.opensAt, featured.closesAt)) * 100)}%` }} />
              </div>
            </div>
            <p className="num flex flex-wrap items-center gap-2 text-sm text-ink3">
              {num(total(withVote(featured.seed, s.votes[featured.id]?.choice)))} participations <DemoTag label="Votes fictifs" />
            </p>
            <LinkButton href={href('consultation', featured.id)} className="rounded-full!">
              {s.votes[featured.id] ? 'Voir ma participation' : 'Participer à la consultation'}
            </LinkButton>
          </section>
        )}

        <Section id="h-fil" title="Fil d'activité" action={more(href('consultations'))}>
          <ul className="flex flex-col divide-y divide-line">
            {feed.map((f) => (
              <li key={f.key}>
                <a href={f.to} className="flex items-center gap-3.5 rounded-xl py-3 hover:bg-surface2">
                  {f.photo ? <EditorialImage photo={f.photo} className="size-[4.25rem] shrink-0 rounded-xl" /> : <ReferenceIcon name={f.icon!} className="size-[4.25rem] rounded-xl p-3" />}
                  <span className="min-w-0">
                    <span className="block leading-snug text-ink"><span className="text-ink3">{f.label} — </span><span className="font-semibold">{f.title}</span></span>
                    <span className="num block text-sm text-ink3">{f.when}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Section>

        <a href={href('debats')} className="flex items-center gap-3 rounded-2xl bg-soft p-4 text-accentink">
          <ReferenceIcon name="debats" size="sm" />
          <span className="font-semibold">{debates.length} débats ouverts <Badge tone="outline">{args.length} arguments</Badge></span>
        </a>
      </aside>
    </div>
  )
}

const duration = (opensAt: string, closesAt: string) => Math.max(1, Math.round((Date.parse(closesAt) - Date.parse(opensAt)) / DAY))
const elapsed = (opensAt: string, now: Date) => Math.max(1, Math.ceil((now.getTime() - Date.parse(opensAt)) / DAY))
