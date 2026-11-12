// Services d'IA : point d'extension, désactivé par défaut.
// AGORA fonctionne entièrement sans fournisseur d'IA. Une intégration future passera
// par un serveur (jamais de clé dans le frontend) et ne recevra que des contenus publics.

export interface AiResult {
  text: string
  /** Toujours affiché à l'utilisateur : une synthèse IA est signalée comme telle. */
  generatedByAi: true
  provider: string
}

export interface AiProvider {
  readonly name: string
  readonly available: boolean
  suggestKeywords(publicText: string): Promise<string[]>
  summarize(publicText: string): Promise<AiResult | null>
}

export const noAi: AiProvider = {
  name: 'aucun',
  available: false,
  suggestKeywords: async () => [],
  summarize: async () => null,
}

export const ai: AiProvider = noAi
