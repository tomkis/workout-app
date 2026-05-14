import { useState } from 'react'
import {
  addSet,
  removeSet,
  updateSet,
  completeSession,
  type ActiveSession,
} from './sessionEngine'
import { saveSession } from './db'

interface Props {
  session: ActiveSession
  onComplete: () => void
  onCancel: () => void
}

export function WorkoutSessionScreen({ session: initial, onComplete, onCancel }: Props) {
  const [session, setSession] = useState(initial)
  const [completing, setCompleting] = useState(false)

  async function handleComplete() {
    const completed = completeSession(session)
    await saveSession(completed)
    onComplete()
  }

  return (
    <div className="app-shell">
      <header className="app-header session-header">
        <button className="btn-ghost" onClick={onCancel}>✕</button>
        <h1>{session.workoutName}</h1>
        <button className="btn-accent-small" onClick={() => setCompleting(true)}>Done</button>
      </header>

      <main className="app-content session-content">
        {session.exercises.length === 0 && (
          <div className="placeholder">
            <p className="muted">No exercises in this workout.</p>
          </div>
        )}

        {session.exercises.map((ex, ei) => (
          <div key={ex.exerciseId} className="session-exercise">
            <div className="session-exercise-header">
              <span className="session-exercise-name">{ex.exerciseName}</span>
              <span className="session-exercise-target muted">{ex.targetSets} sets</span>
            </div>

            <div className="session-sets-header">
              <span className="set-col-num">Set</span>
              <span className="set-col-weight">Weight ({session.unit})</span>
              <span className="set-col-reps">Reps</span>
              <span className="set-col-remove" />
            </div>

            {ex.sets.map((s, si) => (
              <div key={si} className="session-set-row">
                <span className="set-col-num set-num">{si + 1}</span>
                <input
                  className="set-col-weight text-input set-input"
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="0"
                  value={s.weight}
                  onChange={e => setSession(updateSet(session, ei, si, 'weight', e.target.value))}
                  inputMode="decimal"
                />
                <input
                  className="set-col-reps text-input set-input"
                  type="number"
                  min={1}
                  placeholder="0"
                  value={s.reps}
                  onChange={e => setSession(updateSet(session, ei, si, 'reps', e.target.value))}
                  inputMode="numeric"
                />
                <button
                  className="set-col-remove btn-icon danger"
                  onClick={() => setSession(removeSet(session, ei, si))}
                  aria-label="Remove set"
                  disabled={ex.sets.length === 1}
                >✕</button>
              </div>
            ))}

            <button
              className="btn-secondary session-add-set"
              onClick={() => setSession(addSet(session, ei))}
            >
              + Add set
            </button>
          </div>
        ))}
      </main>

      {completing && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Complete workout?</h2>
            <p className="muted">This will save the session to your history.</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setCompleting(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleComplete}>Save &amp; finish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
