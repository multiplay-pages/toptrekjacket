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
const diagnostics = []
const pass = (name, detail = '') => results.push({ name, status: 'PASS', detail })
const fail = (name, detail = '') => results.push({ name, status: 'FAIL', detail })
const check = (name, condition, detail = '') => condition ? pass(name, detail) : fail(name, detail)

const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] })

async function inspectComparison({ name, width, height, expectedColumns, screenshot }) {
  for (const modelCount of [2, 3, 4]) {
    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()
    const pageErrors = []
    const consoleErrors = []
    const failedRequests = []

    page.on('pageerror', error => pageErrors.push(String(error)))
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('requestfailed', request => {
      failedRequests.push({ url: request.url(), error: request.failure()?.errorText || '' })
    })

    try {
      await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForSelector('[data-testid="ranking-section"]', { timeout: 15000 })

      for (let index = 1; index <= modelCount; index += 1) {
        const compareControl = width <= 700
          ? page.locator('.mobile-ranking .mobile-rank-card').nth(index - 1).locator('.mobile-actions .compare-btn')
          : page.locator(`[data-testid="rank-${index}"] .rowcompare`)
        await compareControl.click()
      }

      const sticky = page.locator('.sticky-compare')
      await sticky.waitFor({ state: 'visible' })
      const stickyText = (await sticky.innerText()).trim()
      check(`${name} / ${modelCount}: selection count is exact`, stickyText.includes(`${modelCount}/4`), stickyText)

      await sticky.click()
      await page.waitForSelector('.compare-modal')

      const columns = page.locator('.compare-modal .compare-col')
      check(
        `${name} / ${modelCount}: modal renders exact model count`,
        await columns.count() === modelCount,
        String(await columns.count()),
      )

      const documentMetrics = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }))
      check(
        `${name} / ${modelCount}: page has no horizontal overflow`,
        documentMetrics.scrollWidth <= documentMetrics.clientWidth + 2,
        JSON.stringify(documentMetrics),
      )

      const modalMetrics = await page.locator('.compare-modal').evaluate(element => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        overflowX: getComputedStyle(element).overflowX,
      }))
      check(
        `${name} / ${modelCount}: modal does not require sideways scrolling`,
        modalMetrics.scrollWidth <= modalMetrics.clientWidth + 2 && !['auto', 'scroll'].includes(modalMetrics.overflowX),
        JSON.stringify(modalMetrics),
      )

      const scrollMetrics = await page.locator('.compare-scroll').evaluate(element => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        overflowX: getComputedStyle(element).overflowX,
      }))
      check(
        `${name} / ${modelCount}: compare wrapper does not require sideways scrolling`,
        scrollMetrics.scrollWidth <= scrollMetrics.clientWidth + 2 && !['auto', 'scroll'].includes(scrollMetrics.overflowX),
        JSON.stringify(scrollMetrics),
      )

      const grid = page.locator('.compare-grid')
      const gridBox = await grid.boundingBox()
      const scrollBox = await page.locator('.compare-scroll').boundingBox()
      check(
        `${name} / ${modelCount}: grid fits inside compare wrapper`,
        Boolean(gridBox && scrollBox && gridBox.width <= scrollBox.width + 2),
        JSON.stringify({ gridWidth: gridBox?.width, wrapperWidth: scrollBox?.width }),
      )

      const trackCount = await grid.evaluate(element => {
        const template = getComputedStyle(element).gridTemplateColumns.trim()
        return template ? template.split(/\s+/).length : 0
      })
      const wantedTracks = expectedColumns(modelCount)
      check(
        `${name} / ${modelCount}: responsive column count`,
        trackCount === wantedTracks,
        `${trackCount} columns; expected ${wantedTracks}`,
      )

      check(
        `${name} / ${modelCount}: descriptions preserved`,
        await page.locator('.compare-modal [data-testid="compare-description"]').count() === modelCount,
      )
      check(
        `${name} / ${modelCount}: prices preserved`,
        await page.locator('.compare-modal [data-testid="compare-price"]').count() === modelCount,
      )
      check(
        `${name} / ${modelCount}: all seven ratings per model preserved`,
        await page.locator('.compare-modal .compare-col .metric-row').count() === modelCount * 7,
        String(await page.locator('.compare-modal .compare-col .metric-row').count()),
      )

      if (modelCount === 4) {
        if (screenshot) await page.screenshot({ path: screenshot, fullPage: true })

        await page.locator('.compare-modal .remove-compare').first().click()
        await page.waitForFunction(() => document.querySelectorAll('.compare-modal .compare-col').length === 3)
        check(
          `${name}: removing one model keeps comparison open with 3 models`,
          await page.locator('.compare-modal .compare-col').count() === 3,
          String(await page.locator('.compare-modal .compare-col').count()),
        )

        await page.locator('.compare-modal .modal-close').click()
        await page.locator('.compare-modal').waitFor({ state: 'detached' })
        check(`${name}: close action dismisses comparison`, await page.locator('.compare-modal').count() === 0)
      }

      check(`${name} / ${modelCount}: no JavaScript page errors`, pageErrors.length === 0, JSON.stringify(pageErrors))
      check(`${name} / ${modelCount}: no console errors`, consoleErrors.length === 0, JSON.stringify(consoleErrors))
      diagnostics.push({ name, modelCount, failedRequests })
    } finally {
      await context.close()
    }
  }
}

try {
  await inspectComparison({
    name: 'Desktop 1440',
    width: 1440,
    height: 1000,
    expectedColumns: count => count,
    screenshot: 'stage9-comparison-desktop.png',
  })
  await inspectComparison({
    name: 'Tablet 1024',
    width: 1024,
    height: 900,
    expectedColumns: count => Math.min(count, 2),
    screenshot: 'stage9-comparison-tablet.png',
  })
  await inspectComparison({
    name: 'Mobile 390',
    width: 390,
    height: 844,
    expectedColumns: () => 1,
    screenshot: 'stage9-comparison-mobile.png',
  })
} finally {
  await browser.close()
}

const failed = results.filter(result => result.status === 'FAIL')
const report = {
  url: URL,
  summary: { pass: results.length - failed.length, fail: failed.length },
  results,
  diagnostics,
}

writeFileSync('stage9-comparison-report.json', `${JSON.stringify(report, null, 2)}\n`)

for (const result of results) {
  console.log(`${result.status} — ${result.name}${result.detail ? ` — ${result.detail}` : ''}`)
}
console.log(`Stage 9 comparison gate: ${report.summary.pass} PASS / ${report.summary.fail} FAIL`)

if (failed.length) process.exit(1)
