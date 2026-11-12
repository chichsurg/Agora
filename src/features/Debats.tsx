import { useState, type FormEvent } from 'react'
import { CornerDownRight, Flag, Link2, ThumbsUp } from 'lucide-react'
import { href } from '../app/router'
import { actions, allArguments, useStore } from '../app/store'
import { debates } from '../data/demo'
import { safeUrl, validateArgument } from '../domain/proposals'
import type { Argument, Stance } from '../domain/types'
import { EditorialImage } from '../ui/brand'
import { ago, Button, Card, cx, DemoTag, Empty, Field, inputClass, NotFound, Notice, PageHeader, Section } from '../ui/kit'

const STANCE: Record<Stance, string> = { pour: 'Pour', contre: 'Contre', nuance: 'Nuance' }
// Même gabarit pour les trois positions ; « Nuance » reste neutre.
const STANCE_TONE: Record<Stance, { chip: string; on: string; dot: string }> = {
  pour: { chip: 'bg-poursoft text-pourink', on: 'border-pour bg-poursoft text-pourink', dot: 'bg-pour' },
  contre: { chip: 'bg-contresoft text-contreink', on: 'border-contre bg-contresoft text-contreink', dot: 'bg-contre' },
  nuance: { chip: 'bg-blancsoft text-blancink', on: 'border-blancedge bg-blancsoft text-blancink', dot: 'bg-blanc ring-1 ring-inset ring-blancedge' },
}
const REASONS = ['Attaque personnelle ou injure', 'Information manifestement fausse', 'Hors sujet ou publicité', 'Autre']

export function DebateList() {
  const s = useStore()
  const args = allArguments(s)
  return (
    <>
      <PageHeader eyebrow="Débattre" title="Débats citoyens" intro="Un débat avance quand les arguments se répondent. Chaque intervention indique sa position : pour, contre ou nuance.">
        <div><DemoTag label="Participants fictifs" /></div>
      </PageHeader>
      <ul className="grid gap-4 md:grid-cols-2">
        {debates.map((d) => {
          const list = args.filter((a) => a.debateId === d.id)
          const count = (st: Stance) => list.filter((a) => a.stance === st).length
          return (
            <li key={d.id}>
              <a href={href('debat', d.id)} className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card hover:bg-surface2">
                <EditorialImage photo={d.photo} className="h-32 w-full" position="50% 30%" />
                <span className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                  <span className="font-serif text-xl leading-snug font-medium text-ink">{d.title}</span>
                  <span className="text-sm text-ink2">{d.prompt}</span>
                  <span className="num mt-auto pt-1 text-sm text-ink3">{count('pour')} pour · {count('contre')} contre · {count('nuance')} en nuance</span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
      <Notice>Les règles de modération sont publiques, et toute décision peut être contestée. <a className="font-semibold text-accentink underline" href={href('regles')}>Lire les règles</a></Notice>
    </>
  )
}

function Composer({ debateId, parentId, onDone }: { debateId: string; parentId?: string; onDone?: () => void }) {
  const [stance, setStance] = useState<Stance>('nuance')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [urlError, setUrlError] = useState<string | null>(null)
  const fid = `arg-${parentId ?? debateId}`

  function submit(e: FormEvent) {
    e.preventDefault()
    const err = validateArgument(text)
    const clean = url.trim() ? safeUrl(url) : undefined
    const uerr = clean === null ? 'Ce lien n’est pas valide. Collez une adresse complète commençant par https://' : null
    setError(err)
    setUrlError(uerr)
    if (err || uerr) return
    actions.postArgument(debateId, stance, text, clean ?? undefined, parentId)
    setText('')
    setUrl('')
    onDone?.()
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold text-ink">Votre position</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STANCE) as Stance[]).map((st) => (
            <label key={st} htmlFor={`${fid}-${st}`} className={cx('choice flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold', stance === st ? STANCE_TONE[st].on : 'border-line text-ink2')}>
              <input id={`${fid}-${st}`} type="radio" name={`${fid}-stance`} className="sr-only" checked={stance === st} onChange={() => setStance(st)} />
              <span aria-hidden="true" className={cx('size-2.5 rounded-full', STANCE_TONE[st].dot)} />
              {STANCE[st]}
            </label>
          ))}
        </div>
      </fieldset>
      <Field id={`${fid}-text`} label={parentId ? 'Votre réponse' : 'Votre argument'} error={error ?? undefined}>
        <textarea id={`${fid}-text`} rows={4} value={text} onChange={(e) => setText(e.target.value)} className={inputClass}
          placeholder="Expliquez votre raisonnement. Critiquez les idées, pas les personnes." aria-invalid={!!error} aria-describedby={error ? `${fid}-text-error` : undefined} />
      </Field>
      <Field id={`${fid}-url`} label="Source (facultatif)" error={urlError ?? undefined}>
        <input id={`${fid}-url`} type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} placeholder="https://…" aria-invalid={!!urlError} />
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit">Publier</Button>
        {onDone && <Button tone="ghost" onClick={onDone}>Annuler</Button>}
        <p className="text-sm text-ink3">Publié dans ce navigateur uniquement (prototype).</p>
      </div>
    </form>
  )
}

function ArgumentItem({ a, replies, depth = 0 }: { a: Argument; replies: Argument[]; depth?: number }) {
  const s = useStore()
  const [mode, setMode] = useState<null | 'reply' | 'report' | 'appeal'>(null)
  const [appealText, setAppealText] = useState('')
  const mod = s.moderation[a.id]
  const supported = s.supportedArguments.includes(a.id)
  const reported = s.reports.some((r) => r.argumentId === a.id)

  return (
    <li className={cx('flex flex-col gap-3', depth > 0 && 'ml-4 border-l border-line pl-4')}>
      <article className="flex flex-col gap-2">
        <header className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {depth > 0 && <CornerDownRight size={14} className="text-ink3" aria-hidden="true" />}
          <span className="font-semibold text-ink">{a.author}</span>
          <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold', STANCE_TONE[a.stance].chip)}><span aria-hidden="true" className={cx('size-2 rounded-full', STANCE_TONE[a.stance].dot)} />{STANCE[a.stance]}</span>
          <span className="text-ink3">{ago(a.createdAt)}</span>
        </header>

        {mod?.hidden ? (
          <div className="rounded-xl bg-surface2 px-4 py-3 text-sm text-ink2">
            <p><span className="font-semibold text-ink">Masqué par la modération.</span> Motif : {mod.reason}</p>
            {mod.appeal ? (
              <p className="mt-1">Contestation déposée, en attente d'examen.</p>
            ) : mode === 'appeal' ? (
              <form className="mt-2 flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); if (appealText.trim().length >= 10) { actions.appeal(a.id, appealText); setMode(null) } }}>
                <label htmlFor={`appeal-${a.id}`} className="font-semibold text-ink">Pourquoi contestez-vous cette décision ?</label>
                <textarea id={`appeal-${a.id}`} rows={2} className={inputClass} value={appealText} onChange={(e) => setAppealText(e.target.value)} />
                <div className="flex gap-2"><Button type="submit" disabled={appealText.trim().length < 10}>Envoyer</Button><Button tone="ghost" onClick={() => setMode(null)}>Annuler</Button></div>
              </form>
            ) : (
              <Button tone="ghost" className="mt-1 min-h-9 px-2 text-sm" onClick={() => setMode('appeal')}>Contester cette décision</Button>
            )}
          </div>
        ) : (
          <>
            <p className="max-w-[65ch] text-[0.97rem] whitespace-pre-line text-ink">{a.text}</p>
            {a.sourceUrl && (
              <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer nofollow ugc" className="inline-flex items-center gap-1.5 self-start text-sm font-medium break-all text-accentink underline">
                <Link2 size={14} aria-hidden="true" /> Source citée : {new URL(a.sourceUrl).hostname}
              </a>
            )}
            <div className="-ml-2 flex flex-wrap items-center gap-1">
              <Button tone="ghost" aria-pressed={supported} onClick={() => actions.toggleSupportArgument(a.id)} className={cx('min-h-11 px-2 text-sm', supported && 'bg-soft')}>
                <ThumbsUp size={15} aria-hidden="true" /> <span className="num">{a.supports}</span> <span className="sr-only">soutiens.</span> {supported ? 'Soutenu' : 'Soutenir'}
              </Button>
              {depth === 0 && <Button tone="ghost" className="min-h-11 px-2 text-sm" onClick={() => setMode(mode === 'reply' ? null : 'reply')}>Répondre</Button>}
              <Button tone="ghost" className="min-h-11 px-2 text-sm text-ink3" disabled={reported} onClick={() => setMode(mode === 'report' ? null : 'report')}>
                <Flag size={14} aria-hidden="true" /> {reported ? 'Signalé' : 'Signaler'}
              </Button>
            </div>
          </>
        )}

        {mode === 'report' && (
          <div className="flex flex-col gap-2 rounded-xl bg-surface2 p-3">
            <p className="text-sm font-semibold text-ink">Pourquoi signalez-vous cet argument ?</p>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => <Button key={r} tone="secondary" className="min-h-10 text-sm" onClick={() => { actions.report(a.id, r); setMode(null) }}>{r}</Button>)}
            </div>
            <p className="text-sm text-ink3">Un signalement est examiné par la modération. Il ne masque pas l'argument automatiquement.</p>
          </div>
        )}
        {mode === 'reply' && <Card className="shadow-none"><Composer debateId={a.debateId} parentId={a.id} onDone={() => setMode(null)} /></Card>}
      </article>

      {replies.length > 0 && (
        <ul className="flex flex-col gap-4">
          {replies.map((r) => <ArgumentItem key={r.id} a={r} replies={[]} depth={1} />)}
        </ul>
      )}
    </li>
  )
}

const SORTS = [
  { id: 'recents', label: 'Récents' },
  { id: 'soutenus', label: 'Les plus soutenus' },
  { id: 'sources', label: 'Avec source' },
] as const
type SortId = (typeof SORTS)[number]['id']

export function DebatePage({ id }: { id: string }) {
  const s = useStore()
  const d = debates.find((x) => x.id === id)
  const [sort, setSort] = useState<SortId>('recents')
  const [stance, setStance] = useState<Stance | 'tous'>('tous')
  if (!d) return <NotFound what="Ce débat" />

  const all = allArguments(s).filter((a) => a.debateId === d.id)
  let roots = all.filter((a) => !a.parentId && (stance === 'tous' || a.stance === stance))
  if (sort === 'sources') roots = roots.filter((a) => a.sourceUrl)
  roots = [...roots].sort((a, b) => (sort === 'soutenus' ? b.supports - a.supports : Date.parse(b.createdAt) - Date.parse(a.createdAt)))
  const chip = (active: boolean) => cx('min-h-10 rounded-full border px-3.5 text-sm font-semibold', active ? 'border-accent bg-soft text-accentink' : 'border-line text-ink2')

  return (
    <>
      <PageHeader back={{ href: href('debats'), label: 'Débats' }} eyebrow="Débat" title={d.title} intro={d.prompt}>
        <div className="flex flex-wrap gap-2">
          <DemoTag label="Participants fictifs" />
          {d.dossierId && <a href={href('dossier', d.dossierId)} className="text-sm font-semibold text-accentink underline">Lire le dossier</a>}
        </div>
      </PageHeader>

      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par position">
          {(['tous', 'pour', 'contre', 'nuance'] as const).map((st) => (
            <button key={st} type="button" aria-pressed={stance === st} onClick={() => setStance(st)} className={st === 'tous' || stance !== st ? chip(stance === st) : cx('min-h-10 rounded-full border-2 px-3.5 text-sm font-semibold', STANCE_TONE[st].on)}>{st === 'tous' ? 'Toutes les positions' : STANCE[st]}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Classer">
          {SORTS.map((o) => <button key={o.id} type="button" aria-pressed={sort === o.id} onClick={() => setSort(o.id)} className={chip(sort === o.id)}>{o.label}</button>)}
        </div>
        <p className="text-sm text-ink3">Le nombre de soutiens mesure l'adhésion à un argument, pas son exactitude.</p>
      </div>

      {roots.length ? (
        <ul className="flex flex-col gap-4">
          {roots.map((a) => (
            <Card as="li" key={a.id} className="list-none">
              <ul><ArgumentItem a={a} replies={all.filter((r) => r.parentId === a.id).sort((x, y) => Date.parse(x.createdAt) - Date.parse(y.createdAt))} /></ul>
            </Card>
          ))}
        </ul>
      ) : <Empty>Aucun argument ne correspond à ces filtres.</Empty>}

      <Section id="d-publier" title="Ajouter un argument">
        <Card><Composer debateId={d.id} /></Card>
      </Section>
    </>
  )
}
