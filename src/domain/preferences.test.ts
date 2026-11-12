import { describe, expect, it } from 'vitest'
import { emptyPreferences, recommend, sanitizePreferences, type Preferences } from './preferences'
import type { Consultation } from './types'
import { emptyState, migrate } from '../data/storage'
import { consultations as demo } from '../data/demo'

const NOW = new Date('2026-06-15T12:00:00Z')
const c = (id: string, themes: Consultation['themes'], closesInDays: number, opensInDays = -5): Consultation => ({
  id, themes, title: id, question: `${id} ?`, context: '', rule: 'standard', argsFor: [], argsAgainst: [],
  opensAt: new Date(NOW.getTime() + opensInDays * 86_400_000).toISOString(),
  closesAt: new Date(NOW.getTime() + closesInDays * 86_400_000).toISOString(),
  seed: { pour: 0, contre: 0, blanc: 0 }, seedDaily: [],
})
const all = [c('ecole', ['education'], 10), c('climat', ['environnement'], 3), c('mairie', ['territoires', 'economie'], 6), c('close', ['education'], -1), c('bientot', ['education'], 20, 2)]
const prefs = (p: Partial<Preferences>): Preferences => ({ ...emptyPreferences('termine'), frequency: 'hebdomadaire', ...p })

describe('recommandations', () => {
  it('propose en « Pour vous » les consultations ouvertes qui partagent un thème coché, avec la raison', () => {
    const r = recommend(all, prefs({ themes: ['education', 'economie'] }), NOW)
    expect(r.personalized).toBe(true)
    expect(r.forYou.map((x) => x.consultation.id)).toEqual(['mairie', 'ecole'])
    expect(r.forYou[0].reasons).toEqual(['economie'])
    expect(r.forYou[1].reasons).toEqual(['education'])
  })
  it("n'inclut jamais une consultation close ou à venir", () => {
    const ids = recommend(all, prefs({ themes: ['education'] }), NOW).forYou.map((x) => x.consultation.id)
    expect(ids).toEqual(['ecole'])
  })
  it('diversifie avec « À découvrir » : des sujets hors des thèmes cochés', () => {
    const r = recommend(all, prefs({ themes: ['education'] }), NOW)
    expect(r.discover.map((x) => x.id)).toEqual(['climat', 'mairie'])
    expect(r.discover.some((x) => r.forYou.some((f) => f.consultation.id === x.id))).toBe(false)
  })
  it('limite la mise en avant selon le rythme choisi', () => {
    const themes: Preferences['themes'] = ['education', 'environnement', 'territoires']
    expect(recommend(all, prefs({ themes, frequency: 'mensuelle' }), NOW).forYou).toHaveLength(1)
    expect(recommend(all, prefs({ themes, frequency: 'hebdomadaire' }), NOW).forYou).toHaveLength(2)
    expect(recommend(all, prefs({ themes, frequency: 'plusieurs' }), NOW).forYou).toHaveLength(3)
  })
  it('ne personnalise rien sans thème, sans validation, ou si la personne a choisi « aucune personnalisation »', () => {
    expect(recommend(all, prefs({ themes: [] }), NOW).personalized).toBe(false)
    expect(recommend(all, { ...prefs({ themes: ['education'] }), status: 'passe' }, NOW).personalized).toBe(false)
    const none = recommend(all, prefs({ themes: ['education'], frequency: 'aucune' }), NOW)
    expect(none.personalized).toBe(false)
    expect(none.forYou).toEqual([])
  })
  it('signale un thème sans consultation sans rien inventer', () => {
    const r = recommend(all, prefs({ themes: ['sante'] }), NOW)
    expect(r.personalized).toBe(true)
    expect(r.forYou).toEqual([])
    expect(r.discover.length).toBeGreaterThan(0)
  })
  it('ne dépend que des thèmes et du rythme : la fonction ne reçoit aucun vote', () => {
    // La signature n'accepte ni votes ni soutiens : aucune orientation politique ne peut être déduite.
    expect(recommend.length).toBe(3)
    const a = recommend(all, { status: 'termine', themes: ['education'], frequency: 'hebdomadaire' }, NOW)
    expect(a.forYou.map((x) => x.consultation.id)).toEqual(['ecole'])
  })
  it('chaque consultation de démonstration porte au moins un thème connu', () => {
    for (const d of demo) expect(sanitizePreferences({ themes: d.themes }).themes).toEqual(d.themes)
  })
})

describe('préférences', () => {
  it('écarte les valeurs inconnues et les doublons', () => {
    const p = sanitizePreferences({ status: 'termine', themes: ['education', 'education', 'inconnu', 42], frequency: 'quotidienne', situation: 'etudes', age: '18-24' })
    expect(p).toMatchObject({ status: 'termine', themes: ['education'], frequency: null, situation: 'etudes', age: '18-24' })
  })
  it("ne conserve ni l'âge ni la situation en dessous de 15 ans", () => {
    const p = sanitizePreferences({ status: 'termine', themes: ['education'], situation: 'etudes', age: 'moins-15' })
    expect(p.age).toBeNull()
    expect(p.situation).toBeNull()
    expect(p.themes).toEqual(['education'])
  })
  it('conserve la tranche 15-17 ans', () => {
    expect(sanitizePreferences({ age: '15-17' }).age).toBe('15-17')
  })
  it('renvoie des préférences vides pour une entrée illisible', () => {
    expect(sanitizePreferences(null)).toEqual(emptyPreferences())
    expect(sanitizePreferences('n’importe quoi')).toEqual(emptyPreferences())
  })
})

describe('migration du stockage', () => {
  const v1 = {
    v: 1, pseudonym: 'Camille', theme: 'dark',
    votes: { ric: { choice: 'blanc', at: '2026-05-01T10:00:00.000Z' } },
    arguments: [{ id: 'u1', debateId: 'tirage-au-sort', author: 'Camille', stance: 'pour', text: 'Un argument conservé.', createdAt: '2026-05-01T10:00:00.000Z', supports: 0, demo: false }],
    supportedArguments: ['a1'], proposals: [{ id: 'u2', title: 'Ma proposition' }], supportedProposals: ['jury-petitions'],
    proposalStatus: {}, followed: ['ric'], reports: [], moderation: {}, journal: [], adminMode: false,
  }
  it('conserve votes, arguments, propositions et réglages enregistrés par la version 1', () => {
    const m = migrate(v1)!
    expect(m.v).toBe(2)
    expect(m.votes).toEqual(v1.votes)
    expect(m.arguments).toEqual(v1.arguments)
    expect(m.proposals).toEqual(v1.proposals)
    expect(m.supportedArguments).toEqual(['a1'])
    expect(m.supportedProposals).toEqual(['jury-petitions'])
    expect(m.followed).toEqual(['ric'])
    expect(m.pseudonym).toBe('Camille')
    expect(m.theme).toBe('dark')
  })
  it('ajoute des préférences vides sans toucher au reste', () => {
    expect(migrate(v1)!.prefs).toEqual(emptyPreferences())
  })
  it('complète un enregistrement partiel au lieu de le rejeter', () => {
    const m = migrate({ v: 1, votes: { ric: { choice: 'pour', at: 'x' } } })!
    expect(m.votes.ric.choice).toBe('pour')
    expect(m.arguments).toEqual([])
    expect(m.theme).toBe('system')
  })
  it('relit la version 2 avec ses préférences, enregistrées à part', () => {
    const m = migrate({ ...v1, v: 2 }, { status: 'termine', themes: ['sante'], frequency: 'mensuelle' })!
    expect(m.prefs.themes).toEqual(['sante'])
    expect(m.votes).toEqual(v1.votes)
  })
  it("refuse sans rien inventer des données illisibles ou d'une version plus récente", () => {
    expect(migrate(null)).toBeNull()
    expect(migrate('texte')).toBeNull()
    expect(migrate({ v: 3, votes: {} })).toBeNull()
  })
  it('ne range aucune préférence parmi les participations', () => {
    const { prefs, ...participation } = emptyState()
    expect(prefs).toBeDefined()
    expect(Object.keys(participation)).not.toContain('prefs')
  })
})
