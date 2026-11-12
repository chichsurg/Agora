export type ResultKind = 'dossier' | 'consultation' | 'debat' | 'proposition'

export interface Searchable {
  kind: ResultKind
  id: string
  title: string
  /** Texte complémentaire parcouru par la recherche (résumé, faits, contexte…). */
  body: string
}

/** Minuscules, sans accents ni ponctuation : « Référendum » et « referendum » se valent. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Tous les mots de la requête doivent apparaître. Un mot trouvé dans le titre pèse
 * plus qu'un mot trouvé dans le corps. Aucun classement par popularité.
 */
export function search<T extends Searchable>(query: string, items: T[]): T[] {
  const words = normalize(query).split(' ').filter((w) => w.length >= 2)
  if (words.length === 0) return []
  return items
    .map((item, order) => {
      const title = normalize(item.title)
      const body = normalize(item.body)
      let score = 0
      for (const w of words) {
        if (title.includes(w)) score += 3
        else if (body.includes(w)) score += 1
        else return null
      }
      return { item, score, order }
    })
    .filter((x) => x !== null)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((x) => x.item)
}
