import { useState } from 'react'
import { ExternalLink, PenLine } from 'lucide-react'
import { href } from '../app/router'
import { consultations, debates, dossiers, upcomingDossiers } from '../data/demo'
import { phase } from '../domain/tally'
import type { Dossier, Point } from '../domain/types'
import { EditorialImage } from '../ui/brand'
import { Badge, Card, cx, date, Empty, NotFound, Notice, PageHeader, Section } from '../ui/kit'

export function DossierList() {
  return (
    <>
      <PageHeader eyebrow="S'informer" title="Dossiers" intro="Chaque dossier réunit les faits établis, les enjeux, des points de vue contradictoires et les sources pour vérifier." />
      <ul className="grid gap-4 md:grid-cols-2">
        {dossiers.map((d) => (
          <li key={d.id}>
            <a href={href('dossier', d.id)} className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card hover:bg-surface2">
              <span className="relative block">
                <EditorialImage photo={d.photo} className="h-40 w-full" />
                <span className="absolute bottom-2.5 left-2.5 rounded-md bg-white px-2 py-0.5 text-[0.68rem] font-bold tracking-wider text-[#0f1b3d] uppercase">{d.theme}</span>
              </span>
              <span className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                <h2 className="font-serif text-2xl leading-tight font-medium text-ink">{d.title}</h2>
                <span className="text-sm text-ink2">{d.summary}</span>
                <span className="mt-auto pt-1 text-sm text-ink3">{d.facts.length} faits sourcés · {d.sources.length} sources · mis à jour le {date(d.updatedAt)}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <Section id="d-avenir" title="Thèmes en préparation">
        <ul className="flex flex-wrap gap-2">
          {upcomingDossiers.map((t) => <li key={t}><Badge tone="outline">{t}</Badge></li>)}
        </ul>
        <p className="text-sm text-ink3">Ces dossiers n'ont pas encore de contenu. Ils seront publiés après rédaction et relecture.</p>
      </Section>
    </>
  )
}

const TABS = [
  { id: 'synthese', label: 'Synthèse' },
  { id: 'arguments', label: 'Arguments' },
  { id: 'sources', label: 'Sources' },
] as const
type TabId = (typeof TABS)[number]['id']

function Points({ items }: { items: Point[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((p) => (
        <li key={p.title}>
          <p className="font-semibold text-ink">{p.title}</p>
          <p className="text-[0.95rem] text-ink2">{p.text}</p>
        </li>
      ))}
    </ul>
  )
}

export function DossierPage({ id }: { id: string }) {
  const d = dossiers.find((x) => x.id === id)
  const [tab, setTab] = useState<TabId>('synthese')
  if (!d) return <NotFound what="Ce dossier" />
  const linkedConsultations = consultations.filter((c) => c.dossierId === d.id)
  const linkedDebates = debates.filter((x) => x.dossierId === d.id)
  const now = new Date()

  return (
    <>
      <PageHeader back={{ href: href('dossiers'), label: 'Dossiers' }} eyebrow={d.theme} title={d.title} intro={d.summary}>
        <p className="text-sm text-ink3">Mis à jour le {date(d.updatedAt)}</p>
      </PageHeader>

      <EditorialImage photo={d.photo} className="h-40 w-full rounded-2xl sm:h-56" />

      {d.editorial === 'brouillon-ia' && (
        <Notice title="Contenu en attente de relecture">
          <span className="inline-flex items-start gap-2">
            <PenLine size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            Ce dossier a été rédigé avec l'assistance d'une IA. Chaque fait renvoie à une source publique, mais aucun relecteur humain ne l'a encore validé. Vérifiez les sources avant de le citer.
          </span>
        </Notice>
      )}

      <div role="tablist" aria-label="Parties du dossier" className="-mx-1 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button key={t.id} role="tab" type="button" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} onClick={() => setTab(t.id)}
            className={cx('min-h-11 border-b-2 px-3 text-[0.95rem] font-semibold', tab === t.id ? 'border-accent text-accentink' : 'border-transparent text-ink3')}>
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="flex flex-col gap-7">
        {tab === 'synthese' && <Synthese d={d} />}
        {tab === 'arguments' && (
          <>
            <Section id="s-pdv" title="Points de vue en présence">
              <p className="-mt-2 text-sm text-ink3">Présentés sans ordre de préférence. AGORA n'en défend aucun.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {d.viewpoints.map((v) => (
                  <Card key={v.title} className="shadow-none">
                    <h3 className="font-semibold text-ink">{v.title}</h3>
                    <p className="mt-1 text-[0.95rem] text-ink2">{v.text}</p>
                  </Card>
                ))}
              </div>
            </Section>
            <div className="grid gap-6 sm:grid-cols-2">
              <Section id="s-pour" title="Arguments favorables"><Points items={d.argsFor} /></Section>
              <Section id="s-contre" title="Arguments défavorables"><Points items={d.argsAgainst} /></Section>
            </div>
            <Section id="s-experts" title="Analyses d'experts">
              {d.expertAnalyses.length ? <Points items={d.expertAnalyses} /> : (
                <Empty>Aucune analyse publiée pour l'instant. AGORA ne publie que des analyses réelles, signées et attribuées.</Empty>
              )}
            </Section>
          </>
        )}
        {tab === 'sources' && (
          <Section id="s-sources" title="Sources consultables">
            <ol className="flex flex-col gap-2.5">
              {d.sources.map((s, i) => (
                <li key={s.id} id={`source-${s.id}`}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 hover:bg-surface2">
                    <span className="num grid size-7 shrink-0 place-items-center rounded-full bg-soft text-sm font-bold text-accentink">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">{s.title}</span>
                      <span className="block text-sm text-ink3">{s.publisher}</span>
                    </span>
                    <ExternalLink size={16} className="mt-1 shrink-0 text-ink3" aria-label="Ouvre un site externe" />
                  </a>
                </li>
              ))}
            </ol>
            <p className="text-sm text-ink3">Les liens mènent aux sites des institutions citées. Leur exactitude reste à confirmer lors de la relecture.</p>
          </Section>
        )}
      </div>

      <Section id="s-agir" title="Pour aller plus loin">
        <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
          {linkedConsultations.map((c) => (
            <li key={c.id}>
              <a href={href('consultation', c.id)} className="flex flex-col gap-0.5 p-4 hover:bg-surface2">
                <span className="text-sm text-ink3">Consultation {{ 'a-venir': 'à venir', ouverte: 'ouverte', close: 'close' }[phase(c, now)]}</span>
                <span className="font-semibold text-ink">{c.question}</span>
              </a>
            </li>
          ))}
          {linkedDebates.map((x) => (
            <li key={x.id}>
              <a href={href('debat', x.id)} className="flex flex-col gap-0.5 p-4 hover:bg-surface2">
                <span className="text-sm text-ink3">Débat</span>
                <span className="font-semibold text-ink">{x.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}

function Synthese({ d }: { d: Dossier }) {
  const index = (sid: string) => d.sources.findIndex((s) => s.id === sid) + 1
  return (
    <>
      <Section id="s-faits" title="Les faits établis">
        <ol className="flex flex-col gap-3">
          {d.facts.map((f, i) => (
            <li key={i} className="border-l-2 border-lav pl-3.5 text-[0.97rem] text-ink">
              {f.text}{' '}
              <span className="text-sm whitespace-nowrap text-ink3">
                Source{f.sourceIds.length > 1 ? 's' : ''} {f.sourceIds.map(index).join(', ')}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-ink3">Les numéros renvoient à l'onglet Sources.</p>
      </Section>
      <Section id="s-enjeux" title="Les principaux enjeux">
        <Points items={d.issues} />
      </Section>
    </>
  )
}
