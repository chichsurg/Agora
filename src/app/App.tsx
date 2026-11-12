import { useEffect, useRef, type ReactNode } from 'react'
import { BookOpen, CircleUserRound, Home as HomeIcon, Lightbulb, Menu, MessagesSquare, PieChart, ScrollText, Search, ShieldCheck, Vote } from 'lucide-react'
import { href, useRoute, type Route } from './router'
import { useStore } from './store'
import { cx, NotFound, PageHeader } from '../ui/kit'
import { BrandLogo, ReferenceIcon, type ReferenceIconName } from '../ui/brand'
import { Home } from '../features/Home'
import { DossierList, DossierPage } from '../features/Dossiers'
import { ConsultationList, ConsultationPage } from '../features/Consultations'
import { DebateList, DebatePage } from '../features/Debats'
import { ProposalForm, ProposalList, ProposalPage } from '../features/Propositions'
import { Resultats } from '../features/Resultats'
import { Profil } from '../features/Profil'
import { Admin } from '../features/Admin'
import { Regles } from '../features/Regles'
import { Recherche } from '../features/Recherche'

type Tab = 'accueil' | 'dossiers' | 'consultations' | 'debats' | 'plus'

// Ordre de REF-14 (Accueil, Actualité, Débats, Participer, Plus). « Dossiers » tient la place
// d'« Actualité » : le libellé définitif reste à confirmer par le fondateur.
const TABS = [
  { id: 'accueil', label: 'Accueil', icon: HomeIcon, to: href('accueil') },
  { id: 'dossiers', label: 'Dossiers', icon: BookOpen, to: href('dossiers') },
  { id: 'debats', label: 'Débats', icon: MessagesSquare, to: href('debats') },
  { id: 'consultations', label: 'Participer', icon: Vote, to: href('consultations') },
] as const

export const MORE: { label: string; short?: string; hint: string; icon: typeof Search; ref?: ReferenceIconName; to: string }[] = [
  { label: 'Propositions citoyennes', short: 'Propositions', hint: 'Lire, soutenir, proposer', icon: Lightbulb, to: href('propositions') },
  { label: 'Résultats', hint: 'Chiffres, méthode et limites', icon: PieChart, to: href('resultats') },
  { label: 'Recherche', hint: 'Dossiers, consultations, débats, propositions', icon: Search, to: href('recherche') },
  { label: 'Le projet et ses règles', short: 'Le projet', hint: 'Principes, comptage, modération, données', icon: ScrollText, ref: 'charte', to: href('regles') },
  { label: 'Profil', hint: 'Pseudonyme, affichage, vos données', icon: CircleUserRound, to: href('profil') },
  { label: 'Administration', hint: 'Modération et journal (démonstration)', icon: ShieldCheck, to: href('admin') },
]

function tabOf(r: Route): Tab {
  switch (r.name) {
    case 'accueil': return 'accueil'
    case 'dossiers': case 'dossier': return 'dossiers'
    case 'consultations': case 'consultation': return 'consultations'
    case 'debats': case 'debat': return 'debats'
    default: return 'plus'
  }
}

function Plus() {
  return (
    <>
      <PageHeader title="Plus" intro="Tous les autres espaces d'AGORA." />
      <ul className="flex flex-col gap-2">
        {MORE.map((m) => (
          <li key={m.to}>
            <a href={m.to} className="flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 hover:bg-surface2">
              {m.ref ? <ReferenceIcon name={m.ref} size="sm" /> : <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-soft text-accentink"><m.icon size={20} aria-hidden="true" /></span>}
              <span className="min-w-0">
                <span className="block font-semibold text-ink">{m.label}</span>
                <span className="block text-sm text-ink3">{m.hint}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}

function screen(r: Route): ReactNode {
  switch (r.name) {
    case 'accueil': return <Home />
    case 'dossiers': return <DossierList />
    case 'dossier': return <DossierPage id={r.id} />
    case 'consultations': return <ConsultationList />
    case 'consultation': return <ConsultationPage id={r.id} />
    case 'debats': return <DebateList />
    case 'debat': return <DebatePage id={r.id} />
    case 'propositions': return <ProposalList />
    case 'proposition': return <ProposalPage id={r.id} />
    case 'proposer': return <ProposalForm />
    case 'resultats': return <Resultats />
    case 'profil': return <Profil />
    case 'admin': return <Admin />
    case 'regles': return <Regles />
    case 'plus': return <Plus />
    case 'recherche': return <Recherche />
    default: return <NotFound />
  }
}

/** Largeur utile selon l'écran : tableau de bord large à l'accueil, colonne de lecture ailleurs. */
function widthOf(r: Route): string {
  if (r.name === 'accueil') return 'max-w-[92rem]'
  if (r.name === 'resultats' || r.name === 'dossiers' || r.name === 'debats') return 'max-w-5xl'
  return 'max-w-3xl'
}

export function App() {
  const route = useRoute()
  const { theme } = useStore()
  const key = 'id' in route ? `${route.name}-${route.id}` : route.name
  const tab = tabOf(route)
  const home = route.name === 'accueil'
  const first = useRef(true)

  // Préférence d'affichage : "système" laisse la main au téléphone (ou à l'hôte de l'aperçu).
  const applied = useRef(false)
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      if (applied.current) root.removeAttribute('data-theme')
      applied.current = false
    } else {
      root.setAttribute('data-theme', theme)
      applied.current = true
    }
  }, [theme])

  // À chaque changement d'écran : retour en haut et focus sur le titre (lecteurs d'écran, clavier).
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo(0, 0)
    document.getElementById('page-title')?.focus({ preventScroll: true })
  }, [key])

  const railItems = [
    ...TABS.map((t) => ({ ...t, active: tab === t.id })),
    ...MORE.slice(0, 4).map((m) => ({ ...m, label: m.short ?? m.label, id: m.to, active: '#' + key === m.to || (m.to === href('propositions') && ['proposition', 'proposer'].includes(route.name)) })),
  ]
  const railLink = (active: boolean) =>
    cx('flex min-h-11 items-center gap-3.5 rounded-xl px-3.5 text-[0.95rem]', active ? 'bg-bg font-bold text-accentink shadow-card' : 'font-medium text-ink2 hover:bg-surface2')

  return (
    <div className="min-h-full lg:pl-60">
      <a href="#contenu" onClick={(e) => { e.preventDefault(); document.getElementById('page-title')?.focus() }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">
        Aller au contenu
      </a>

      {/* Rail latéral (grand écran), composition de REF-14 */}
      <nav aria-label="Navigation principale" className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-1 overflow-y-auto border-r border-line bg-surface px-4 pt-7 pb-5 lg:flex">
        <a href={href('accueil')} className="mb-7 self-center rounded-xl p-1" aria-label="AGORA, accueil">
          <BrandLogo variant="stacked" />
        </a>
        {railItems.map((t) => (
          <a key={t.id} href={t.to} aria-current={t.active ? 'page' : undefined} className={railLink(t.active)}>
            <t.icon size={20} strokeWidth={1.9} fill={t.active && t.id === 'accueil' ? 'currentColor' : 'none'} aria-hidden="true" />
            {t.label}
          </a>
        ))}
        <div className="mt-auto flex flex-col gap-1 pt-6">
          {MORE.slice(4).map((m) => (
            <a key={m.to} href={m.to} aria-current={'#' + key === m.to ? 'page' : undefined} className={railLink('#' + key === m.to)}>
              <m.icon size={20} strokeWidth={1.9} aria-hidden="true" />
              {m.label}
            </a>
          ))}
          <p className="mt-3 px-2 text-xs text-ink3">Prototype de démonstration. Les votes et les participants affichés sont fictifs.</p>
        </div>
      </nav>

      {/* En-tête (mobile). À l'accueil, le hero porte lui-même le logo, comme sur REF-14. */}
      {!home && (
        <header className="gutter sticky z-30 flex h-14 items-center justify-between border-b border-line bg-bg/90 backdrop-blur lg:hidden" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
          <a href={href('accueil')} className="flex min-h-11 items-center" aria-label="AGORA, accueil">
            <BrandLogo variant="row" />
          </a>
          <div className="flex items-center">
            <a href={href('regles')} className="mr-1 rounded-full bg-sand/40 px-2.5 py-1 text-xs font-semibold text-ink">Prototype</a>
            <a href={href('recherche')} aria-label="Rechercher" className="grid size-11 place-items-center rounded-full text-ink2 hover:bg-surface2">
              <Search size={22} aria-hidden="true" />
            </a>
            <a href={href('profil')} aria-label="Profil" className="grid size-11 place-items-center rounded-full text-ink2 hover:bg-surface2">
              <CircleUserRound size={24} aria-hidden="true" />
            </a>
          </div>
        </header>
      )}

      <main id="contenu" className={cx('mx-auto pb-28 lg:pb-16', home ? 'lg:px-6' : 'gutter', widthOf(route))}>
        <div key={key} className={cx('rise flex flex-col gap-7', home ? 'lg:py-6' : 'py-4 lg:py-8')}>{screen(route)}</div>
      </main>

      {/* Barre d'onglets (mobile) */}
      <nav aria-label="Navigation principale" className="gutter fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {[...TABS, { id: 'plus', label: 'Plus', icon: Menu, to: href('plus') } as const].map((t) => {
            const active = tab === t.id
            return (
              <li key={t.id}>
                <a href={t.to} aria-current={active ? 'page' : undefined}
                  className={cx('flex min-h-[3.75rem] flex-col items-center justify-center gap-1 text-[0.72rem]', active ? 'font-bold text-accentink' : 'font-medium text-ink3')}>
                  <t.icon size={23} strokeWidth={1.9} fill={active && t.id === 'accueil' ? 'currentColor' : 'none'} aria-hidden="true" />
                  {t.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
