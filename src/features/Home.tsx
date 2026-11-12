import { ArrowRight, BookOpen, Lightbulb, MessagesSquare, PieChart, Search, Vote } from 'lucide-react'
import { href } from '../app/router'
import { allArguments, allProposals, useStore } from '../app/store'
import { consultations, debates, dossiers } from '../data/demo'
import { statusLabel } from '../domain/proposals'
import { daysLeft, phase, total, withVote } from '../domain/tally'
import { Arch, Badge, Card, DemoTag, LinkButton, num, Section, VoteBars } from '../ui/kit'

const QUICK = [
  { label: "S'informer", hint: 'Dossiers sourcés', icon: BookOpen, to: href('dossiers') },
  { label: 'Participer', hint: 'Consultations ouvertes', icon: Vote, to: href('consultations') },
  { label: 'Débattre', hint: 'Arguments contradictoires', icon: MessagesSquare, to: href('debats') },
  { label: 'Proposer', hint: 'Votre idée, structurée', icon: Lightbulb, to: href('propositions') },
]

const more = (to: string, label = 'Tout voir') => (
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
  const dossier = dossiers[0]
  const participations = consultations.reduce((n, c) => n + total(withVote(c.seed, s.votes[c.id]?.choice)), 0)

  return (
    <>
      {/* Manifeste */}
      <section aria-labelledby="page-title" className="relative overflow-hidden rounded-3xl bg-night px-5 pt-7 pb-6 text-white sm:px-8 sm:pt-10 sm:pb-8">
        <Arch tone="light" className="pointer-events-none absolute -right-10 -bottom-16 h-64 w-64 opacity-40 sm:-right-4 sm:h-80 sm:w-80" />
        <Arch tone="light" className="pointer-events-none absolute right-24 -bottom-24 h-56 w-56 opacity-15" />
        <div className="relative flex max-w-md flex-col gap-4">
          <p className="eyebrow text-[#b7a8fd]">Plateforme citoyenne indépendante</p>
          <h1 id="page-title" tabIndex={-1} className="font-serif text-[2.35rem] leading-[1.05] font-medium outline-none sm:text-5xl">
            La place publique, réinventée.
          </h1>
          <p className="text-[1.02rem] text-white/85">
            Comprendre les enjeux, comparer les arguments, donner son avis. Nous n'avons pas besoin d'être d'accord pour réfléchir ensemble.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <LinkButton href={href('consultations')}>Participer <ArrowRight size={17} aria-hidden="true" /></LinkButton>
            <LinkButton href={href('regles')} className="border border-white/30 bg-transparent text-white hover:bg-white/10">Comment ça marche</LinkButton>
          </div>
        </div>
        <span aria-hidden="true" className="relative mt-6 flex h-1 w-14 overflow-hidden rounded-full">
          <span className="flex-1 bg-[#6f8cff]" /><span className="flex-1 bg-white" /><span className="flex-1 bg-[#ef5b5b]" />
        </span>
      </section>

      <a href={href('recherche')} className="flex min-h-12 items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 text-ink3 hover:bg-surface2">
        <Search size={18} aria-hidden="true" /> Rechercher un sujet, une idée…
      </a>

      <nav aria-label="Accès rapide">
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {QUICK.map((q) => (
            <li key={q.label}>
              <a href={q.to} className="flex h-full flex-col gap-2 rounded-2xl border border-line bg-surface p-3.5 hover:bg-surface2">
                <span className="grid size-10 place-items-center rounded-xl bg-soft text-accentink"><q.icon size={20} aria-hidden="true" /></span>
                <span className="font-semibold text-ink">{q.label}</span>
                <span className="-mt-1.5 text-sm text-ink3">{q.hint}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {featured && (
        <Section id="h-consult" title="Consultation en cours" action={more(href('consultations'))}>
          <Card as="article" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{daysLeft(featured.closesAt, now)} jours restants</Badge>
              <DemoTag label="Votes fictifs" />
            </div>
            <h3 className="font-serif text-2xl leading-tight font-medium text-ink">{featured.question}</h3>
            <VoteBars tally={withVote(featured.seed, s.votes[featured.id]?.choice)} compact />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="num text-sm text-ink3">{num(total(withVote(featured.seed, s.votes[featured.id]?.choice)))} participations</p>
              <LinkButton href={href('consultation', featured.id)}>
                {s.votes[featured.id] ? 'Voir ma participation' : 'Lire et voter'}
              </LinkButton>
            </div>
          </Card>
        </Section>
      )}

      <Section id="h-dossier" title="Dossier à la une" action={more(href('dossiers'), `Les ${dossiers.length} dossiers`)}>
        <a href={href('dossier', dossier.id)} className="group grid overflow-hidden rounded-2xl border border-line bg-surface shadow-card sm:grid-cols-[11rem_1fr]">
          <div className="relative h-28 overflow-hidden bg-soft sm:h-full">
            <Arch className="absolute -bottom-6 left-6 h-32 w-32" />
            <Arch className="absolute -bottom-10 left-28 h-28 w-28 opacity-50" />
          </div>
          <div className="flex flex-col gap-2 p-4 sm:p-5">
            <p className="eyebrow text-accentink">{dossier.theme}</p>
            <h3 className="font-serif text-2xl leading-tight font-medium text-ink">{dossier.title}</h3>
            <p className="text-sm text-ink2">{dossier.summary}</p>
            <p className="text-sm text-ink3">
              {dossier.facts.length} faits sourcés · {dossier.viewpoints.length} points de vue · {dossier.sources.length} sources
            </p>
          </div>
        </a>
      </Section>

      <Section id="h-debats" title="Débats populaires" action={more(href('debats'))}>
        <ul className="flex flex-col gap-2.5">
          {debates.map((d) => {
            const n = args.filter((a) => a.debateId === d.id).length
            return (
              <li key={d.id}>
                <a href={href('debat', d.id)} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 hover:bg-surface2">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-soft text-accentink"><MessagesSquare size={20} aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{d.title}</span>
                    <span className="block text-sm text-ink3">{n} arguments</span>
                  </span>
                  <ArrowRight size={18} className="shrink-0 text-ink3" aria-hidden="true" />
                </a>
              </li>
            )
          })}
        </ul>
      </Section>

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
        <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
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
    </>
  )
}
