import type { ProposalStatus } from './types'

/** Étapes internes à AGORA : aucune ne vaut décision publique officielle. */
export const LIFECYCLE: { id: ProposalStatus; label: string }[] = [
  { id: 'proposee', label: 'Proposée' },
  { id: 'discussion', label: 'En discussion' },
  { id: 'analyse', label: 'En analyse' },
  { id: 'consultation', label: 'En consultation' },
  { id: 'conclusion', label: 'Conclusion' },
]

export function statusLabel(s: ProposalStatus): string {
  return LIFECYCLE.find((x) => x.id === s)!.label
}

export function nextStatus(s: ProposalStatus): ProposalStatus | null {
  const i = LIFECYCLE.findIndex((x) => x.id === s)
  return i < LIFECYCLE.length - 1 ? LIFECYCLE[i + 1].id : null
}

export interface ProposalDraft {
  title: string
  problem: string
  solution: string
  benefits: string
  risks: string
  sources: string
}

export const LIMITS = { title: [8, 120], problem: [30, 1000], solution: [30, 1000], benefits: [0, 600], risks: [10, 600], sources: [0, 600] } as const

const NAMES: Record<keyof ProposalDraft, string> = {
  title: 'Le titre',
  problem: 'Le problème identifié',
  solution: 'La solution proposée',
  benefits: 'Les bénéfices attendus',
  risks: 'Les risques et limites',
  sources: 'Les sources',
}

/** Renvoie un message d'erreur par champ invalide. Objet vide = brouillon valide. */
export function validateProposal(d: ProposalDraft): Partial<Record<keyof ProposalDraft, string>> {
  const errors: Partial<Record<keyof ProposalDraft, string>> = {}
  for (const key of Object.keys(LIMITS) as (keyof ProposalDraft)[]) {
    const [min, max] = LIMITS[key]
    const len = d[key].trim().length
    if (len < min) errors[key] = `${NAMES[key]} doit compter au moins ${min} caractères (${len} pour l'instant).`
    else if (len > max) errors[key] = `${NAMES[key]} ne doit pas dépasser ${max} caractères (${len} pour l'instant).`
  }
  return errors
}

/** Validation d'un argument de débat. Renvoie null si le texte est acceptable. */
export function validateArgument(text: string): string | null {
  const len = text.trim().length
  if (len < 20) return `Développez votre argument : 20 caractères au minimum (${len} pour l'instant).`
  if (len > 1200) return `Votre argument dépasse 1 200 caractères (${len}). Raccourcissez-le.`
  return null
}

/** N'accepte que des liens http(s) : jamais de javascript: ni de data:. */
export function safeUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim())
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null
  } catch {
    return null
  }
}
