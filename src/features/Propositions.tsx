import { useState, type FormEvent } from 'react'
import { Plus, ThumbsUp } from 'lucide-react'
import { href, navigate } from '../app/router'
import { actions, allProposals, useStore } from '../app/store'
import { LIFECYCLE, LIMITS, statusLabel, validateProposal, type ProposalDraft } from '../domain/proposals'
import type { Proposal } from '../domain/types'
import { ago, Badge, Button, Card, cx, DemoTag, Field, inputClass, LinkButton, NotFound, Notice, num, PageHeader, Section } from '../ui/kit'

export function ProposalList() {
  const s = useStore()
  const list = allProposals(s)
  return (
    <>
      <PageHeader eyebrow="Proposer" title="Propositions citoyennes" intro="Une proposition décrit un problème, une solution, ses bénéfices et aussi ses risques.">
        <div className="flex flex-wrap items-center gap-3">
          <LinkButton href={href('proposer')}><Plus size={17} aria-hidden="true" /> Déposer une proposition</LinkButton>
          <DemoTag label="Exemples fictifs" />
        </div>
      </PageHeader>
      <ul className="flex flex-col gap-3">
        {list.map((p) => (
          <li key={p.id}>
            <a href={href('proposition', p.id)} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4 shadow-card hover:bg-surface2 sm:p-5">
              <span className="flex flex-wrap gap-2"><Badge>{statusLabel(p.status)}</Badge>{!p.demo && <Badge tone="night">La vôtre</Badge>}</span>
              <span className="font-semibold text-ink">{p.title}</span>
              <span className="line-clamp-2 text-sm text-ink2">{p.problem}</span>
              <span className="num text-sm text-ink3">{p.author} · {ago(p.createdAt)} · {num(p.supports)} soutiens</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}

function Lifecycle({ p }: { p: Proposal }) {
  const current = LIFECYCLE.findIndex((x) => x.id === p.status)
  return (
    <ol className="flex flex-col gap-0" aria-label="Étapes de la proposition">
      {LIFECYCLE.map((step, i) => (
        <li key={step.id} className="flex items-stretch gap-3" aria-current={i === current ? 'step' : undefined}>
          <span className="flex flex-col items-center">
            <span className={cx('num grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold', i <= current ? 'bg-accent text-white' : 'border border-line text-ink3')}>{i + 1}</span>
            {i < LIFECYCLE.length - 1 && <span className={cx('w-0.5 flex-1', i < current ? 'bg-accent' : 'bg-line')} />}
          </span>
          <span className={cx('pb-4 text-[0.95rem]', i === current ? 'font-bold text-ink' : i < current ? 'text-ink2' : 'text-ink3')}>
            {step.label}{i === current && <span className="sr-only"> (étape actuelle)</span>}
          </span>
        </li>
      ))}
    </ol>
  )
}

export function ProposalPage({ id }: { id: string }) {
  const s = useStore()
  const p = allProposals(s).find((x) => x.id === id)
  if (!p) return <NotFound what="Cette proposition" />
  const supported = s.supportedProposals.includes(p.id)
  const blocks: [string, string][] = [['Problème identifié', p.problem], ['Solution proposée', p.solution], ['Bénéfices attendus', p.benefits], ['Risques et limites', p.risks], ['Sources', p.sources]]

  return (
    <>
      <PageHeader back={{ href: href('propositions'), label: 'Propositions' }} eyebrow={`Proposition · ${statusLabel(p.status)}`} title={p.title}>
        <p className="text-sm text-ink3">Par {p.author}, {ago(p.createdAt)}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button tone={supported ? 'secondary' : 'primary'} aria-pressed={supported} onClick={() => actions.toggleSupportProposal(p.id)}>
            <ThumbsUp size={16} aria-hidden="true" /> {supported ? 'Soutenue' : 'Soutenir'} · <span className="num">{num(p.supports)}</span>
          </Button>
          {p.demo && <DemoTag label="Exemple fictif" />}
        </div>
      </PageHeader>

      <div className="flex flex-col gap-5">
        {blocks.map(([label, text]) => (
          <section key={label}>
            <h2 className="eyebrow mb-1 text-accentink">{label}</h2>
            <p className="max-w-[65ch] whitespace-pre-line text-ink">{text || <span className="text-ink3">Non renseigné.</span>}</p>
          </section>
        ))}
      </div>

      <Section id="p-etapes" title="Où en est cette proposition">
        <Card className="shadow-none"><Lifecycle p={p} /></Card>
        <p className="text-sm text-ink3">Ces étapes décrivent le parcours d'une proposition dans AGORA. Aucune ne correspond à une décision publique officielle.</p>
      </Section>
    </>
  )
}

const FIELDS: { key: keyof ProposalDraft; label: string; hint: string; rows: number }[] = [
  { key: 'title', label: 'Titre', hint: 'Une phrase qui résume la proposition.', rows: 1 },
  { key: 'problem', label: 'Problème identifié', hint: 'Quelle situation voulez-vous changer, et pour qui ?', rows: 4 },
  { key: 'solution', label: 'Solution proposée', hint: 'Que faudrait-il faire concrètement ?', rows: 4 },
  { key: 'benefits', label: 'Bénéfices attendus (facultatif)', hint: 'Ce que la solution améliorerait.', rows: 3 },
  { key: 'risks', label: 'Risques et limites', hint: 'Coûts, effets indésirables, objections probables. Ce champ est obligatoire.', rows: 3 },
  { key: 'sources', label: 'Sources (facultatif)', hint: 'Liens ou références qui appuient votre constat.', rows: 2 },
]

export function ProposalForm() {
  const [draft, setDraft] = useState<ProposalDraft>({ title: '', problem: '', solution: '', benefits: '', risks: '', sources: '' })
  const [errors, setErrors] = useState<ReturnType<typeof validateProposal>>({})

  function submit(e: FormEvent) {
    e.preventDefault()
    const errs = validateProposal(draft)
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) {
      document.getElementById(`prop-${first}`)?.focus()
      return
    }
    navigate(href('proposition', actions.submitProposal(draft)))
  }

  return (
    <>
      <PageHeader back={{ href: href('propositions'), label: 'Propositions' }} eyebrow="Proposer" title="Déposer une proposition" intro="Prenez le temps de décrire aussi les limites de votre idée : une proposition qui nomme ses risques est plus facile à discuter." />
      <Notice title="Prototype">Votre proposition est enregistrée dans ce navigateur uniquement. Personne d'autre ne la verra. N'y inscrivez aucune donnée personnelle.</Notice>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {FIELDS.map((f) => {
          const id = `prop-${f.key}`
          const common = {
            id, value: draft[f.key], className: inputClass, 'aria-invalid': !!errors[f.key],
            'aria-describedby': `${id}-hint${errors[f.key] ? ` ${id}-error` : ''}`,
            onChange: (e: { target: { value: string } }) => setDraft({ ...draft, [f.key]: e.target.value }),
          }
          return (
            <Field key={f.key} id={id} label={f.label} hint={f.hint} error={errors[f.key]}>
              {f.rows === 1 ? <input type="text" {...common} /> : <textarea rows={f.rows} {...common} />}
              <p className="num -mt-0.5 self-end text-xs text-ink3">{draft[f.key].trim().length} / {LIMITS[f.key][1]}</p>
            </Field>
          )
        })}
        <div className="flex flex-wrap gap-2">
          <Button type="submit">Publier la proposition</Button>
          <LinkButton tone="ghost" href={href('propositions')}>Annuler</LinkButton>
        </div>
      </form>
    </>
  )
}
