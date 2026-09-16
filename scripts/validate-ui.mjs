import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const images = readFileSync(new URL('../src/image-data.ts', import.meta.url), 'utf8')
const dataFiles = [
  '../src/data/jackets-01-05.json',
  '../src/data/jackets-06-10.json',
  '../src/data/jackets-11-15.json',
  '../src/data/jackets-16-20.json',
]

const jackets = dataFiles.flatMap(path =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')),
)

const failures = []
const requireText = (haystack, needle, label = needle) => {
  if (!haystack.includes(needle)) failures.push(`missing: ${label}`)
}

if (jackets.length !== 20) failures.push(`expected 20 jackets, got ${jackets.length}`)

for (const jacket of jackets) {
  if (!images.includes(`'${jacket.id}'`)) failures.push(`missing image metadata: ${jacket.id}`)
}

for (const token of [
  'data-testid="scenario-selector"',
  'data-testid="top3-section"',
  'data-testid="ranking-section"',
  'data-testid="full-data-section"',
  'Uwzględnij moje preferencje wizualne w shortlistcie',
  'Nie przypisano oceny liczbowej w audycie.',
  'Porównanie: {compareIds.length}/4',
  'SourceLinks',
  'ProductPhoto',
  'shortlistForScenario(scenario, includeVisual, dislikes)',
]) requireText(app, token)

if (app.includes('Stage 1 recovery scaffold')) failures.push('legacy Stage 1 scaffold copy remains in UI')
if (app.includes("imageStatus: 'needs-verification'")) failures.push('UI reintroduces Stage 2 image placeholder state')

if (failures.length) {
  console.error('Stage 3 UI validation FAIL')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Stage 3 UI validation PASS')
console.log(`- product image metadata: ${jackets.length}/20`)
console.log('- required selector, TOP3, TOP20, full-data and comparison hooks present')
console.log('- explicit no-numeric-rating fallback present')
