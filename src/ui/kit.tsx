import { type ComponentProps, type ReactNode } from 'react'
import { ArrowLeft, FlaskConical } from 'lucide-react'
import { CHOICES, percentages, total } from '../domain/tally'
import type { Choice, Tally } from '../domain/types'
import { href } from '../app/router'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

const fmtDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
const fmtNum = new Intl.NumberFormat('fr-FR')
export const date = (iso: string) => fmtDate.format(new Date(iso))
export const num = (n: number) => fmtNum.format(n)
export function ago(iso: string): string {
  const d = Math.round((Date.now() - Date.parse(iso)) / 86_400_000)
  if (d <= 0) return "aujourd'hui"
  return d === 1 ? 'hier' : `il y a ${d} jours`
}

const btnBase =
  'press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-[0.95rem] font-semibold disabled:cursor-not-allowed disabled:opacity-50'
const btnTone = {
  primary: 'bg-accent text-white hover:bg-[#5237d6]',
  secondary: 'border border-line bg-surface text-ink hover:bg-surface2',
  ghost: 'text-accentink hover:bg-soft',
  danger: 'border border-alert text-alert hover:bg-alertsoft',
}
type Tone = keyof typeof btnTone

export function Button({ tone = 'primary', className, ...p }: ComponentProps<'button'> & { tone?: Tone }) {
  return <button type="button" {...p} className={cx(btnBase, btnTone[tone], className)} />
}
export function LinkButton({ tone = 'primary', className, ...p }: ComponentProps<'a'> & { tone?: Tone }) {
  return <a {...p} className={cx(btnBase, btnTone[tone], className)} />
}

export function Card({ className, as: Tag = 'div', ...p }: ComponentProps<'div'> & { as?: 'div' | 'article' | 'section' | 'li' }) {
  return <Tag {...(p as object)} className={cx('rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5', className)} />
}

export function Badge({ children, tone = 'soft' }: { children: ReactNode; tone?: 'soft' | 'outline' | 'night' | 'sand' }) {
  const tones = {
    soft: 'bg-soft text-accentink',
    outline: 'border border-line text-ink2',
    night: 'bg-night text-white',
    sand: 'bg-sand/40 text-ink',
  }
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone])}>{children}</span>
}

/** Étiquette obligatoire sur toute donnée fictive. */
export function DemoTag({ label = 'Données fictives' }: { label?: string }) {
  return (
    <Badge tone="sand">
      <FlaskConical size={12} aria-hidden="true" />
      {label}
    </Badge>
  )
}

export function Notice({ title, children, tone = 'info' }: { title?: string; children: ReactNode; tone?: 'info' | 'alert' }) {
  return (
    <div className={cx('rounded-xl px-4 py-3 text-sm', tone === 'alert' ? 'bg-alertsoft text-alert' : 'bg-surface2 text-ink2')} role="note">
      {title && <p className="font-semibold text-ink">{title}</p>}
      <div className={cx(title && 'mt-0.5')}>{children}</div>
    </div>
  )
}

export function PageHeader({ eyebrow, title, intro, back, children, compact }: { eyebrow?: string; title: string; intro?: ReactNode; back?: { href: string; label: string }; children?: ReactNode; compact?: boolean }) {
  return (
    <header className="flex flex-col gap-2 pt-2">
      {back && (
        <a href={back.href} className="-ml-1 inline-flex min-h-11 items-center gap-1 self-start rounded-lg px-1 text-sm font-semibold text-accentink">
          <ArrowLeft size={16} aria-hidden="true" />
          {back.label}
        </a>
      )}
      {eyebrow && <p className="eyebrow text-accentink">{eyebrow}</p>}
      <h1 id="page-title" tabIndex={-1} className={cx('font-serif font-medium text-ink outline-none', compact ? 'text-[1.3rem] leading-snug sm:text-2xl' : 'text-[1.9rem] leading-[1.12] sm:text-4xl')}>
        {title}
      </h1>
      {intro && <p className="max-w-[62ch] text-ink2">{intro}</p>}
      {children}
    </header>
  )
}

export function Section({ title, action, children, id }: { title: string; action?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <h2 id={id} className="text-lg font-bold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export const CHOICE_LABEL: Record<Choice, string> = { pour: 'Pour', contre: 'Contre', blanc: 'Blanc' }
/**
 * Habillage des trois choix. Même construction pour chacun : aucune forme, taille ou graisse
 * ne distingue une position d'une autre. Le gris BLANC, trop clair seul, porte un liseré.
 */
export const CHOICE_TONE: Record<Choice, { soft: string; ink: string; solid: string; border: string; fill: string }> = {
  pour: { soft: 'bg-poursoft', ink: 'text-pourink', solid: 'bg-pour text-onpour', border: 'border-pour', fill: 'bg-pour' },
  contre: { soft: 'bg-contresoft', ink: 'text-contreink', solid: 'bg-contre text-oncontre', border: 'border-contre', fill: 'bg-contre' },
  blanc: { soft: 'bg-blancsoft', ink: 'text-blancink', solid: 'bg-blanc text-onblanc ring-1 ring-inset ring-blancedge', border: 'border-blancedge', fill: 'bg-blanc ring-1 ring-inset ring-blancedge' },
}

/** Répartition POUR / CONTRE / BLANC, lisible sans la couleur (libellé, pourcentage et nombre). */
export function VoteBars({ tally, compact }: { tally: Tally; compact?: boolean }) {
  const pct = percentages(tally)
  const n = total(tally)
  if (n === 0) return <p className="text-sm text-ink3">Aucune participation enregistrée.</p>
  return (
    <dl className={cx('flex flex-col', compact ? 'gap-1.5' : 'gap-3')}>
      {CHOICES.map((c) => (
        <div key={c} className="grid grid-cols-[4.2rem_1fr_auto] items-center gap-2 text-sm">
          <dt className="font-semibold text-ink">{CHOICE_LABEL[c]}</dt>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface2" aria-hidden="true">
            <div className={cx('h-full rounded-full', CHOICE_TONE[c].fill)} style={{ width: `${pct[c]}%` }} />
          </div>
          <dd className="num text-right text-ink2">
            <span className="font-semibold text-ink">{pct[c]} %</span>
            {!compact && <span className="ml-2 text-ink3">{num(tally[c])}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">{label}</label>
      {hint && <p id={`${id}-hint`} className="text-sm text-ink3">{hint}</p>}
      {children}
      {error && <p id={`${id}-error`} className="text-sm font-medium text-alert">{error}</p>}
    </div>
  )
}

export const inputClass =
  'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-ink3 focus:border-lav focus:outline-none focus:ring-2 focus:ring-lav/50'

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink3">{children}</p>
}

export function NotFound({ what = 'Cette page' }: { what?: string }) {
  return (
    <>
      <PageHeader title="Page introuvable" intro={`${what} n'existe pas ou n'existe plus.`} />
      <LinkButton href={href('accueil')} className="self-start">Revenir à l'accueil</LinkButton>
    </>
  )
}
