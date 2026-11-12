import { href } from '../app/router'
import { useStore } from '../app/store'
import { consultations } from '../data/demo'
import { cumulative, outcome, phase, total, withVote } from '../domain/tally'
import type { Consultation } from '../domain/types'
import { Badge, Card, date, DemoTag, Notice, num, PageHeader, Section, VoteBars } from '../ui/kit'
import { OUTCOME_TEXT } from './Consultations'

/** Courbe du cumul des participations. Échelle unique, de 0 au total atteint. */
function Evolution({ c }: { c: Consultation }) {
  const points = cumulative(c.seedDaily)
  if (points.length < 2) return null
  const W = 320, H = 96, L = 6, R = 6, T = 10, B = 6
  const max = points[points.length - 1]
  const x = (i: number) => L + (i * (W - L - R)) / (points.length - 1)
  const y = (v: number) => T + (H - T - B) * (1 - v / max)
  const line = points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  return (
    <figure className="flex flex-col gap-1.5">
      <figcaption className="text-sm font-semibold text-ink">Participations cumulées depuis l'ouverture</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" role="img" aria-label={`Le cumul passe de ${num(points[0])} le premier jour à ${num(max)} après ${points.length} jours.`} preserveAspectRatio="none">
        <line x1={L} x2={W - R} y1={H - B} y2={H - B} stroke="var(--line)" strokeWidth="1" />
        <path d={`${line} L${x(points.length - 1)} ${H - B} L${L} ${H - B} Z`} fill="var(--soft)" />
        <path d={line} fill="none" stroke="var(--pour)" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="num flex justify-between text-xs text-ink3"><span>Jour 1 : {num(points[0])}</span><span>Jour {points.length} : {num(max)}</span></p>
    </figure>
  )
}

export function Resultats() {
  const s = useStore()
  const now = new Date()
  const list = consultations.filter((c) => phase(c, now) !== 'a-venir')
  return (
    <>
      <PageHeader eyebrow="Résultats" title="Résultats des consultations" intro="Les chiffres, la façon dont ils sont calculés, et ce qu'ils ne permettent pas de dire.">
        <div><DemoTag label="Votes fictifs" /></div>
      </PageHeader>

      <Notice title="Ce que ces résultats ne disent pas">
        Les participants ont choisi de répondre : ils ne forment pas un échantillon représentatif. Ces résultats décrivent leur avis, pas celui de la population française.
      </Notice>

      {list.map((c) => {
        const ph = phase(c, now)
        const tally = withVote(c.seed, s.votes[c.id]?.choice)
        return (
          <Card as="article" key={c.id} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={ph === 'ouverte' ? 'soft' : 'outline'}>{ph === 'ouverte' ? 'Provisoire' : 'Définitif'}</Badge>
              <span className="text-sm text-ink3">{ph === 'ouverte' ? `Clôture le ${date(c.closesAt)}` : `Close le ${date(c.closesAt)}`}</span>
            </div>
            <h2 className="font-serif text-xl leading-snug font-medium text-ink">
              <a href={href('consultation', c.id)} className="hover:underline">{c.question}</a>
            </h2>
            <VoteBars tally={tally} />
            <p className="font-medium text-ink">{OUTCOME_TEXT[outcome(tally, c.rule)]}</p>
            <Evolution c={c} />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 text-sm">
              <div><dt className="text-ink3">Participations</dt><dd className="num font-semibold text-ink">{num(total(tally))}</dd></div>
              <div><dt className="text-ink3">Mise à jour</dt><dd className="font-semibold text-ink">{date(ph === 'close' ? c.closesAt : now.toISOString())}</dd></div>
            </dl>
          </Card>
        )
      })}

      <Section id="r-methode" title="Méthode de calcul">
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[0.95rem] text-ink2">
          <li>Chaque participation vaut une voix : pour, contre ou blanc.</li>
          <li>Les pourcentages portent sur toutes les participations, votes blancs compris, et sont arrondis pour totaliser 100 %.</li>
          <li>L'abstention n'est pas mesurée : on ne sait pas combien de personnes ont vu la question sans y répondre.</li>
          <li>Dans ce prototype, les chiffres additionnent des votes fictifs et, le cas échéant, votre propre vote.</li>
        </ul>
        <a href={href('regles')} className="inline-flex min-h-11 items-center self-start text-sm font-semibold text-accentink underline">Toutes les règles</a>
      </Section>
    </>
  )
}
