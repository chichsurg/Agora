import { describe, expect, it } from 'vitest'
import { contrast, luminance } from './contrast'
// Lit les jetons réels de src/index.css : si une couleur change, ces contrôles la suivent.
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')
const tokens = (block: string) => Object.fromEntries([...block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]))
const light = tokens(css.slice(css.indexOf(':root {'), css.indexOf('@media (prefers-color-scheme: dark)')))
const dark = tokens(css.slice(css.indexOf(':root[data-theme="dark"] {'), css.indexOf('@theme inline')))

const CHOICES = ['pour', 'contre', 'blanc'] as const

describe.each([['clair', light], ['sombre', dark]])('couleurs de participation, thème %s', (_name, t) => {
  it('définit les quatre jetons de chaque famille', () => {
    for (const c of CHOICES) for (const k of [c, `${c}-ink`, `${c}-soft`, `on-${c}`]) expect(t[k], k).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('texte coloré lisible (AA, 4,5:1) sur fond doux, sur carte et sur la page', () => {
    for (const c of CHOICES) {
      for (const bg of [t[`${c}-soft`], t.surface, t.bg]) expect(contrast(t[`${c}-ink`], bg), `${c}-ink sur ${bg}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('texte lisible (AA) sur les aplats et texte courant lisible sur les fonds doux', () => {
    for (const c of CHOICES) {
      expect(contrast(t[`on-${c}`], t[c]), `on-${c}`).toBeGreaterThanOrEqual(4.5)
      expect(contrast(t.ink, t[`${c}-soft`]), `encre sur ${c}-soft`).toBeGreaterThanOrEqual(4.5)
      expect(contrast(t.ink2, t[`${c}-soft`]), `encre 2 sur ${c}-soft`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('formes des graphiques perceptibles (3:1) : aplats POUR et CONTRE, liseré du BLANC', () => {
    for (const bg of [t.surface, t.bg]) {
      expect(contrast(t.pour, bg)).toBeGreaterThanOrEqual(3)
      expect(contrast(t.contre, bg)).toBeGreaterThanOrEqual(3)
      expect(contrast(t['blanc-edge'], bg)).toBeGreaterThanOrEqual(3)
    }
  })

  it('POUR et CONTRE ont un poids visuel équivalent', () => {
    // Même ordre de grandeur de luminance et de contraste : aucune des deux positions ne domine l'autre.
    expect(Math.abs(luminance(t.pour) - luminance(t.contre))).toBeLessThan(0.06)
    expect(Math.abs(contrast(t.pour, t.surface) - contrast(t.contre, t.surface))).toBeLessThan(1)
    expect(Math.abs(contrast(t['pour-ink'], t['pour-soft']) - contrast(t['contre-ink'], t['contre-soft']))).toBeLessThan(1)
  })

  it("CONTRE ne reprend pas la couleur d'erreur", () => {
    expect(t.contre.toLowerCase()).not.toBe(t.alert.toLowerCase())
    expect(t['contre-ink'].toLowerCase()).not.toBe(t.alert.toLowerCase())
  })
})
