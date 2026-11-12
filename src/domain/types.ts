// Modèle métier d'AGORA. Aucune dépendance à l'interface ni au stockage.
import type { ThemeId } from './preferences'

export type Choice = 'pour' | 'contre' | 'blanc'
export type Tally = Record<Choice, number>

export interface Source {
  id: string
  title: string
  publisher: string
  url: string
}

export interface Fact {
  text: string
  sourceIds: string[]
}

export interface Point {
  title: string
  text: string
}

/** 'brouillon-ia' : rédigé avec assistance IA, pas encore relu par un humain. */
export type EditorialStatus = 'brouillon-ia' | 'valide'

export interface Dossier {
  id: string
  /** Identifiant d'une photo de data/media.ts. Illustration seulement. */
  photo: 'invalides' | 'assemblee' | 'luxembourg' | 'soufflot'
  title: string
  theme: string
  summary: string
  editorial: EditorialStatus
  updatedAt: string
  facts: Fact[]
  issues: Point[]
  viewpoints: Point[]
  argsFor: Point[]
  argsAgainst: Point[]
  /** Vide tant qu'aucune analyse réelle et attribuée n'a été publiée. */
  expertAnalyses: Point[]
  sources: Source[]
}

/** 'reformulation-si-blanc' : règle à l'étude, réservée aux consultations portant sur le modèle 6EME REPUBLIC. */
export type CountingRule = 'standard' | 'reformulation-si-blanc'

export interface Consultation {
  id: string
  /** Thèmes civiques de la consultation : seule base des recommandations. */
  themes: ThemeId[]
  title: string
  question: string
  context: string
  dossierId?: string
  opensAt: string
  closesAt: string
  rule: CountingRule
  argsFor: Point[]
  argsAgainst: Point[]
  /** Votes fictifs de démonstration. */
  seed: Tally
  /** Participations fictives par jour depuis l'ouverture. */
  seedDaily: number[]
}

export type ConsultationPhase = 'a-venir' | 'ouverte' | 'close'

export type Stance = 'pour' | 'contre' | 'nuance'

export interface Argument {
  id: string
  debateId: string
  parentId?: string
  author: string
  stance: Stance
  text: string
  sourceUrl?: string
  createdAt: string
  supports: number
  /** true : contenu fictif fourni avec le prototype. */
  demo: boolean
}

export interface Debate {
  id: string
  photo: Dossier['photo']
  title: string
  prompt: string
  dossierId?: string
}

export type ProposalStatus = 'proposee' | 'discussion' | 'analyse' | 'consultation' | 'conclusion'

export interface Proposal {
  id: string
  title: string
  problem: string
  solution: string
  benefits: string
  risks: string
  sources: string
  status: ProposalStatus
  author: string
  createdAt: string
  supports: number
  demo: boolean
}

export interface Report {
  id: string
  argumentId: string
  reason: string
  createdAt: string
  resolved: boolean
}

export interface Moderation {
  hidden: boolean
  reason: string
  /** Contestation déposée par l'auteur ou un lecteur. */
  appeal?: string
}

export interface LogEntry {
  at: string
  action: string
  detail: string
}
