import { useSyncExternalStore } from 'react'

// Routage par ancre simple (#nom ou #nom-identifiant) : fonctionne en PWA,
// sur un hébergement statique et dans un aperçu Artifact.

const STATIC = ['accueil', 'dossiers', 'consultations', 'debats', 'propositions', 'proposer', 'resultats', 'profil', 'admin', 'regles', 'plus'] as const
const WITH_ID = ['dossier', 'consultation', 'debat', 'proposition'] as const

export type StaticName = (typeof STATIC)[number]
export type DetailName = (typeof WITH_ID)[number]
export type Route = { name: StaticName } | { name: DetailName; id: string } | { name: 'introuvable' }

export function parseRoute(hash: string): Route {
  const h = hash.replace(/^#/, '')
  if (h === '') return { name: 'accueil' }
  if ((STATIC as readonly string[]).includes(h)) return { name: h as StaticName }
  for (const p of WITH_ID) {
    if (h.startsWith(p + '-') && /^[a-z0-9-]+$/.test(h) && h.length > p.length + 1) {
      return { name: p, id: h.slice(p.length + 1) }
    }
  }
  return { name: 'introuvable' }
}

export function href(name: StaticName): string
export function href(name: DetailName, id: string): string
export function href(name: string, id?: string): string {
  return '#' + (id ? `${name}-${id}` : name)
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return parseRoute(hash)
}

export function navigate(to: string) {
  window.location.hash = to
}
