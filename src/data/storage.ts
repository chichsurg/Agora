import { emptyPreferences, sanitizePreferences, type Preferences } from '../domain/preferences'
import type { Argument, Choice, LogEntry, Moderation, Proposal, ProposalStatus, Report } from '../domain/types'

/** Tout ce que le prototype enregistre. Rien ne quitte le navigateur. */
export interface Persisted {
  v: 2
  pseudonym: string
  theme: 'system' | 'light' | 'dark'
  votes: Record<string, { choice: Choice; at: string }>
  arguments: Argument[]
  supportedArguments: string[]
  proposals: Proposal[]
  supportedProposals: string[]
  proposalStatus: Record<string, ProposalStatus>
  followed: string[]
  reports: Report[]
  moderation: Record<string, Moderation>
  journal: LogEntry[]
  adminMode: boolean
  /** Personnalisation. Enregistrée à part des votes (autre clé de stockage). */
  prefs: Preferences
}

export const emptyState = (): Persisted => ({
  v: 2,
  pseudonym: '',
  theme: 'system',
  votes: {},
  arguments: [],
  supportedArguments: [],
  proposals: [],
  supportedProposals: [],
  proposalStatus: {},
  followed: [],
  reports: [],
  moderation: {},
  journal: [],
  adminMode: false,
  prefs: emptyPreferences(),
})

/**
 * Point d'accès aux données. Le prototype utilise le stockage local ;
 * une version connectée fournira une autre implémentation (API + base PostgreSQL)
 * sans toucher à l'interface ni à la logique métier.
 */
export interface StorageAdapter {
  load(): Persisted
  save(state: Persisted): void
  clear(): void
}

// Deux clés distinctes : les participations (votes, contributions) d'un côté, les préférences
// de personnalisation de l'autre. Le nom de la première clé est conservé depuis la version 1
// pour retrouver les données déjà enregistrées.
const KEY = 'agora.demo.v1'
const PREFS_KEY = 'agora.preferences.v1'
const BACKUP_KEY = 'agora.demo.sauvegarde'

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)

/**
 * Convertit des données enregistrées par une version antérieure vers le schéma actuel.
 * Ne supprime jamais un vote ni une contribution : tout champ connu est repris tel quel,
 * tout champ absent ou mal typé prend sa valeur par défaut.
 * Renvoie null si les données sont illisibles ou viennent d'une version plus récente.
 */
export function migrate(raw: unknown, rawPrefs?: unknown): Persisted | null {
  if (!isRecord(raw)) return null
  if (raw.v !== 1 && raw.v !== 2) return null
  const base = emptyState()
  const list = <T,>(x: unknown, fallback: T[]): T[] => (Array.isArray(x) ? (x as T[]) : fallback)
  const rec = <T,>(x: unknown, fallback: Record<string, T>): Record<string, T> => (isRecord(x) ? (x as Record<string, T>) : fallback)
  return {
    v: 2,
    pseudonym: typeof raw.pseudonym === 'string' ? raw.pseudonym : base.pseudonym,
    theme: raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : 'system',
    votes: rec(raw.votes, base.votes),
    arguments: list(raw.arguments, base.arguments),
    supportedArguments: list(raw.supportedArguments, base.supportedArguments),
    proposals: list(raw.proposals, base.proposals),
    supportedProposals: list(raw.supportedProposals, base.supportedProposals),
    proposalStatus: rec(raw.proposalStatus, base.proposalStatus),
    followed: list(raw.followed, base.followed),
    reports: list(raw.reports, base.reports),
    moderation: rec(raw.moderation, base.moderation),
    journal: list(raw.journal, base.journal),
    adminMode: raw.adminMode === true,
    prefs: sanitizePreferences(rawPrefs),
  }
}

const read = (key: string): unknown => {
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) : null
}

export const localAdapter: StorageAdapter = {
  load() {
    try {
      let prefs: unknown = null
      try { prefs = read(PREFS_KEY) } catch { /* préférences illisibles : on repart de zéro pour elles seules */ }
      const raw = localStorage.getItem(KEY)
      if (!raw) return { ...emptyState(), prefs: sanitizePreferences(prefs) }
      let parsed: unknown = null
      try { parsed = JSON.parse(raw) } catch { /* traité ci-dessous */ }
      const migrated = migrate(parsed, prefs)
      if (migrated) return migrated
      // Données illisibles ou d'une version plus récente : on les met de côté au lieu de les écraser.
      localStorage.setItem(BACKUP_KEY, raw)
      return { ...emptyState(), prefs: sanitizePreferences(prefs) }
    } catch {
      return emptyState() // navigation privée ou stockage bloqué : l'application reste utilisable
    }
  },
  save(state) {
    try {
      const { prefs, ...participation } = state
      localStorage.setItem(KEY, JSON.stringify(participation))
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    } catch {
      /* stockage indisponible : l'état reste en mémoire pour la session */
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY)
      localStorage.removeItem(PREFS_KEY)
      localStorage.removeItem(BACKUP_KEY)
    } catch {
      /* rien à effacer */
    }
  },
}
