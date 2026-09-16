export type UsageRatings = {
  breathability: number
  wind: number
  backpack: number
  forest: number
  km20: number
  km50: number
  km100: number
}

export type MarketPriceSource = {
  label: string
  url: string
}

export type MarketSnapshot = {
  ratings: UsageRatings
  marketPrice: string
  marketPriceCheckedAt: string
  priceReference: string
  priceSources: MarketPriceSource[]
}

/**
 * STAGE 7 PRESENTATION DATA — 16.09.2026
 *
 * ratings:
 * Editorial/user-use ratings derived from the qualitative audit for this specific
 * use case. They are NOT laboratory measurements and are intentionally kept
 * separate from manufacturer product facts.
 *
 * marketPrice:
 * A dated market snapshot. PLN averages/ranges are calculated from the currently
 * found offers. EUR offers use 1 EUR = 4.34793 PLN and JPY offers use
 * 1 JPY = 0.0242783 PLN (rates checked 16.09.2026). Promotions/outlet prices can
 * widen the range; exact size/colour availability can change at any time.
 */
export const marketDataByRank: Record<number, MarketSnapshot> = {
  1: {
    ratings: { breathability: 4.5, wind: 4, backpack: 4.5, forest: 4, km20: 5, km50: 5, km100: 4 },
    marketPrice: '≈ 890 zł · znalezione 520–1 090 zł',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Średnia orientacyjna z aktualnych ofert regularnych, promocyjnych i outletowych; bardzo niska oferta outletowa poszerza widełki.',
    priceSources: [
      { label: 'Cena 16.09.2026 — Niponino: 956 zł / 903,55 zł z kodem', url: 'https://www.niponino.pl/falketind-thermo40-zip-hood-men' },
      { label: 'Cena 16.09.2026 — Snowleader: 187,50 €', url: 'https://www.snowleader.nl/en/falketind-thermo40-zip-hood-m-exuberance-NORR02850.html' },
      { label: 'Cena 16.09.2026 — Helsinki Outlet: 119 € outlet', url: 'https://www.helsinkioutlet.fi/en_GB/search/%2Bjacket?catalog=all&limit=54' },
    ],
  },
  2: {
    ratings: { breathability: 4.5, wind: 4, backpack: 4.5, forest: 3.5, km20: 5, km50: 4.5, km100: 3.5 },
    marketPrice: '≈ 770 zł · znalezione 680–960 zł',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Średnia z kilku aktualnych ofert EU; cena zależy mocno od koloru i wyprzedaży.',
    priceSources: [
      { label: 'Cena 16.09.2026 — SportFits: 156,55–174,05 €', url: 'https://sportfits.eu/products/rab-xenair-alpine-light-jacket' },
      { label: 'Cena 16.09.2026 — Idealo: od 163,90 €; część wariantów 219,95 €', url: 'https://www.idealo.de/preisvergleich/OffersOfProduct/204427935_-xenair-alpine-light-jacket-qip-17-rab.html' },
    ],
  },
  3: {
    ratings: { breathability: 5, wind: 3.5, backpack: 4, forest: 3.5, km20: 4.5, km50: 5, km100: 4.5 },
    marketPrice: '≈ 1 120 zł · znalezione 980–1 190 zł',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Średnia z aktualnych ofert PL/EU dla dokładnego modelu Freelight Polartec Alpha Insulated Hood Jacket.',
    priceSources: [
      { label: 'Cena 16.09.2026 — Ceneo / 8a.pl: 1 179,99 zł', url: 'https://www.ceneo.pl/182870103' },
      { label: 'Cena 16.09.2026 — OX.ee: 226 €', url: 'https://www.ox.ee/est/product/3680082' },
      { label: 'Cena 16.09.2026 — 8a.si: 273,99 €', url: 'https://8a.si/jakna-peak-performance-freelight-polartec-alpha-insulated-hood-jacket-black' },
    ],
  },
  4: {
    ratings: { breathability: 4.5, wind: 4, backpack: 5, forest: 3.5, km20: 5, km50: 4.5, km100: 4 },
    marketPrice: '≈ 900 zł · znalezione 835–1 000 zł',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Średnia z bieżących ofert EU; widełki obejmują promocje i cenę katalogową.',
    priceSources: [
      { label: 'Cena 16.09.2026 — SportFits: 192,05–197,65 €; UVP 229,90 €', url: 'https://sportfits.eu/products/la-sportiva-aequilibrium-lite-insulation-jacket-men' },
    ],
  },
  5: {
    ratings: { breathability: 5, wind: 3.5, backpack: 4, forest: 3.5, km20: 4.5, km50: 5, km100: 4 },
    marketPrice: '≈ 820 zł · znalezione 610–1 090 zł',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Duże rozbieżności wynikają z wyprzedaży kolorów; cena regularna producenta to 250 €.',
    priceSources: [
      { label: 'Cena 16.09.2026 — Dynafit: 175 €; cena regularna 250 €', url: 'https://www.dynafit.com/mezzalama-polartec_-alpha_-jacket-men-08-0000071596' },
      { label: 'Cena 16.09.2026 — Dynafit lista: wybrane warianty od 140 €', url: 'https://www.dynafit.com/men/apparel/insulation-down-jackets' },
    ],
  },
  6: {
    ratings: { breathability: 5, wind: 3.5, backpack: 4.5, forest: 3.5, km20: 4.5, km50: 5, km100: 4.5 },
    marketPrice: '≈ 710 zł · znalezione 550–870 zł',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Zakres z aktualnej oferty detalicznej EU i katalogowej ceny europejskiej FW26/27.',
    priceSources: [
      { label: 'Cena 16.09.2026 — BIKE24: 126,88 €', url: 'https://www.bike24.com/brands/outdoor-research' },
      { label: 'Outdoor Research FW26/27 workbook — PV 199,95 €', url: 'https://graniteoutdoor.net/wp-content/uploads/Outdoor-Research-Fall-Winter-26-27-.pdf' },
    ],
  },
  7: {
    ratings: { breathability: 5, wind: 3.5, backpack: 4.5, forest: 3.5, km20: 4, km50: 5, km100: 5 },
    marketPrice: '≈ 1 090 zł · znaleziona cena 250 €',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Aktualna cena producenta EU; brak istotnego rozrzutu w znalezionych wiarygodnych ofertach.',
    priceSources: [
      { label: 'Cena 16.09.2026 — Patagonia EU: 250 €', url: 'https://eu.patagonia.com/pl/en/product/mens-nano-air-ultralight-full-zip-insulated-hoody/85365.html' },
    ],
  },
  8: {
    ratings: { breathability: 4.5, wind: 4, backpack: 4.5, forest: 4, km20: 4.5, km50: 4.5, km100: 4 },
    marketPrice: '≈ 1 000 zł · znaleziona cena 229,90 €',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Aktualna cena producenta EU dla Switch Pro Hooded Men.',
    priceSources: [
      { label: 'Cena 16.09.2026 — Mountain Equipment EU: 229,90 €', url: 'https://mountain-equipment.eu/products/switch-pro-hooded-mens-jacket' },
    ],
  },
  9: {
    ratings: { breathability: 5, wind: 3, backpack: 4.5, forest: 3, km20: 4, km50: 5, km100: 4.5 },
    marketPrice: '≈ 960 zł · znaleziona cena 220 €',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Aktualna cena producenta; ten model jest pozycjonowany jako techniczny midlayer premium.',
    priceSources: [
      { label: 'Cena 16.09.2026 — Mammut: 220 €', url: 'https://www.mammut.com/pl/pl/products/1014-07870-0001/aenergy-ml-hybrid-hooded-jacket-men' },
    ],
  },
  10: {
    ratings: { breathability: 4, wind: 4.5, backpack: 4.5, forest: 5, km20: 5, km50: 4, km100: 3.5 },
    marketPrice: '≈ 1 130 zł · znaleziona cena 260 €',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Aktualna cena producenta International.',
    priceSources: [
      { label: 'Cena 16.09.2026 — Salewa: 260 €', url: 'https://www.salewa.com/ortles-hybrid-tirolwool_-responsive-jacket-men-00-0000028720' },
    ],
  },
  11: {
    ratings: { breathability: 4, wind: 4.5, backpack: 4.5, forest: 4.5, km20: 4.5, km50: 3.5, km100: 3 },
    marketPrice: '≈ 1 360 zł · znalezione 1 290–1 435 zł',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Średnia z aktualnej ceny promocyjnej i ceny regularnej dla kodu X000008436.',
    priceSources: [
      { label: 'Cena 16.09.2026 — Oliunìd: 296,90 €; regularna 330 €', url: 'https://www.oliunid.com/eu/arc-teryx-proton-hoody-m-giacca-imbottita-uomo' },
    ],
  },
  12: {
    ratings: { breathability: 4, wind: 4.5, backpack: 4.5, forest: 4.5, km20: 4.5, km50: 4, km100: 3.5 },
    marketPrice: '≈ 1 390 zł · znaleziona cena 320 €',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Aktualna cena producenta dla dokładnego Venet Swisswool 60 Jacket M.',
    priceSources: [
      { label: 'Cena 16.09.2026 — Ortovox: 320 €', url: 'https://www.ortovox.com/int-en/shop/men/mountainwear/jackets-vests/' },
    ],
  },
  13: {
    ratings: { breathability: 4, wind: 4, backpack: 4, forest: 4, km20: 4, km50: 3.5, km100: 3 },
    marketPrice: '≈ 1 130 zł · znaleziona cena 260 €',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Aktualna cena producenta EU.',
    priceSources: [
      { label: 'Cena 16.09.2026 — Houdini: 260 €', url: 'https://houdinisportswear.com/en-eu/products/ms-tech-insulation-houdi' },
    ],
  },
  14: {
    ratings: { breathability: 4, wind: 4.5, backpack: 4, forest: 4, km20: 4.5, km50: 3.5, km100: 3 },
    marketPrice: '≈ 1 220 zł · znaleziona cena 280 €',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Aktualna cena producenta DE/EU.',
    priceSources: [
      { label: 'Cena 16.09.2026 — Montane DE: 280 €', url: 'https://de.montane.com/products/montane-mens-sirocco-xt-hooded-insulated-jacket' },
    ],
  },
  15: {
    ratings: { breathability: 4, wind: 4.5, backpack: 5, forest: 4.5, km20: 4, km50: 3.5, km100: 3 },
    marketPrice: '≈ 1 480 zł · znaleziona cena 340 €',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Aktualna cena producenta EU.',
    priceSources: [
      { label: 'Cena 16.09.2026 — Klättermusen: 340 €', url: 'https://www.klattermusen.com/en-eu/men/new-arrivals/10625m12-alv-2-0-jacket-ms-dark-mineral-blue/' },
    ],
  },
  16: {
    ratings: { breathability: 3.5, wind: 4.5, backpack: 4, forest: 4, km20: 4, km50: 3, km100: 2.5 },
    marketPrice: '≈ 820 zł · znaleziona cena od 189 €',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Aktualna cena producenta „from 189 €”; dostępność internetowa jest ograniczona.',
    priceSources: [
      { label: 'Cena 16.09.2026 — VAUDE: od 189 €', url: 'https://www.vaude.com/int/en/42970-sesvenna-insulating-jacket-men-s.html' },
    ],
  },
  17: {
    ratings: { breathability: 4.5, wind: 4, backpack: 4, forest: 3.5, km20: 4.5, km50: 4.5, km100: 4 },
    marketPrice: '≈ 1 230 zł · katalogowo 50 600 JPY',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Cena katalogowa dokładnego UNISEX GM25306; oferta europejska jest ograniczona. Nie użyto ceny damskiego GMW25306.',
    priceSources: [
      { label: 'Cena katalogowa 2025/26 — Goldwin GM25306: 50 600 JPY', url: 'https://www.goldwin-global.com/public/assets/document/goldwin-2025-ski-catalog.pdf' },
      { label: 'Aktualna oferta identyfikacyjna — Yahoo Japan: GM25306 50 600 JPY', url: 'https://store.shopping.yahoo.co.jp/linkfast/goldwin-gm25306.html' },
    ],
  },
  18: {
    ratings: { breathability: 3, wind: 4.5, backpack: 3.5, forest: 4, km20: 4, km50: 3.5, km100: 3 },
    marketPrice: '≈ 1 080 zł · znaleziona cena 1 079 zł',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Aktualna cena producenta PL, potwierdzona również u sprzedawcy FlyLite.',
    priceSources: [
      { label: 'Cena 16.09.2026 — Cumulus: 1 079 zł', url: 'https://cumulus.equipment/p/meska-kurtka-climalite-full-zip' },
      { label: 'Cena 16.09.2026 — FlyLite: 1 079 zł', url: 'https://flylite.pl/sklep/akcesoria-paralotniowe/kurtki/' },
    ],
  },
  19: {
    ratings: { breathability: 3.5, wind: 4.5, backpack: 3.5, forest: 4.5, km20: 3.5, km50: 3, km100: 2.5 },
    marketPrice: '≈ 400 zł · znalezione 349–449 zł',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Średnia z ceny promocyjnej i regularnej polskiego sprzedawcy dla dokładnego Milo Nafo.',
    priceSources: [
      { label: 'Cena 16.09.2026 — RockHunters: 349 zł; regularna 449 zł', url: 'https://rockhunters.pl/' },
    ],
  },
  20: {
    ratings: { breathability: 3, wind: 4.5, backpack: 3.5, forest: 4, km20: 4, km50: 3, km100: 2.5 },
    marketPrice: '≈ 825 zł · znalezione 675–900 zł',
    marketPriceCheckedAt: '16.09.2026',
    priceReference: 'Średnia z bieżącej promocji i ceny regularnej/producenta w Polsce.',
    priceSources: [
      { label: 'Cena 16.09.2026 — Helly Hansen PL: 900 zł', url: 'https://www.hellyhansen.com/en_pl/lifaloft-insulator-jacket-65603' },
      { label: 'Cena 16.09.2026 — INTERSPORT: 674,99–899,99 zł', url: 'https://www.intersport.pl/sporty/turystyka/odziez-trekkingowa/kurtki-puchowe-ocieplane/rozmiar/m/' },
    ],
  },
}
