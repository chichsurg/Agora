import { useState } from 'react'
import { href } from '../app/router'
import { actions, useStore } from '../app/store'
import { consultations, debates } from '../data/demo'
import { AGES, FREQUENCIES, SITUATIONS, themeLabel } from '../domain/preferences'
import { Button, Card, CHOICE_LABEL, cx, Empty, Field, inputClass, LinkButton, Notice, PageHeader, Section } from '../ui/kit'

const THEMES = [
  { id: 'system', label: 'Automatique' },
  { id: 'light', label: 'Clair' },
  { id: 'dark', label: 'Sombre' },
] as const

export function Profil() {
  const s = useStore()
  const [confirming, setConfirming] = useState(false)
  const [erasingPrefs, setErasingPrefs] = useState(false)
  const p = s.prefs
  const answered = p.status === 'termine'
  const [showExport, setShowExport] = useState(false)
  const [copied, setCopied] = useState(false)
  const exported = JSON.stringify(s, null, 2)
  const voted = consultations.filter((c) => s.votes[c.id])
  const followed = consultations.filter((c) => s.followed.includes(c.id))

  async function copy() {
    try {
      await navigator.clipboard.writeText(exported)
      setCopied(true)
    } catch {
      (document.getElementById('export-data') as HTMLTextAreaElement | null)?.select()
    }
  }

  return (
    <>
      <PageHeader eyebrow="Profil" title="Votre espace" intro="Aucun compte n'est nécessaire pour lire AGORA. Ce que vous faites ici reste dans ce navigateur." />

      <Section id="pf-id" title="Pseudonyme">
        <Field id="pseudo" label="Nom affiché avec vos contributions" hint="Facultatif. Évitez votre vrai nom. 30 caractères au maximum.">
          <input id="pseudo" type="text" autoComplete="off" maxLength={30} value={s.pseudonym} onChange={(e) => actions.setPseudonym(e.target.value)} className={inputClass} placeholder="Vous (anonyme)" aria-describedby="pseudo-hint" />
        </Field>
      </Section>

      <Section id="pf-prefs" title="Mes préférences">
        {answered ? (
          <dl className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
            {([
              ['Thèmes suivis', p.themes.length ? p.themes.map(themeLabel).join(', ') : 'Aucun'],
              ['Rythme de découverte', FREQUENCIES.find((f) => f.id === p.frequency)?.label ?? 'Non précisé'],
              ['Situation', SITUATIONS.find((x) => x.id === p.situation)?.label ?? 'Non précisée'],
              ['Tranche d’âge', AGES.find((x) => x.id === p.age)?.label ?? 'Non précisée'],
            ] as const).map(([label, value]) => (
              <div key={label} className="p-4"><dt className="text-sm text-ink3">{label}</dt><dd className="font-semibold text-ink">{value}</dd></div>
            ))}
          </dl>
        ) : <Empty>Vous n'avez enregistré aucune préférence. AGORA vous présente toutes les consultations de la même façon.</Empty>}
        <p className="text-sm text-ink3">
          Ces réponses composent votre espace « Pour vous » à partir des thèmes choisis. Elles restent sur cet appareil, à part de vos votes, et vos votes ne servent jamais aux recommandations. AGORA n'envoie aucune notification.
        </p>
        <div className="flex flex-wrap gap-2">
          <LinkButton tone="secondary" href={href('bienvenue')}>{answered ? 'Modifier mes préférences' : 'Répondre au questionnaire'}</LinkButton>
          {answered && !erasingPrefs && <Button tone="danger" onClick={() => setErasingPrefs(true)}>Effacer mes préférences</Button>}
        </div>
        {erasingPrefs && (
          <Card className="flex flex-col gap-3 border-alert shadow-none" role="alertdialog" aria-labelledby="erase-prefs-title">
            <p id="erase-prefs-title" className="font-semibold text-ink">Effacer vos thèmes, votre rythme, votre situation et votre tranche d'âge ?</p>
            <p className="text-sm text-ink2">Vos votes et vos contributions ne sont pas concernés.</p>
            <div className="flex flex-wrap gap-2">
              <Button tone="danger" onClick={() => { actions.erasePreferences(); setErasingPrefs(false) }}>Oui, effacer mes préférences</Button>
              <Button tone="ghost" onClick={() => setErasingPrefs(false)}>Annuler</Button>
            </div>
          </Card>
        )}
      </Section>

      <Section id="pf-theme" title="Affichage">
        <div role="radiogroup" aria-label="Thème" className="grid grid-cols-3 gap-1 rounded-xl bg-surface2 p-1">
          {THEMES.map((t) => (
            <button key={t.id} type="button" role="radio" aria-checked={s.theme === t.id} onClick={() => actions.setTheme(t.id)}
              className={cx('min-h-11 rounded-lg text-sm font-semibold', s.theme === t.id ? 'bg-surface text-ink shadow-card' : 'text-ink2')}>
              {t.label}
            </button>
          ))}
        </div>
      </Section>

      <Section id="pf-votes" title="Vos participations">
        {voted.length ? (
          <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
            {voted.map((c) => (
              <li key={c.id}>
                <a href={href('consultation', c.id)} className="flex flex-col gap-0.5 p-4 hover:bg-surface2">
                  <span className="font-semibold text-ink">{c.question}</span>
                  <span className="text-sm text-ink3">Votre vote : {CHOICE_LABEL[s.votes[c.id].choice]}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : <Empty>Vous n'avez encore participé à aucune consultation.</Empty>}
        <p className="text-sm text-ink3">Vos votes ne sont visibles que sur cet appareil. Ils ne sont jamais affichés publiquement.</p>
      </Section>

      <Section id="pf-suivi" title="Consultations suivies">
        {followed.length ? (
          <ul className="flex flex-col gap-1.5">
            {followed.map((c) => <li key={c.id}><a className="font-semibold text-accentink underline" href={href('consultation', c.id)}>{c.question}</a></li>)}
          </ul>
        ) : <Empty>Aucune consultation suivie.</Empty>}
      </Section>

      <Section id="pf-contrib" title="Vos contributions">
        {s.arguments.length + s.proposals.length ? (
          <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
            {s.proposals.map((p) => (
              <li key={p.id}><a href={href('proposition', p.id)} className="flex flex-col gap-0.5 p-4 hover:bg-surface2"><span className="text-sm text-ink3">Proposition</span><span className="font-semibold text-ink">{p.title}</span></a></li>
            ))}
            {s.arguments.map((a) => (
              <li key={a.id}><a href={href('debat', a.debateId)} className="flex flex-col gap-0.5 p-4 hover:bg-surface2"><span className="text-sm text-ink3">Argument · {debates.find((d) => d.id === a.debateId)?.title}</span><span className="line-clamp-2 text-ink">{a.text}</span></a></li>
            ))}
          </ul>
        ) : <Empty>Vos arguments et propositions apparaîtront ici.</Empty>}
      </Section>

      <Section id="pf-data" title="Vos données">
        <Notice>
          Ce prototype n'a ni serveur ni compte. Votre pseudonyme, vos préférences, vos votes et vos contributions sont enregistrés dans le stockage de ce navigateur et n'en sortent pas.
        </Notice>
        <div className="flex flex-wrap gap-2">
          <Button tone="secondary" onClick={() => setShowExport(!showExport)} aria-expanded={showExport}>{showExport ? 'Masquer mes données' : 'Voir et copier mes données'}</Button>
          {!confirming && <Button tone="danger" onClick={() => setConfirming(true)}>Effacer mes données</Button>}
        </div>
        {showExport && (
          <Card className="flex flex-col gap-2 shadow-none">
            <label htmlFor="export-data" className="text-sm font-semibold text-ink">Toutes vos données, au format JSON</label>
            <textarea id="export-data" readOnly rows={8} value={exported} className={cx(inputClass, 'font-mono text-xs')} />
            <Button tone="secondary" className="self-start" onClick={copy}>{copied ? 'Copié' : 'Copier'}</Button>
          </Card>
        )}
        {confirming && (
          <Card className="flex flex-col gap-3 border-alert shadow-none" role="alertdialog" aria-labelledby="erase-title">
            <p id="erase-title" className="font-semibold text-ink">Effacer définitivement vos votes, arguments, propositions, préférences et réglages ?</p>
            <p className="text-sm text-ink2">Cette action ne peut pas être annulée.</p>
            <div className="flex flex-wrap gap-2">
              <Button tone="danger" onClick={() => { actions.eraseAll(); setConfirming(false) }}>Oui, tout effacer</Button>
              <Button tone="ghost" onClick={() => setConfirming(false)}>Annuler</Button>
            </div>
          </Card>
        )}
      </Section>
    </>
  )
}
