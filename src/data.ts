import jackets01to05 from './data/jackets-01-05.json'
import jackets06to10 from './data/jackets-06-10.json'
import jackets11to15 from './data/jackets-11-15.json'
import jackets16to20 from './data/jackets-16-20.json'

const rawJackets = [
  ...jackets01to05,
  ...jackets06to10,
  ...jackets11to15,
  ...jackets16to20,
]

/**
 * STAGE 2 AUTHORITATIVE DATA
 * Product facts come from the Notion DATA PACK dated 15.09.2026.
 * Ranking and scenario selector logic are intentionally preserved from Stage 1.
 */
export type EvidenceStatus =
  | 'confirmed'
  | 'secondary-confirmed'
  | 'disputed'
  | 'manufacturer-unpublished'
  | 'not-applicable'

export type EvidenceField = {
  text: string
  status: EvidenceStatus
}

export type ProductSource = {
  label: string
  url?: string
}

export type JacketFacts = {
  id: string
  rank: number
  brand: string
  model: string
  shortModel: string
  description: string
  weight: EvidenceField
  insulation: EvidenceField
  insulationWeight: EvidenceField
  construction: string
  bodyMapping: string
  useProfile: string
  priceReference: string
  strengths: string[]
  weaknesses: string[]
  dataStatus: EvidenceStatus
  sources: ProductSource[]
}

export type ImageStatus = 'verified' | 'needs-verification'

export type Jacket = JacketFacts & {
  breathability?: number
  wind?: number
  backpack?: number
  forest?: number
  km20?: number
  km50?: number
  km100?: number

  // Compatibility aliases used by the recovered Stage 1 UI.
  price: string
  verdict: string
  caveats: string[]

  // Image migration is outside Stage 2.
  imageStatus: ImageStatus
  imageUrl?: string
  imageFallbacks?: string[]
  imageSourceLabel?: string
  imageSourceUrl?: string
  color?: string
}

const authoritativeFacts = rawJackets as JacketFacts[]

const ids = Object.fromEntries(
  authoritativeFacts.map(({ rank, id }) => [rank, id]),
) as Record<number, string>

const knownRatings: Record<
  number,
  Partial<Pick<Jacket, 'breathability' | 'wind' | 'backpack' | 'forest' | 'km20' | 'km50' | 'km100'>>
> = {
  1: { breathability: 4.5, wind: 4, backpack: 4.5, forest: 4, km20: 5, km50: 5, km100: 4 },
  2: { breathability: 4.5, wind: 4, backpack: 4.5, forest: 3.5, km20: 5, km50: 4.5, km100: 3.5 },
  3: { breathability: 5, wind: 3.5, backpack: 4, forest: 3.5, km20: 4.5, km50: 5, km100: 4.5 },
  4: { breathability: 4.5, wind: 4, backpack: 5, forest: 3.5, km20: 5, km50: 4.5, km100: 4 },
  5: { breathability: 5, wind: 3.5, backpack: 4, forest: 3.5, km20: 4.5, km50: 5, km100: 4 },
  6: { breathability: 5, wind: 3.5, backpack: 4.5, forest: 3.5, km20: 4.5, km50: 5, km100: 4.5 },
  7: { breathability: 5, wind: 3.5, backpack: 4.5, forest: 3.5, km20: 4, km50: 5, km100: 5 },
  8: { breathability: 4.5, wind: 4, backpack: 4.5, forest: 4, km20: 4.5, km50: 4.5, km100: 4 },
  9: { breathability: 5, wind: 3, backpack: 4.5, forest: 3, km20: 4, km50: 5, km100: 4.5 },
  10: { breathability: 4, wind: 4.5, backpack: 4.5, forest: 5, km20: 5, km50: 4, km100: 3.5 },
}

export const jackets: Jacket[] = authoritativeFacts.map(facts => ({
  ...facts,
  ...(knownRatings[facts.rank] || {}),
  price: facts.priceReference,
  verdict: facts.description,
  caveats: facts.weaknesses,
  imageStatus: 'needs-verification',
}))

export type Scenario = {
  distance: '10–20 km' | '20–40 km' | '40–50 km'
  temperature: 'chłód' | 'około 0°C' | 'lekki mróz'
  pace: 'spokojne' | 'umiarkowane' | 'bardzo szybkie'
  mode: 'jedna kurtka' | 'system warstwowy'
  wind: boolean
  forest: boolean
  backpack: boolean
  value: boolean
}

export const defaultScenario: Scenario = {
  distance: '20–40 km',
  temperature: 'około 0°C',
  pace: 'umiarkowane',
  mode: 'jedna kurtka',
  wind: false,
  forest: true,
  backpack: true,
  value: false,
}

export function shortlistForScenario(
  s: Scenario,
  includeVisual: boolean,
  dislikes: Set<string>,
) {
  const signals: string[] = []
  const preferred: string[] = []
  const add = (...itemIds: string[]) =>
    itemIds.forEach(id => {
      if (!preferred.includes(id)) preferred.push(id)
    })

  if (s.mode === 'jedna kurtka') {
    add(ids[1], ids[2])
    signals.push('tryb: jedna kurtka → Norrøna / Rab')
  } else {
    add(ids[9], ids[7], ids[5])
    signals.push('tryb: system warstwowy → Mammut / Patagonia')
  }

  if (s.distance === '10–20 km') add(ids[2], ids[1])
  if (s.distance === '20–40 km') add(ids[1], ids[2], ids[4])
  if (s.distance === '40–50 km') add(ids[1], ids[3], ids[5], ids[6])
  if (s.temperature === 'około 0°C') add(ids[2], ids[1])
  if (s.temperature === 'lekki mróz') add(ids[2], ids[11], ids[10])
  if (s.pace === 'bardzo szybkie') add(ids[3], ids[5], ids[6], ids[7], ids[9])
  if (s.wind) add(ids[10], ids[1], ids[11])
  if (s.forest) add(ids[10], ids[8], ids[1])
  if (s.backpack) add(ids[4], ids[9], ids[10])
  if (s.value) add(ids[5], ids[18], ids[19])

  const ordered = [...jackets].sort((a, b) => {
    const ai = preferred.indexOf(a.id)
    const bi = preferred.indexOf(b.id)
    if (ai >= 0 && bi >= 0) return ai - bi
    if (ai >= 0) return -1
    if (bi >= 0) return 1
    return a.rank - b.rank
  })

  const filtered = includeVisual
    ? ordered.filter(j => !dislikes.has(j.id))
    : ordered

  return { top3: filtered.slice(0, 3), signals }
}
