import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  ExternalLink,
  Heart,
  Layers3,
  Mountain,
  Scale,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react'
import {
  defaultScenario,
  jackets,
  Jacket,
  Scenario,
  shortlistForScenario,
  EvidenceStatus,
} from './data'
import { productImages } from './image-data'

const STATUS_LABELS: Record<EvidenceStatus, string> = {
  confirmed: 'potwierdzony',
  'secondary-confirmed': 'wtórnie potwierdzony',
  disputed: 'sporny',
  'manufacturer-unpublished': 'producent nie publikuje',
  'not-applicable': 'nie dotyczy',
}

type RatingKey =
  | 'breathability'
  | 'wind'
  | 'backpack'
  | 'forest'
  | 'km20'
  | 'km50'
  | 'km100'

const RATING_LABELS: Array<[RatingKey, string]> = [
  ['breathability', 'Oddychalność'],
  ['wind', 'Wiatr'],
  ['backpack', 'Plecak'],
  ['forest', 'Las'],
  ['km20', '20 km'],
  ['km50', '50 km'],
  ['km100', '100 km'],
]

const TABLE_RATING_LABELS: Array<[RatingKey, string]> = [
  ['breathability', 'Oddych.'],
  ['wind', 'Wiatr'],
  ['backpack', 'Plecak'],
  ['forest', 'Las'],
  ['km20', '20 km'],
  ['km50', '50 km'],
]

const readStoredSet = (key: string) => {
  if (typeof window === 'undefined') return new Set<string>()
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || '[]')
    return new Set<string>(Array.isArray(value) ? value : [])
  } catch {
    return new Set<string>()
  }
}

function StatusBadge({ status }: { status: EvidenceStatus }) {
  return <span className={`status-badge status-${status}`}>{STATUS_LABELS[status]}</span>
}

function ProductPhoto({ jacket, compact = false }: { jacket: Jacket; compact?: boolean }) {
  const meta = productImages[jacket.id]
  const sources = meta ? [meta.imageUrl, ...meta.imageFallbacks] : []
  const [index, setIndex] = useState(0)

  useEffect(() => setIndex(0), [jacket.id])

  if (!meta || !sources[index]) {
    return (
      <div className={`photo ${compact ? 'compact-photo' : ''}`}>
        <div className="photo-fallback">
          <strong>Zdjęcie chwilowo niedostępne</strong>
          <span>Tożsamość produktu jest zweryfikowana; sprawdź źródło zdjęcia.</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`photo ${compact ? 'compact-photo' : ''}`}>
      <img
        src={sources[index]}
        alt={`${jacket.brand} ${jacket.model}`}
        loading="lazy"
        onError={() => setIndex(current => current + 1)}
      />
    </div>
  )
}

function SourceLinks({ jacket }: { jacket: Jacket }) {
  const imageMeta = productImages[jacket.id]
  return (
    <div className="source-links">
      {jacket.sources.map((source, index) =>
        source.url ? (
          <a key={`${source.label}-${index}`} href={source.url} target="_blank" rel="noreferrer">
            {source.label} <ExternalLink size={12} />
          </a>
        ) : (
          <span key={`${source.label}-${index}`}>{source.label}</span>
        ),
      )}
      {imageMeta && (
        <a href={imageMeta.imageSourceUrl} target="_blank" rel="noreferrer">
          Źródło zdjęcia: {imageMeta.imageSourceLabel} <ExternalLink size={12} />
        </a>
      )}
    </div>
  )
}

function RatingSummary({ jacket }: { jacket: Jacket }) {
  if (jacket.breathability == null) {
    return (
      <div className="descriptive-ranking-note" data-testid={`missing-ratings-${jacket.rank}`}>
        <b>Brak ocen użytkowych — błąd kompletności</b>
        <span>Każdy model powinien mieć pełny zestaw ocen 1–5.</span>
      </div>
    )
  }

  return (
    <div className="rating-summary" data-testid={`numeric-ratings-${jacket.rank}`}>
      {TABLE_RATING_LABELS.map(([key, label]) => (
        <span key={key}>
          <small>{label}</small>
          <b>{jacket[key]}/5</b>
        </span>
      ))}
    </div>
  )
}

function App() {
  const [scenario, setScenario] = useState<Scenario>(defaultScenario)
  const [query, setQuery] = useState('')
  const [includeVisual, setIncludeVisual] = useState(false)
  const [onlyPhotos, setOnlyPhotos] = useState(false)
  const [likes, setLikes] = useState<Set<string>>(() => readStoredSet('trek-jacket-likes'))
  const [dislikes, setDislikes] = useState<Set<string>>(() => readStoredSet('trek-jacket-dislikes'))
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)
  const [lightbox, setLightbox] = useState<Jacket | null>(null)

  useEffect(() => {
    window.localStorage.setItem('trek-jacket-likes', JSON.stringify([...likes]))
  }, [likes])

  useEffect(() => {
    window.localStorage.setItem('trek-jacket-dislikes', JSON.stringify([...dislikes]))
  }, [dislikes])

  const { top3, signals } = useMemo(
    () => shortlistForScenario(scenario, includeVisual, dislikes),
    [scenario, includeVisual, dislikes],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('pl')
    return jackets.filter(jacket => {
      const matchesQuery =
        !needle || `${jacket.brand} ${jacket.model}`.toLocaleLowerCase('pl').includes(needle)
      const matchesPhoto = !onlyPhotos || Boolean(productImages[jacket.id])
      return matchesQuery && matchesPhoto
    })
  }, [query, onlyPhotos])

  const compareJackets = useMemo(
    () =>
      compareIds
        .map(id => jackets.find(jacket => jacket.id === id))
        .filter((jacket): jacket is Jacket => Boolean(jacket)),
    [compareIds],
  )

  const set = <K extends keyof Scenario>(key: K, value: Scenario[K]) => {
    setScenario(current => ({ ...current, [key]: value }))
  }

  const resetScenario = () => {
    setScenario(defaultScenario)
    setIncludeVisual(false)
  }

  const like = (id: string) => {
    setLikes(current => {
      const next = new Set(current)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setDislikes(current => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
  }

  const dislike = (id: string) => {
    setDislikes(current => {
      const next = new Set(current)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setLikes(current => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
  }

  const toggleCompare = (id: string) => {
    setCompareIds(current => {
      if (current.includes(id)) return current.filter(item => item !== id)
      if (current.length >= 4) return current
      return [...current, id]
    })
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <nav className="nav">
          <a className="logo" href="#top">
            <Mountain size={22} />
            <span>Trek Jacket Finder</span>
          </a>
          <div className="nav-links">
            <a href="#selector">Selektor</a>
            <a href="#ranking">TOP 20</a>
            <a href="#full-data">Pełne dane</a>
            <a href="#system">System warstwowy</a>
          </div>
          <a className="nav-cta" href="#selector">Dobierz kurtkę</a>
        </nav>

        <div className="hero-inner" id="top">
          <div className="hero-copy">
            <span className="hero-kicker"><ShieldCheck size={15} /> AUDYT TECHNICZNY 20 MODELI</span>
            <h1>Nie wybieraj kurtki<br /><em>tylko z tabeli.</em></h1>
            <p>
              Active insulation ma pracować razem z Tobą na trasie. Selektor łączy audyt techniczny,
              profil marszu 20–50 km, realne ograniczenia materiałów i jawny status jakości danych.
            </p>
            <div className="hero-actions">
              <a className="primary" href="#selector">Dobierz kurtkę</a>
              <a className="secondary" href="#ranking">Pełny TOP 20</a>
            </div>
          </div>
          <div className="hero-stats">
            <div><strong>20</strong><span>modeli w rankingu</span></div>
            <div><strong>20/20</strong><span>ocen użytkowych</span></div>
            <div><strong>20/20</strong><span>zweryfikowanych źródeł zdjęć + fallback</span></div>
            <div><strong>16.09</strong><span>snapshot cen rynkowych</span></div>
          </div>
        </div>
      </header>

      <main>
        <section className="scenario-panel" id="selector" data-testid="scenario-selector">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">KREATOR SCENARIUSZA</span>
              <h2>Jak będziesz używać kurtki?</h2>
              <p className="sub">Zmiana parametrów przelicza shortlistę, ale nie zmienia bazowego rankingu technicznego.</p>
            </div>
            <button id="reset" className="reset-btn" onClick={resetScenario}>Ustawienia domyślne</button>
          </div>

          <div className="scenario-grid">
            <label>Dystans
              <select id="distance" value={scenario.distance} onChange={event => set('distance', event.target.value as Scenario['distance'])}>
                <option>10–20 km</option><option>20–40 km</option><option>40–50 km</option>
              </select>
            </label>
            <label>Temperatura
              <select id="temperature" value={scenario.temperature} onChange={event => set('temperature', event.target.value as Scenario['temperature'])}>
                <option>chłód</option><option>około 0°C</option><option>lekki mróz</option>
              </select>
            </label>
            <label>Tempo
              <select id="pace" value={scenario.pace} onChange={event => set('pace', event.target.value as Scenario['pace'])}>
                <option>spokojne</option><option>umiarkowane</option><option>bardzo szybkie</option>
              </select>
            </label>
            <label>Konfiguracja
              <select id="mode" value={scenario.mode} onChange={event => set('mode', event.target.value as Scenario['mode'])}>
                <option>jedna kurtka</option><option>system warstwowy</option>
              </select>
            </label>
          </div>

          <div className="toggle-grid">
            <button className={`toggle-chip ${scenario.wind ? 'on' : ''}`} onClick={() => set('wind', !scenario.wind)}>{scenario.wind && <Check size={14} />} 💨 Silny wiatr</button>
            <button className={`toggle-chip ${scenario.forest ? 'on' : ''}`} onClick={() => set('forest', !scenario.forest)}>{scenario.forest && <Check size={14} />} 🌲 Las / zarośla</button>
            <button className={`toggle-chip ${scenario.backpack ? 'on' : ''}`} onClick={() => set('backpack', !scenario.backpack)}>{scenario.backpack && <Check size={14} />} 🎒 Ciężki plecak</button>
            <button className={`toggle-chip ${scenario.value ? 'on' : ''}`} onClick={() => set('value', !scenario.value)}>{scenario.value && <Check size={14} />} 💶 Cena / jakość</button>
          </div>

          <label className="visual-toggle">
            <input id="visual" type="checkbox" checked={includeVisual} onChange={event => setIncludeVisual(event.target.checked)} />
            <span>
              <b>Uwzględnij moje preferencje wizualne w shortlistcie</b>
              <small>Modele oznaczone „Nie podoba mi się” mogą zniknąć z TOP 3. Ranking techniczny pozostaje bez zmian.</small>
            </span>
          </label>
        </section>

        <section className="results-section" data-testid="top3-section">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">TWOJA SHORTLISTA</span>
              <h2>TOP 3 dla wybranego scenariusza</h2>
              <p className="sub">Selekcja regułowa oparta na werdyktach audytu; oceny 1–5 są użytkową syntezą tego audytu, a nie pomiarami laboratoryjnymi.</p>
            </div>
            {compareIds.length >= 2 && (
              <button id="openCompare" className="compare-btn compare-floating" onClick={() => setCompareOpen(true)}>
                <Scale size={16} /> Porównaj {compareIds.length}
              </button>
            )}
          </div>

          <div className="signal-line">
            {signals.map(signal => <span key={signal}><Check size={12} />{signal}</span>)}
          </div>

          <div className="top-grid">
            {top3.map((jacket, index) => {
              const imageMeta = productImages[jacket.id]
              const selected = compareIds.includes(jacket.id)
              return (
                <article className="top-card" key={jacket.id} data-testid={`top-card-${index + 1}`}>
                  <div className="top-photo-wrap">
                    <ProductPhoto jacket={jacket} />
                  </div>
                  <div className="top-content">
                    <div className="top-actions">
                      <span className="rank-pill">#{index + 1} dla scenariusza</span>
                      <StatusBadge status={jacket.dataStatus} />
                    </div>
                    <p className="brand">{jacket.brand}</p>
                    <h3>{jacket.model}</h3>
                    <p>{jacket.description}</p>
                    <div className="quick-specs top-quick-specs">
                      <span><small>Masa</small><b>{jacket.weight.text}</b></span>
                      <span><small>Izolacja</small><b>{jacket.insulation.text}</b></span>
                      <span data-testid="top-gsm"><small>Gramatura / status</small><b>{jacket.insulationWeight.text}</b></span>
                      <span data-testid="top-price"><small>Średnia cena / widełki</small><b>{jacket.marketPrice}</b></span>
                    </div>
                    <div className="top-ratings">
                      <small>Oceny użytkowe 1–5</small>
                      <RatingSummary jacket={jacket} />
                    </div>
                    <p className="use-profile"><b>Najlepszy profil:</b> {jacket.useProfile}</p>
                    <div className="strength-list">
                      {jacket.strengths.slice(0, 3).map(item => <span key={item}><Check size={13} />{item}</span>)}
                    </div>
                    <div className="top-limitations" data-testid="top-limitations">
                      <b>Najważniejsze ograniczenia</b>
                      <ul>{jacket.weaknesses.slice(0, 2).map(item => <li key={item}>{item}</li>)}</ul>
                    </div>
                    <div className="preference-buttons">
                      <button className={likes.has(jacket.id) ? 'active-like' : ''} onClick={() => like(jacket.id)}><Heart size={14} /> Podoba mi się</button>
                      <button className={dislikes.has(jacket.id) ? 'active-dislike' : ''} onClick={() => dislike(jacket.id)}>Nie podoba mi się</button>
                      <button className={selected ? 'selected' : ''} onClick={() => toggleCompare(jacket.id)}><Scale size={14} /> {selected ? 'Wybrano' : 'Porównaj'}</button>
                      <button onClick={() => setLightbox(jacket)}>Powiększ zdjęcie</button>
                    </div>
                    {imageMeta?.color && <small>Wariant zdjęcia: {imageMeta.color}</small>}
                    <SourceLinks jacket={jacket} />
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="ranking-section" id="ranking" data-testid="ranking-section">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">RANKING BAZOWY</span>
              <h2>Globalny TOP 20</h2>
              <p className="sub">Kolejność z audytu pozostaje stała. Wszystkie 20 modeli ma ten sam zestaw ocen użytkowych 1–5. Są to oceny redakcyjne dla tego profilu użycia, nie deklaracje producentów; 100 km pozostaje kryterium informacyjnym.</p>
            </div>
          </div>

          <div className="toolbar">
            <label className="searchbox">
              <Search size={17} />
              <input id="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Szukaj marki lub modelu" />
            </label>
            <label className="checkbox-filter">
              <input id="onlyPhotos" type="checkbox" checked={onlyPhotos} onChange={event => setOnlyPhotos(event.target.checked)} />
              Tylko ze zweryfikowanym źródłem zdjęcia
            </label>
          </div>

          <div className="ranking-table-wrap">
            <table className="ranking-table stage7-ranking-table">
              <thead>
                <tr>
                  <th>#</th><th>Model</th><th>Zdjęcie</th><th>Masa</th><th>Izolacja</th>
                  <th>Gramatura / status</th><th>Średnia cena / widełki</th><th>Oceny użytkowe</th><th>Status</th><th>Pełne dane</th><th>Porównaj</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(jacket => (
                  <tr key={jacket.id} data-testid={`rank-${jacket.rank}`} className={dislikes.has(jacket.id) ? 'row-disliked' : ''}>
                    <td><b>{jacket.rank}</b></td>
                    <td>
                      <strong>{jacket.brand}</strong>
                      <span>{jacket.model}</span>
                      <small>{jacket.useProfile}</small>
                    </td>
                    <td><div className="table-photo"><ProductPhoto jacket={jacket} compact /></div></td>
                    <td>{jacket.weight.text}</td>
                    <td><b>{jacket.insulation.text}</b></td>
                    <td className="table-gsm">
                      <span>{jacket.insulationWeight.text}</span>
                      <StatusBadge status={jacket.insulationWeight.status} />
                    </td>
                    <td className="table-market-price" data-testid={`market-price-${jacket.rank}`}>
                      <b>{jacket.marketPrice}</b>
                      <small>sprawdzono {jacket.marketPriceCheckedAt}</small>
                    </td>
                    <td><RatingSummary jacket={jacket} /></td>
                    <td><StatusBadge status={jacket.dataStatus} /></td>
                    <td><a className="details-link" href={`#details-${jacket.rank}`}>Pełne dane</a></td>
                    <td><button className={`icon-btn rowcompare ${compareIds.includes(jacket.id) ? 'selected' : ''}`} onClick={() => toggleCompare(jacket.id)} aria-label={`Porównaj ${jacket.brand} ${jacket.model}`}><Scale size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mobile-ranking">
            {filtered.map(jacket => (
              <article className={`mobile-rank-card ${dislikes.has(jacket.id) ? 'row-disliked' : ''}`} key={jacket.id}>
                <div className="mobile-photo"><ProductPhoto jacket={jacket} compact /></div>
                <div className="mobile-rank-main">
                  <div className="mobile-rank-top"><b>#{jacket.rank}</b><StatusBadge status={jacket.dataStatus} /></div>
                  <strong>{jacket.brand}</strong><h3>{jacket.model}</h3>
                  <div className="mobile-spec-grid">
                    <span><small>Masa</small>{jacket.weight.text}</span>
                    <span><small>Izolacja</small>{jacket.insulation.text}</span>
                    <span className="mobile-gsm"><small>Gramatura / status</small>{jacket.insulationWeight.text}</span>
                    <span className="mobile-market-price"><small>Średnia cena / widełki</small>{jacket.marketPrice}<br /><small>sprawdzono {jacket.marketPriceCheckedAt}</small></span>
                    {jacket.breathability != null ? (
                      <span className="mobile-ratings"><small>Oceny użytkowe</small>Oddych. {jacket.breathability}/5 · Wiatr {jacket.wind}/5 · Plecak {jacket.backpack}/5 · Las {jacket.forest}/5 · 20 km {jacket.km20}/5 · 50 km {jacket.km50}/5</span>
                    ) : (
                      <span className="mobile-descriptive-note"><small>Oceny</small>Brak ocen — błąd kompletności</span>
                    )}
                  </div>
                  <div className="mobile-actions">
                    <a className="details-link" href={`#details-${jacket.rank}`}>Pełne dane</a>
                    <button className={`compare-btn ${compareIds.includes(jacket.id) ? 'selected' : ''}`} onClick={() => toggleCompare(jacket.id)}><Scale size={14} /> Porównaj</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="ranking-section" id="full-data" data-testid="full-data-section">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">DATA PACK 20/20</span>
              <h2>Pełne opisy, oceny i status dowodów</h2>
              <p className="sub">Każdy model ma ten sam układ: technikalia, oceny użytkowe, średnią cenę/widełki z datą sprawdzenia, mocne i słabe strony oraz źródła.</p>
            </div>
          </div>
          <div className="details-grid">
            {jackets.map(jacket => (
              <details className="product-details" id={`details-${jacket.rank}`} key={jacket.id} data-testid={`details-${jacket.rank}`}>
                <summary>
                  <span className="detail-rank">#{jacket.rank}</span>
                  <span className="detail-summary-main">
                    <span><b>{jacket.brand}</b> {jacket.model}</span>
                    <small data-testid={`detail-summary-specs-${jacket.rank}`}>
                      {jacket.weight.text} · {jacket.insulation.text} · {jacket.insulationWeight.text} · {jacket.marketPrice}
                    </small>
                  </span>
                  <StatusBadge status={jacket.dataStatus} />
                </summary>
                <div className="detail-body">
                  <div className="detail-photo"><ProductPhoto jacket={jacket} /></div>
                  <div className="detail-content">
                    <p>{jacket.description}</p>
                    <dl className="fact-list">
                      <div><dt>Masa</dt><dd>{jacket.weight.text} <StatusBadge status={jacket.weight.status} /></dd></div>
                      <div><dt>Izolacja</dt><dd>{jacket.insulation.text} <StatusBadge status={jacket.insulation.status} /></dd></div>
                      <div><dt>Gramatura / status</dt><dd>{jacket.insulationWeight.text} <StatusBadge status={jacket.insulationWeight.status} /></dd></div>
                      <div><dt>Konstrukcja</dt><dd>{jacket.construction}</dd></div>
                      <div><dt>Body mapping</dt><dd>{jacket.bodyMapping}</dd></div>
                      <div><dt>Profil użycia</dt><dd>{jacket.useProfile}</dd></div>
                      <div data-testid={`detail-market-price-${jacket.rank}`}><dt>Średnia cena / widełki</dt><dd><b>{jacket.marketPrice}</b><br /><small>Snapshot rynku: {jacket.marketPriceCheckedAt}. {jacket.priceReference}</small></dd></div>
                    </dl>
                    <div className="detail-ratings" data-testid={`detail-ratings-${jacket.rank}`}>
                      <h4>Oceny użytkowe 1–5</h4>
                      <p>Redakcyjna synteza audytu dla tego profilu użytkowania; nie są to pomiary laboratoryjne producenta.</p>
                      <RatingSummary jacket={jacket} />
                    </div>
                    <div className="pros-cons">
                      <div><h4>Mocne strony</h4><ul>{jacket.strengths.map(item => <li key={item}>{item}</li>)}</ul></div>
                      <div><h4>Ograniczenia</h4><ul>{jacket.weaknesses.map(item => <li key={item}>{item}</li>)}</ul></div>
                    </div>
                    <SourceLinks jacket={jacket} />
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="system-section" id="system">
          <div className="system-card">
            <span className="eyebrow"><Layers3 size={14} /> SYSTEM WARSTWOWY</span>
            <h2>Gdy jedna kurtka nie ma robić wszystkiego</h2>
            <div className="layer-flow">
              <div><small>1</small><b>Baza</b><span>Warstwa transportująca wilgoć</span></div>
              <i>→</i>
              <div><small>2</small><b>Mammut Aenergy ML Hybrid</b><span>Termoregulujący midlayer Alpha Direct</span></div>
              <i>→</i>
              <div><small>3</small><b>Montbell Tachyon</b><span>Lekki wiatr</span></div>
              <i>→</i>
              <div><small>4</small><b>Hardshell</b><span>Tylko przy realnym opadzie</span></div>
            </div>
            <div className="system-note"><ShieldCheck size={17} /><span>To wariant z audytu dla użytkownika, który akceptuje system warstw zamiast jednej bardziej uniwersalnej kurtki.</span></div>
          </div>
        </section>
      </main>

      <footer>
        <b>Trek Jacket Finder</b>
        <p>Dane techniczne: DATA PACK 15.09.2026. Ranking bazowy: audyt 14.09.2026. Oceny użytkowe 1–5 są redakcyjną syntezą audytu. Ceny są snapshotem rynku z 16.09.2026 i mogą się zmieniać wraz z promocjami, kolorem i rozmiarem.</p>
      </footer>

      {compareIds.length > 0 && !compareOpen && (
        <button className="sticky-compare" onClick={() => compareIds.length >= 2 && setCompareOpen(true)}>
          <Scale size={16} /> Porównanie: {compareIds.length}/4 {compareIds.length < 2 ? '· wybierz jeszcze model' : '· otwórz'}
        </button>
      )}

      {compareOpen && compareJackets.length >= 2 && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Porównanie kurtek">
          <div className="compare-modal">
            <button className="modal-close" onClick={() => setCompareOpen(false)} aria-label="Zamknij porównanie"><X size={18} /></button>
            <div className="compare-header"><div><span className="eyebrow">PORÓWNANIE 2–4 MODELI</span><h2>Porównaj fakty, ceny i oceny użytkowe</h2></div></div>
            <div className="compare-scroll">
              <div className="compare-grid" style={{ gridTemplateColumns: `repeat(${compareJackets.length}, minmax(230px, 1fr))` }}>
                {compareJackets.map(jacket => (
                  <article className="compare-col" key={jacket.id}>
                    <button className="remove-compare" onClick={() => toggleCompare(jacket.id)} aria-label={`Usuń ${jacket.model} z porównania`}><X size={14} /></button>
                    <ProductPhoto jacket={jacket} compact />
                    <p className="brand">{jacket.brand}</p><h3>{jacket.model}</h3>
                    <StatusBadge status={jacket.dataStatus} />
                    <p className="compare-description" data-testid="compare-description">{jacket.description}</p>
                    <dl>
                      <div><dt>Masa</dt><dd>{jacket.weight.text}</dd></div>
                      <div><dt>Izolacja</dt><dd>{jacket.insulation.text}</dd></div>
                      <div><dt>Gramatura / status</dt><dd>{jacket.insulationWeight.text}</dd></div>
                      <div><dt>Konstrukcja</dt><dd>{jacket.construction}</dd></div>
                      <div><dt>Body mapping</dt><dd>{jacket.bodyMapping}</dd></div>
                      <div><dt>Profil</dt><dd>{jacket.useProfile}</dd></div>
                      <div data-testid="compare-price"><dt>Średnia cena / widełki</dt><dd><b>{jacket.marketPrice}</b><br /><small>sprawdzono {jacket.marketPriceCheckedAt}</small></dd></div>
                    </dl>
                    <div className="metric-list">
                      {jacket.breathability == null ? (
                        <p className="no-rating-note">
                          <b>Brak ocen użytkowych.</b> Ten stan oznacza błąd kompletności danych Stage 7.
                        </p>
                      ) : (
                        RATING_LABELS.map(([key, label]) => {
                          const value = jacket[key]
                          return (
                            <div className="metric-row" key={key}>
                              <span>{label}</span>
                              <div className="metric-track">{value != null && <i style={{ width: `${value * 20}%` }} />}</div>
                              <b>{value}</b>
                            </div>
                          )
                        })
                      )}
                    </div>
                    <div className="pros-cons compact-pros-cons">
                      <div><h4>Mocne strony</h4><ul>{jacket.strengths.map(item => <li key={item}>{item}</li>)}</ul></div>
                      <div><h4>Ograniczenia</h4><ul>{jacket.weaknesses.map(item => <li key={item}>{item}</li>)}</ul></div>
                    </div>
                    <SourceLinks jacket={jacket} />
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`Zdjęcie ${lightbox.model}`}>
          <div className="lightbox">
            <button className="modal-close" onClick={() => setLightbox(null)} aria-label="Zamknij zdjęcie"><X size={18} /></button>
            <div className="lightbox-photo"><ProductPhoto jacket={lightbox} /></div>
            <p className="brand">{lightbox.brand}</p><h2>{lightbox.model}</h2>
            <SourceLinks jacket={lightbox} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App