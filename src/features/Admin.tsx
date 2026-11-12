import { useState } from 'react'
import { actions, allArguments, allProposals, useStore } from '../app/store'
import { consultations, dossiers } from '../data/demo'
import { nextStatus, statusLabel } from '../domain/proposals'
import { phase } from '../domain/tally'
import { Badge, Button, Card, date, Empty, inputClass, Notice, PageHeader, Section } from '../ui/kit'

export function Admin() {
  const s = useStore()
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const args = allArguments(s)
  const pending = s.reports.filter((r) => !r.resolved)
  const appeals = Object.entries(s.moderation).filter(([, m]) => m.appeal)
  const now = new Date()

  return (
    <>
      <PageHeader eyebrow="Administration" title="Espace d'administration" intro="Modération, suivi des contenus et journal des opérations sensibles." />

      <Notice title="Démonstration sans contrôle d'accès" tone="alert">
        Dans ce prototype, n'importe qui peut activer ce mode, et ses effets restent dans ce navigateur. Dans la version connectée, chaque action sera autorisée et journalisée par le serveur.
      </Notice>

      {!s.adminMode ? (
        <Button className="self-start" onClick={() => actions.setAdminMode(true)}>Activer le mode administration (démo)</Button>
      ) : (
        <>
          <Button tone="secondary" className="self-start" onClick={() => actions.setAdminMode(false)}>Quitter le mode administration</Button>

          <Section id="ad-signal" title={`Signalements à traiter (${pending.length})`}>
            {pending.length ? pending.map((r) => {
              const a = args.find((x) => x.id === r.argumentId)
              const reason = reasons[r.id] ?? r.reason
              return (
                <Card key={r.id} className="flex flex-col gap-3 shadow-none">
                  <p className="text-sm text-ink3">Signalé le {date(r.createdAt)} · Motif : {r.reason}</p>
                  <blockquote className="border-l-2 border-line pl-3 text-ink">{a ? <>{a.text} <span className="text-sm text-ink3">— {a.author}</span></> : 'Argument introuvable.'}</blockquote>
                  <label htmlFor={`motif-${r.id}`} className="text-sm font-semibold text-ink">Motif de la décision (affiché publiquement)</label>
                  <input id={`motif-${r.id}`} className={inputClass} value={reason} onChange={(e) => setReasons({ ...reasons, [r.id]: e.target.value })} />
                  <div className="flex flex-wrap gap-2">
                    <Button tone="danger" disabled={!reason.trim()} onClick={() => actions.resolveReport(r.id, true, reason.trim())}>Masquer l'argument</Button>
                    <Button tone="secondary" disabled={!reason.trim()} onClick={() => actions.resolveReport(r.id, false, reason.trim())}>Maintenir en ligne</Button>
                  </div>
                </Card>
              )
            }) : <Empty>Aucun signalement en attente. Pour essayer : ouvrez un débat et signalez un argument.</Empty>}
          </Section>

          <Section id="ad-appel" title={`Contestations (${appeals.length})`}>
            {appeals.length ? appeals.map(([id, m]) => (
              <Card key={id} className="flex flex-col gap-2 shadow-none">
                <p className="text-sm text-ink3">Masqué pour : {m.reason}</p>
                <p className="text-ink">« {m.appeal} »</p>
                <Button tone="secondary" className="self-start" onClick={() => actions.restoreArgument(id)}>Rétablir l'argument</Button>
              </Card>
            )) : <Empty>Aucune contestation.</Empty>}
          </Section>

          <Section id="ad-props" title="Propositions">
            <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
              {allProposals(s).map((p) => {
                const next = nextStatus(p.status)
                return (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                    <span className="min-w-0"><span className="block font-semibold text-ink">{p.title}</span><span className="text-sm text-ink3">{statusLabel(p.status)}</span></span>
                    {next && <Button tone="secondary" className="min-h-10 text-sm" onClick={() => actions.advanceProposal(p)}>Passer à « {statusLabel(next)} »</Button>}
                  </li>
                )
              })}
            </ul>
          </Section>

          <Section id="ad-contenus" title="Contenus éditoriaux">
            <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
              {dossiers.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <span className="font-semibold text-ink">Dossier · {d.title}</span>
                  <Badge tone={d.editorial === 'valide' ? 'soft' : 'sand'}>{d.editorial === 'valide' ? 'Validé' : 'À relire (brouillon IA)'}</Badge>
                </li>
              ))}
              {consultations.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <span className="font-semibold text-ink">Consultation · {c.title}</span>
                  <Badge tone="outline">{{ 'a-venir': 'À venir', ouverte: 'Ouverte', close: 'Close' }[phase(c, now)]}</Badge>
                </li>
              ))}
            </ul>
            <p className="text-sm text-ink3">La création et la publication de dossiers et de consultations arriveront avec la version connectée.</p>
          </Section>

          <Section id="ad-journal" title="Journal des opérations">
            {s.journal.length ? (
              <ol className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface text-sm">
                {s.journal.map((l, i) => (
                  <li key={i} className="p-3"><span className="font-semibold text-ink">{l.action}</span> <span className="text-ink2">{l.detail}</span><span className="num block text-ink3">{new Date(l.at).toLocaleString('fr-FR')}</span></li>
                ))}
              </ol>
            ) : <Empty>Aucune opération enregistrée.</Empty>}
          </Section>
        </>
      )}
    </>
  )
}
