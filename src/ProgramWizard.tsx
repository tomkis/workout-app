import { useState } from 'react'
import type { Workout } from './db'

interface Props {
  onSave: (name: string, workouts: Workout[]) => void
  onCancel: () => void
}

function generateId() {
  return Math.random().toString(36).slice(2)
}

export function ProgramWizard({ onSave, onCancel }: Props) {
  const [step, setStep] = useState<'name' | 'workouts'>('name')
  const [programName, setProgramName] = useState('')
  const [workouts, setWorkouts] = useState<Workout[]>([
    { id: generateId(), name: 'Workout A' },
  ])
  const [editingId, setEditingId] = useState<string | null>(null)

  function addWorkout() {
    setWorkouts(prev => [
      ...prev,
      { id: generateId(), name: `Workout ${String.fromCharCode(65 + prev.length)}` },
    ])
  }

  function removeWorkout(id: string) {
    setWorkouts(prev => prev.filter(w => w.id !== id))
  }

  function renameWorkout(id: string, name: string) {
    setWorkouts(prev => prev.map(w => (w.id === id ? { ...w, name } : w)))
  }

  function moveUp(index: number) {
    if (index === 0) return
    setWorkouts(prev => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  function moveDown(index: number) {
    setWorkouts(prev => {
      if (index === prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  function handleSave() {
    if (programName.trim() && workouts.length > 0) {
      onSave(programName.trim(), workouts)
    }
  }

  return (
    <div className="wizard">
      <div className="wizard-header">
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <h2>{step === 'name' ? 'New Program' : 'Add Workouts'}</h2>
        <div className="wizard-step">{step === 'name' ? '1/2' : '2/2'}</div>
      </div>

      {step === 'name' && (
        <div className="wizard-body">
          <label className="field-label" htmlFor="program-name">Program name</label>
          <input
            id="program-name"
            className="text-input"
            type="text"
            placeholder="e.g. Push Pull Legs"
            value={programName}
            onChange={e => setProgramName(e.target.value)}
            autoFocus
          />
          <button
            className="btn-primary"
            onClick={() => setStep('workouts')}
            disabled={!programName.trim()}
          >
            Next
          </button>
        </div>
      )}

      {step === 'workouts' && (
        <div className="wizard-body">
          <p className="wizard-hint">Add and name each workout day in order.</p>

          <ul className="workout-list">
            {workouts.map((w, i) => (
              <li key={w.id} className="workout-item">
                <div className="workout-item-move">
                  <button
                    className="btn-icon"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    aria-label="Move up"
                  >▲</button>
                  <button
                    className="btn-icon"
                    onClick={() => moveDown(i)}
                    disabled={i === workouts.length - 1}
                    aria-label="Move down"
                  >▼</button>
                </div>

                {editingId === w.id ? (
                  <input
                    className="text-input inline"
                    value={w.name}
                    onChange={e => renameWorkout(w.id, e.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={e => { if (e.key === 'Enter') setEditingId(null) }}
                    autoFocus
                  />
                ) : (
                  <span
                    className="workout-name"
                    onClick={() => setEditingId(w.id)}
                  >
                    {w.name}
                  </span>
                )}

                <button
                  className="btn-icon danger"
                  onClick={() => removeWorkout(w.id)}
                  disabled={workouts.length === 1}
                  aria-label="Remove workout"
                >✕</button>
              </li>
            ))}
          </ul>

          <button className="btn-secondary" onClick={addWorkout}>
            + Add workout
          </button>

          <div className="wizard-actions">
            <button className="btn-ghost" onClick={() => setStep('name')}>Back</button>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={workouts.length === 0}
            >
              Save program
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
