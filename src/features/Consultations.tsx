import { useEffect, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Bell, BellOff, Check, EyeOff, SlidersHorizontal } from 'lucide-react'
import { href } from '../app/router'
import { actions, useStore } from '../app/store'
import { consultations, debates } from '../data/demo'
import { FREQUENCIES, recommend, themeLabel, type ThemeId } from '../domain/preferences'
import { CHOICES, daysLeft, outcome, phase, total, withVote, type Outcome } from '../domain/tally'
import type { Choice, Consultation, ConsultationPhase, Point } from '../domain/types'
import { Badge, Button, Card, CHOICE_LABEL, CHOICE_TONE, cx, date, DemoTag, LinkButton, NotFound, Notice, num, PageHeader, Section, VoteBars } from '../ui/kit'

const PHASE_LABEL: Record<ConsultationPhase, string> = { 'a-venir': 'À venir', ouverte: 'Ouverte', close: 'Close' }

export const OUTCOME_TEXT: Record<Outcome, string> = {
  'aucun-vote': 'Aucune participation pour le moment.',
  pour: 'Le « pour » est en tête parmi les participants.',
  contre: 'Le « contre » est en tête parmi les participants.',
  blanc: 'Le vote blanc est en tête parmi les participants.',
  egalite: 'Deux choix au moins sont à égalité en tête.',
  reformulation: 'Le vote blanc est en tête : selon la règle appliquée à cette consultation, la question doit être reformulée.',
}

/* ------------------------------------------------------------------ Listes */

/** Carte d'une consultation. `reason` explique pourquoi elle est proposée. Aucun résultat n'y figure. */
export function ConsultationCard({ c, reason }: { c: Consultation; reason?: ReactNode }) {
  const s = useStore()
  const now = new Date()
  const ph = phase(c, now)
  const n = total(withVote(c.seed, s.votes[c.id]?.choice))
  return (
    <li className="h-full">
      <a href={href('consultation', c.id)} className="press flex h-full flex-col gap-2.5 rounded-2xl border border-line bg-surface p-4 shadow-card hover:bg-surface2 sm:p-5">
        <span className="flex flex-wrap items-center gap-2">
          <Badge tone={ph === 'ouverte' ? 'soft' : 'outline'}>{PHASE_LABEL[ph]}</Badge>
          {c.themes.slice(0, 2).map((t) => <Badge key={t} tone="outline">{themeLabel(t)}</Badge>)}
          {s.votes[c.id] && <Badge tone="night"><Check size={12} aria-hidden="true" /> Vous avez participé</Badge>}
        </span>
        <span className="font-serif text-xl leading-snug font-medium text-ink">{c.question}</span>
        {reason && <span className="text-sm font-medium text-accentink">{reason}</span>}
        <span className="num mt-auto pt-1 text-sm text-ink3">
          {ph === 'a-venir' && `Ouverture le ${date(c.opensAt)}`}
          {ph === 'ouverte' && `${daysLeft(c.closesAt, now)} jours restants · ${num(n)} participations`}
          {ph === 'close' && `Close le ${date(c.closesAt)} · ${num(n)} participations`}
        </span>
      </a>
    </li>
  )
}

const because = (reasons: ThemeId[]) => `Parce que vous suivez : ${reasons.map(themeLabel).join(', ')}`

/**
 * « Pour vous » et « À découvrir ». Les recommandations viennent des thèmes cochés dans
 * « Mes préférences », jamais des votes : `recommend` ne reçoit pas les votes.
 */
export function ForYou({ columns = 'md:grid-cols-2' }: { columns?: string }) {
  const { prefs } = useStore()
  const reco = recommend(consultations, prefs, new Date())
  const rhythm = FREQUENCIES.find((f) => f.id === prefs.frequency)

  return (
    <>
      <Section id="pour-vous" title="Pour vous" action={
        <a href={href('bienvenue')} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-semibold text-accentink">
          <SlidersHorizontal size={15} aria-hidden="true" /> {prefs.status === 'termine' ? 'Mes préférences' : 'Personnaliser'}
        </a>
      }>
        {reco.personalized && reco.forYou.length > 0 && (
          <>
            <ul className={cx('grid gap-3 sm:gap-4', columns)}>
              {reco.forYou.map((r) => <ConsultationCard key={r.consultation.id} c={r.consultation} reason={because(r.reasons)} />)}
            </ul>
            <p className="text-sm text-ink3">
              Sélection fondée sur vos thèmes{rhythm ? `, au rythme « ${rhythm.label.toLowerCase()} »` : ''}. Vos votes ne sont jamais utilisés pour vous recommander un contenu.
            </p>
          </>
        )}
        {reco.personalized && reco.forYou.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line px-4 py-5 text-[0.95rem] text-ink2">
            Aucune consultation ouverte ne correspond à vos thèmes ({prefs.themes.map(themeLabel).join(', ')}) pour le moment. Les autres sujets sont juste en dessous.
          </p>
        )}
        {!reco.personalized && (
          <div className="flex flex-col items-start gap-3 rounded-2xl bg-soft p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <p className="text-[0.95rem] text-ink">
              {prefs.frequency === 'aucune'
                ? 'Vous avez choisi de ne pas personnaliser AGORA. Toutes les consultations sont présentées de la même façon.'
                : 'Choisissez vos thèmes pour voir ici les consultations qui vous intéressent. C’est facultatif et modifiable à tout moment.'}
            </p>
            <LinkButton href={href('bienvenue')} className="shrink-0">{prefs.frequency === 'aucune' ? 'Modifier' : 'Choisir mes thèmes'}</LinkButton>
          </div>
        )}
      </Section>

      {reco.discover.length > 0 && (
        <Section id="a-decouvrir" title="À découvrir" action={
          <a href={href('consultations')} className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-accentink">Toutes les consultations <ArrowRight size={15} aria-hidden="true" /></a>
        }>
          <ul className={cx('grid gap-3 sm:gap-4', columns)}>
            {reco.discover.map((c) => <ConsultationCard key={c.id} c={c} reason={reco.personalized ? 'Hors de vos thèmes, pour varier les sujets' : undefined} />)}
          </ul>
        </Section>
      )}
    </>
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

      <ForYou />

      <Section id="toutes" title="Toutes les consultations">
        <p className="-mt-2 text-sm text-ink3">La liste complète, sans filtre ni personnalisation.</p>
        {groups.map(([label, ph]) => {
          const list = consultations.filter((c) => phase(c, now) === ph)
          if (!list.length) return null
          return (
            <div key={ph} className="flex flex-col gap-3">
              <h3 className="eyebrow pt-2 text-ink3">{label} · {list.length}</h3>
              <ul className="grid gap-3 sm:gap-4 md:grid-cols-2">{list.map((c) => <ConsultationCard key={c.id} c={c} />)}</ul>
            </div>
          )
        })}
      </Section>

      <Notice title="Consultations indicatives">
        Une consultation AGORA n'est pas un scrutin officiel. Ses résultats décrivent l'avis des personnes qui ont choisi de participer, pas celui de la population. <a className="font-semibold text-accentink underline" href={href('regles')}>Lire les règles</a>
      </Notice>
    </>
  )
}

/* ---------------------------------------------------------------- Parcours */

type StepId = 'decouvrir' | 'comprendre' | 'choisir' | 'confirmer' | 'resultats' | 'debattre'
const STEP_LABEL: Record<StepId, string> = { decouvrir: 'Découvrir', comprendre: 'Comprendre', choisir: 'Choisir', confirmer: 'Confirmer', resultats: 'Résultats', debattre: 'Débattre' }
const STEPS_BY_PHASE: Record<ConsultationPhase, StepId[]> = {
  ouverte: ['decouvrir', 'comprendre', 'choisir', 'confirmer', 'resultats', 'debattre'],
  close: ['decouvrir', 'comprendre', 'resultats', 'debattre'],
  'a-venir': ['decouvrir', 'comprendre', 'debattre'],
}

const CHOICE_HINT: Record<Choice, string> = {
  pour: 'Je suis favorable à la proposition.',
  contre: 'Je suis défavorable à la proposition.',
  blanc: 'Je participe, sans choisir entre les deux réponses.',
}

/** Colonne d'arguments. Même gabarit pour les deux positions. */
function Arguments({ choice, title, items }: { choice: 'pour' | 'contre'; title: string; items: Point[] }) {
  const tone = CHOICE_TONE[choice]
  return (
    <section className={cx('flex flex-col gap-3 rounded-2xl border p-4 sm:p-5', tone.soft, tone.border)}>
      <h3 className={cx('flex items-center gap-2 text-[1.05rem] font-bold', tone.ink)}>
        <span aria-hidden="true" className={cx('size-3 rounded-full', tone.fill)} />
        {title}
      </h3>
      <ul className="flex flex-col gap-3">
        {items.map((p) => (
          <li key={p.title}>
            <p className="font-semibold text-ink">{p.title}</p>
            <p className="text-[0.95rem] text-ink2">{p.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function CountingRules({ c }: { c: Consultation }) {
  return (
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
  )
}

export function ConsultationPage({ id }: { id: string }) {
  const s = useStore()
  const c = consultations.find((x) => x.id === id)
  const mine = c ? s.votes[c.id] : undefined
  const [step, setStep] = useState<StepId>(mine ? 'resultats' : 'decouvrir')
  const [pick, setPick] = useState<Choice | null>(null)
  const [editing, setEditing] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [justVoted, setJustVoted] = useState(false)
  const [moved, setMoved] = useState(false)

  // À chaque étape : retour en haut et focus sur son titre (clavier, lecteurs d'écran).
  useEffect(() => {
    if (!moved) return
    window.scrollTo(0, 0)
    document.getElementById('step-title')?.focus({ preventScroll: true })
  }, [step, moved])

  if (!c) return <NotFound what="Cette consultation" />
  const now = new Date()
  const ph = phase(c, now)
  const steps = STEPS_BY_PHASE[ph]
  const index = Math.max(0, steps.indexOf(step))
  const current = steps[index]
  const tally = withVote(c.seed, mine?.choice)
  const followed = s.followed.includes(c.id)
  const voting = !mine || editing
  const related = debates.filter((d) => c.dossierId && d.dossierId === c.dossierId)
  // L'ordre des deux colonnes d'arguments alterne d'une consultation à l'autre.
  const againstFirst = [...c.id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 2 === 1
  const columns = [
    <Arguments key="pour" choice="pour" title="Arguments pour" items={c.argsFor} />,
    <Arguments key="contre" choice="contre" title="Arguments contre" items={c.argsAgainst} />,
  ]

  const go = (to: StepId) => { setMoved(true); setJustVoted(false); setStep(to) }
  const canOpen = (st: StepId) => st !== 'confirmer' || (voting && pick !== null)
  const confirm = () => {
    if (!pick) return
    actions.vote(c.id, pick)
    setEditing(false)
    setPick(null)
    setMoved(true)
    setJustVoted(true)
    setStep('resultats')
  }
  const startEditing = () => { setEditing(true); setPick(null); go('choisir') }

  const next: Partial<Record<StepId, { label: string; to: StepId; disabled?: boolean }>> = {
    decouvrir: { label: 'Lire les arguments', to: 'comprendre' },
    comprendre: ph === 'ouverte' ? (voting ? { label: 'Donner mon avis', to: 'choisir' } : { label: 'Voir les résultats', to: 'resultats' })
      : ph === 'close' ? { label: 'Voir le résultat', to: 'resultats' } : { label: 'Continuer', to: 'debattre' },
    choisir: voting ? { label: 'Continuer', to: 'confirmer', disabled: pick === null } : { label: 'Voir les résultats', to: 'resultats' },
    resultats: { label: 'Poursuivre le débat', to: 'debattre' },
  }
  const cta = next[current]

  return (
    <>
      <PageHeader back={{ href: href('consultations'), label: 'Consultations' }} eyebrow={`Consultation · ${PHASE_LABEL[ph]}`} title={c.question} compact={index > 0}>
        <p className="num text-sm text-ink3">Du {date(c.opensAt)} au {date(c.closesAt)}{ph === 'ouverte' && ` · ${daysLeft(c.closesAt, now)} jours restants`}</p>
      </PageHeader>

      {/* Fil du parcours */}
      <nav aria-label="Étapes de la consultation">
        <ol className="flex gap-1.5">
          {steps.map((st, i) => {
            const active = st === current
            const enabled = canOpen(st)
            return (
              <li key={st} className={cx('min-w-0', active ? 'flex-1' : 'w-11 flex-none lg:w-auto lg:flex-1')}>
                <button type="button" onClick={() => enabled && go(st)} aria-current={active ? 'step' : undefined} aria-disabled={!enabled}
                  className={cx('press flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border px-2 text-sm font-semibold',
                    active ? 'border-accent bg-accent text-white' : i < index ? 'border-transparent bg-soft text-accentink' : 'border-line text-ink2',
                    !enabled && 'cursor-not-allowed opacity-50')}>
                  <span className="num" aria-hidden="true">{i + 1}</span>
                  <span className={cx('truncate', !active && 'sr-only lg:not-sr-only')}>{STEP_LABEL[st]}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <section key={current} aria-labelledby="step-title" className="rise flex flex-col gap-5">
        <h2 id="step-title" tabIndex={-1} className="text-xl font-bold text-ink outline-none">
          <span className="num text-accentink">{index + 1}.</span> {STEP_LABEL[current]}
        </h2>

        {current === 'decouvrir' && (
          <>
            <p className="max-w-[65ch] text-[1.05rem] text-ink">{c.context}</p>
            <div className="flex flex-wrap items-center gap-2">
              {c.themes.map((t) => <Badge key={t} tone="outline">{themeLabel(t)}</Badge>)}
              <DemoTag label="Votes fictifs" />
              <Button tone="ghost" aria-pressed={followed} onClick={() => actions.toggleFollow(c.id)} className="min-h-11 px-3 text-sm">
                {followed ? <BellOff size={16} aria-hidden="true" /> : <Bell size={16} aria-hidden="true" />}
                {followed ? 'Ne plus suivre' : 'Suivre'}
              </Button>
            </div>
            {c.dossierId && <a href={href('dossier', c.dossierId)} className="inline-flex min-h-11 items-center self-start font-semibold text-accentink underline">Lire le dossier complet</a>}
            <Notice title="Comment ça se passe">
              Vous lisez les arguments des deux côtés, puis vous choisissez : pour, contre ou blanc. Votre choix n'est enregistré qu'après confirmation, dans ce navigateur uniquement. Cette consultation est indicative.
            </Notice>
            {ph === 'a-venir' && <Notice title="Vote pas encore ouvert">Cette consultation ouvrira le {date(c.opensAt)}. Suivez-la pour la retrouver dans votre profil.</Notice>}
          </>
        )}

        {current === 'comprendre' && (
          <>
            <div className="grid gap-4 md:grid-cols-2">{againstFirst ? [...columns].reverse() : columns}</div>
            <p className="text-sm text-ink3">Les deux positions sont présentées avec la même place. L'ordre des colonnes alterne d'une consultation à l'autre.</p>
          </>
        )}

        {current === 'choisir' && !voting && mine && (
          <Card className="flex flex-col gap-3">
            <p className="font-semibold text-ink">Vous avez déjà voté : {CHOICE_LABEL[mine.choice]}</p>
            <p className="text-sm text-ink2">Enregistré le {date(mine.at)}, dans ce navigateur uniquement. Vous pouvez le modifier ou le retirer jusqu'à la clôture.</p>
            <div className="flex flex-wrap gap-2">
              <Button tone="secondary" onClick={startEditing}>Modifier mon vote</Button>
              <Button tone="ghost" onClick={() => { actions.withdrawVote(c.id); setRevealed(false) }}>Retirer mon vote</Button>
            </div>
          </Card>
        )}

        {current === 'choisir' && voting && (
          <>
            <fieldset className="grid auto-rows-fr gap-3">
              <legend className="mb-3 text-ink2">Aucun choix n'est sélectionné d'avance. {mine && `Votre vote actuel : ${CHOICE_LABEL[mine.choice]}.`}</legend>
              {CHOICES.map((ch) => {
                const tone = CHOICE_TONE[ch]
                const on = pick === ch
                return (
                  <label key={ch} htmlFor={`vote-${c.id}-${ch}`}
                    className={cx('choice flex min-h-[4.5rem] cursor-pointer items-center gap-4 rounded-2xl border-2 px-4 py-3', on ? cx(tone.border, tone.soft) : 'border-line bg-surface hover:bg-surface2')}>
                    <input id={`vote-${c.id}-${ch}`} type="radio" name={`vote-${c.id}`} value={ch} checked={on} onChange={() => setPick(ch)} className="sr-only" />
                    <span aria-hidden="true" className={cx('grid size-9 shrink-0 place-items-center rounded-full', tone.solid)}>
                      {on && <Check size={20} strokeWidth={3} />}
                    </span>
                    <span>
                      <span className={cx('block text-lg font-bold', on ? tone.ink : 'text-ink')}>{CHOICE_LABEL[ch]}</span>
                      <span className="block text-sm text-ink2">{CHOICE_HINT[ch]}</span>
                    </span>
                  </label>
                )
              })}
            </fieldset>
            <p className="text-sm text-ink3">Le vote blanc est compté comme une participation. S'abstenir, c'est ne pas voter : l'abstention n'apparaît pas dans les résultats.</p>
          </>
        )}

        {current === 'confirmer' && pick && (
          <>
            <Card className="flex flex-col gap-4">
              <p className="text-sm text-ink3">La question</p>
              <p className="-mt-3 font-serif text-xl leading-snug font-medium text-ink">{c.question}</p>
              <p className="text-sm text-ink3">Votre choix</p>
              <p className={cx('-mt-3 flex items-center gap-3 rounded-2xl px-4 py-3.5 text-xl font-bold', CHOICE_TONE[pick].solid)}>
                <Check size={22} strokeWidth={3} aria-hidden="true" /> {CHOICE_LABEL[pick]}
              </p>
            </Card>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[0.95rem] text-ink2">
              <li>Votre vote sera enregistré dans ce navigateur uniquement. Il n'est envoyé à aucun serveur.</li>
              <li>Il ne sera jamais affiché publiquement.</li>
              <li>Vous pourrez le modifier ou le retirer jusqu'à la clôture, le {date(c.closesAt)}.</li>
              <li>Cette consultation est indicative : ce n'est pas un scrutin officiel.</li>
            </ul>
          </>
        )}

        {current === 'resultats' && (
          <>
            <div aria-live="polite">
              {justVoted && mine && (
                <p className="flex items-center gap-3 rounded-2xl bg-surface2 px-4 py-3 font-semibold text-ink">
                  <span className="pop grid size-8 shrink-0 place-items-center rounded-full bg-ink text-bg"><Check size={18} strokeWidth={3} aria-hidden="true" /></span>
                  Vote enregistré : {CHOICE_LABEL[mine.choice]}
                </p>
              )}
            </div>
            {ph === 'ouverte' && !mine && !revealed ? (
              <Card className="flex flex-col items-start gap-3">
                <p className="flex items-center gap-2 font-bold text-ink"><EyeOff size={19} aria-hidden="true" /> Résultats provisoires masqués</p>
                <p className="max-w-[60ch] text-[0.95rem] text-ink2">Voir où en est une consultation avant de voter peut influencer votre réponse. Vous pouvez donner votre avis d'abord, ou afficher les résultats sans voter.</p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => go('choisir')}>Donner mon avis d'abord</Button>
                  <Button tone="secondary" onClick={() => setRevealed(true)}>Afficher les résultats</Button>
                </div>
              </Card>
            ) : (
              <>
                {mine && !justVoted && (
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.95rem] text-ink2">
                    <span>Votre vote : <strong className="text-ink">{CHOICE_LABEL[mine.choice]}</strong>, visible de vous seul.</span>
                    {ph === 'ouverte' && <button type="button" className="min-h-11 font-semibold text-accentink underline" onClick={startEditing}>Modifier</button>}
                    {ph === 'ouverte' && <button type="button" className="min-h-11 font-semibold text-accentink underline" onClick={() => { actions.withdrawVote(c.id); setRevealed(false) }}>Retirer</button>}
                  </p>
                )}
                <Card className="flex flex-col gap-4">
                  <p className="eyebrow text-ink3">{ph === 'close' ? 'Résultat définitif' : 'Résultats provisoires'}</p>
                  <VoteBars tally={tally} />
                  <p className="font-medium text-ink">{OUTCOME_TEXT[outcome(tally, c.rule)]}</p>
                  <p className="num flex flex-wrap items-center gap-2 text-sm text-ink3">{num(total(tally))} participations{mine ? ', dont la vôtre' : ''} <DemoTag label="Votes fictifs" /></p>
                </Card>
                <Section id="c-regles" title="Règles de comptage"><CountingRules c={c} /></Section>
              </>
            )}
          </>
        )}

        {current === 'debattre' && (
          <>
            <p className="max-w-[65ch] text-ink2">Un vote dit où vous en êtes. Un argument explique pourquoi. Poursuivez la discussion ou proposez une autre solution.</p>
            <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
              {related.map((d) => (
                <li key={d.id}><a href={href('debat', d.id)} className="flex flex-col gap-0.5 p-4 hover:bg-surface2"><span className="text-sm text-ink3">Débat</span><span className="font-semibold text-ink">{d.title}</span></a></li>
              ))}
              {related.length === 0 && <li><a href={href('debats')} className="flex flex-col gap-0.5 p-4 hover:bg-surface2"><span className="text-sm text-ink3">Débats</span><span className="font-semibold text-ink">Voir tous les débats ouverts</span></a></li>}
              {c.dossierId && <li><a href={href('dossier', c.dossierId)} className="flex flex-col gap-0.5 p-4 hover:bg-surface2"><span className="text-sm text-ink3">Dossier</span><span className="font-semibold text-ink">Relire les faits et les sources</span></a></li>}
              <li><a href={href('proposer')} className="flex flex-col gap-0.5 p-4 hover:bg-surface2"><span className="text-sm text-ink3">Proposition</span><span className="font-semibold text-ink">Proposer une autre solution</span></a></li>
            </ul>
          </>
        )}
      </section>

      {/* Actions de l'étape : collées au-dessus des onglets sur mobile */}
      <div className="action-bar -mx-4 flex items-center gap-2.5 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
        {index > 0 && current !== 'confirmer' && <Button tone="secondary" onClick={() => go(steps[index - 1] === 'confirmer' ? 'choisir' : steps[index - 1])}><ArrowLeft size={17} aria-hidden="true" /> Retour</Button>}
        {current === 'confirmer' ? (
          <>
            <Button tone="secondary" onClick={() => go('choisir')}><ArrowLeft size={17} aria-hidden="true" /> Modifier</Button>
            <Button className="flex-1" onClick={confirm} disabled={!pick}>Confirmer mon vote</Button>
          </>
        ) : cta ? (
          <Button className="flex-1 lg:flex-none lg:px-8" disabled={cta.disabled} onClick={() => go(cta.to)}>{cta.label} <ArrowRight size={17} aria-hidden="true" /></Button>
        ) : (
          <LinkButton className="flex-1 lg:flex-none lg:px-8" href={href('consultations')}>Toutes les consultations</LinkButton>
        )}
      </div>
    </>
  )
}
