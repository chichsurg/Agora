// Transforme le build mono-fichier en page publiable comme Claude Artifact
// (l'hébergeur ajoute lui-même <!doctype>, <html>, <head> et <body>).
import { readFileSync, writeFileSync } from 'node:fs'

const html = readFileSync('dist-artifact/index.html', 'utf8')
const grab = (re) => [...html.matchAll(re)].map((m) => m[0]).join('\n')
const out = [
  '<meta name="claude:viewport-fit-sides" content="cover">',
  '<title>AGORA</title>',
  grab(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/g),
  grab(/<style[\s\S]*?<\/style>/g),
  '<div id="root"></div>',
  grab(/<script[\s\S]*?<\/script>/g),
].join('\n')
writeFileSync('dist-artifact/agora.html', out)
console.log(`dist-artifact/agora.html — ${(out.length / 1024).toFixed(0)} Ko`)
