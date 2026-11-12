import { useEffect, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from 'lucide-react'
import { href, navigate } from '../app/router'
import { actions, useStore } from '../app/store'
import { AGES, FREQUENCIES, SITUATIONS, THEMES, themeLabel, type AgeId, type FrequencyId, type SituationId, type ThemeId } from '../domain/preferences'
import { BrandLogo } from '../ui/brand'
import { Button, cx, Notice } from '../ui/kit'

// Questionnaire de bienvenue : facultatif, quatre questions, un récapitulatif.
// Rien n'est enregistré avant la validation finale ; « Quitter » ramène toujours à l'application.

const STEPS = ['Thèmes', 'Rythme', 'Situation', 'Âge'] as const

function Option({ id, name, type, checked, onChange, label, hint }: { id: string; name: string; type: 'radio' | 'checkbox'; checked: boolean; onChange: () => void; label: string; hint?: string }) {
  return (
    <label htmlFor={id} className={cx('choice flex min-h-13 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-2.5', checked ? 'border-accent bg-soft' : 'border-line bg-surface hover:bg-surface2')}>
      <input id={id} name={name} type={type} checked={checked} onChange={onChange} className="sr-only" />
      <span aria-hidden="true" className={cx('grid size-6 shrink-0 place-items-center border-2', type === 'radio' ? 'rounded-full' : 'rounded-lg', checked ? 'border-accent bg-accent text-white' : 'border-ink3')}>
        {checked && <Check size={15} strokeWidth={3} />}
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-ink">{label}</span>
        {hint && <span className="block text-sm text-ink2">{hint}</span>}
      </span>
    </label>
  )
}

export function Bienvenue() {
  const { prefs } = useStore()
  const editing = prefs.status === 'termine'
  const [step, setStep] = useState(editing ? 1 : 0)
  const [themes, setThemes] = useState<ThemeId[]>(prefs.themes)
  const [frequency, setFrequency] = useState<FrequencyId | null>(prefs.frequency)
  const [situation, setSituation] = useState<SituationId | null>(prefs.situation)
  const [age, setAge] = useState<AgeId | null>(prefs.age)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.getElementById('page-title')?.focus({ preventScroll: true })
  }, [step])

  const leave = () => {
    actions.skipOnboarding()
    navigate(editing ? href('profil') : href('accueil'))
  }
  const save = () => {
    actions.savePreferences({ themes, frequency, situation, age })
    navigate(editing ? href('profil') : href('accueil'))
  }
  /** « Passer » : avance sans garder de réponse à la question affichée. */
  const skip = () => {
    if (step === 1) setThemes([])
    if (step === 2) setFrequency(null)
    if (step === 3) setSituation(null)
    if (step === 4) setAge(null)
    setStep(step + 1)
  }
  const under15 = age === 'moins-15'

  const shell = (children: ReactNode) => (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 pt-2 lg:pt-6">
      <div className="flex items-center justify-between gap-3">
        <BrandLogo variant="row" />
        <Button tone="ghost" className="min-h-11 px-3 text-sm" onClick={leave}>{editing ? 'Annuler' : 'Quitter le questionnaire'}</Button>
      </div>
      {children}
    </div>
  )

  if (step === 0) {
    return shell(
      <>
        <header className="flex flex-col gap-3">
          <p className="eyebrow text-accentink">Bienvenue</p>
          <h1 id="page-title" tabIndex={-1} className="font-serif text-[2rem] leading-[1.1] font-medium text-ink outline-none sm:text-4xl">Quels sujets vous intéressent ?</h1>
          <p className="text-ink2">Quatre questions pour mettre en avant les consultations qui vous concernent. Ce questionnaire est facultatif : vous pouvez le passer, y revenir ou effacer vos réponses à tout moment.</p>
        </header>
        <ul className="flex flex-col gap-3 text-[0.97rem] text-ink2">
          {[
            'Vos réponses restent sur cet appareil. Rien n’est envoyé à un serveur.',
            'Vos recommandations dépendent des thèmes que vous cochez, jamais de vos votes.',
            'Toutes les consultations restent accessibles, quelles que soient vos réponses.',
          ].map((t) => (
            <li key={t} className="flex items-start gap-3"><ShieldCheck size={20} className="mt-0.5 shrink-0 text-accentink" aria-hidden="true" />{t}</li>
          ))}
        </ul>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button className="press h-13 px-7" onClick={() => setStep(1)}>Commencer <ArrowRight size={18} aria-hidden="true" /></Button>
          <Button tone="secondary" className="press h-13 px-7" onClick={leave}>Passer et découvrir AGORA</Button>
        </div>
      </>,
    )
  }

  if (step === 5) {
    const rows: [string, string, number][] = [
      ['Thèmes', themes.length ? themes.map(themeLabel).join(', ') : 'Aucun thème choisi', 1],
      ['Rythme', FREQUENCIES.find((f) => f.id === frequency)?.label ?? 'Non précisé', 2],
      ['Situation', under15 ? 'Non enregistrée' : SITUATIONS.find((x) => x.id === situation)?.label ?? 'Non précisée', 3],
      ['Âge', under15 ? 'Non enregistré' : AGES.find((x) => x.id === age)?.label ?? 'Non précisé', 4],
    ]
    return shell(
      <>
        <header className="flex flex-col gap-2">
          <p className="eyebrow text-accentink">Récapitulatif</p>
          <h1 id="page-title" tabIndex={-1} className="font-serif text-[2rem] leading-[1.1] font-medium text-ink outline-none">Vérifiez vos réponses</h1>
          <p className="text-ink2">Rien n'est enregistré tant que vous n'avez pas validé.</p>
        </header>
        <dl className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
          {rows.map(([label, value, target]) => (
            <div key={label} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <dt className="text-sm text-ink3">{label}</dt>
                <dd className="font-semibold text-ink">{value}</dd>
              </div>
              <Button tone="ghost" className="min-h-11 shrink-0 px-3 text-sm" onClick={() => setStep(target)} aria-label={`Modifier : ${label}`}>Modifier</Button>
            </div>
          ))}
        </dl>
        <Notice>
          Ces préférences sont enregistrées sur cet appareil uniquement, à part de vos votes. AGORA n'envoie aucune notification : le rythme choisi règle seulement le nombre de consultations mises en avant.
        </Notice>
        <div className="action-bar -mx-4 flex gap-2.5 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
          <Button tone="secondary" className="press" onClick={() => setStep(4)}><ArrowLeft size={17} aria-hidden="true" /> Retour</Button>
          <Button className="press flex-1" onClick={save}>Enregistrer mes préférences</Button>
        </div>
      </>,
    )
  }

  const titles = [
    '',
    'Quels thèmes vous intéressent ?',
    'À quel rythme souhaitez-vous découvrir des consultations ?',
    'Quelle est votre situation ?',
    'Quelle est votre tranche d’âge ?',
  ]
  const intros = [
    '',
    'Choisissez-en autant que vous voulez. Ils servent à composer votre espace « Pour vous ».',
    'C’est une préférence d’affichage. AGORA n’envoie aucune notification.',
    'Facultatif. Cette réponse ne sert pas aux recommandations et reste sur cet appareil.',
    'Facultatif. Cette réponse ne sert pas aux recommandations et reste sur cet appareil.',
  ]

  return shell(
    <>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-ink2" id="progress-label">Étape {step} sur {STEPS.length} · {STEPS[step - 1]}</p>
        <div role="progressbar" aria-labelledby="progress-label" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step} className="grid grid-cols-4 gap-1.5">
          {STEPS.map((s, i) => <span key={s} className={cx('h-1.5 rounded-full', i < step ? 'bg-accent' : 'bg-line')} />)}
        </div>
      </div>

      <fieldset className="flex flex-col gap-4">
        <legend className="contents">
          <h1 id="page-title" tabIndex={-1} className="font-serif text-[1.75rem] leading-[1.15] font-medium text-ink outline-none sm:text-3xl">{titles[step]}</h1>
        </legend>
        <p className="text-ink2">{intros[step]}</p>

        {step === 1 && (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {THEMES.map((t) => (
              <Option key={t.id} id={`theme-${t.id}`} name="themes" type="checkbox" label={t.label} checked={themes.includes(t.id)}
                onChange={() => setThemes(themes.includes(t.id) ? themes.filter((x) => x !== t.id) : [...themes, t.id])} />
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-2.5">
            {FREQUENCIES.map((f) => <Option key={f.id} id={`freq-${f.id}`} name="frequency" type="radio" label={f.label} hint={f.hint} checked={frequency === f.id} onChange={() => setFrequency(f.id)} />)}
          </div>
        )}
        {step === 3 && (
          <div className="flex flex-col gap-2.5">
            {SITUATIONS.map((x) => <Option key={x.id} id={`situation-${x.id}`} name="situation" type="radio" label={x.label} checked={situation === x.id} onChange={() => setSituation(x.id)} />)}
          </div>
        )}
        {step === 4 && (
          <>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {AGES.map((x) => <Option key={x.id} id={`age-${x.id}`} name="age" type="radio" label={x.label} checked={age === x.id} onChange={() => setAge(x.id)} />)}
            </div>
            <div aria-live="polite">
              {under15 && (
                <Notice title="Nous n'enregistrerons pas cette réponse">
                  Pour les moins de 15 ans, AGORA ne conserve ni l'âge ni la situation. Vous pouvez lire tous les dossiers librement. Pour participer, parlez-en avec un parent ou un enseignant.
                </Notice>
              )}
              {age === '15-17' && (
                <Notice title="Bon à savoir">
                  Les consultations AGORA sont indicatives et n'ont aucune valeur officielle. Aucune autre information ne vous est demandée.
                </Notice>
              )}
            </div>
          </>
        )}
      </fieldset>

      <div className="action-bar -mx-4 flex items-center gap-2.5 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
        <Button tone="secondary" className="press" onClick={() => setStep(step - 1)} disabled={editing && step === 1}><ArrowLeft size={17} aria-hidden="true" /> Retour</Button>
        <Button tone="ghost" className="press" onClick={skip}>Passer</Button>
        <Button className="press flex-1" onClick={() => setStep(step + 1)}>Continuer <ArrowRight size={17} aria-hidden="true" /></Button>
      </div>
    </>,
  )
}
