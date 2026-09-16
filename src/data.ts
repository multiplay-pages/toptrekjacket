/**
 * STAGE 1 RECOVERY NOTE
 * This is a non-authoritative legacy scaffold. Product evidence will be migrated
 * from the Notion DATA PACK in Stage 2. Do not deploy this dataset to production.
 */
export type DataStatus = 'potwierdzony' | 'prawdopodobny' | 'sporny' | 'brak danych'
export type ImageStatus = 'verified' | 'needs-verification'

export type Jacket = {
  id: string
  rank: number
  brand: string
  model: string
  shortModel: string
  weight: string
  insulation: string
  bodyMapping: string
  breathability?: number
  wind?: number
  backpack?: number
  forest?: number
  km20?: number
  km50?: number
  km100?: number
  price: string
  verdict: string
  strengths: string[]
  caveats: string[]
  dataStatus: DataStatus
  imageStatus: ImageStatus
  imageUrl?: string
  imageFallbacks?: string[]
  imageSourceLabel?: string
  imageSourceUrl?: string
  color?: string
}

type Seed = [number, string, string, string]
const seeds: Seed[] = [
  [1, 'Norrøna', 'falketind thermo40 Zip Hood Men', 'norrona-falketind-thermo40'],
  [2, 'Rab', 'Xenair Alpine Light Insulated Jacket', 'rab-xenair-alpine-light'],
  [3, 'Peak Performance', 'Freelight Polartec Alpha Insulated Hood Jacket', 'peak-freelight-alpha'],
  [4, 'La Sportiva', 'Aequilibrium Lite Insulation Jkt M', 'lasportiva-aequilibrium-lite'],
  [5, 'Dynafit', 'Mezzalama Polartec Alpha Jacket Men', 'dynafit-mezzalama-alpha'],
  [6, 'Outdoor Research', 'Deviator Hoodie', 'or-deviator'],
  [7, 'Patagonia', 'Nano-Air Ultralight Full-Zip Hoody', 'patagonia-nano-air-ultralight'],
  [8, 'Mountain Equipment', 'Switch Pro Hooded Jacket', 'me-switch-pro'],
  [9, 'Mammut', 'Aenergy ML Hybrid Hooded Jacket Men', 'mammut-aenergy-ml-hybrid'],
  [10, 'Salewa', 'Ortles Hybrid TirolWool Responsive Jacket', 'salewa-ortles-hybrid'],
  [11, "Arc'teryx", 'Proton Hoody', 'arcteryx-proton'],
  [12, 'Ortovox', 'Venet Swisswool 60 Jacket M', 'ortovox-venet-swisswool-60'],
  [13, 'Houdini', "M's Tech Insulation Houdi", 'houdini-tech-insulation-houdi'],
  [14, 'Montane', 'Sirocco XT Hooded Insulated Jacket', 'montane-sirocco-xt'],
  [15, 'Klättermusen', 'Alv 2.0 Jacket Men', 'klattermusen-alv2'],
  [16, 'VAUDE', 'Sesvenna / Sesvenna IV 42970', 'vaude-sesvenna'],
  [17, 'Goldwin', 'PERTEX Quantum Air Insulated Jacket GM25306', 'goldwin-pertex-qa'],
  [18, 'Cumulus', 'Climalite Full Zip', 'cumulus-climalite'],
  [19, 'Milo', 'Nafo', 'milo-nafo'],
  [20, 'Helly Hansen', 'LIFALOFT Insulator Jacket', 'hh-lifaloft'],
]

const ids = Object.fromEntries(seeds.map(([rank,,, id]) => [rank, id])) as Record<number, string>
const knownRatings: Record<number, Partial<Pick<Jacket, 'breathability'|'wind'|'backpack'|'forest'|'km20'|'km50'|'km100'>>> = {
  1: { breathability: 4.5, wind: 4, backpack: 4.5, forest: 4, km20: 5, km50: 5, km100: 4 },
  2: { breathability: 4.5, wind: 4, backpack: 4.5, forest: 3.5, km20: 5, km50: 4.5, km100: 3.5 },
  3: { breathability: 5, wind: 3.5, backpack: 4, forest: 3.5, km20: 4.5, km50: 5, km100: 4.5 },
  4: { breathability: 4.5, wind: 4, backpack: 5, forest: 3.5, km20: 5, km50: 4.5, km100: 4 },
  5: { breathability: 5, wind: 3.5, backpack: 4, forest: 3.5, km20: 4.5, km50: 5, km100: 4 },
  6: { breathability: 5, wind: 3.5, backpack: 4.5, forest: 3.5, km20: 4.5, km50: 5, km100: 4.5 },
  7: { breathability: 5, wind: 3.5, backpack: 4.5, forest: 3.5, km20: 4, km50: 5, km100: 5 },
  8: { breathability: 4.5, wind: 4, backpack: 4.5, forest: 4, km20: 4.5, km50: 4.5, km100: 4 },
  9: { breathability: 5, wind: 3, backpack: 4.5, forest: 3, km20: 4, km50: 5, km100: 4.5 },
  10:{ breathability: 4, wind: 4.5, backpack: 4.5, forest: 5, km20: 5, km50: 4, km100: 3.5 },
}

export const jackets: Jacket[] = seeds.map(([rank, brand, model, id]) => ({
  id,
  rank,
  brand,
  model,
  shortModel: model,
  weight: 'Stage 2: migrate from authoritative DATA PACK',
  insulation: 'Stage 2: migrate from authoritative DATA PACK',
  bodyMapping: 'Stage 2: migrate from authoritative DATA PACK',
  ...(knownRatings[rank] || {}),
  price: 'Stage 2: migrate from authoritative DATA PACK',
  verdict: rank <= 10 ? 'Legacy scaffold — ranking preserved; facts pending Stage 2 migration.' : 'Legacy scaffold — no numeric audit ratings assigned here.',
  strengths: ['Stage 2: migrate verified strengths from DATA PACK'],
  caveats: ['This record is intentionally non-authoritative in Stage 1.'],
  dataStatus: 'brak danych',
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
  distance: '20–40 km', temperature: 'około 0°C', pace: 'umiarkowane', mode: 'jedna kurtka', wind: false, forest: true, backpack: true, value: false,
}

export function shortlistForScenario(s: Scenario, includeVisual: boolean, dislikes: Set<string>) {
  const signals: string[] = []
  const preferred: string[] = []
  const add = (...itemIds: string[]) => itemIds.forEach(id => { if (!preferred.includes(id)) preferred.push(id) })

  if (s.mode === 'jedna kurtka') { add(ids[1], ids[2]); signals.push('tryb: jedna kurtka → Norrøna / Rab') }
  else { add(ids[9], ids[7], ids[5]); signals.push('tryb: system warstwowy → Mammut / Patagonia') }

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
    const ai = preferred.indexOf(a.id), bi = preferred.indexOf(b.id)
    if (ai >= 0 && bi >= 0) return ai - bi
    if (ai >= 0) return -1
    if (bi >= 0) return 1
    return a.rank - b.rank
  })
  const filtered = includeVisual ? ordered.filter(j => !dislikes.has(j.id)) : ordered
  return { top3: filtered.slice(0, 3), signals }
}
