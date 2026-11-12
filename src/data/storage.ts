import type { Argument, Choice, LogEntry, Moderation, Proposal, ProposalStatus, Report } from '../domain/types'

/** Tout ce que le prototype enregistre. Rien ne quitte le navigateur. */
export interface Persisted {
  v: 1
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
}

export const emptyState = (): Persisted => ({
  v: 1,
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

const KEY = 'agora.demo.v1'

export const localAdapter: StorageAdapter = {
  load() {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return emptyState()
      const parsed = JSON.parse(raw)
      if (!parsed || parsed.v !== 1) return emptyState()
      return { ...emptyState(), ...parsed }
    } catch {
      return emptyState() // navigation privée ou stockage bloqué : l'application reste utilisable
    }
  },
  save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* stockage indisponible : l'état reste en mémoire pour la session */
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* rien à effacer */
    }
  },
}
