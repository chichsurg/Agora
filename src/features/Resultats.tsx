import { useState } from 'react'
import { BarChart3, EyeOff, FileText, Lock, MessageSquare, Vote } from 'lucide-react'
import { href } from '../app/router'
import { useStore } from '../app/store'
import { consultations } from '../data/demo'
import { CHOICES, cumulative, outcome, percentages, phase, total, withVote } from '../domain/tally'
import type { Consultation, Tally } from '../domain/types'
import { ReferenceIcon } from '../ui/brand'
import { Badge, Button, Card, CHOICE_LABEL, date, DemoTag, LinkButton, Notice, num, PageHeader, Section } from '../ui/kit'
import { OUTCOME_TEXT } from './Consultations'

// Modèles de REF-12 : données clés, diagramme circulaire avec légende, courbe d'évolution,
// chronologie. Les cartes et comparaisons régionales de la planche ne sont pas reprises :
// le prototype n'a aucune donnée territoriale, et aucune n'est inventée.

const STROKE = { pour: 'var(--pour)', contre: 'var(--contre)', blanc: 'var(--blanc)' } as const

/** Diagramme circulaire. Le centre affiche le choix en tête ; la légende donne tout en clair. */
function Donut({ tally }: { tally: Tally }) {
  const pct = percentages(tally)
  const n = total(tally)
  const R = 54
  const C = 2 * Math.PI * R
  const lead = CHOICES.reduce((a, b) => (tally[b] > tally[a] ? b : a))
  const tie = CHOICES.filter((c) => tally[c] === tally[lead]).length > 1
  let offset = 0
  return (
    <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
      <svg viewBox="0 0 140 140" className="size-36 shrink-0 -rotate-90" role="img"
        aria-label={`Répartition : ${CHOICES.map((c) => `${CHOICE_LABEL[c]} ${pct[c]} %`).join(', ')}.`}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--surface2)" strokeWidth="17" />
        {n > 0 && CHOICES.map((c) => {
          const len = (tally[c] / n) * C
          const dash = { strokeDasharray: `${Math.max(0, len - 1.5)} ${C}`, strokeDashoffset: -offset }
          // Le gris BLANC est trop clair pour se détacher seul : un liseré plus soutenu l'entoure.
          const seg = (
            <g key={c}>
              {c === 'blanc' && <circle cx="70" cy="70" r={R} fill="none" stroke="var(--blanc-edge)" strokeWidth="17" {...dash} />}
              <circle cx="70" cy="70" r={R} fill="none" stroke={STROKE[c]} strokeWidth={c === 'blanc' ? 15 : 17} {...dash} />
            </g>
          )
          offset += len
          return seg
        })}
        <g transform="rotate(90 70 70)" fill="var(--ink)" textAnchor="middle">
          <text x="70" y="70" fontSize="25" fontFamily="var(--font-serif)" fontWeight="500">{n === 0 ? '–' : tie ? '=' : `${pct[lead]} %`}</text>
          <text x="70" y="87" fontSize="10" fill="var(--ink2)">{n === 0 ? 'Aucun vote' : tie ? 'Égalité' : CHOICE_LABEL[lead]}</text>
        </g>
      </svg>
      <dl className="flex min-w-[11rem] flex-1 flex-col gap-2.5 text-[0.95rem]">
        {CHOICES.map((c) => (
          <div key={c} className="flex items-center gap-2.5">
            <span aria-hidden="true" className="size-3 shrink-0 rounded-full" style={{ background: STROKE[c], boxShadow: c === 'blanc' ? 'inset 0 0 0 1px var(--blanc-edge)' : undefined }} />
            <dt className="font-semibold text-ink">{CHOICE_LABEL[c]}</dt>
            <dd className="num ml-auto text-ink2"><span className="font-bold text-ink">{pct[c]} %</span> · {num(tally[c])}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** Courbe du cumul des participations. Une seule échelle, de 0 au total atteint. */
function Evolution({ c }: { c: Consultation }) {
  const points = cumulative(c.seedDaily)
  if (points.length < 2) return null
  const W = 360, H = 150, L = 40, R = 10, T = 12, B = 22
  const max = points[points.length - 1]
  const x = (i: number) => L + (i * (W - L - R)) / (points.length - 1)
  const y = (v: number) => T + (H - T - B) * (1 - v / max)
  const line = points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const dots = points.length <= 12
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-sm font-semibold text-ink">Participations cumulées depuis l'ouverture</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Le cumul passe de ${num(points[0])} le premier jour à ${num(max)} après ${points.length} jours.`}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={L} x2={W - R} y1={y(max * f)} y2={y(max * f)} stroke="var(--line)" strokeWidth="1" />
            <text x={L - 6} y={y(max * f) + 3.5} fontSize="10" textAnchor="end" fill="var(--ink3)">{num(Math.round(max * f))}</text>
          </g>
        ))}
        <path d={`${line} L${x(points.length - 1)} ${y(0)} L${L} ${y(0)} Z`} fill="var(--soft)" />
        <path d={line} fill="none" stroke="var(--pour)" strokeWidth="2" strokeLinejoin="round" />
        {dots && points.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="var(--surface)" stroke="var(--pour)" strokeWidth="1.8" />)}
        <text x={L} y={H - 5} fontSize="10" fill="var(--ink3)">Jour 1</text>
        <text x={W - R} y={H - 5} fontSize="10" textAnchor="end" fill="var(--ink3)">Jour {points.length}</text>
      </svg>
    </figure>
  )
}

/**
 * Résultat d'une consultation. Tant qu'elle est ouverte et que la personne n'a pas voté,
 * les chiffres restent masqués : elle peut les afficher, mais ils ne s'imposent pas à elle.
 */
function ResultCard({ c, tally, voted }: { c: Consultation; tally: Tally; voted: boolean }) {
  const [revealed, setRevealed] = useState(false)
  const now = new Date()
  const ph = phase(c, now)
  const masked = ph === 'ouverte' && !voted && !revealed
  return (
    <Card as="article" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={ph === 'ouverte' ? 'soft' : 'outline'}>{ph === 'ouverte' ? 'Provisoire' : 'Définitif'}</Badge>
        <span className="text-sm text-ink3">Du {date(c.opensAt)} au {date(c.closesAt)}</span>
      </div>
      <h2 className="font-serif text-xl leading-snug font-medium text-ink">
        <a href={href('consultation', c.id)} className="hover:underline">{c.question}</a>
      </h2>
      {masked ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl bg-surface2 p-4">
          <p className="flex items-center gap-2 font-bold text-ink"><EyeOff size={18} aria-hidden="true" /> Résultats provisoires masqués</p>
          <p className="text-[0.95rem] text-ink2">Vous n'avez pas encore voté. Voir les chiffres avant de répondre peut influencer votre avis.</p>
          <div className="flex flex-wrap gap-2">
            <LinkButton href={href('consultation', c.id)}>Lire et voter</LinkButton>
            <Button tone="secondary" onClick={() => setRevealed(true)}>Afficher les résultats</Button>
          </div>
        </div>
      ) : (
        <>
          <Donut tally={tally} />
          <p className="font-medium text-ink">{OUTCOME_TEXT[outcome(tally, c.rule)]}</p>
          <Evolution c={c} />
        </>
      )}
      <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 text-sm">
        <div><dt className="text-ink3">Participations</dt><dd className="num font-semibold text-ink">{num(total(tally))}</dd></div>
        <div><dt className="text-ink3">Mise à jour</dt><dd className="font-semibold text-ink">{date(ph === 'close' ? c.closesAt : now.toISOString())}</dd></div>
      </dl>
    </Card>
  )
}

const STEPS = [
  { icon: FileText, title: 'Ouverture', text: 'Présentation du sujet' },
  { icon: MessageSquare, title: 'Arguments', text: 'Le pour et le contre' },
  { icon: Vote, title: 'Vote', text: 'Pour, contre ou blanc' },
  { icon: Lock, title: 'Clôture', text: 'À la date annoncée' },
  { icon: BarChart3, title: 'Résultats', text: 'Chiffres et méthode' },
]

export function Resultats() {
  const s = useStore()
  const now = new Date()
  const list = consultations.filter((c) => phase(c, now) !== 'a-venir')
  const tallies = list.map((c) => withVote(c.seed, s.votes[c.id]?.choice))
  const kpis: [string, string, 'agora' | 'debats' | 'le-projet'][] = [
    [num(tallies.reduce((n, t) => n + total(t), 0)), 'participations enregistrées', 'agora'],
    [String(list.filter((c) => phase(c, now) === 'ouverte').length), 'consultations ouvertes', 'debats'],
    [String(list.filter((c) => phase(c, now) === 'close').length), list.filter((c) => phase(c, now) === 'close').length > 1 ? 'consultations closes' : 'consultation close', 'le-projet'],
  ]

  return (
    <>
      <PageHeader eyebrow="Résultats" title="Résultats des consultations" intro="Les chiffres, la façon dont ils sont calculés, et ce qu'ils ne permettent pas de dire.">
        <div><DemoTag label="Votes fictifs" /></div>
      </PageHeader>

      <Notice title="Ce que ces résultats ne disent pas">
        Les participants ont choisi de répondre : ils ne forment pas un échantillon représentatif. Ces résultats décrivent leur avis, pas celui de la population française.
      </Notice>

      <dl className="grid gap-3 sm:grid-cols-3">
        {kpis.map(([value, label, icon]) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
            <ReferenceIcon name={icon} />
            <div>
              <dd className="num font-serif text-3xl leading-none font-medium text-ink">{value}</dd>
              <dt className="mt-1 text-sm text-ink2">{label}</dt>
            </div>
          </div>
        ))}
      </dl>

      <div className="grid gap-5 lg:grid-cols-2">
        {list.map((c, i) => <ResultCard key={c.id} c={c} tally={tallies[i]} voted={!!s.votes[c.id]} />)}
      </div>

      <Section id="r-etapes" title="Les étapes d'une consultation sur AGORA">
        <ol className="grid gap-x-2 gap-y-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-5">
          {STEPS.map((st, i) => (
            <li key={st.title} className="relative flex items-center gap-3.5 sm:flex-col sm:gap-2 sm:text-center">
              {i > 0 && <span aria-hidden="true" className="absolute top-6 right-1/2 hidden h-0.5 w-full -translate-y-1/2 bg-soft sm:block" />}
              <span className="relative grid size-12 shrink-0 place-items-center rounded-full border border-line bg-surface text-accentink"><st.icon size={21} aria-hidden="true" /></span>
              <span>
                <span className="block font-bold text-ink"><span className="num text-accentink">{i + 1}.</span> {st.title}</span>
                <span className="block text-sm text-ink3">{st.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="r-methode" title="Méthode de calcul">
        <ul className="flex max-w-[68ch] list-disc flex-col gap-1.5 pl-5 text-[0.95rem] text-ink2">
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
