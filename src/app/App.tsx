import { useEffect, useRef, type ReactNode } from 'react'
import { BookOpen, CircleUserRound, Home as HomeIcon, Lightbulb, Menu, MessagesSquare, PieChart, ScrollText, Search, ShieldCheck, Vote } from 'lucide-react'
import { href, useRoute, type Route } from './router'
import { useStore } from './store'
import { Arch, cx, NotFound, PageHeader, Wordmark } from '../ui/kit'
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

const TABS = [
  { id: 'accueil', label: 'Accueil', icon: HomeIcon, to: href('accueil') },
  { id: 'dossiers', label: 'Dossiers', icon: BookOpen, to: href('dossiers') },
  { id: 'consultations', label: 'Participer', icon: Vote, to: href('consultations') },
  { id: 'debats', label: 'Débats', icon: MessagesSquare, to: href('debats') },
] as const

export const MORE = [
  { label: 'Recherche', hint: 'Dossiers, consultations, débats, propositions', icon: Search, to: href('recherche') },
  { label: 'Propositions citoyennes', hint: 'Lire, soutenir, proposer', icon: Lightbulb, to: href('propositions') },
  { label: 'Résultats', hint: 'Chiffres, méthode et limites', icon: PieChart, to: href('resultats') },
  { label: 'Règles et transparence', hint: 'Comptage, modération, données', icon: ScrollText, to: href('regles') },
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
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-soft text-accentink"><m.icon size={20} aria-hidden="true" /></span>
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

export function App() {
  const route = useRoute()
  const { theme } = useStore()
  const key = 'id' in route ? `${route.name}-${route.id}` : route.name
  const tab = tabOf(route)
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

  return (
    <div className="min-h-full lg:pl-64">
      <a href="#contenu" onClick={(e) => { e.preventDefault(); document.getElementById('page-title')?.focus() }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">
        Aller au contenu
      </a>

      {/* Rail latéral (grand écran) */}
      <nav aria-label="Navigation principale" className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-1 border-r border-line bg-surface px-4 py-6 lg:flex">
        <a href={href('accueil')} className="mb-6 flex items-center gap-3 px-2">
          <Arch className="h-8 w-8" />
          <Wordmark />
        </a>
        {[...TABS.map((t) => ({ ...t, active: tab === t.id })), ...MORE.map((m) => ({ ...m, id: m.to, active: '#' + key === m.to || (m.to === href('propositions') && ['proposition', 'proposer'].includes(route.name)) }))].map((t) => (
          <a key={t.id} href={t.to} aria-current={t.active ? 'page' : undefined}
            className={cx('flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.95rem] font-medium', t.active ? 'bg-soft text-accentink' : 'text-ink2 hover:bg-surface2')}>
            <t.icon size={19} aria-hidden="true" />
            {t.label}
          </a>
        ))}
        <p className="mt-auto px-2 text-xs text-ink3">Prototype de démonstration. Les votes et les participants affichés sont fictifs.</p>
      </nav>

      {/* En-tête (mobile) */}
      <header className="gutter sticky z-30 flex h-14 items-center justify-between border-b border-line bg-bg/90 backdrop-blur lg:hidden" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <a href={href('accueil')} className="flex min-h-11 items-center gap-2.5" aria-label="AGORA, accueil">
          <Arch className="h-7 w-7" />
          <Wordmark className="text-sm" />
        </a>
        <div className="flex items-center gap-1">
          <a href={href('regles')} className="rounded-full bg-sand/40 px-2.5 py-1 text-xs font-semibold text-ink">Prototype</a>
          <a href={href('recherche')} aria-label="Rechercher" className="grid size-11 place-items-center rounded-full text-ink2 hover:bg-surface2">
            <Search size={22} aria-hidden="true" />
          </a>
          <a href={href('profil')} aria-label="Profil" className="grid size-11 place-items-center rounded-full text-ink2 hover:bg-surface2">
            <CircleUserRound size={24} aria-hidden="true" />
          </a>
        </div>
      </header>

      <main id="contenu" className="gutter mx-auto max-w-3xl pb-28 lg:max-w-4xl lg:pb-16">
        <div key={key} className="rise flex flex-col gap-7 py-4 lg:py-8">{screen(route)}</div>
      </main>

      {/* Barre d'onglets (mobile) */}
      <nav aria-label="Navigation principale" className="gutter fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {[...TABS, { id: 'plus', label: 'Plus', icon: Menu, to: href('plus') } as const].map((t) => {
            const active = tab === t.id
            return (
              <li key={t.id}>
                <a href={t.to} aria-current={active ? 'page' : undefined}
                  className={cx('flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold', active ? 'text-accentink' : 'text-ink3')}>
                  <span className={cx('grid h-7 w-12 place-items-center rounded-full', active && 'bg-soft')}><t.icon size={20} aria-hidden="true" /></span>
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
