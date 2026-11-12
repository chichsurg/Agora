import { describe, expect, it } from 'vitest'
import { cumulative, daysLeft, outcome, percentages, phase, total, withVote } from './tally'
import { nextStatus, safeUrl, validateArgument, validateProposal } from './proposals'
import { parseRoute } from '../app/router'
import { normalize, search } from './search'
import { dossiers } from '../data/demo'

describe('comptage des votes', () => {
  it("ajoute le vote du navigateur sans modifier les données d'origine", () => {
    const seed = { pour: 10, contre: 5, blanc: 2 }
    expect(withVote(seed, 'blanc')).toEqual({ pour: 10, contre: 5, blanc: 3 })
    expect(withVote(seed)).toEqual(seed)
    expect(seed.blanc).toBe(2)
  })

  it('compte le vote blanc dans la participation', () => {
    expect(total({ pour: 1, contre: 1, blanc: 1 })).toBe(3)
  })

  it('produit des pourcentages entiers dont la somme vaut 100', () => {
    for (const t of [
      { pour: 1, contre: 1, blanc: 1 },
      { pour: 612, contre: 398, blanc: 230 },
      { pour: 2, contre: 0, blanc: 1 },
      { pour: 7, contre: 7, blanc: 0 },
    ]) {
      const p = percentages(t)
      expect(p.pour + p.contre + p.blanc).toBe(100)
    }
    expect(percentages({ pour: 0, contre: 0, blanc: 0 })).toEqual({ pour: 0, contre: 0, blanc: 0 })
    expect(percentages({ pour: 3, contre: 1, blanc: 0 })).toEqual({ pour: 75, contre: 25, blanc: 0 })
  })
})

describe('lecture du résultat', () => {
  it('désigne le choix en tête', () => {
    expect(outcome({ pour: 5, contre: 3, blanc: 1 }, 'standard')).toBe('pour')
    expect(outcome({ pour: 2, contre: 3, blanc: 1 }, 'standard')).toBe('contre')
  })
  it('signale égalité et absence de vote', () => {
    expect(outcome({ pour: 3, contre: 3, blanc: 1 }, 'standard')).toBe('egalite')
    expect(outcome({ pour: 0, contre: 0, blanc: 0 }, 'standard')).toBe('aucun-vote')
  })
  it("n'applique la reformulation que lorsque la règle est activée", () => {
    const t = { pour: 2, contre: 3, blanc: 6 }
    expect(outcome(t, 'standard')).toBe('blanc')
    expect(outcome(t, 'reformulation-si-blanc')).toBe('reformulation')
    expect(outcome({ pour: 6, contre: 3, blanc: 6 }, 'reformulation-si-blanc')).toBe('egalite')
  })
})

describe('calendrier', () => {
  const c = { opensAt: '2026-01-10T00:00:00Z', closesAt: '2026-01-20T00:00:00Z' }
  it('distingue à venir, ouverte et close', () => {
    expect(phase(c, new Date('2026-01-09T12:00:00Z'))).toBe('a-venir')
    expect(phase(c, new Date('2026-01-10T00:00:00Z'))).toBe('ouverte')
    expect(phase(c, new Date('2026-01-20T00:00:00Z'))).toBe('close')
  })
  it('compte les jours restants sans descendre sous zéro', () => {
    expect(daysLeft(c.closesAt, new Date('2026-01-18T12:00:00Z'))).toBe(2)
    expect(daysLeft(c.closesAt, new Date('2026-02-01T00:00:00Z'))).toBe(0)
  })
  it('cumule les participations', () => {
    expect(cumulative([2, 3, 0, 5])).toEqual([2, 5, 5, 10])
  })
})

describe('propositions et arguments', () => {
  const ok = {
    title: 'Un titre suffisant',
    problem: 'Un problème décrit en plus de trente caractères.',
    solution: 'Une solution décrite en plus de trente caractères.',
    benefits: '',
    risks: 'Un risque identifié.',
    sources: '',
  }
  it('accepte un brouillon complet', () => {
    expect(validateProposal(ok)).toEqual({})
  })
  it('exige les risques et limites, et un titre', () => {
    const e = validateProposal({ ...ok, title: 'Court', risks: '' })
    expect(Object.keys(e).sort()).toEqual(['risks', 'title'])
  })
  it('suit le cycle de vie dans l’ordre', () => {
    expect(nextStatus('proposee')).toBe('discussion')
    expect(nextStatus('consultation')).toBe('conclusion')
    expect(nextStatus('conclusion')).toBeNull()
  })
  it('borne la longueur des arguments', () => {
    expect(validateArgument('trop court')).not.toBeNull()
    expect(validateArgument('x'.repeat(1201))).not.toBeNull()
    expect(validateArgument('Un argument assez développé pour être publié.')).toBeNull()
  })
  it('refuse les liens non http', () => {
    expect(safeUrl('javascript:alert(1)')).toBeNull()
    expect(safeUrl('data:text/html,x')).toBeNull()
    expect(safeUrl('pas un lien')).toBeNull()
    expect(safeUrl('https://www.vie-publique.fr')).toBe('https://www.vie-publique.fr/')
  })
})

describe('routage', () => {
  it('reconnaît les pages et les fiches', () => {
    expect(parseRoute('')).toEqual({ name: 'accueil' })
    expect(parseRoute('#debats')).toEqual({ name: 'debats' })
    expect(parseRoute('#dossier-participation-citoyenne')).toEqual({ name: 'dossier', id: 'participation-citoyenne' })
    expect(parseRoute('#consultation-ric')).toEqual({ name: 'consultation', id: 'ric' })
  })
  it('renvoie introuvable pour une ancre inconnue ou malformée', () => {
    expect(parseRoute('#nimporte')).toEqual({ name: 'introuvable' })
    expect(parseRoute('#dossier-')).toEqual({ name: 'introuvable' })
    expect(parseRoute('#dossier-<script>')).toEqual({ name: 'introuvable' })
  })
})

describe('recherche', () => {
  const items = [
    { kind: 'dossier' as const, id: 'a', title: 'La participation citoyenne', body: 'Référendum, tirage au sort, pétitions' },
    { kind: 'debat' as const, id: 'b', title: 'Le référendum en question', body: 'Un débat' },
    { kind: 'proposition' as const, id: 'c', title: 'Budget communal', body: 'Rien à voir' },
  ]
  it('ignore les accents, la casse et la ponctuation', () => {
    expect(normalize('  Référendum d’initiative ! ')).toBe('referendum d initiative')
    expect(search('REFERENDUM', items).map((x) => x.id)).toEqual(['b', 'a'])
  })
  it('exige tous les mots et place les titres en premier', () => {
    expect(search('tirage sort', items).map((x) => x.id)).toEqual(['a'])
    expect(search('référendum budget', items)).toEqual([])
  })
  it('ne renvoie rien pour une requête vide ou trop courte', () => {
    expect(search('', items)).toEqual([])
    expect(search(' a ', items)).toEqual([])
  })
})

describe('intégrité éditoriale des dossiers', () => {
  it('chaque fait cite au moins une source existante', () => {
    for (const d of dossiers) {
      const ids = new Set(d.sources.map((s) => s.id))
      for (const f of d.facts) {
        expect(f.sourceIds.length).toBeGreaterThan(0)
        for (const id of f.sourceIds) expect(ids.has(id), `${d.id}: source ${id}`).toBe(true)
      }
    }
  })
  it('présente des arguments des deux côtés et plusieurs points de vue', () => {
    for (const d of dossiers) {
      expect(d.argsFor.length).toBeGreaterThan(0)
      expect(d.argsAgainst.length).toBeGreaterThan(0)
      expect(d.viewpoints.length).toBeGreaterThan(1)
    }
  })
  it('ne publie aucune source hors http(s)', () => {
    for (const d of dossiers) for (const s of d.sources) expect(s.url).toMatch(/^https:\/\//)
  })
})
