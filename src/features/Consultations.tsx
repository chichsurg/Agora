import { useState } from 'react'
import { Bell, BellOff, Check } from 'lucide-react'
import { href } from '../app/router'
import { actions, useStore } from '../app/store'
import { consultations } from '../data/demo'
import { CHOICES, daysLeft, outcome, phase, total, withVote, type Outcome } from '../domain/tally'
import type { Choice, Consultation, ConsultationPhase } from '../domain/types'
import { Badge, Button, Card, CHOICE_LABEL, cx, date, DemoTag, NotFound, Notice, num, PageHeader, Section, VoteBars } from '../ui/kit'

const PHASE_LABEL: Record<ConsultationPhase, string> = { 'a-venir': 'À venir', ouverte: 'Ouverte', close: 'Close' }

export const OUTCOME_TEXT: Record<Outcome, string> = {
  'aucun-vote': 'Aucune participation pour le moment.',
  pour: 'Le « pour » est en tête parmi les participants.',
  contre: 'Le « contre » est en tête parmi les participants.',
  blanc: 'Le vote blanc est en tête parmi les participants.',
  egalite: 'Deux choix au moins sont à égalité en tête.',
  reformulation: 'Le vote blanc est en tête : selon la règle appliquée à cette consultation, la question doit être reformulée.',
}

function ConsultationCard({ c }: { c: Consultation }) {
  const s = useStore()
  const now = new Date()
  const ph = phase(c, now)
  const tally = withVote(c.seed, s.votes[c.id]?.choice)
  return (
    <li>
      <a href={href('consultation', c.id)} className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-4 shadow-card hover:bg-surface2 sm:p-5">
        <span className="flex flex-wrap items-center gap-2">
          <Badge tone={ph === 'ouverte' ? 'soft' : 'outline'}>{PHASE_LABEL[ph]}</Badge>
          {s.votes[c.id] && <Badge tone="night"><Check size={12} aria-hidden="true" /> Vous avez participé</Badge>}
        </span>
        <span className="font-serif text-xl leading-snug font-medium text-ink">{c.question}</span>
        <span className="num text-sm text-ink3">
          {ph === 'a-venir' && `Ouverture le ${date(c.opensAt)}`}
          {ph === 'ouverte' && `${daysLeft(c.closesAt, now)} jours restants · ${num(total(tally))} participations`}
          {ph === 'close' && `Close le ${date(c.closesAt)} · ${num(total(tally))} participations`}
        </span>
      </a>
    </li>
  )
}

export function ConsultationList() {
  const now = new Date()
  const groups: [string, ConsultationPhase][] = [['Ouvertes', 'ouverte'], ['À venir', 'a-venir'], ['Historique', 'close']]
  return (
    <>
      <PageHeader eyebrow="Participer" title="Consultations" intro="Lisez le sujet et les arguments des deux côtés, puis votez pour, contre ou blanc.">
        <div className="flex flex-wrap gap-2"><DemoTag label="Votes fictifs" /></div>
      </PageHeader>
      {groups.map(([label, ph]) => {
        const list = consultations.filter((c) => phase(c, now) === ph)
        if (!list.length) return null
        return (
          <Section key={ph} id={`c-${ph}`} title={label}>
            <ul className="flex flex-col gap-3">{list.map((c) => <ConsultationCard key={c.id} c={c} />)}</ul>
          </Section>
        )
      })}
      <Notice title="Consultations indicatives">
        Une consultation AGORA n'est pas un scrutin officiel. Ses résultats décrivent l'avis des personnes qui ont choisi de participer, pas celui de la population. <a className="font-semibold text-accentink underline" href={href('regles')}>Lire les règles</a>
      </Notice>
    </>
  )
}

const CHOICE_HINT: Record<Choice, string> = {
  pour: 'Je suis favorable à la proposition.',
  contre: 'Je suis défavorable à la proposition.',
  blanc: 'Je participe, sans choisir entre les deux réponses.',
}

function Ballot({ c }: { c: Consultation }) {
  const s = useStore()
  const mine = s.votes[c.id]
  const [pick, setPick] = useState<Choice | null>(null)
  const [editing, setEditing] = useState(false)

  if (mine && !editing) {
    return (
      <Card className="flex flex-col gap-3" aria-live="polite">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <span className="grid size-7 place-items-center rounded-full bg-accent text-white"><Check size={16} aria-hidden="true" /></span>
          Vote enregistré : {CHOICE_LABEL[mine.choice]}
        </p>
        <p className="text-sm text-ink2">Enregistré le {date(mine.at)}, dans ce navigateur uniquement. Vous pouvez le modifier ou le retirer jusqu'à la clôture.</p>
        <div className="flex flex-wrap gap-2">
          <Button tone="secondary" onClick={() => { setPick(mine.choice); setEditing(true) }}>Modifier mon vote</Button>
          <Button tone="ghost" onClick={() => actions.withdrawVote(c.id)}>Retirer mon vote</Button>
        </div>
      </Card>
    )
  }

  return (
    <Card as="section" className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2 font-semibold text-ink">Votre vote</legend>
        {CHOICES.map((ch) => (
          <label key={ch} htmlFor={`vote-${c.id}-${ch}`}
            className={cx('flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5', pick === ch ? 'border-accent bg-soft' : 'border-line hover:bg-surface2')}>
            <input id={`vote-${c.id}-${ch}`} type="radio" name={`vote-${c.id}`} value={ch} checked={pick === ch} onChange={() => setPick(ch)} className="size-5 accent-[#6246ea]" />
            <span>
              <span className="block font-semibold text-ink">{CHOICE_LABEL[ch]}</span>
              <span className="block text-sm text-ink2">{CHOICE_HINT[ch]}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <p className="text-sm text-ink3">Le vote blanc est compté comme une participation. S'abstenir, c'est ne pas voter : l'abstention n'apparaît pas dans les résultats.</p>
      <div className="flex flex-wrap gap-2">
        <Button disabled={!pick} onClick={() => { if (pick) { actions.vote(c.id, pick); setEditing(false) } }}>
          {mine ? 'Enregistrer la modification' : 'Enregistrer mon vote'}
        </Button>
        {editing && <Button tone="ghost" onClick={() => setEditing(false)}>Annuler</Button>}
      </div>
    </Card>
  )
}

export function ConsultationPage({ id }: { id: string }) {
  const s = useStore()
  const c = consultations.find((x) => x.id === id)
  if (!c) return <NotFound what="Cette consultation" />
  const now = new Date()
  const ph = phase(c, now)
  const tally = withVote(c.seed, s.votes[c.id]?.choice)
  const followed = s.followed.includes(c.id)

  return (
    <>
      <PageHeader back={{ href: href('consultations'), label: 'Consultations' }} eyebrow={`Consultation · ${PHASE_LABEL[ph]}`} title={c.question}>
        <p className="num text-sm text-ink3">Du {date(c.opensAt)} au {date(c.closesAt)}{ph === 'ouverte' && ` · ${daysLeft(c.closesAt, now)} jours restants`}</p>
        <div className="flex flex-wrap items-center gap-2">
          <DemoTag label="Votes fictifs" />
          <Button tone="ghost" aria-pressed={followed} onClick={() => actions.toggleFollow(c.id)} className="min-h-9 px-2.5 text-sm">
            {followed ? <BellOff size={15} aria-hidden="true" /> : <Bell size={15} aria-hidden="true" />}
            {followed ? 'Ne plus suivre' : 'Suivre'}
          </Button>
        </div>
      </PageHeader>

      <Section id="c-sujet" title="Le sujet">
        <p className="max-w-[65ch] text-ink2">{c.context}</p>
        {c.dossierId && <a href={href('dossier', c.dossierId)} className="inline-flex min-h-11 items-center self-start text-sm font-semibold text-accentink underline">Lire le dossier complet</a>}
      </Section>

      <div className="grid gap-4 sm:grid-cols-2">
        {([['Arguments pour', c.argsFor], ['Arguments contre', c.argsAgainst]] as const).map(([title, items]) => (
          <Card key={title} as="section" className="shadow-none">
            <h2 className="mb-2 font-bold text-ink">{title}</h2>
            <ul className="flex flex-col gap-2.5">
              {items.map((p) => (
                <li key={p.title} className="text-[0.95rem] text-ink2"><span className="font-semibold text-ink">{p.title}.</span> {p.text}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {ph === 'ouverte' && <Ballot c={c} />}
      {ph === 'a-venir' && <Notice title="Vote pas encore ouvert">Cette consultation ouvrira le {date(c.opensAt)}. Suivez-la pour la retrouver dans votre profil.</Notice>}

      {ph !== 'a-venir' && (
        <Section id="c-resultats" title={ph === 'close' ? 'Résultat' : 'Résultats provisoires'}>
          <Card className="flex flex-col gap-4">
            <VoteBars tally={tally} />
            <p className="font-medium text-ink">{OUTCOME_TEXT[outcome(tally, c.rule)]}</p>
            <p className="num text-sm text-ink3">{num(total(tally))} participations · votes de démonstration{ s.votes[c.id] ? ' + le vôtre' : ''}</p>
          </Card>
        </Section>
      )}

      <Section id="c-regles" title="Règles de comptage">
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[0.95rem] text-ink2">
          <li>Les pourcentages sont calculés sur l'ensemble des participations, votes blancs compris.</li>
          <li>L'abstention n'est ni comptée ni estimée.</li>
          {c.rule === 'reformulation-si-blanc' ? (
            <li><strong className="text-ink">Règle à l'étude, propre à cette consultation :</strong> si le vote blanc arrive strictement en tête, la question est renvoyée pour reformulation. Cette règle ne s'applique pas aux autres consultations AGORA.</li>
          ) : (
            <li>Le choix en tête est indiqué à titre d'information. Il n'entraîne aucune décision.</li>
          )}
          <li>Ce prototype ne vérifie pas l'identité : il ne peut pas garantir un vote par personne.</li>
        </ul>
      </Section>
    </>
  )
}
