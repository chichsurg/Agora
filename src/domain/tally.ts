import type { Choice, Consultation, ConsultationPhase, Tally } from './types'

export const CHOICES: Choice[] = ['pour', 'contre', 'blanc']

/** Additionne les votes de démonstration et le vote éventuel de ce navigateur. */
export function withVote(seed: Tally, vote?: Choice): Tally {
  const t = { ...seed }
  if (vote) t[vote] += 1
  return t
}

export function total(t: Tally): number {
  return t.pour + t.contre + t.blanc
}

/**
 * Pourcentages entiers dont la somme vaut exactement 100 (méthode du plus fort reste).
 * La base est l'ensemble des participations, votes blancs compris : le blanc est un choix exprimé.
 * L'abstention (ne pas participer) n'est ni comptée ni estimée.
 */
export function percentages(t: Tally): Tally {
  const n = total(t)
  if (n === 0) return { pour: 0, contre: 0, blanc: 0 }
  const exact = CHOICES.map((c) => (t[c] * 100) / n)
  const floor = exact.map(Math.floor)
  let rest = 100 - floor.reduce((a, b) => a + b, 0)
  const order = exact.map((x, i) => ({ i, r: x - floor[i] })).sort((a, b) => b.r - a.r || a.i - b.i)
  for (const { i } of order) {
    if (rest <= 0) break
    floor[i] += 1
    rest -= 1
  }
  return { pour: floor[0], contre: floor[1], blanc: floor[2] }
}

export type Outcome = 'aucun-vote' | 'pour' | 'contre' | 'blanc' | 'egalite' | 'reformulation'

/**
 * Lecture du résultat. Avec la règle 'reformulation-si-blanc', un vote blanc strictement
 * en tête signifie que la question doit être reformulée, pas qu'une option l'emporte.
 */
export function outcome(t: Tally, rule: Consultation['rule']): Outcome {
  if (total(t) === 0) return 'aucun-vote'
  const max = Math.max(t.pour, t.contre, t.blanc)
  const leaders = CHOICES.filter((c) => t[c] === max)
  if (leaders.length > 1) return 'egalite'
  if (leaders[0] === 'blanc' && rule === 'reformulation-si-blanc') return 'reformulation'
  return leaders[0]
}

export function phase(c: Pick<Consultation, 'opensAt' | 'closesAt'>, now: Date): ConsultationPhase {
  const t = now.getTime()
  if (t < Date.parse(c.opensAt)) return 'a-venir'
  if (t >= Date.parse(c.closesAt)) return 'close'
  return 'ouverte'
}

export function daysLeft(closesAt: string, now: Date): number {
  return Math.max(0, Math.ceil((Date.parse(closesAt) - now.getTime()) / 86_400_000))
}

/** Cumul jour par jour, pour la courbe d'évolution. */
export function cumulative(daily: number[]): number[] {
  let sum = 0
  return daily.map((d) => (sum += d))
}
