import { useMemo, useState } from 'react'
import { Check, Mountain, ShieldCheck } from 'lucide-react'
import { defaultScenario, jackets, Scenario, shortlistForScenario } from './data'

const fmt = (value?: number) => value == null ? 'brak oceny liczbowej' : `${value}/5`

function App() {
  const [scenario, setScenario] = useState<Scenario>(defaultScenario)
  const [query, setQuery] = useState('')
  const { top3, signals } = useMemo(
    () => shortlistForScenario(scenario, false, new Set<string>()),
    [scenario],
  )

  const set = <K extends keyof Scenario>(key: K, value: Scenario[K]) => {
    setScenario(current => ({ ...current, [key]: value }))
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('pl')
    if (!needle) return jackets
    return jackets.filter(j => `${j.brand} ${j.model}`.toLocaleLowerCase('pl').includes(needle))
  }, [query])

  return (
    <div className="app-shell">
      <header className="hero">
        <nav className="nav">
          <a className="logo" href="#top"><Mountain size={22}/><span>Trek Jacket Finder</span></a>
          <span className="stage-badge">Stage 1 recovery scaffold</span>
        </nav>
        <div className="hero-inner" id="top">
          <div className="hero-copy">
            <span className="hero-kicker"><ShieldCheck size={15}/> SOURCE RECOVERY</span>
            <h1>Normalne źródło kodu.<br/><em>Produkcja bez zmian.</em></h1>
            <p>Ten branch służy wyłącznie do odzyskania kontrolowanego źródła React/TypeScript/Vite. Dane produktowe są tymczasowym rusztowaniem i zostaną zastąpione autorytatywnym DATA PACK w Etapie 2.</p>
          </div>
          <div className="hero-stats">
            <div><strong>20</strong><span>pozycji rankingu</span></div>
            <div><strong>0</strong><span>zmian produkcji</span></div>
          </div>
        </div>
      </header>

      <main>
        <section className="scenario-panel" id="selector">
          <div className="section-title-row">
            <div><span className="eyebrow">SCENARIUSZ</span><h2>Odzyskana logika wyboru</h2></div>
            <button className="reset-btn" onClick={() => setScenario(defaultScenario)}>Ustawienia domyślne</button>
          </div>
          <div className="scenario-grid">
            <label>Dystans<select value={scenario.distance} onChange={e => set('distance', e.target.value as Scenario['distance'])}><option>10–20 km</option><option>20–40 km</option><option>40–50 km</option></select></label>
            <label>Temperatura<select value={scenario.temperature} onChange={e => set('temperature', e.target.value as Scenario['temperature'])}><option>chłód</option><option>około 0°C</option><option>lekki mróz</option></select></label>
            <label>Tempo<select value={scenario.pace} onChange={e => set('pace', e.target.value as Scenario['pace'])}><option>spokojne</option><option>umiarkowane</option><option>bardzo szybkie</option></select></label>
            <label>Konfiguracja<select value={scenario.mode} onChange={e => set('mode', e.target.value as Scenario['mode'])}><option>jedna kurtka</option><option>system warstwowy</option></select></label>
          </div>
          <div className="toggle-grid">
            {(['wind','forest','backpack','value'] as const).map(key => (
              <button key={key} className={`toggle-chip ${scenario[key] ? 'on' : ''}`} onClick={() => set(key, !scenario[key])}>
                {scenario[key] && <Check size={14}/>} {key === 'wind' ? 'Silny wiatr' : key === 'forest' ? 'Las / zarośla' : key === 'backpack' ? 'Ciężki plecak' : 'Cena / jakość'}
              </button>
            ))}
          </div>
        </section>

        <section className="results-section">
          <div className="section-title-row"><div><span className="eyebrow">SHORTLISTA</span><h2>TOP 3 dla scenariusza</h2></div></div>
          <div className="signal-line">{signals.map(signal => <span key={signal}><Check size={12}/>{signal}</span>)}</div>
          <div className="top-grid">
            {top3.map((j, index) => (
              <article className="top-card" key={j.id}>
                <div className="top-content">
                  <span className="rank-pill">#{index + 1} dla scenariusza</span>
                  <p className="brand">{j.brand}</p><h3>{j.model}</h3>
                  <p>{j.verdict}</p>
                  <small>Uwaga: parametry produktowe w Stage 1 nie są źródłem prawdy.</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="ranking-section" id="ranking">
          <div className="section-title-row"><div><span className="eyebrow">RANKING BAZOWY</span><h2>Globalny TOP 20</h2></div></div>
          <div className="toolbar"><label className="searchbox"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Szukaj marki lub modelu"/></label></div>
          <div className="ranking-table-wrap">
            <table className="ranking-table">
              <thead><tr><th>#</th><th>Model</th><th>Oddych.</th><th>Wiatr</th><th>Plecak</th><th>50 km</th></tr></thead>
              <tbody>{filtered.map(j => <tr key={j.id}><td><b>{j.rank}</b></td><td><strong>{j.brand}</strong><span>{j.model}</span></td><td>{fmt(j.breathability)}</td><td>{fmt(j.wind)}</td><td>{fmt(j.backpack)}</td><td>{fmt(j.km50)}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      </main>
      <footer><b>Trek Jacket Finder — Stage 1</b><p>Recovery scaffold. Nie wdrażać na produkcję przed zakończeniem kolejnych etapów QA.</p></footer>
    </div>
  )
}

export default App
