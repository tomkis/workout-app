import { useState, useEffect } from 'react'
import { SettingsScreen } from './SettingsScreen'
import { HomeScreen } from './HomeScreen'
import { HistoryScreen } from './HistoryScreen'
import { ProgramWizard } from './ProgramWizard'
import { WorkoutSessionScreen } from './WorkoutSessionScreen'
import { useUnitPref } from './useUnitPref'
import {
  getActiveProgram,
  saveProgram,
  getAllSessions,
  getLastSessionForWorkout,
  type Program,
  type Workout,
  type WorkoutSession,
} from './db'
import { initSession, type ActiveSession, type ActiveSet } from './sessionEngine'
import { getNextWorkoutIndex, getPrefillSets } from './progressionEngine'
import './App.css'

type Tab = 'home' | 'programs' | 'history' | 'settings'

function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [unit, setUnit] = useUnitPref()
  const [program, setProgram] = useState<Program | null>(null)
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [showWizard, setShowWizard] = useState(false)
  const [confirmReplace, setConfirmReplace] = useState(false)
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [suggestedWorkoutIndex, setSuggestedWorkoutIndex] = useState<number | null>(null)

  async function loadData() {
    const [loaded, allSessions] = await Promise.all([getActiveProgram(), getAllSessions()])
    setProgram(loaded)
    setSessions(allSessions)
    if (loaded) {
      const idx = getNextWorkoutIndex(loaded.workouts, allSessions, loaded.id ?? null)
      setSuggestedWorkoutIndex(idx)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSaveProgram(name: string, workouts: Workout[]) {
    const saved: Program = { name, workouts, createdAt: Date.now() }
    await saveProgram(saved)
    await loadData()
    setShowWizard(false)
    setConfirmReplace(false)
    setTab('home')
  }

  async function handleStartWorkout(workout: Workout) {
    const programId = program?.id ?? null
    const lastSession = await getLastSessionForWorkout(workout.id)
    let prefillMap: Map<string, ActiveSet[]> | undefined

    if (lastSession) {
      prefillMap = new Map(
        workout.exercises.map(ex => {
          const lastEx = lastSession.exercises.find(e => e.exerciseId === ex.id)
          return [ex.id, getPrefillSets(ex, lastEx?.sets ?? null, unit)]
        }),
      )
    }

    setActiveSession(initSession(workout, programId, unit, prefillMap))
  }

  async function handleSessionComplete() {
    setActiveSession(null)
    await loadData()
  }

  if (activeSession) {
    return (
      <WorkoutSessionScreen
        session={activeSession}
        onComplete={handleSessionComplete}
        onCancel={() => setActiveSession(null)}
      />
    )
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
            suggestedWorkoutIndex={suggestedWorkoutIndex}
            onCreateProgram={() => setShowWizard(true)}
            onReplaceProgram={() => setConfirmReplace(true)}
            onStartWorkout={handleStartWorkout}
          />
        )}
        {tab === 'programs' && (
          <div className="placeholder">
            <p>Programs</p>
            <p className="muted">Create and manage your workout programs.</p>
          </div>
        )}
        {tab === 'history' && (
          <HistoryScreen sessions={sessions} unit={unit} />
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
