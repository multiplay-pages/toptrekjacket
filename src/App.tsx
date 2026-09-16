import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Compare,
  ExternalLink,
  Filter,
  Heart,
  ImageOff,
  Info,
  Layers3,
  Menu,
  Mountain,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Snowflake,
  ThumbsDown,
  ThumbsUp,
  Wind,
  X,
} from 'lucide-react'
import { defaultScenario, jackets, Jacket, Scenario, shortlistForScenario } from './data'

type Preference = 'like' | 'dislike' | null

const fmt = (n?: number) => n ? n.toString().replace('.', ',') : 'â€”'

function useStoredMap(key: string) {
  const [map, setMap] = useState<Record<string, Preference>>(() => {
    try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} }
  })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(map)) }, [key, map])
  return [map, setMap] as const
}

const imageProxy = (url: string) => `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=1400&fit=contain&output=webp`

function imageCandidates(jacket: Jacket) {
  const originals = [jacket.imageUrl, ...(jacket.imageFallbacks || [])].filter(Boolean) as string[]
  return originals.flatMap(url => [imageProxy(url), url])
}

function ResilientImage({ jacket, compact = false }: { jacket: Jacket, compact?: boolean }) {
  const candidates = useMemo(() => imageCandidates(jacket), [jacket])
  const [index, setIndex] = useState(0)
  const unavailable = jacket.imageStatus === 'verified' && candidates.length > 0 && index >= candidates.length
  const unverified = jacket.imageStatus !== 'verified' || candidates.length === 0
  if (unverified || unavailable) {
    return (
      <div className="photo-fallback">
        <ImageOff size={compact ? 18 : 28} />
        {!compact && <>
          <strong>{unverified ? 'ZdjÄ™cie wymaga weryfikacji' : 'ZdjÄ™cie chwilowo niedostÄ™pne'}</strong>
          <span>{unverified ? 'Nie pokazujemy podobnego modelu.' : 'Å¹rÃ³dÅ‚o jest zweryfikowane, ale serwer obrazu nie odpowiedziaÅ‚. MoÅ¼esz otworzyÄ‡ ÅºrÃ³dÅ‚o produktu.'}</span>
        </>}
      </div>
    )
  }
  return <img src={candidates[index]} alt={`${jacket.brand} ${jacket.model}`} onError={() => setIndex(i => i + 1)} loading={compact ? 'lazy' : 'eager'} />
}

function Photo({ jacket, onOpen, compact = false }: { jacket: Jacket, onOpen: () => void, compact?: boolean }) {
  const verified = jacket.imageStatus === 'verified' && !!jacket.imageUrl
  return (
    <button className={`photo ${compact ? 'photo-compact' : ''} ${verified ? '' : 'photo-missing'}`} onClick={onOpen} aria-label={`PokaÅ¼ zdjÄ™cie ${jacket.brand} ${jacket.model}`}>
      <ResilientImage jacket={jacket} compact={compact} />
      <span className="photo-status">{verified ? <><BadgeCheck size={14}/> zweryfikowane</> : <>weryfikacja</>}</span>
    </button>
  )
}

function Metric({ label, value, max = 5 }: { label: string, value?: number, max?: number }) {
  return (
    <div className="metric-row">
      <span>{label}</span>
      <div className="metric-track" aria-label={`${label}: ${value ?? 'brak danych'} na ${max}`}>
        <i style={{ width: value ? `${(value / max) * 100}%` : '0%' }} />
      </div>
      <b>{fmt(value)}</b>
    </div>
  )
}

function PreferenceButtons({ jacket, preference, onChange }: { jacket: Jacket, preference: Preference, onChange: (p: Preference) => void }) {
  return (
    <div className="preference-buttons">
      <button className={preference === 'like' ? 'active-like' : ''} onClick={() => onChange(preference === 'like' ? null : 'like')}>
        <Heart size={16} fill={preference === 'like' ? 'currentColor' : 'none'} /> Podoba mi siÄ™
      </button>
      <button className={preference === 'dislike' ? 'active-dislike' : ''} onClick={() => onChange(preference === 'dislike' ? null : 'dislike')}>
        <ThumbsDown size={16} /> Nie podoba mi siÄ™
      </button>
    </div>
  )
}

function ScenarioPanel({ value, onChange, visualEnabled, onVisualEnabled }: { value: Scenario, onChange: (s: Scenario) => void, visualEnabled: boolean, onVisualEnabled: (b: boolean) => void }) {
  const set = <K extends keyof Scenario>(key: K, val: Scenario[K]) => onChange({ ...value, [key]: val })
  return (
    <section className="scenario-panel" id="selector">
      <div className="section-title-row">
        <div>
          <span className="eyebrow"><SlidersHorizontal size={15}/> KREATOR SCENARIUSZA</span>
          <h2>Jak bÄ™dziesz uÅ¼ywaÄ‡ kurtki?</h2>
        </div>
        <button className="reset-btn" onClick={() => onChange(defaultScenario)}>Ustawienia domyÅ›lne</button>
      </div>
      <div className="scenario-grid">
        <label><span>Dystans</span><select value={value.distance} onChange={e => set('distance', e.target.value as Scenario['distance'])}><option>10â€“20 km</option><option>20â€“40 km</option><option>40â€“50 km</option></select><ChevronDown size={15}/></label>
        <label><span>Temperatura</span><select value={value.temperature} onChange={e => set('temperature', e.target.value as Scenario['temperature'])}><option>chÅ‚Ã³d</option><option>okoÅ‚o 0Â°C</option><option>lekki mrÃ³z</option></select><ChevronDown size={15}/></label>
        <label><span>Tempo</span><select value={value.pace} onChange={e => set('pace', e.target.value as Scenario['pace'])}><option>spokojne</option><option>umiarkowane</option><option>bardzo szybkie</option></select><ChevronDown size={15}/></label>
        <label><span>Konfiguracja</span><select value={value.mode} onChange={e => set('mode', e.target.value as Scenario['mode'])}><option>jedna kurtka</option><option>system warstwowy</option></select><ChevronDown size={15}/></label>
      </div>
      <div className="toggle-grid">
        {[
          ['wind', 'Silny wiatr', Wind], ['forest', 'Las i zaroÅ›la', Mountain], ['backpack', 'CiÄ™Å¼ki plecak', ShieldCheck], ['value', 'Cena / jakoÅ›Ä‡', Filter]
        ].map(([key, label, Icon]) => {
          const k = key as 'wind' | 'forest' | 'backpack' | 'value'
          return <button key={k} className={`toggle-chip ${value[k] ? 'on' : ''}`} onClick={() => set(k, !value[k])}><Icon size={16}/><span>{label as string}</span><i>{value[k] ? <Check size={12}/> : null}</i></button>
        })}
      </div>
      <label className="visual-toggle">
        <input type="checkbox" checked={visualEnabled} onChange={e => onVisualEnabled(e.target.checked)} />
        <span className="switch" />
        <div><b>UwzglÄ™dnij moje preferencje wizualne w shortlistcie</b><small>Modele oznaczone â€žNie podoba mi siÄ™â€ mogÄ… zniknÄ…Ä‡ z TOP 3. Ranking techniczny pozostaje bez zmian.</small></div>
      </label>
    </section>
  )
}

function TopCard({ jacket, index, preference, onPreference, selected, onCompare, onPhoto }: {
  jacket: Jacket, index: number, preference: Preference, onPreference: (p: Preference) => void, selected: boolean, onCompare: () => void, onPhoto: () => void
}) {
  return (
    <article className={`top-card rank-${index + 1}`}>
      <div className="top-photo-wrap"><Photo jacket={jacket} onOpen={onPhoto} /></div>
      <div className="top-content">
        <div className="rank-row"><span className="rank-pill">#{index + 1} DLA TEGO SCENARIUSZA</span><span className={`status-badge status-${jacket.dataStatus.replace(' ', '-')}`}>{jacket.dataStatus}</span></div>
        <p className="brand">{jacket.brand}</p>
        <h3>{jacket.model}</h3>
        <p className="verdict">{jacket.verdict}</p>
        <div className="quick-specs"><span><b>{jacket.weight}</b><small>Masa</small></span><span><b>{jacket.insulation}</b><small>Izolacja</small></span></div>
        <div className="strength-list">{jacket.strengths.slice(0,3).map(x => <span key={x}><Check size={14}/>{x}</span>)}</div>
        <div className="top-actions"><button className={`compare-btn ${selected ? 'selected' : ''}`) onClick={onCompare}><Compare size={16}/>{selected ? 'Wybrane do porÃ³wnania' : 'PorÃ³wnaj'}</button>{jacket.imageSourceUrl && <a href={jacket.imageSourceUrl} target="_blank" rel="noreferrer">Å¹rÃ³dÅ‚o zdjÄ™cia <ExternalLink size={13}/></a>}</div>
        <PreferenceButtons jacket={jacket} preference={preference} onChange={onPreference} />
      </div>
    </article>
  )
}

function App() {
  const [scenario, setScenario] = useState(defaultScenario)
  const [preferences, setPreferences] = useStoredMap('trek-jacket-preferences-v1')
  const [visualEnabled, setVisualEnabled] = useState(false)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [lightbox, setLightbox] = useState<Jacket | null>(null)
  const [compareOpen, setCompareOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [onlyPhotos, setOnlyPhotos] = useState(false)

  const dislikes = useMemo(() => new Set(Object.entries(preferences).filter(([, v]) => v === 'dislike').map(([id]) => id)), [preferences])
  const { top3, signals } = useMemo(() => shortlistForScenario(scenario, visualEnabled, dislikes), [scenario, visualEnabled, dislikes])
  const compareJackets = compareIds.map(id => jackets.find(j => j.id === id)).filter(Boolean) as Jacket[]
  const filtered = jackets.filter(j => {
    const q = query.trim().toLowerCase()
    const hit = !q || `${j.brand} ${j.model} ${j.insulation} ${j.verdict}`.toLowerCase().includes(q)
    const photoHit = !onlyPhotos || j.imageStatus === 'verified'
    return hit && photoHit
  })

  const setPref = (id: string, p: Preference) => setPreferences(prev => ({ ...prev, [id]: p }))
  const toggleCompare = (id: string) => setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 4 ? prev : [...prev, id])

  return (
    <div className="app-shell">
      <header className="hero">
        <nav className="nav"><a className="logo" href="#top"><Mountain size={22}/><span>Trek Jacket Finder</span></a><div className="nav-links"><a href="#selector">Selektor</a><a href="#ranking">TOP 20</a><a href="#system">System warstwowy</a></div><a className="nav-cta" href="#ranking">Zobacz ranking <ArrowUpRight size={15}/></a></nav>
        <div className="hero-inner" id="top">
          <div className="hero-copy"><span className="hero-kicker"><Snowflake size={14}/> ACTIVE INSULATION Â· 20â€“50 KM</span><h1>Nie wybierak kurtki<br/><em>tylko z tabeli.</em></h1><p>PoÄ…Å‚acz wynik audytu technicznego z tym, jak kurtka faktycznie wyglÄ…‘‘„¸UÍÑ…ÜÝ…ÉÕ¹­¤µ…ÉÍéÔ°é½‰…èQ=@€Ì°Á½ËÍÝ¹…¨µ½‘•±”¤½‘Éé×Ñ”°­ÓÍÉå ¹¥”¡•Íè¹½Í§¸ð½Àøñ‘¥Ø±…ÍÍ9…µ”ô‰¡•É¼µ…Ñ¥½¹Ìˆøñ„¡É•˜ôˆÍ•±•Ñ½Èˆ±…ÍÍ9…µ”ô‰ÁÉ¥µ…Éäˆù½‰¥•Éè­ÕÉÑ¯d€ñÉÉ½ÝUÁI¥¡ÐÍ¥é”õìÄÙô¼øð½„øñ„¡É•˜ôˆÉ…¹­¥¹œˆ±…ÍÍ9…µ”ô‰Í•½¹‘…ÉäˆùA—	¹äQ=@€ÈÀð½„øð½‘¥Øøð½‘¥Øø(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰¡•É¼µÍÑ…ÑÌˆøñ‘¥ØøñÍÑÉ½¹œøÈÀð½ÍÑÉ½¹œøñÍÁ…¸ùµ½‘•±¤ÜÉ…¹­¥¹Ôð½ÍÁ…¸øð½‘¥Øøñ‘¥ØøñÍÑÉ½¹œùí©…­•ÑÌ¹™¥±Ñ•È¡¨€ôø¨¹¥µ…•MÑ…ÑÕÌ€ôôô€Ù•É¥™¥•œ¤¹±•¹Ñ¡ôð½ÍÑÉ½¹œøñÍÁ…¸ùéÝ•Éå™¥­½Ý…¹å é‘«gð½ÍÁ…¸øð½‘¥Øøñ‘¥ØøñÍÑÉ½¹œøÈÃŠLÔÀ­´ð½ÍÑÉ½¹œøñÍÁ…¸ùé…­É•Ì‘•åéå©¹äð½ÍÁ…¸øð½‘¥Øøñ‘¥ØøñÍÑÉ½¹œøÄÀÀ­´ð½ÍÑÉ½¹œøñÍÁ…¸ùÑå±­¼¥¹™½Éµ…å©¹¥”ð½ÍÁ…¸øð½‘¥Øøð½‘¥Øø(€€€€€€€€ð½‘¥Øø(€€€€€€ð½¡•…‘•Èø((€€€€€€ñµ…¥¸ø(€€€€€€€€ñM•¹…É¥½A…¹•°Ù…±Õ”õíÍ•¹…É¥½ô½¹¡…¹”õíÍ•ÑM•¹…É¥½ôÙ¥ÍÕ…±¹…‰±•õíÙ¥ÍÕ…±¹…‰±•‘ô½¹Y¥ÍÕ…±¹…‰±•õíÍ•ÑY¥ÍÕ…±¹…‰±•‘ô€¼ø((€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰É•ÍÕ±ÑÌµÍ•Ñ¥½¸ˆø(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Í•Ñ¥½¸µÑ¥Ñ±”µÉ½Üˆøñ‘¥ØøñÍÁ…¸±…ÍÍ9…µ”ô‰•å•‰É½Üˆøñ	…‘•¡•¬Í¥é”õìÄÕô¼øQ]=)M!=IQ1%MQð½ÍÁ…¸øñ ÈùQ=@€Ì‘±„Ýå‰É…¹•¼Í•¹…É¥ÕÍé„ð½ ÈøñÀ±…ÍÍ9…µ”ô‰ÍÕˆˆùQ¼Í•±•­©„É•×	­½Ý„½Á…ÉÑ„¹„Ý•É‘å­Ñ… …Õ‘åÑÔƒŠPˆ‰•èÕ‘…Ý…¹¥„±…‰½É…Ñ½Éå©¹•¨ÁÉ•åé©¤¸ð½Àøð½‘¥Øøñ‰ÕÑÑ½¸±…ÍÍ9…µ”ô‰½µÁ…É”µ™±½…Ñ¥¹œˆ½¹±¥¬õì ¤€ôøÍ•Ñ½µÁ…É•=Á•¸¡ÑÉÕ”¥ô‘¥Í…‰±•õì…½µÁ…É•%‘Ì¹±•¹Ñ¡ôøñ½µÁ…É”Í¥é”õìÄÙô¼øA½ËÍÝ¹…¹¥”í½µÁ…É•%‘Ì¹±•¹Ñ €ü€ ‘í½µÁ…É•%‘Ì¹±•¹Ñ¡ô¥€€è€œôð½‰ÕÑÑ½¸øð½‘¥Øø(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Í¥¹…°µ±¥¹”ˆùíÍ¥¹…±Ì¹Í±¥” À°Ð¤¹µ…À¡Ì€ôø€ñÍÁ…¸­•äõíÍôøñ¡•¬Í¥é”õìÄÉô¼ùíÍôð½ÍÁ…¸ø¥ôð½‘¥Øø(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Ñ½ÀµÉ¥ˆùíÑ½ÀÌ¹µ…À ¡¨°¤¤€ôø€ñQ½Á…É­•äõí¨¹¥‘ô©…­•Ðõí©ô¥¹‘•àõí¥ôÁÉ•™•É•¹”õíÁÉ•™•É•¹•Ím¨¹¥‘tñð¹Õ±±ô½¹AÉ•™•É•¹”õíÀ€ôøÍ•ÑAÉ•˜¡¨¹¥°À¥ôÍ•±•Ñ•õí½µÁ…É•%‘Ì¹¥¹±Õ‘•Ì¡¨¹¥¥ô½¹½µÁ…É”õì ¤€ôøÑ½±•½µÁ…É”¡¨¹¥¥ô½¹A¡½Ñ¼õì ¤€ôøÍ•Ñ1¥¡Ñ‰½à¡¨¥ô€¼ø¥ôð½‘¥Øø(€€€€€€€€€íÙ¥ÍÕ…±¹…‰±•€˜˜‘¥Í±¥­•Ì¹Í¥é”€ø€À€˜˜€ñ‘¥Ø±…ÍÍ9…µ”ô‰Ù¥ÍÕ…°µ¹½Ñ”ˆøñ%¹™¼Í¥é”õìÄÙô¼øñÍÁ…¸ù¥±ÑÈÝ¥éÕ…±¹ä©•ÍÐ…­ÑåÝ¹ä¸=‘ÉéÕ½¹”Ý¥éÕ…±¹¥”µ½‘•±”¹¥”Á½©…Ý¥…«Í§dÜÍ¡½ÉÑ±¥ÍÑ¥”°…±”¥ Á½éå©„Ñ•¡¹¥é¹„ÜQ=@€ÈÀÁ½é½ÍÑ…©”‰•èéµ¥…¸¸ð½ÍÁ…¸øð½‘¥Øùô(€€€€€€€€ð½Í•Ñ¥½¸ø((€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰É…¹­¥¹œµÍ•Ñ¥½¸ˆ¥ô‰É…¹­¥¹œˆø(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Í•Ñ¥½¸µÑ¥Ñ±”µÉ½Üˆøñ‘¥ØøñÍÁ…¸±…ÍÍ9…µ”ô‰•å•‰É½Üˆøñ5•¹ÔÍ¥é”õìÄÕô¼øI9-%9	i=]dð½ÍÁ…¸øñ Èù±½‰…±¹äQ=@€ÈÀð½ ÈøñÀ±…ÍÍ9…µ”ô‰ÍÕˆˆùA½éå©„‰…é½Ý„è…Õ‘åÑÔ¸]å³¹¥”éµ¥•¹¥„É…¹­¥¹ÔÑ•¡¹¥é¹•¼¸ð½Àøð½‘¥Øøð½‘¥Øø(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Ñ½½±‰…Èˆøñ±…‰•°±…ÍÍ9…µ”ô‰Í•…É¡‰½àˆøñM•…É Í¥é”õìÄÙô¼øñ¥¹ÁÕÐÙ…±Õ”õíÅÕ•Éåô½¹¡…¹”õí”€ôøÍ•ÑEÕ•Éä¡”¹Ñ…É•Ð¹Ù…±Õ”¥ôÁ±…•¡½±‘•Èô‰MéÕ­…¨µ…É­¤°µ½‘•±Ô°¥é½±…©§Š˜ˆ¼øð½±…‰•°øñ±…‰•°±…ÍÍ9…µ”ô‰¡•­‰½àµ™¥±Ñ•Èˆøñ¥¹ÁÕÐÑåÁ”ô‰¡•­‰½àˆ¡•­•õí½¹±åA¡½Ñ½Íô½¹¡…¹”õí”€ôøÍ•Ñ=¹±åA¡½Ñ½Ì¡”¹Ñ…É•Ð¹¡•­•¥ô¼øñÍÁ…¸ùQå±­¼é”éÝ•Éå™¥­½Ý…¹å´é‘«e¥•´ð½ÍÁ…¸øð½±…‰•°øð½‘¥Øø(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰É…¹­¥¹œµÑ…‰±”µÝÉ…Àˆø(€€€€€€€€€€€€ñÑ…‰±”±…ÍÍ9…µ”ô‰É…¹­¥¹œµÑ…‰±”ˆø(€€€€€€€€€€€€€€ñÑ¡•…øñÑÈøñÑ øŒð½Ñ øñÑ ù]å³ð½Ñ øñÑ ù5½‘•°ð½Ñ øñÑ ù5…Í„ð½Ñ øñÑ ù%é½±…©„ð½Ñ øñÑ ù=‘‘å ¸ð½Ñ øñÑ ù]¥…ÑÈð½Ñ øñÑ ùA±•…¬ð½Ñ øñÑ ù1…Ìð½Ñ øñÑ øÈÀ­´ð½Ñ øñÑ øÔÀ­´ð½Ñ øñÑ ù•¹„ð½Ñ øñÑ øð½Ñ øð½ÑÈøð½Ñ¡•…ø(€€€€€€€€€€€€€€ñÑ‰½‘äùí™¥±Ñ•É•¹µ…À¡¨€ôø€ñÑÈ­•äõí¨¹¥‘ô±…ÍÍ9…µ”õíÁÉ•™•É•¹•Ím¨¹¥‘t€ôôô€‘¥Í±¥­”œ€ü€É½Üµ‘¥Í±¥­•œ€è€œôø(€€€€€€€€€€€€€€€€ñÑøñˆùí¨¹É…¹­ôð½ˆøð½ÑøñÑøñA¡½Ñ¼©…­•Ðõí©ô½µÁ…Ð½¹=Á•¸õì ¤€ôøÍ•Ñ1¥¡Ñ‰½à¡¨¥ô¼øð½ÑøñÑøñÍÑÉ½¹œùí¨¹‰É…¹‘ôð½ÍÑÉ½¹œøñÍÁ…¸ùí¨¹µ½‘•±ôð½ÍÁ…¸øñÍµ…±°ùí¨¹Ù•É‘¥Ñôð½Íµ…±°øð½ÑøñÑùí¨¹Ý•¥¡Ñôð½ÑøñÑùí¨¹¥¹ÍÕ±…Ñ¥½¹ôð½ÑøñÑùí™µÐ¡¨¹‰É•…Ñ¡…‰¥±¥Ñä¥ôð½ÑøñÑùí™µÐ¡¨¹Ý¥¹¥ôð½ÑøñÑùí™µÐ¡¨¹‰…­Á…¬¥ôð½ÑøñÑùí™µÐ¡¨¹™½É•ÍÐ¥ôð½ÑøñÑùí™µÐ¡¨¹­´ÈÀ¥ôð½ÑøñÑùí™µÐ¡¨¹­´ÔÀ¥ôð½ÑøñÑùí¨¹ÁÉ¥•ôð½ÑøñÑøñ‰ÕÑÑ½¸±…ÍÍ9…µ”õí¥½¸µ‰Ñ¸€‘í½µÁ…É•%‘Ì¹¥¹±Õ‘•Ì¡¨¹¥¤€ü€Í•±•Ñ•œ€è€œõô½¹±¥¬õì ¤€ôøÑ½±•½µÁ…É”¡¨¹¥¥ôÑ¥Ñ±”ô‰½‘…¨‘¼Á½ËÍÝ¹…¹¥„ˆøñ½µÁ…É”Í¥é”õìÄÙô¼øð½‰ÕÑÑ½¸øð½Ñø(€€€€€€€€€€€€€€ð½ÑÈø¥ôð½Ñ‰½‘äø(€€€€€€€€€€€€ð½Ñ…‰±”ø(€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰µ½‰¥±”µÉ…¹­¥¹œˆùí™¥±Ñ•É•¹µ…À¡¨€ôø€ñ…ÉÑ¥±”±…ÍÍ9…µ”ô‰µ½‰¥±”µÉ…¹¬µ…Éˆ­•äõí¨¹¥‘ôøñ‘¥Ø±…ÍÍ9…µ”ô‰µ½‰¥±”µÁ¡½Ñ¼ˆøñA¡½Ñ¼©…­•Ðõí©ô½µÁ…Ð½¹=Á•¸õì ¤€ôøÍ•Ñ1¥¡Ñ‰½à¡¨¥ô¼øð½‘¥Øøñ‘¥Ø±…ÍÍ9…µ”ô‰µ½‰¥±”µÉ…¹¬µµ…¥¸ˆøñ‘¥Ø±…ÍÍ9…µ”ô‰µ½‰¥±”µÉ…¹¬µÑ½ÀˆøñÍÁ…¸øí¨¹É…¹­ôð½ÍÁ…¸øñÍÁ…¸±…ÍÍ9…µ”õíÍÑ…ÑÕÌµ‰…‘”ÍÑ…ÑÕÌ´‘í¨¹‘…Ñ…MÑ…ÑÕÌ¹É•Á±…” œ€œ°€œ´œ¥õôùí¨¹‘…Ñ…MÑ…ÑÕÍôð½ÍÁ…¸øð½‘¥ØøñÍÑÉ½¹œùí¨¹‰É…¹‘ôð½ÍÑÉ½¹œøñ Ìùí¨¹µ½‘•±ôð½ ÌøñÀùí¨¹Ù•É‘¥Ñôð½Àøñ‘¥Ø±…ÍÍ9…µ”ô‰µ½‰¥±”µÍÁ•ŒµÉ¥ˆøñÍÁ…¸øñÍµ…±°ù5…Í„ð½Íµ…±°ùí¨¹Ý•¥¡Ñôð½ÍÁ…¸øñÍÁ…¸øñÍµ…±°ù%é½±…©„ð½Íµ…±°ùí¨¹¥¹ÍÕ±…Ñ¥½¹ôð½ÍÁ…¸øñÍÁ…¸øñÍµ…±°øÔÀ­´ð½Íµ…±°ùí™µÐ¡¨¹­´ÔÀ¥ô¼Ôð½ÍÁ…¸øñÍÁ…¸øñÍµ…±°ù]¥…ÑÈð½Íµ…±°ùí™µÐ¡¨¹Ý¥¹¥ô¼Ôð½ÍÁ…¸øð½‘¥ØøñAÉ•™•É•¹•	ÕÑÑ½¹Ì©…­•Ðõí©ôÁÉ•™•É•¹”õíÁÉ•™•É•¹•Ím¨¹¥‘tñð¹Õ±±ô½¹¡…¹”õíÀ€ôøÍ•ÑAÉ•˜¡¨¹¥°À¥ô€¼øñ‰ÕÑÑ½¸±…ÍÍ9…µ”õí½µÁ…É”µ‰Ñ¸€‘í½µÁ…É•%‘Ì¹¥¹±Õ‘•Ì¡¨¹¥¤€ü€Í•±•Ñ•œ€è€œõô½¹±¥¬õì ¤€ôøÑ½±•½µÁ…É”¡¨¹¥¥ôøñ½µÁ…É”Í¥é”õìÄÙô¼ùí½µÁ…É•%‘Ì¹¥¹±Õ‘•Ì¡¨¹¥¤€ü€]å‰É…¹”œ€è€A½ËÍÝ¹…¨ôð½‰ÕÑÑ½¸øð½‘¥Øøð½…ÉÑ¥±”ø¥ôð½‘¥Øø(€€€€€€€€ð½Í•Ñ¥½¸ø((€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰ÍåÍÑ•´µÍ•Ñ¥½¸ˆ¥ô‰ÍåÍÑ•´ˆø(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰ÍåÍÑ•´µ…ÉˆøñÍÁ…¸±…ÍÍ9…µ”ô‰•å•‰É½Üˆøñ1…å•ÉÌÌÍ¥é”õìÄÕô¼ø1QI9Qe]1ƒŠy)9(-UIQ-'Štð½ÍÁ…¸øñ ÈùMåÍÑ•´Ý…ÉÍÑÝ½Ýäè…Õ‘åÑÔð½ ÈøñÀù9„“	Õ¥´°¥¹Ñ•¹ÍåÝ¹å´µ…ÉÍéÔÍåÍÑ•´µ¿ñ”±•Á¥•¨é…Éë‘é‡éµ¥…¹…µ¤Ñ•µÁ•É…ÑÕÉä¤Ý¥…ÑÉÔ¹§ð©•‘¹„‰…É‘é¥•¨Õ¹¥Ý•ÉÍ…±¹„­ÕÉÑ­„¸ð½Àøñ‘¥Ø±…ÍÍ9…µ”ô‰±…å•Èµ™±½Üˆøñ‘¥ØøñˆøÄð½ˆøñÍÁ…¸ù	…é„ð½ÍÁ…¸øñÍµ…±°ùÝ…ÉÍÑÝ„ÁÉéä¥•±”ð½Íµ…±°øð½‘¥Øøñ¤ûŠHð½¤øñ‘¥ØøñˆøÈð½ˆøñÍÁ…¸ù5…µµÕÐ•¹•Éä50!å‰É¥ð½ÍÁ…¸øñÍµ…±°ù±Á¡„¥É•Ð€¬™±••”ð½Íµ…±°øð½‘¥Øøñ¤ûŠHð½¤øñ‘¥ØøñˆøÌð½ˆøñÍÁ…¸ù5½¹Ñ‰•±°Q…¡å½¸ð½ÍÁ…¸øñÍµ…±°ù±•­­„Ý…ÉÍÑÝ„Ý¥…ÑÉ½Ý„ð½Íµ…±°øð½‘¥Øøñ¤ûŠHð½¤øñ‘¥ØøñˆøÐð½ˆøñÍÁ…¸ù!…É‘Í¡•±°ð½ÍÁ…¸øñÍµ…±°ùÑå±­¼ÁÉéäÉ•…±¹å´½Á…‘é¥”ð½Íµ…±°øð½‘¥Øøð½‘¥Øøñ‘¥Ø±…ÍÍ9…µ”ô‰ÍåÍÑ•´µ¹½Ñ”ˆøñ%¹™¼Í¥é”õìÄÙô¼øQ•¸Í•¹…É¥ÕÍè©•ÍÐé½‘¹äèÝ•É‘å­Ñ•´…Õ‘åÑÔ¸9¥”éµ¥•¹¥…µä¼ÜƒŠyÉ…¹­¥¹œ©•‘¹•¨­ÕÉÑ­§Št¸ð½‘¥Øøð½‘¥Øø(€€€€€€€€ð½Í•Ñ¥½¸ø(€€€€€€ð½µ…¥¸ø((€€€€€€ñ™½½Ñ•Èøñ‘¥Øøñ5½Õ¹Ñ…¥¸Í¥é”õìÄáô¼øñˆùQÉ•¬)…­•Ð¥¹‘•Èð½ˆøð½‘¥ØøñÀù9„Á½‘ÍÑ…Ý¥”…Õ‘åÑÔè€ÄÐ¸Àä¸ÈÀÈØ¸	É…­¤‘…¹å Á½é½ÍÑ…«‰É…­…µ¤ƒŠP¹¥”Ï¥¹Ñ•ÉÁ½±½Ý…¹”¸ð½Àøð½™½½Ñ•Èø((€€€€€í½µÁ…É•%‘Ì¹±•¹Ñ €ø€À€˜˜€ñ‰ÕÑÑ½¸±…ÍÍ9…µ”ô‰ÍÑ¥­äµ½µÁ…É”ˆ½¹±¥¬õì ¤€ôøÍ•Ñ½µÁ…É•=Á•¸¡ÑÉÕ”¥ôøñ½µÁ…É”Í¥é”õìÄÝô¼øñÍÁ…¸ùA½ËÍÝ¹…¨í½µÁ…É•%‘Ì¹±•¹Ñ¡ôí½µÁ…É•%‘Ì¹±•¹Ñ €ôôô€Ä€ü€µ½‘•°œ€è€µ½‘•±”ôð½ÍÁ…¸øð½‰ÕÑÑ½¸ùô((€€€€€í±¥¡Ñ‰½à€˜˜€ñ‘¥Ø±…ÍÍ9…µ”ô‰µ½‘…°µ‰…­‘É½Àˆ½¹±¥¬õì ¤€ôøÍ•Ñ1¥¡Ñ‰½à¡¹Õ±°¥ôøñ‘¥Ø±…ÍÍ9…µ”ô‰±¥¡Ñ‰½àˆ½¹±¥¬õí”€ôø”¹ÍÑ½ÁAÉ½Á……Ñ¥½¸ ¥ôøñ‰ÕÑÑ½¸±…ÍÍ9…µ”ô‰µ½‘…°µ±½Í”ˆ½¹±¥¬õì ¤€ôøÍ•Ñ1¥¡Ñ‰½à¡¹Õ±°¥ôøñ`¼øð½‰ÕÑÑ½¸øñ‘¥Ø±…ÍÍ9…µ”ô‰±¥¡Ñ‰½àµÁ¡½Ñ¼ˆøñI•Í¥±¥•¹Ñ%µ…”©…­•Ðõí±¥¡Ñ‰½áô€¼øð½‘¥Øøñ‘¥Ø±…ÍÍ9…µ”ô‰±¥¡Ñ‰½àµ¥¹™¼ˆøñÍÁ…¸±…ÍÍ9…µ”ô‰É…¹¬µÁ¥±°ˆøí±¥¡Ñ‰½à¹É…¹­ôÉ…¹­¥¹œ‰…é½Ýäð½ÍÁ…¸øñÀ±…ÍÍ9…µ”ô‰‰É…¹ˆùí±¥¡Ñ‰½à¹‰É…¹‘ôð½Àøñ Èùí±¥¡Ñ‰½à¹µ½‘•±ôð½ Èùí±¥¡Ñ‰½à¹½±½È€˜˜€ñÀ±…ÍÍ9…µ”ô‰½±½Èµ±¥¹”ˆù]…É¥…¹Ð¹„é‘«e¥Ôè€ñˆùí±¥¡Ñ‰½à¹½±½Éôð½ˆøð½ÀùôñÀùí±¥¡Ñ‰½à¹Ù•É‘¥Ñôð½Àùí±¥¡Ñ‰½à¹¥µ…•M½ÕÉ•UÉ°€ü€ñ„¡É•˜õí±¥¡Ñ‰½à¹¥µ…•M½ÕÉ•UÉ±ôÑ…É•Ðô‰}‰±…¹¬ˆÉ•°ô‰¹½É•™•ÉÉ•Èˆù=ÑßÍÉèƒéËÍ“	¼é‘«e¥„€ñáÑ•É¹…±1¥¹¬Í¥é”õìÄÑô¼øð½„ø€è€ñÍÁ…¸±…ÍÍ9…µ”ô‰Í½ÕÉ”µµ¥ÍÍ¥¹œˆù	É…¬éÝ•Éå™¥­½Ý…¹•¼ƒéËÍ“	„é‘«e¥„¸ð½ÍÁ…¸ùôñAÉ•™•É•¹•	ÕÑÑ½¹Ì©…­•Ðõí±¥¡Ñ‰½áôÁÉ•™•É•¹”õíÁÉ•™•É•¹•Ím±¥¡Ñ‰½à¹¥‘tñð¹Õ±±ô½¹¡…¹”õíÀ€ôøÍ•ÑAÉ•˜¡±¥¡Ñ‰½à¹¥°À¥ô€¼øð½‘¥Øøð½‘¥Øøð½‘¥Øùô((€€€€€í½µÁ…É•=Á•¸€˜˜€ñ‘¥Ø±…ÍÍ9…µ”ô‰µ½‘…°µ‰…­‘É½À½µÁ…É”µ‰…­‘É½Àˆ½¹±¥¬õì ¤€ôøÍ•Ñ½µÁ…É•=Á•¸¡™…±Í”¥ôøñ‘¥Ø±…ÍÍ9…µ”ô‰½µÁ…É”µµ½‘…°ˆ½¹±¥¬õí”€ôø”¹ÍÑ½ÁAÉ½Á……Ñ¥½¸ ¥ôøñ‘¥Ø±…ÍÍ9…µ”ô‰½µÁ…É”µ¡•…‘•Èˆøñ‘¥ØøñÍÁ…¸±…ÍÍ9…µ”ô‰•å•‰É½Üˆøñ½µÁ…É”Í¥é”õìÄÕô¼øA=KM]99%ð½ÍÁ…¸øñ Èù9…©Á¥•ÉÜÝå³¸A½Ñ•´Á…É…µ•ÑÉä¸ð½ Èøð½‘¥Øøñ‰ÕÑÑ½¸±…ÍÍ9…µ”ô‰µ½‘…°µ±½Í”ÍÑ…Ñ¥Œˆ½¹±¥¬õì ¤€ôøÍ•Ñ½µÁ…É•=Á•¸¡™…±Í”¥ôøñ`¼øð½‰ÕÑÑ½¸øð½‘¥Øùí½µÁ…É•)…­•ÑÌ¹±•¹Ñ €ôôô€À€ü€ñ‘¥Ø±…ÍÍ9…µ”ô‰•µÁÑäµ½µÁ…É”ˆøñ½µÁ…É”Í¥é”õìÌÑô¼øñ Ìù]å‰¥•Éè€ËŠLÐ­ÕÉÑ­¤ð½ ÌøñÀù½‘…¨µ½‘•±”èQ=@€Ì±ÕˆÑ…‰•±¤¸ð½Àøð½‘¥Øø€è€ñ‘¥Ø±…ÍÍ9…µ”ô‰½µÁ…É”µÍÉ½±°ˆøñ‘¥Ø±…ÍÍ9…µ”ô‰½µÁ…É”µÉ¥ˆÍÑå±”õíìÉ¥‘Q•µÁ±…Ñ•½±Õµ¹ÌèÉ•Á•…Ð ‘í½µÁ…É•)…­•ÑÌ¹±•¹Ñ¡ô°µ¥¹µ…à ÈÔÁÁà°€Å™È¤¥€õôùí½µÁ…É•)…­•ÑÌ¹µ…À¡¨€ôø€ñ…ÉÑ¥±”±…ÍÍ9…µ”ô‰½µÁ…É”µ½°ˆ­•äõí¨¹¥‘ôøñ‰ÕÑÑ½¸±…ÍÍ9…µ”ô‰É•µ½Ù”µ½µÁ…É”ˆ½¹±¥¬õì ¤€ôøÑ½±•½µÁ…É”¡¨¹¥¥ôøñ`Í¥é”õìÄÑô¼øð½‰ÕÑÑ½¸øñA¡½Ñ¼©…­•Ðõí©ô½¹=Á•¸õì ¤€ôøÍ•Ñ1¥¡Ñ‰½à¡¨¥ô¼øñÀ±…ÍÍ9…µ”ô‰‰É…¹ˆùí¨¹‰É…¹‘ôð½Àøñ Ìùí¨¹µ½‘•±ôð½ ÌøñÀ±…ÍÍ9…µ”ô‰½µÁ…É”µÙ•É‘¥Ðˆùí¨¹Ù•É‘¥Ñôð½Àøñ‘°øñ‘¥Øøñ‘Ðù5…Í„ð½‘Ðøñ‘ùí¨¹Ý•¥¡Ñôð½‘øð½‘¥Øøñ‘¥Øøñ‘Ðù%é½±…©„ð½‘Ðøñ‘ùí¨¹¥¹ÍÕ±…Ñ¥½¹ôð½‘øð½‘¥Øøñ‘¥Øøñ‘Ðù	½‘äµ…ÁÁ¥¹œð½‘Ðøñ‘ùí¨¹‰½‘å5…ÁÁ¥¹ôð½‘øð½‘¥Øøñ‘¥Øøñ‘Ðù•¹„è…Õ‘åÑÔð½‘Ðøñ‘ùí¨¹ÁÉ¥•ôð½‘øð½‘¥Øøð½‘°øñ‘¥Ø±…ÍÍ9…µ”ô‰µ•ÑÉ¥Œµ‰±½¬ˆøñ5•ÑÉ¥Œ±…‰•°ô‰=‘‘å¡…±¹¿oˆÙ…±Õ”õí¨¹‰É•…Ñ¡…‰¥±¥Ñåô¼øñ5•ÑÉ¥Œ±…‰•°ô‰]¥…ÑÈˆÙ…±Õ”õí¨¹Ý¥¹‘ô¼øñ5•ÑÉ¥Œ±…‰•°ô‰A±•…¬ˆÙ…±Õ”õí¨¹‰…­Á…­ô¼øñ5•ÑÉ¥Œ±…‰•°ô‰1…ÌˆÙ…±Õ”õí¨¹™½É•ÍÑô¼øñ5•ÑÉ¥Œ±…‰•°ôˆÈÀ­´ˆÙ…±Õ”õí¨¹­´ÈÁô¼øñ5•ÑÉ¥Œ±…‰•°ôˆÔÀ­´ˆÙ…±Õ”õí¨¹­´ÔÁô¼øð½‘¥ØøñAÉ•™•É•¹•	ÕÑÑ½¹Ì©…­•Ðõí©ôÁÉ•™•É•¹”õíÁÉ•™•É•¹•Ím¨¹¥‘tñð¹Õ±±ô½¹¡…¹”õíÀ€ôøÍ•ÑAÉ•˜¡¨¹¥°À¥ô¼øð½…ÉÑ¥±”ø¥ôð½‘¥Øøð½‘¥Øùôñ‘¥Ø±…ÍÍ9…µ”ô‰½µÁ…É”µ™½½Ñ•ÈˆøñÍµ…±°ù5…­Íåµ…±¹¥”€Ðµ½‘•±”¸€ÄÀÀ­´¹¥”ÝÃ	åÝ„¹„É…¹­¥¹œ¸ð½Íµ…±°øð½‘¥Øøð½‘¥Øøð½‘¥Øùô(€€€€ð½‘¥Øø(€€¤)ô()•áÁ½ÉÐ‘•™…Õ±ÐÁÀ(