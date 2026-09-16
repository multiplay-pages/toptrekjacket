export type ProductImageMeta = {
  imageStatus: 'verified'
  imageUrl: string
  imageFallbacks: string[]
  imageSourceLabel: string
  imageSourceUrl: string
  color?: string
}

const image = (
  imageUrl: string,
  sourceUrl = imageUrl,
  sourceLabel = 'Zweryfikowane źródło zdjęcia',
  color?: string,
  imageFallbacks: string[] = [],
): ProductImageMeta => ({
  imageStatus: 'verified',
  imageUrl,
  imageFallbacks,
  imageSourceLabel: sourceLabel,
  imageSourceUrl: sourceUrl,
  color,
})

/**
 * Stage 3 image references recovered from the verified production UI and then
 * hardened on 16.09.2026 to avoid a protected Vercel deployment proxy.
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
    'https://rab.equipment/media/catalog/product/x/e/xenair_alpine_light_jacket_black_qip_17_blk_1.jpg?optimize=medium&fit=bounds&height=822&width=548&canvas=548:822',
    'https://rab.equipment/eu/mens-xenair-alpine-light-insulated-jacket',
    'Rab — Xenair Alpine Light Insulated Jacket',
    'Black',
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
    'https://oberalp.imgix.net/89522292-20dd-41bd-996d-185d05398e5e.png?type=still&auto=format&fit=clip&w=1200&cs=srgb',
    'https://www.dynafit.com/mezzalama-polartec_-alpha_-jacket-men-08-0000071596',
    'Dynafit — Mezzalama Polartec Alpha Jacket Men',
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
  'mammut-aenergy-ml-hybrid': image(
    'https://static.mammut.com/cdn-cgi/image/width=960,quality=85,f=auto,metadata=none/master/1014-07870-0001_main_300832.jpg',
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
  'houdini-tech-insulation-houdi': image(
    'https://houdinisportswear.com/cdn/shop/files/820042_900_100_Men_Tech_Insulation_Houdi_true_black_c_low.webp?crop=center&height=1200&v=1788259121&width=1200',
    'https://houdinisportswear.com/en-na/products/ms-tech-insulation-houdi',
    "Houdini — M's Tech Insulation Houdi",
    'True Black',
  ),
  'montane-sirocco-xt': image(
    'https://montane.com/cdn/shop/files/MSXTH_DAS_A_2_square_9fabc018-dde6-4ab2-9001-d88ed09ff89b_grande.jpg?v=1784736487',
    'https://montane.com/products/montane-mens-sirocco-xt-hooded-insulated-jacket?color=Moss',
    'Montane — Sirocco XT Hooded Insulated Jacket',
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
  'goldwin-pertex-qa': image(
    'https://item-shopping.c.yimg.jp/i/n/linkfast_goldwin-gm25306_i_20250626194941',
    'https://store.shopping.yahoo.co.jp/linkfast/goldwin-gm25306.html',
    'Zweryfikowane źródło GM25306 UNISEX',
  ),
  'cumulus-climalite': image(
    'https://media.cumulus.equipment/media/volkanos/image/4a/50/64cff8249674b0bcd57580f6b5ae90d804e6a41f6d35c84231386a6df540.jpg',
    undefined,
    'Cumulus — Climalite Full Zip',
  ),
  'milo-nafo': image(
    'https://milo.pl/2680-home_default/techniczna-hybrydowa-kurtka-meska-nafo.jpg',
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
