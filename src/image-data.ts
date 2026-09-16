export type ProductImageMeta = {
  imageStatus: 'verified'
  imageUrl: string
  imageFallbacks: string[]
  imageSourceLabel: string
  imageSourceUrl: string
  color?: string
}

const PRODUCT_IMAGE_PROXY =
  'https://trek-jacket-finder-h6a4gul9m-lukaszs-projects-d71b6aef.vercel.app/api/product-image?url='

const proxied = (url: string) => `${PRODUCT_IMAGE_PROXY}${encodeURIComponent(url)}`

const image = (
  originalUrl: string,
  sourceUrl = originalUrl,
  sourceLabel = 'Zweryfikowane źródło zdjęcia',
  color?: string,
): ProductImageMeta => ({
  imageStatus: 'verified',
  imageUrl: proxied(originalUrl),
  imageFallbacks: [originalUrl],
  imageSourceLabel: sourceLabel,
  imageSourceUrl: sourceUrl,
  color,
})

const productPage = (
  productUrl: string,
  sourceLabel = 'Zweryfikowana strona dokładnego modelu',
  color?: string,
): ProductImageMeta => ({
  imageStatus: 'verified',
  imageUrl: proxied(productUrl),
  imageFallbacks: [],
  imageSourceLabel: sourceLabel,
  imageSourceUrl: productUrl,
  color,
})

/**
 * Stage 3 image references recovered from the verified production UI on 16.09.2026.
 * These references are presentation metadata only. Product facts remain sourced from
 * the authoritative Stage 2 DATA PACK.
 */
export const productImages: Record<string, ProductImageMeta> = {
  'norrona-falketind-thermo40': image(
    'https://cdn.4camping.cz/files/photos/1600/8/84b887e4-panska-bunda-norrona-falketind-thermo40-zip-hood.webp',
    'https://www.4camping.cz/p/panska-bunda-norrona-falketind-thermo40-zip-hood/',
    '4camping — dokładny model Norrøna falketind thermo40',
  ),
  'rab-xenair-alpine-light': image(
    'https://www.outside.co.uk/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/r/a/rab-m-xenair-alpine-light-jacket-qip-17-tmb-tempest-blue-04-w25.jpg',
    'https://www.outside.co.uk/mens-clothing/mens-jackets/mens-insulated-jackets/rab-xenair-alpine-light-jacket-m-70117.html',
    'Outside — Rab Xenair Alpine Light',
    'Tempest Blue',
  ),
  'peak-freelight-alpha': image(
    'https://www.peakperformance.com/us/media/catalog/product/cache/47a61cd39417a8407e88c1f76cc311d9/article_images/G80110020/G80110020_cb62bf5c1b631b36e8ddfb16b0683d3c.jpg?auto=webp&crop=3%3A4&format=pjpg&optimize=low&width=1440',
    undefined,
    'Peak Performance — dokładny model Freelight Alpha',
  ),
  'lasportiva-aequilibrium-lite': image(
    'https://www.fjellsport.no/assets/blobs/zamj077-b46e32-02-zamj077b46e32s-bc4121f39c.jpeg',
    'https://www.outnorth.com/int/brands/la-sportiva/la-sportiva-men-s-aequilibrium-lite-insulation-jacket-night-sky-savana-FS637921',
    'Outnorth / Fjellsport — La Sportiva Aequilibrium Lite',
  ),
  'dynafit-mezzalama-alpha': image(
    'https://www.polarsport.pl/media/catalog/product/cache/ed1dd25b44ac74c9dca085c463c89987/k/u/kurtka-meska-dynafit-mezzalama-polartec-alpha-rock-khaki-04.jpg',
    undefined,
    'Polarsport — Dynafit Mezzalama Alpha',
    'Rock Khaki',
  ),
  'or-deviator': image(
    'https://www.outdoorresearch.com/cdn/shop/files/3004652566A3.png?v=1723760908&width=1426',
    undefined,
    'Outdoor Research — Deviator Hoodie',
  ),
  'patagonia-nano-air-ultralight': image(
    'https://www.foreststidesandtreasures.com/cdn/shop/files/Patagonia_Nano-Air_UltralightFull-ZipHoody_M_SmolderBlue_85365_SMDB_032025c_2000x.jpg?v=1742502215',
    undefined,
    'Zweryfikowany sprzedawca — Patagonia Nano-Air Ultralight',
    'Smolder Blue',
  ),
  'me-switch-pro': image(
    'https://us.mountain-equipment.com/cdn/shop/files/ME-006776_Switch_Pro_Hooded_Mens_Jacket_ME-01848_Redrock_Dusk_Front-9871.png?height=2400&v=1739980874&width=2400',
    undefined,
    'Mountain Equipment — Switch Pro Hooded Jacket',
    'Redrock / Dusk',
  ),
  'mammut-aenergy-ml-hybrid': productPage(
    'https://www.mammut.com/pl/pl/products/1014-07870-0001/aenergy-ml-hybrid-hooded-jacket-men',
    'Mammut — Aenergy ML Hybrid Hooded Jacket Men',
  ),
  'salewa-ortles-hybrid': image(
    'https://cdn.idealo.com/folder/Product/202108/7/202108768/s2_produktbild_max/salewa-ortles-hybrid-tirolwool-responsive-men-s-jacket-electric.jpg',
    undefined,
    'Idealo — Salewa Ortles Hybrid TirolWool Responsive',
  ),
  'arcteryx-proton': image(
    'https://store.miyaradventures.com/cdn/shop/products/F23-X000007520-Proton-Hoody-Smoke-Bluff-Front-View_5ff88d25-5afc-4656-b1de-b51b0c9936f6_600x.jpg?v=1695909984',
    undefined,
    "Zweryfikowany sprzedawca — Arc'teryx Proton Hoody",
    'Smoke Bluff',
  ),
  'ortovox-venet-swisswool-60': image(
    'https://cdn.alpinstore.com/760015-large_default/ortovox-venet-swisswool-60-jacket-m-blue-nunatak.jpg',
    undefined,
    'Alpinstore — Ortovox Venet Swisswool 60',
    'Blue Nunatak',
  ),
  'houdini-tech-insulation-houdi': productPage(
    'https://houdinisportswear.com/en-na/collections/men/products/ms-tech-insulation-houdi',
    "Houdini — M's Tech Insulation Houdi",
  ),
  'montane-sirocco-xt': productPage(
    'https://montane.com/products/montane-mens-sirocco-xt-hooded-insulated-jacket?color=Moss',
    'Montane — Sirocco XT Hooded Insulated Jacket',
    'Moss',
  ),
  'klattermusen-alv2': image(
    'https://itsheatwave.co.nz/cdn/shop/files/klattermusen-mens-alv-20-jacket-black-heatwave-287493.jpg?v=1721195092&width=480',
    undefined,
    'Heatwave — Klättermusen Alv 2.0',
    'Black',
  ),
  'vaude-sesvenna': image(
    'https://sportano.com/img/986c30c27a3d26a3ee16c136f92f4ff5/4/0/4062218708907_01-jpg/men-s-insulated-jacket-vaude-sesvenna-iv-woodland-0.jpg',
    undefined,
    'Sportano — VAUDE Sesvenna IV 42970',
    'Woodland',
  ),
  'goldwin-pertex-qa': productPage(
    'https://store.shopping.yahoo.co.jp/linkfast/goldwin-gm25306.html',
    'Zweryfikowane źródło GM25306 UNISEX',
  ),
  'cumulus-climalite': image(
    'https://media.cumulus.equipment/media/volkanos/image/4a/50/64cff8249674b0bcd57580f6b5ae90d804e6a41f6d35c84231386a6df540.jpg',
    undefined,
    'Cumulus — Climalite Full Zip',
  ),
  'milo-nafo': productPage(
    'https://milo.pl/pl/144714-techniczna-hybrydowa-kurtka-meska-nafo.html',
    'Milo — Nafo',
  ),
  'hh-lifaloft': image(
    'https://www.campandtravel.com/images/thumbs/0039864_helly-hansen-lifaloft-insulator-jacket-hh-erkek-ceket-olympian-blue.jpeg',
    undefined,
    'Camp and Travel — Helly Hansen LIFALOFT Insulator',
    'Olympian Blue',
  ),
}
