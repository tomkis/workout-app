import { useState, useEffect } from 'react'
import { SettingsScreen } from './SettingsScreen'
import { HomeScreen } from './HomeScreen'
import { ProgramWizard } from './ProgramWizard'
import { useUnitPref } from './useUnitPref'
import { getActiveProgram, saveProgram, type Program, type Workout } from './db'
import './App.css'

type Tab = 'home' | 'programs' | 'history' | 'settings'

function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [unit, setUnit] = useUnitPref()
  const [program, setProgram] = useState<Program | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [confirmReplace, setConfirmReplace] = useState(false)

  useEffect(() => {
    getActiveProgram().then(setProgram)
  }, [])

  async function handleSaveProgram(name: string, workouts: Workout[]) {
    const saved: Program = { name, workouts, createdAt: Date.now() }
    await saveProgram(saved)
    const loaded = await getActiveProgram()
    setProgram(loaded)
    setShowWizard(false)
    setConfirmReplace(false)
    setTab('home')
  }

  function handleReplaceRequest() {
    setConfirmReplace(true)
  }

  if (showWizard) {
    return (
      <div className="app-shell">
        <ProgramWizard
          onSave={handleSaveProgram}
          onCancel={() => { setShowWizard(false); setConfirmReplace(false) }}
        />
      </div>
    )
  }

  if (confirmReplace) {
    return (
      <div className="app-shell">
        <div className="app-content confirm-dialog">
          <h2>Replace program?</h2>
          <p className="muted">This will replace your current program <strong>{program?.name}</strong>. Your workout history will be kept.</p>
          <div className="confirm-actions">
            <button className="btn-ghost" onClick={() => setConfirmReplace(false)}>Cancel</button>
            <button className="btn-danger" onClick={() => setShowWizard(true)}>Replace</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Workout</h1>
      </header>

      <main className="app-content">
        {tab === 'home' && (
          <HomeScreen
            program={program}
            onCreateProgram={() => setShowWizard(true)}
            onReplaceProgram={handleReplaceRequest}
          />
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
