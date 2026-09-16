import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const images = readFileSync(new URL('../src/image-data.ts', import.meta.url), 'utf8')
const market = readFileSync(new URL('../src/market-data.ts', import.meta.url), 'utf8')
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
  if (!market.includes(`${jacket.rank}: {`)) failures.push(`missing Stage 7 rating/price snapshot: rank ${jacket.rank}`)
}

for (const token of [
  'data-testid="scenario-selector"',
  'data-testid="top3-section"',
  'data-testid="ranking-section"',
  'data-testid="full-data-section"',
  'Uwzględnij moje preferencje wizualne w shortlistcie',
  'Oceny użytkowe',
  'Średnia cena',
  'data-testid="top-gsm"',
  'data-testid="top-limitations"',
  'data-testid="top-price"',
  'data-testid={`market-price-${jacket.rank}`}',
  'detail-summary-specs-',
  'Porównanie: {compareIds.length}/4',
  'SourceLinks',
  'ProductPhoto',
  'shortlistForScenario(scenario, includeVisual, dislikes)',
]) requireText(app, token)

for (const token of [
  'marketDataByRank',
  'marketPriceCheckedAt',
  'priceSources',
  '1 EUR = 4.34793 PLN',
  '1 JPY = 0.0242783 PLN',
]) requireText(market, token)

requireText(images, 'https://wsrv.nl/?url=', 'deterministic exact-image proxy fallback')

if (app.includes('Dla pozycji 11–20 nie dopisujemy ocen 1–5')) failures.push('legacy #11–20 no-rating copy remains in UI')
if (app.includes('Stage 1 recovery scaffold')) failures.push('legacy Stage 1 scaffold copy remains in UI')
if (app.includes("imageStatus: 'needs-verification'")) failures.push('UI reintroduces Stage 2 image placeholder state')

if (failures.length) {
  console.error('Stage 7 UI validation FAIL')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Stage 7 UI validation PASS')
console.log(`- product image metadata: ${jackets.length}/20`)
console.log('- deterministic exact-image proxy fallback present')
console.log('- market/rating snapshot: 20/20')
console.log('- required selector, TOP3, TOP20, full-data and comparison hooks present')
console.log('- TOP3 gsm + limitations + market-price presentation guardrails present')
console.log('- all 20 models are expected to expose numeric editorial ratings')
console.log('- comparison and full DATA PACK expose dated market prices')
