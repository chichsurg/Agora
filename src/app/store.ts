import { useSyncExternalStore } from 'react'
import { demoArguments, demoProposals } from '../data/demo'
import { emptyState, localAdapter, type Persisted, type StorageAdapter } from '../data/storage'
import { emptyPreferences, sanitizePreferences, type Preferences } from '../domain/preferences'
import { nextStatus, statusLabel, type ProposalDraft } from '../domain/proposals'
import type { Argument, Choice, Proposal, Stance } from '../domain/types'

// État applicatif : lit et écrit via un StorageAdapter, notifie React.

let adapter: StorageAdapter = localAdapter
let state: Persisted = adapter.load()
const listeners = new Set<() => void>()

function set(patch: Partial<Persisted>) {
  state = { ...state, ...patch }
  adapter.save(state)
  listeners.forEach((l) => l())
}

const uid = () => Math.random().toString(36).slice(2, 10)
const now = () => new Date().toISOString()
const log = (action: string, detail: string) => [{ at: now(), action, detail }, ...state.journal].slice(0, 200)
const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

export function useStore(): Persisted {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => state,
  )
}

export const displayName = (s: Persisted) => s.pseudonym.trim() || 'Vous (anonyme)'

// Sélecteurs : fusionnent les données de démonstration et celles de ce navigateur.

export function allArguments(s: Persisted): Argument[] {
  return [...demoArguments, ...s.arguments].map((a) => ({
    ...a,
    supports: a.supports + (s.supportedArguments.includes(a.id) ? 1 : 0),
  }))
}

export function allProposals(s: Persisted): Proposal[] {
  return [...s.proposals, ...demoProposals].map((p) => ({
    ...p,
    status: s.proposalStatus[p.id] ?? p.status,
    supports: p.supports + (s.supportedProposals.includes(p.id) ? 1 : 0),
  }))
}

export const actions = {
  setPseudonym: (pseudonym: string) => set({ pseudonym: pseudonym.slice(0, 30) }),
  setTheme: (theme: Persisted['theme']) => set({ theme }),

  vote: (consultationId: string, choice: Choice) =>
    set({ votes: { ...state.votes, [consultationId]: { choice, at: now() } } }),
  withdrawVote: (consultationId: string) => {
    const votes = { ...state.votes }
    delete votes[consultationId]
    set({ votes })
  },
  toggleFollow: (consultationId: string) => set({ followed: toggle(state.followed, consultationId) }),

  postArgument: (debateId: string, stance: Stance, text: string, sourceUrl?: string, parentId?: string) =>
    set({
      arguments: [
        ...state.arguments,
        { id: 'u' + uid(), debateId, parentId, author: displayName(state), stance, text: text.trim(), sourceUrl, createdAt: now(), supports: 0, demo: false },
      ],
    }),
  toggleSupportArgument: (id: string) => set({ supportedArguments: toggle(state.supportedArguments, id) }),

  report: (argumentId: string, reason: string) =>
    set({ reports: [{ id: 'r' + uid(), argumentId, reason, createdAt: now(), resolved: false }, ...state.reports] }),
  appeal: (argumentId: string, text: string) => {
    const m = state.moderation[argumentId]
    if (!m) return
    set({ moderation: { ...state.moderation, [argumentId]: { ...m, appeal: text.trim() } }, journal: log('Contestation reçue', `Argument ${argumentId}`) })
  },

  submitProposal: (d: ProposalDraft): string => {
    const id = 'u' + uid()
    const p: Proposal = {
      id, title: d.title.trim(), problem: d.problem.trim(), solution: d.solution.trim(), benefits: d.benefits.trim(),
      risks: d.risks.trim(), sources: d.sources.trim(), status: 'proposee', author: displayName(state), createdAt: now(), supports: 0, demo: false,
    }
    set({ proposals: [p, ...state.proposals] })
    return id
  },
  toggleSupportProposal: (id: string) => set({ supportedProposals: toggle(state.supportedProposals, id) }),

  // Administration (mode démonstration : aucune permission réelle n'est vérifiée ici).
  setAdminMode: (adminMode: boolean) => set({ adminMode, journal: log(adminMode ? 'Mode administration activé' : 'Mode administration désactivé', 'Démonstration locale') }),
  resolveReport: (reportId: string, hide: boolean, reason: string) => {
    const r = state.reports.find((x) => x.id === reportId)
    if (!r) return
    set({
      reports: state.reports.map((x) => (x.id === reportId ? { ...x, resolved: true } : x)),
      moderation: hide ? { ...state.moderation, [r.argumentId]: { hidden: true, reason } } : state.moderation,
      journal: log(hide ? 'Argument masqué' : 'Signalement classé', `Argument ${r.argumentId} — ${reason}`),
    })
  },
  restoreArgument: (argumentId: string) => {
    const moderation = { ...state.moderation }
    delete moderation[argumentId]
    set({ moderation, journal: log('Argument rétabli', `Argument ${argumentId}, après contestation`) })
  },
  advanceProposal: (p: Proposal) => {
    const next = nextStatus(p.status)
    if (!next) return
    set({ proposalStatus: { ...state.proposalStatus, [p.id]: next }, journal: log('Proposition avancée', `« ${p.title} » → ${statusLabel(next)}`) })
  },

  // Personnalisation : jamais croisée avec les votes.
  savePreferences: (answers: Pick<Preferences, 'themes' | 'frequency' | 'situation' | 'age'>) =>
    set({ prefs: sanitizePreferences({ ...answers, status: 'termine', updatedAt: now() }) }),
  skipOnboarding: () => { if (state.prefs.status === 'jamais-vu') set({ prefs: { ...state.prefs, status: 'passe' } }) },
  erasePreferences: () => set({ prefs: emptyPreferences('passe') }),

  eraseAll: () => {
    adapter.clear()
    state = { ...emptyState(), prefs: emptyPreferences('passe') }
    listeners.forEach((l) => l())
  },
}

/** Réservé aux tests : remplace le stockage et repart d'un état vide. */
export function __reset(a: StorageAdapter = localAdapter) {
  adapter = a
  state = a.load()
}
