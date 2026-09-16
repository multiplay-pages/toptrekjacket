import { chromium } from 'playwright-core'
import { existsSync, writeFileSync } from 'node:fs'

const URL = process.env.STAGE3_URL || 'http://127.0.0.1:4173'
const expectedTop3Brands = ['Norrøna', 'Rab', 'La Sportiva']
const expectedLayeredTop3Brands = ['Mammut', 'Patagonia', 'Dynafit']
const expectedRankTestIds = Array.from({ length: 20 }, (_, index) => `rank-${index + 1}`)

const browserCandidates = [
  process.env.CHROME_BIN,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)
const executablePath = browserCandidates.find(path => existsSync(path))
if (!executablePath) throw new Error(`No system Chrome/Chromium found: ${browserCandidates.join(', ')}`)

const results = []
const pageErrors = []
const consoleErrors = []
const failedRequests = []
const pass = (name, detail = '') => results.push({ name, status: 'PASS', detail })
const fail = (name, detail = '') => results.push({ name, status: 'FAIL', detail })
const check = (name, condition, detail = '') => condition ? pass(name, detail) : fail(name, detail)
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
page.on('pageerror', error => pageErrors.push(String(error)))
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()) })
page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText || '' }))

const top3Brands = async targetPage => targetPage.locator('[data-testid="top3-section"] .top-card .brand').allTextContents()
const rankingTestIds = async targetPage => targetPage.locator('tbody tr[data-testid^="rank-"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-testid')))

async function imageState(locator) {
  if (await locator.count() !== 1) return { ok: false, reason: 'no img element / fallback visible' }
  const state = await locator.evaluate(element => ({
    complete: element.complete,
    width: element.naturalWidth,
    height: element.naturalHeight,
    src: element.currentSrc || element.src,
  }))
  return { ok: state.complete && state.width > 0 && state.height > 0, ...state }
}

try {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForSelector('[data-testid="scenario-selector"]', { timeout: 15000 })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-testid="scenario-selector"]')
  pass('UI loads')

  const defaultTop3 = await top3Brands(page)
  check('Default TOP3 exact', JSON.stringify(defaultTop3) === JSON.stringify(expectedTop3Brands), JSON.stringify(defaultTop3))

  const topGsm = page.locator('[data-testid="top3-section"] [data-testid="top-gsm"]')
  check('TOP3 shows gramatura/status on all cards', await topGsm.count() === 3 && (await topGsm.allInnerTexts()).every(text => text.trim().length > 15), JSON.stringify(await topGsm.allInnerTexts()))
  const topLimitations = page.locator('[data-testid="top3-section"] [data-testid="top-limitations"]')
  check('TOP3 shows limitations on all cards', await topLimitations.count() === 3 && (await topLimitations.allInnerTexts()).every(text => text.includes('Najważniejsze ograniczenia')), JSON.stringify(await topLimitations.allInnerTexts()))
  const topPrices = page.locator('[data-testid="top3-section"] [data-testid="top-price"]')
  check('TOP3 shows market price on all cards', await topPrices.count() === 3 && (await topPrices.allInnerTexts()).every(text => text.includes('zł')), JSON.stringify(await topPrices.allInnerTexts()))
  const topRatings = page.locator('[data-testid="top3-section"] [data-testid^="numeric-ratings-"]')
  check('TOP3 shows user ratings on all cards', await topRatings.count() === 3, String(await topRatings.count()))

  const rows = page.locator('tbody tr[data-testid^="rank-"]')
  check('TOP20 has 20 rows', await rows.count() === 20, String(await rows.count()))
  const rankOrder = await rankingTestIds(page)
  check('TOP20 exact rank order', JSON.stringify(rankOrder) === JSON.stringify(expectedRankTestIds), JSON.stringify(rankOrder))

  const bareDash = []
  const emptyDataCells = []
  for (let i = 1; i <= 20; i++) {
    const cells = page.locator(`[data-testid="rank-${i}"] td`)
    for (let j = 0; j < await cells.count(); j++) {
      const text = (await cells.nth(j).innerText()).trim()
      if (['—', '-', '–'].includes(text)) bareDash.push([i, j, text])
      if (!text && ![2, 10].includes(j)) emptyDataCells.push([i, j])
    }
  }
  check('No bare dash placeholders in TOP20', bareDash.length === 0, JSON.stringify(bareDash))
  check('No empty descriptive data cells in TOP20', emptyDataCells.length === 0, JSON.stringify(emptyDataCells))

  const badRatings = []
  for (let i = 1; i <= 20; i++) {
    const row = page.locator(`[data-testid="rank-${i}"]`)
    const rating = row.locator(`[data-testid="numeric-ratings-${i}"]`)
    const missing = row.locator(`[data-testid="missing-ratings-${i}"]`)
    if (await rating.count() !== 1 || await missing.count() !== 0) {
      badRatings.push({ rank: i, reason: 'missing numeric rating block in TOP20 row' })
      continue
    }
    const text = (await rating.innerText()).trim()
    const scores = [...text.matchAll(/([1-5](?:\.5)?)\/5/g)].map(match => Number(match[1]))
    if (scores.length !== 6 || scores.some(value => value < 1 || value > 5)) badRatings.push({ rank: i, text, scores })
  }
  check('All 20 models have complete numeric user ratings', badRatings.length === 0, JSON.stringify(badRatings))

  const marketPrices = page.locator('[data-testid^="market-price-"]')
  const marketPriceTexts = await marketPrices.allInnerTexts()
  check('All 20 models show dated market price', await marketPrices.count() === 20 && marketPriceTexts.every(text => text.includes('zł') && text.includes('16.09.2026')), JSON.stringify(marketPriceTexts))

  check('Full data has 20 records', await page.locator('details[data-testid^="details-"]').count() === 20)
  const compactSummaries = page.locator('[data-testid^="detail-summary-specs-"]')
  check('Collapsed DATA PACK summaries expose weight insulation gsm and price', await compactSummaries.count() === 20 && (await compactSummaries.allInnerTexts()).every(text => text.includes('·') && text.includes('zł')), JSON.stringify((await compactSummaries.allInnerTexts()).slice(0, 3)))

  for (const index of [3, 9, 15, 17, 19, 20]) await page.locator(`[data-testid="details-${index}"] summary`).click()
  const specialText = (await Promise.all([3, 9, 15, 17, 19, 20].map(index => page.locator(`[data-testid="details-${index}"]`).innerText()))).join('\n')
  check('Peak disputed 68/85 visible', specialText.includes('68') && specialText.includes('85') && /sporn/i.test(specialText))
  check('Mammut unpublished gsm visible', specialText.includes('Aenergy ML Hybrid') && /nie publikuje/i.test(specialText))
  check('Klättermusen unpublished gsm visible', specialText.includes('Alv 2.0') && /nie publikuje/i.test(specialText))
  check('Goldwin GM25306 + Quantum Air + Octa visible', specialText.includes('GM25306') && specialText.includes('PERTEX Quantum Air') && specialText.includes('Octa'))
  check('Milo non-puffy gsm explanation visible', specialText.includes('Gelanots 3L') && /(Nie dotyczy|nie ma .*zastosowania)/i.test(specialText))
  check('HH unpublished gsm visible', specialText.includes('LIFALOFT') && /nie publikuje/i.test(specialText))

  check('Default distance', await page.locator('#distance').inputValue() === '20–40 km', await page.locator('#distance').inputValue())
  check('Default temperature', await page.locator('#temperature').inputValue() === 'około 0°C', await page.locator('#temperature').inputValue())
  check('Default pace', await page.locator('#pace').inputValue() === 'umiarkowane', await page.locator('#pace').inputValue())
  check('Default mode', await page.locator('#mode').inputValue() === 'jedna kurtka', await page.locator('#mode').inputValue())
  const chipStates = await page.locator('.toggle-chip').evaluateAll(nodes => nodes.map(node => node.classList.contains('on')))
  check('Default toggles exact', JSON.stringify(chipStates) === JSON.stringify([false, true, true, false]), JSON.stringify(chipStates))

  await page.locator('#mode').selectOption({ label: 'system warstwowy' })
  const changedTop3 = await top3Brands(page)
  check('Selector changes TOP3', JSON.stringify(changedTop3) === JSON.stringify(expectedLayeredTop3Brands), JSON.stringify(changedTop3))
  await page.locator('#reset').click()
  const resetTop3 = await top3Brands(page)
  const resetChips = await page.locator('.toggle-chip').evaluateAll(nodes => nodes.map(node => node.classList.contains('on')))
  check('Reset restores default TOP3', JSON.stringify(resetTop3) === JSON.stringify(expectedTop3Brands), JSON.stringify(resetTop3))
  check('Reset restores exact default toggles', JSON.stringify(resetChips) === JSON.stringify([false, true, true, false]), JSON.stringify(resetChips))

  await page.locator('[data-testid="top-card-1"]').getByRole('button', { name: 'Nie podoba mi się', exact: true }).click()
  const afterDislike = await top3Brands(page)
  check('Dislike alone does not alter technical TOP3', JSON.stringify(afterDislike) === JSON.stringify(expectedTop3Brands), JSON.stringify(afterDislike))
  await page.locator('#visual').check()
  const visualTop3 = await top3Brands(page)
  check('Visual opt-in alters shortlist after dislike', !visualTop3.includes(expectedTop3Brands[0]) && JSON.stringify(visualTop3) !== JSON.stringify(expectedTop3Brands), JSON.stringify(visualTop3))
  const rankingAfterVisual = await rankingTestIds(page)
  check('Visual preference does not alter base ranking', JSON.stringify(rankingAfterVisual) === JSON.stringify(expectedRankTestIds), JSON.stringify(rankingAfterVisual))
  await page.locator('#reset').click()

  for (let i = 1; i <= 5; i++) await page.locator(`[data-testid="rank-${i}"] .rowcompare`).click()
  const stickyText = await page.locator('.sticky-compare').innerText()
  check('Compare selection capped at 4', stickyText.includes('4/4'), stickyText)
  await page.locator('.sticky-compare').click()
  await page.waitForSelector('.compare-modal')
  check('Compare modal shows 4 models', await page.locator('.compare-modal .compare-col').count() === 4, String(await page.locator('.compare-modal .compare-col').count()))
  const compareText = await page.locator('.compare-modal').innerText()
  check('Compare includes strengths and limitations', compareText.includes('Mocne strony') && compareText.includes('Ograniczenia'))
  check('Compare includes status and sources', /potwierdzony/i.test(compareText) && /źródło/i.test(compareText))
  check('Compare includes product descriptions', await page.locator('.compare-modal [data-testid="compare-description"]').count() === 4)
  check('Compare includes market price', await page.locator('.compare-modal [data-testid="compare-price"]').count() === 4 && compareText.includes('Średnia cena / widełki') && compareText.includes('16.09.2026'))
  check('Compare includes numeric ratings for all models', await page.locator('.compare-modal .compare-col .metric-row').count() === 28, String(await page.locator('.compare-modal .compare-col .metric-row').count()))
  await page.locator('.compare-modal .modal-close').click()

  await page.locator('#search').fill('Goldwin')
  check('Search filters to Goldwin', await page.locator('tbody tr[data-testid^="rank-"]:visible').count() === 1 && (await page.locator('tbody tr[data-testid^="rank-"]:visible').innerText()).includes('Goldwin'))
  await page.locator('#search').fill('')

  await page.locator('[data-testid="top-card-1"]').getByRole('button', { name: 'Podoba mi się', exact: true }).click()
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-testid="top-card-1"]')
  const likeClass = await page.locator('[data-testid="top-card-1"]').getByRole('button', { name: 'Podoba mi się', exact: true }).getAttribute('class') || ''
  check('Visual preference persists in localStorage', likeClass.includes('active-like'), likeClass)

  await page.evaluate(() => document.querySelectorAll('img').forEach(img => { img.loading = 'eager' }))
  for (let i = 1; i <= 20; i++) await page.locator(`[data-testid="rank-${i}"]`).scrollIntoViewIfNeeded()
  await sleep(12000)

  const rankingImageFailures = []
  for (let i = 1; i <= 20; i++) {
    const state = await imageState(page.locator(`[data-testid="rank-${i}"] .table-photo img`))
    if (!state.ok) rankingImageFailures.push({ rank: i, ...state })
  }
  check('Ranking images load 20/20', rankingImageFailures.length === 0, JSON.stringify(rankingImageFailures))

  const topImageFailures = []
  for (let i = 1; i <= 3; i++) {
    const state = await imageState(page.locator(`[data-testid="top-card-${i}"] .top-photo-wrap img`))
    if (!state.ok) topImageFailures.push({ card: i, ...state })
  }
  check('TOP3 images load 3/3', topImageFailures.length === 0, JSON.stringify(topImageFailures))

  await page.locator('details[data-testid^="details-"]').evaluateAll(nodes => nodes.forEach(node => { node.open = true }))
  await page.evaluate(() => document.querySelectorAll('details img').forEach(img => { img.loading = 'eager' }))
  for (let i = 1; i <= 20; i++) await page.locator(`[data-testid="details-${i}"]`).scrollIntoViewIfNeeded()
  await sleep(12000)

  const detailImageFailures = []
  for (let i = 1; i <= 20; i++) {
    const state = await imageState(page.locator(`[data-testid="details-${i}"] .detail-photo img`))
    if (!state.ok) detailImageFailures.push({ rank: i, ...state })
  }
  check('Full-data images load 20/20', detailImageFailures.length === 0, JSON.stringify(detailImageFailures))
  check('Full-data ratings are present 20/20', await page.locator('[data-testid^="detail-ratings-"]').count() === 20, String(await page.locator('[data-testid^="detail-ratings-"]').count()))
  check('Full-data market prices are present 20/20', await page.locator('[data-testid^="detail-market-price-"]').count() === 20, String(await page.locator('[data-testid^="detail-market-price-"]').count()))

  await page.screenshot({ path: 'stage7-e2e-desktop.png', fullPage: true })

  const mobile = await context.newPage()
  await mobile.setViewportSize({ width: 390, height: 844 })
  await mobile.goto(URL, { waitUntil: 'domcontentloaded' })
  await mobile.waitForSelector('.mobile-ranking')
  check('Mobile ranking has 20 cards', await mobile.locator('.mobile-rank-card').count() === 20, String(await mobile.locator('.mobile-rank-card').count()))
  check('Mobile ratings are present 20/20', await mobile.locator('.mobile-ratings').count() === 20, String(await mobile.locator('.mobile-ratings').count()))
  check('Mobile has no descriptive-rating fallback', await mobile.locator('.mobile-descriptive-note').count() === 0, String(await mobile.locator('.mobile-descriptive-note').count()))
  check('Mobile market prices are present 20/20', await mobile.locator('.mobile-market-price').count() === 20, String(await mobile.locator('.mobile-market-price').count()))
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  check('No page-level mobile horizontal overflow', overflow <= 2, String(overflow))
  await mobile.screenshot({ path: 'stage7-e2e-mobile.png', fullPage: true })
  await mobile.close()

  check('No JavaScript page errors', pageErrors.length === 0, JSON.stringify(pageErrors))
  check('No console errors', consoleErrors.length === 0, JSON.stringify(consoleErrors.slice(0, 20)))
} catch (error) {
  fail('E2E runner completed', error.stack || String(error))
} finally {
  const report = {
    url: URL,
    browser: executablePath,
    pass: results.filter(item => item.status === 'PASS').length,
    fail: results.filter(item => item.status === 'FAIL').length,
    results,
    pageErrors,
    consoleErrors: consoleErrors.slice(0, 50),
    failedRequests: failedRequests.slice(0, 100),
  }
  writeFileSync('stage7-e2e-report.json', JSON.stringify(report, null, 2))
  for (const result of results) console.log(`${result.status}: ${result.name}${result.detail ? ` — ${result.detail}` : ''}`)
  console.log(`E2E SUMMARY: ${report.pass} PASS / ${report.fail} FAIL`)
  await browser.close()
  if (report.fail) process.exitCode = 1
}
