import { useState } from 'react'
import { SettingsScreen } from './SettingsScreen'
import { useUnitPref } from './useUnitPref'
import './App.css'

type Tab = 'home' | 'programs' | 'history' | 'settings'

function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [unit, setUnit] = useUnitPref()

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Workout</h1>
      </header>

      <main className="app-content">
        {tab === 'home' && (
          <div className="placeholder">
            <p>Welcome to Workout App</p>
            <p className="muted">Start a workout to begin tracking.</p>
          </div>
        )}
        {tab === 'programs' && (
          <div className="placeholder">
            <p>Programs</p>
            <p className="muted">Create and manage your workout programs.</p>
          </div>
        )}
        {tab === 'history' && (
          <div className="placeholder">
            <p>History</p>
            <p className="muted">Your completed workouts will appear here.</p>
          </div>
        )}
        {tab === 'settings' && (
          <SettingsScreen unit={unit} onUnitChange={setUnit} />
        )}
      </main>

      <nav className="app-nav">
        <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}>Home</button>
        <button className={tab === 'programs' ? 'active' : ''} onClick={() => setTab('programs')}>Programs</button>
        <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>History</button>
        <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>Settings</button>
      </nav>
    </div>
  )
}

export default App
