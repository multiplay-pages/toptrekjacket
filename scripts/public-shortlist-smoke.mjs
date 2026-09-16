import { chromium } from 'playwright-core'
import { existsSync } from 'node:fs'

const URL = process.env.PUBLIC_STAGE3_URL
if (!URL) throw new Error('PUBLIC_STAGE3_URL is required')

const expectedDefault = ['Norrøna', 'Rab', 'La Sportiva']
const expectedLayered = ['Mammut', 'Patagonia', 'Dynafit']

const browserCandidates = [
  process.env.CHROME_BIN,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)
const executablePath = browserCandidates.find(path => existsSync(path))
if (!executablePath) throw new Error(`No system Chrome/Chromium found: ${browserCandidates.join(', ')}`)

const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()

const top3Brands = () => page.locator('[data-testid="top3-section"] .top-card .brand').allTextContents()
const assertExact = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${label} — ${JSON.stringify(actual)}`)
  if (!ok) throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
}

try {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 })

  // raw.githack/rawcdn shows an anti-phishing notice for direct HTML navigation.
  // A same-URL POST with Referer sets its short-lived acknowledgement cookie.
  if (await page.locator('[data-testid="scenario-selector"]').count() === 0) {
    await context.request.post(URL, {
      headers: { Referer: URL },
      failOnStatusCode: false,
      maxRedirects: 5,
    })
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
  }

  await page.waitForSelector('[data-testid="scenario-selector"]', { timeout: 15000 })

  // Remove any persisted visual likes/dislikes so this is a true default-state test.
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForSelector('[data-testid="scenario-selector"]')

  const defaults = {
    distance: await page.locator('#distance').inputValue(),
    temperature: await page.locator('#temperature').inputValue(),
    pace: await page.locator('#pace').inputValue(),
    mode: await page.locator('#mode').inputValue(),
    visual: await page.locator('#visual').isChecked(),
    toggles: await page.locator('.toggle-chip').evaluateAll(nodes => nodes.map(node => node.classList.contains('on'))),
  }
  console.log(`STATE: ${JSON.stringify(defaults)}`)
  if (
    defaults.distance !== '20–40 km' ||
    defaults.temperature !== 'około 0°C' ||
    defaults.pace !== 'umiarkowane' ||
    defaults.mode !== 'jedna kurtka' ||
    defaults.visual !== false ||
    JSON.stringify(defaults.toggles) !== JSON.stringify([false, true, true, false])
  ) throw new Error(`Default selector state mismatch: ${JSON.stringify(defaults)}`)

  assertExact('Public default TOP3', await top3Brands(), expectedDefault)

  await page.locator('#mode').selectOption({ label: 'system warstwowy' })
  await page.waitForFunction(
    expected => [...document.querySelectorAll('[data-testid="top3-section"] .top-card .brand')].map(node => node.textContent?.trim()).join('|') === expected.join('|'),
    expectedLayered,
  )
  assertExact('Public layered TOP3', await top3Brands(), expectedLayered)

  await page.locator('#reset').click()
  await page.waitForFunction(
    expected => [...document.querySelectorAll('[data-testid="top3-section"] .top-card .brand')].map(node => node.textContent?.trim()).join('|') === expected.join('|'),
    expectedDefault,
  )
  assertExact('Public reset TOP3', await top3Brands(), expectedDefault)

  await page.screenshot({ path: 'stage3-public-shortlist.png', fullPage: true })
  console.log('PUBLIC SHORTLIST SMOKE: 3 PASS / 0 FAIL')
} finally {
  await browser.close()
}
