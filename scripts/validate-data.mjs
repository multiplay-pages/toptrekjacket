import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const files = [
  'src/data/jackets-01-05.json',
  'src/data/jackets-06-10.json',
  'src/data/jackets-11-15.json',
  'src/data/jackets-16-20.json',
].map(file => path.resolve(file))

const records = files.flatMap(file => JSON.parse(fs.readFileSync(file, 'utf8')))

const allowedStatuses = new Set([
  'confirmed',
  'secondary-confirmed',
  'disputed',
  'manufacturer-unpublished',
  'not-applicable',
])

const requiredText = [
  'id',
  'brand',
  'model',
  'shortModel',
  'description',
  'construction',
  'bodyMapping',
  'useProfile',
  'priceReference',
]

const forbiddenExact = new Set(['', '-', '—', 'brak danych', 'todo', 'tbd'])
const errors = []

function fail(rank, field, message) {
  errors.push(`#${rank ?? '?'} ${field}: ${message}`)
}

function substantive(value, minLength = 8) {
  return typeof value === 'string' && value.trim().length >= minLength
}

function validateText(record, field) {
  const value = record[field]
  if (typeof value !== 'string') {
    fail(record.rank, field, 'must be a string')
    return
  }
  const normalized = value.trim().toLowerCase()
  if (forbiddenExact.has(normalized)) fail(record.rank, field, `forbidden placeholder "${value}"`)
  if (/stage\s*2\s*:/i.test(value)) fail(record.rank, field, 'Stage 2 migration placeholder is still present')
}

function validateEvidence(record, field) {
  const value = record[field]
  if (!value || typeof value !== 'object') {
    fail(record.rank, field, 'must be an evidence object')
    return
  }
  if (!allowedStatuses.has(value.status)) fail(record.rank, `${field}.status`, `unsupported status "${value.status}"`)
  if (!substantive(value.text, 3)) fail(record.rank, `${field}.text`, 'must contain a meaningful value or explanation')
  if (
    ['disputed', 'manufacturer-unpublished', 'not-applicable'].includes(value.status) &&
    !substantive(value.text, 35)
  ) {
    fail(record.rank, `${field}.text`, `status "${value.status}" requires an explicit explanation`)
  }
  const lower = String(value.text).toLowerCase()
  if (
    (lower.includes('nie publikuje') || lower.includes('nie podaje') || lower.includes('oficjalnie niepodana')) &&
    value.status !== 'manufacturer-unpublished'
  ) {
    fail(record.rank, field, 'manufacturer-unpublished wording must use matching status')
  }
  if (lower.includes('nie dotyczy') && value.status !== 'not-applicable') {
    fail(record.rank, field, '"nie dotyczy" must use status "not-applicable"')
  }
}

if (!Array.isArray(records)) {
  console.error('DATA VALIDATION FAIL: root value must be an array')
  process.exit(1)
}

if (records.length !== 20) errors.push(`dataset: expected exactly 20 records, got ${records.length}`)

const ids = new Set()
const ranks = new Set()

for (const record of records) {
  if (!Number.isInteger(record.rank) || record.rank < 1 || record.rank > 20) {
    fail(record.rank, 'rank', 'must be an integer from 1 to 20')
  }
  if (ids.has(record.id)) fail(record.rank, 'id', `duplicate id "${record.id}"`)
  ids.add(record.id)
  if (ranks.has(record.rank)) fail(record.rank, 'rank', `duplicate rank ${record.rank}`)
  ranks.add(record.rank)

  for (const field of requiredText) validateText(record, field)
  for (const field of ['weight', 'insulation', 'insulationWeight']) validateEvidence(record, field)

  if (!allowedStatuses.has(record.dataStatus)) fail(record.rank, 'dataStatus', `unsupported status "${record.dataStatus}"`)

  for (const field of ['strengths', 'weaknesses', 'sources']) {
    if (!Array.isArray(record[field]) || record[field].length === 0) fail(record.rank, field, 'must be a non-empty array')
  }

  for (const [index, item] of (record.strengths || []).entries()) {
    if (!substantive(item, 4)) fail(record.rank, `strengths[${index}]`, 'must be non-empty and meaningful')
  }
  for (const [index, item] of (record.weaknesses || []).entries()) {
    if (!substantive(item, 4)) fail(record.rank, `weaknesses[${index}]`, 'must be non-empty and meaningful')
  }

  for (const [index, source] of (record.sources || []).entries()) {
    if (!source || typeof source.label !== 'string' || source.label.trim().length < 3) {
      fail(record.rank, `sources[${index}].label`, 'source label is required')
    }
    if (source.url != null && !/^https?:\/\//.test(source.url)) {
      fail(record.rank, `sources[${index}].url`, 'URL must start with http:// or https://')
    }
  }

  const serialized = JSON.stringify(record).toLowerCase()
  if (serialized.includes('"—"') || serialized.includes('"brak danych"')) {
    fail(record.rank, 'record', 'contains a forbidden unexplained missing-value token')
  }
}

for (let rank = 1; rank <= 20; rank += 1) {
  if (!ranks.has(rank)) errors.push(`dataset: missing rank ${rank}`)
}

const byRank = rank => records.find(record => record.rank === rank)

const peak = byRank(3)
if (
  peak?.insulationWeight?.status !== 'disputed' ||
  !peak.insulationWeight.text.includes('68') ||
  !peak.insulationWeight.text.includes('85')
) errors.push('#3 guardrail: Peak Alpha gsm must remain disputed and mention both 68 and 85')

const mammut = byRank(9)
if (mammut?.insulationWeight?.status !== 'manufacturer-unpublished') {
  errors.push('#9 guardrail: Mammut Alpha Direct gsm must be manufacturer-unpublished')
}

const klattermusen = byRank(15)
if (klattermusen?.insulationWeight?.status !== 'manufacturer-unpublished') {
  errors.push('#15 guardrail: Klättermusen insulation gsm must be manufacturer-unpublished')
}

const goldwin = byRank(17)
if (
  !goldwin?.model?.includes('GM25306') ||
  !goldwin.model.includes('UNISEX') ||
  goldwin.model.includes('GMW25306') ||
  goldwin?.weight?.status !== 'manufacturer-unpublished' ||
  goldwin?.insulationWeight?.status !== 'manufacturer-unpublished'
) errors.push('#17 guardrail: Goldwin must be GM25306 UNISEX with unpublished weight and gsm')

const milo = byRank(19)
const miloText = `${milo?.construction ?? ''} ${milo?.insulation?.text ?? ''}`
if (
  milo?.insulationWeight?.status !== 'not-applicable' ||
  !miloText.includes('Gelanots') ||
  !miloText.includes('WarmPro') ||
  !miloText.includes('Nanoqpile')
) errors.push('#19 guardrail: Milo must explain non-applicable classical gsm and the three-material hybrid')

const hh = byRank(20)
if (hh?.insulationWeight?.status !== 'manufacturer-unpublished') {
  errors.push('#20 guardrail: Helly Hansen LIFALOFT gsm must be manufacturer-unpublished')
}

for (const record of records.filter(record => record.rank >= 11)) {
  for (const scoreField of ['breathability', 'wind', 'backpack', 'forest', 'km20', 'km50', 'km100']) {
    if (Object.prototype.hasOwnProperty.call(record, scoreField)) {
      fail(record.rank, scoreField, 'Stage 2 must not invent numeric audit scores for ranks 11–20')
    }
  }
}

if (errors.length > 0) {
  console.error(`DATA VALIDATION FAIL (${errors.length} issue${errors.length === 1 ? '' : 's'}):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('DATA VALIDATION PASS')
console.log(`- records: ${records.length}`)
console.log('- ranks: 1–20 exactly once')
console.log('- required descriptive fields: complete')
console.log('- forbidden placeholders: none')
console.log('- uncertainty guardrails: PASS')
console.log('- ranks 11–20 numeric-score invention guardrail: PASS')
