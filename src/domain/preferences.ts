import { phase } from './tally'
import type { Consultation } from './types'

// Personnalisation d'AGORA.
// Règle de conception : ce module ne reçoit JAMAIS les votes, les soutiens ni les arguments
// de la personne. Les recommandations reposent uniquement sur les thèmes qu'elle a cochés.
// Aucune orientation politique n'est déduite, et rien ici ne permet de le faire.

export const THEMES = [
  { id: 'democratie', label: 'Démocratie et participation' },
  { id: 'institutions', label: 'Institutions' },
  { id: 'territoires', label: 'Vie locale et territoires' },
  { id: 'education', label: 'Éducation et jeunesse' },
  { id: 'environnement', label: 'Environnement' },
  { id: 'economie', label: 'Économie et emploi' },
  { id: 'sante', label: 'Santé' },
  { id: 'justice', label: 'Justice et libertés' },
  { id: 'numerique', label: 'Numérique' },
  { id: 'europe', label: 'Europe et international' },
] as const
export type ThemeId = (typeof THEMES)[number]['id']
export const themeLabel = (id: ThemeId) => THEMES.find((t) => t.id === id)?.label ?? id

/** Une préférence de rythme, rien de plus : AGORA n'envoie aucune notification. */
export const FREQUENCIES = [
  { id: 'mensuelle', label: 'Une fois par mois', hint: 'Une consultation mise en avant à la fois.', highlights: 1 },
  { id: 'hebdomadaire', label: 'Une fois par semaine', hint: 'Deux consultations mises en avant.', highlights: 2 },
  { id: 'plusieurs', label: 'Plusieurs fois par semaine', hint: 'Trois consultations mises en avant.', highlights: 3 },
  { id: 'aucune', label: 'Aucune personnalisation', hint: 'Toutes les consultations, sans mise en avant.', highlights: 0 },
] as const
export type FrequencyId = (typeof FREQUENCIES)[number]['id']

export const SITUATIONS = [
  { id: 'etudes', label: 'En études ou en formation' },
  { id: 'prive', label: 'Salarié·e du secteur privé' },
  { id: 'public', label: 'Agent·e du secteur public' },
  { id: 'independant', label: 'Indépendant·e, artisan·e, agriculteur·rice' },
  { id: 'recherche', label: "En recherche d'emploi" },
  { id: 'retraite', label: 'À la retraite' },
  { id: 'autre', label: 'Autre situation' },
] as const
export type SituationId = (typeof SITUATIONS)[number]['id']

export const AGES = [
  { id: 'moins-15', label: 'Moins de 15 ans' },
  { id: '15-17', label: '15 à 17 ans' },
  { id: '18-24', label: '18 à 24 ans' },
  { id: '25-39', label: '25 à 39 ans' },
  { id: '40-59', label: '40 à 59 ans' },
  { id: '60-plus', label: '60 ans et plus' },
] as const
export type AgeId = (typeof AGES)[number]['id']

export interface Preferences {
  /** jamais-vu : première visite ; passe : questionnaire refusé ou effacé ; termine : validé. */
  status: 'jamais-vu' | 'passe' | 'termine'
  themes: ThemeId[]
  frequency: FrequencyId | null
  situation: SituationId | null
  age: AgeId | null
  updatedAt: string | null
}

export const emptyPreferences = (status: Preferences['status'] = 'jamais-vu'): Preferences => ({
  status, themes: [], frequency: null, situation: null, age: null, updatedAt: null,
})

const has = <T extends { id: string }>(list: readonly T[], id: unknown): id is T['id'] => list.some((x) => x.id === id)

/**
 * Nettoie des préférences lues ou saisies : valeurs inconnues écartées, doublons retirés.
 * Protection des plus jeunes : en dessous de 15 ans (âge du consentement numérique en France),
 * ni la tranche d'âge ni la situation ne sont conservées.
 */
export function sanitizePreferences(raw: unknown): Preferences {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const themes = Array.isArray(r.themes) ? [...new Set(r.themes.filter((t): t is ThemeId => has(THEMES, t)))] : []
  const under15 = r.age === 'moins-15'
  return {
    status: r.status === 'termine' || r.status === 'passe' ? r.status : 'jamais-vu',
    themes,
    frequency: has(FREQUENCIES, r.frequency) ? r.frequency : null,
    situation: !under15 && has(SITUATIONS, r.situation) ? r.situation : null,
    age: !under15 && has(AGES, r.age) ? r.age : null,
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : null,
  }
}

export interface Recommendation {
  consultation: Consultation
  /** Thèmes cochés par la personne et portés par la consultation : la raison affichée. */
  reasons: ThemeId[]
}

export interface Recommendations {
  /** false : la personne n'a rien choisi ou a refusé la personnalisation. */
  personalized: boolean
  forYou: Recommendation[]
  discover: Consultation[]
}

/**
 * Sélection « Pour vous » et « À découvrir » parmi les consultations ouvertes.
 * - Pour vous : au moins un thème en commun avec les thèmes cochés ; les plus proches
 *   de la clôture d'abord ; nombre limité par le rythme choisi.
 * - À découvrir : consultations hors des thèmes cochés, pour varier les sujets.
 * La liste complète reste toujours accessible ailleurs, sans filtre.
 */
export function recommend(all: Consultation[], prefs: Pick<Preferences, 'status' | 'themes' | 'frequency'>, now: Date): Recommendations {
  const open = all.filter((c) => phase(c, now) === 'ouverte').sort((a, b) => Date.parse(a.closesAt) - Date.parse(b.closesAt))
  const personalized = prefs.status === 'termine' && prefs.themes.length > 0 && prefs.frequency !== 'aucune'
  if (!personalized) return { personalized: false, forYou: [], discover: open.slice(0, 2) }

  const limit = FREQUENCIES.find((f) => f.id === prefs.frequency)?.highlights ?? 2
  const matches = open
    .map((consultation) => ({ consultation, reasons: prefs.themes.filter((t) => consultation.themes.includes(t)) }))
    .filter((r) => r.reasons.length > 0)
  const forYou = matches.slice(0, limit)
  const shown = new Set(forYou.map((r) => r.consultation.id))
  const outside = open.filter((c) => !matches.some((m) => m.consultation.id === c.id))
  const discover = (outside.length ? outside : open.filter((c) => !shown.has(c.id))).slice(0, 2)
  return { personalized: true, forYou, discover }
}
