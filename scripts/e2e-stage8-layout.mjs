import { chromium } from 'playwright-core'
import { existsSync, writeFileSync } from 'node:fs'

const URL = process.env.STAGE3_URL || 'http://127.0.0.1:4173'

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
const pass = (name, detail = '') => results.push({ name, status: 'PASS', detail })
const fail = (name, detail = '') => results.push({ name, status: 'FAIL', detail })
const check = (name, condition, detail = '') => condition ? pass(name, detail) : fail(name, detail)

const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] })

async function inspectRanking({ name, width, height, screenshot, mobile = false }) {
  const context = await browser.newContext({ viewport: { width, height } })
  const page = await context.newPage()

  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForSelector('[data-testid="ranking-section"]', { timeout: 15000 })
    await page.locator('[data-testid="ranking-section"]').scrollIntoViewIfNeeded()

    const documentMetrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    check(
      `${name}: page has no horizontal overflow`,
      documentMetrics.scrollWidth <= documentMetrics.clientWidth + 2,
      JSON.stringify(documentMetrics),
    )

    if (mobile) {
      const tableDisplay = await page.locator('.ranking-table-wrap').evaluate(element => getComputedStyle(element).display)
      check(`${name}: desktop table is hidden`, tableDisplay === 'none', tableDisplay)

      const mobileDisplay = await page.locator('.mobile-ranking').evaluate(element => getComputedStyle(element).display)
      check(`${name}: mobile ranking is visible`, mobileDisplay !== 'none', mobileDisplay)
      check(`${name}: mobile ranking has 20 cards`, await page.locator('.mobile-ranking .mobile-rank-card').count() === 20)
    } else {
      const wrap = page.locator('.ranking-table-wrap')
      const table = page.locator('.stage7-ranking-table')
      const metrics = await wrap.evaluate(element => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        overflowX: getComputedStyle(element).overflowX,
      }))
      check(
        `${name}: TOP20 wrapper does not require sideways scrolling`,
        metrics.scrollWidth <= metrics.clientWidth + 2,
        JSON.stringify(metrics),
      )

      const tableBox = await table.boundingBox()
      const wrapBox = await wrap.boundingBox()
      check(
        `${name}: ranking fits inside its container`,
        Boolean(tableBox && wrapBox && tableBox.width <= wrapBox.width + 2),
        JSON.stringify({ tableWidth: tableBox?.width, wrapperWidth: wrapBox?.width }),
      )

      check(`${name}: ranking keeps all 20 rows`, await page.locator('tbody tr[data-testid^="rank-"]').count() === 20)
      const firstRowDisplay = await page.locator('[data-testid="rank-1"]').evaluate(element => getComputedStyle(element).display)
      check(`${name}: ranking rows use field-guide grid layout`, firstRowDisplay === 'grid', firstRowDisplay)

      const firstRank = (await page.locator('[data-testid="rank-1"] td').first().innerText()).trim()
      const lastRank = (await page.locator('[data-testid="rank-20"] td').first().innerText()).trim()
      check(`${name}: rank order endpoints stay unchanged`, firstRank === '1' && lastRank === '20', `${firstRank}…${lastRank}`)
    }

    await page.screenshot({ path: screenshot, fullPage: true })
  } finally {
    await context.close()
  }
}

try {
  await inspectRanking({
    name: 'Desktop 1440',
    width: 1440,
    height: 1000,
    screenshot: 'stage8-layout-desktop.png',
  })
  await inspectRanking({
    name: 'Tablet 1024',
    width: 1024,
    height: 900,
    screenshot: 'stage8-layout-tablet.png',
  })
  await inspectRanking({
    name: 'Mobile 390',
    width: 390,
    height: 844,
    screenshot: 'stage8-layout-mobile.png',
    mobile: true,
  })
} finally {
  await browser.close()
}

const failed = results.filter(result => result.status === 'FAIL')
const report = {
  url: URL,
  summary: { pass: results.length - failed.length, fail: failed.length },
  results,
}

writeFileSync('stage8-layout-report.json', `${JSON.stringify(report, null, 2)}\n`)

for (const result of results) {
  console.log(`${result.status} — ${result.name}${result.detail ? ` — ${result.detail}` : ''}`)
}
console.log(`Stage 8 layout gate: ${report.summary.pass} PASS / ${report.summary.fail} FAIL`)

if (failed.length) process.exit(1)
