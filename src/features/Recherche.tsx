import { useState } from 'react'
import { Search } from 'lucide-react'
import { href } from '../app/router'
import { allProposals, useStore } from '../app/store'
import { consultations, debates, dossiers } from '../data/demo'
import { search, type ResultKind, type Searchable } from '../domain/search'
import { Badge, Empty, inputClass, PageHeader } from '../ui/kit'

const KIND: Record<ResultKind, string> = { dossier: 'Dossier', consultation: 'Consultation', debat: 'Débat', proposition: 'Proposition' }
const SUGGESTIONS = ['référendum', 'tirage au sort', 'vote blanc', 'pétition']

// Conserve la dernière recherche quand on revient d'un résultat.
let lastQuery = ''

export function Recherche() {
  const s = useStore()
  const [q, setQ] = useState(lastQuery)
  lastQuery = q

  const index: Searchable[] = [
    ...dossiers.map((d) => ({ kind: 'dossier' as const, id: d.id, title: d.title, body: [d.summary, d.theme, ...d.facts.map((f) => f.text), ...d.issues.map((i) => i.title)].join(' ') })),
    ...consultations.map((c) => ({ kind: 'consultation' as const, id: c.id, title: c.question, body: `${c.title} ${c.context}` })),
    ...debates.map((d) => ({ kind: 'debat' as const, id: d.id, title: d.title, body: d.prompt })),
    ...allProposals(s).map((p) => ({ kind: 'proposition' as const, id: p.id, title: p.title, body: `${p.problem} ${p.solution}` })),
  ]
  const results = search(q, index)
  const typed = q.trim().length >= 2

  return (
    <>
      <PageHeader eyebrow="Rechercher" title="Recherche" intro="Dossiers, consultations, débats et propositions." />
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <label htmlFor="q" className="sr-only">Rechercher dans AGORA</label>
        <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink3" aria-hidden="true" />
        <input id="q" type="search" enterKeyHint="search" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} className={`${inputClass} min-h-12 pl-10`} placeholder="Un sujet, une idée…" />
      </form>

      {!typed && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-ink3">Essayez par exemple :</p>
          <ul className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((x) => (
              <li key={x}><button type="button" onClick={() => setQ(x)} className="min-h-10 rounded-full border border-line px-3.5 text-sm font-semibold text-ink2 hover:bg-surface2">{x}</button></li>
            ))}
          </ul>
        </div>
      )}

      <div aria-live="polite" className="flex flex-col gap-3">
        {typed && <p className="text-sm text-ink3">{results.length === 0 ? 'Aucun résultat' : results.length === 1 ? '1 résultat' : `${results.length} résultats`}</p>}
        {typed && results.length === 0 && <Empty>Rien ne correspond à « {q.trim()} ». Vérifiez l'orthographe ou essayez un mot plus général.</Empty>}
        {results.length > 0 && (
          <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
            {results.map((r) => (
              <li key={`${r.kind}-${r.id}`}>
                <a href={href(r.kind, r.id)} className="flex flex-col items-start gap-1.5 p-4 hover:bg-surface2">
                  <Badge tone="outline">{KIND[r.kind]}</Badge>
                  <span className="font-semibold text-ink">{r.title}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
