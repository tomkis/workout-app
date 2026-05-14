import { useState } from 'react'
import { ExerciseEditor } from './ExerciseEditor'
import type { Workout, Exercise } from './db'

interface Props {
  onSave: (name: string, workouts: Workout[]) => void
  onCancel: () => void
}

type Step = 'name' | 'workouts' | 'exercises'

function generateId() {
  return Math.random().toString(36).slice(2)
}

function newWorkout(index: number): Workout {
  return { id: generateId(), name: `Workout ${String.fromCharCode(65 + index)}`, exercises: [] }
}

export function ProgramWizard({ onSave, onCancel }: Props) {
  const [step, setStep] = useState<Step>('name')
  const [programName, setProgramName] = useState('')
  const [workouts, setWorkouts] = useState<Workout[]>([newWorkout(0)])
  const [editingId, setEditingId] = useState<string | null>(null)
  // exercises step: which workout is expanded
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null)

  function addWorkout() {
    setWorkouts(prev => [...prev, newWorkout(prev.length)])
  }

  function removeWorkout(id: string) {
    setWorkouts(prev => prev.filter(w => w.id !== id))
  }

  function renameWorkout(id: string, name: string) {
    setWorkouts(prev => prev.map(w => (w.id === id ? { ...w, name } : w)))
  }

  function moveWorkoutUp(index: number) {
    if (index === 0) return
    setWorkouts(prev => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  function moveWorkoutDown(index: number) {
    setWorkouts(prev => {
      if (index === prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  function setExercises(workoutId: string, exercises: Exercise[]) {
    setWorkouts(prev => prev.map(w => (w.id === workoutId ? { ...w, exercises } : w)))
  }

  function handleSave() {
    if (programName.trim() && workouts.length > 0) {
      onSave(programName.trim(), workouts)
    }
  }

  const stepLabel: Record<Step, string> = { name: '1/3', workouts: '2/3', exercises: '3/3' }
  const stepTitle: Record<Step, string> = { name: 'New Program', workouts: 'Add Workouts', exercises: 'Add Exercises' }

  return (
    <div className="wizard">
      <div className="wizard-header">
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <h2>{stepTitle[step]}</h2>
        <div className="wizard-step">{stepLabel[step]}</div>
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
            onKeyDown={e => { if (e.key === 'Enter' && programName.trim()) setStep('workouts') }}
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
                  <button className="btn-icon" onClick={() => moveWorkoutUp(i)} disabled={i === 0} aria-label="Move up">▲</button>
                  <button className="btn-icon" onClick={() => moveWorkoutDown(i)} disabled={i === workouts.length - 1} aria-label="Move down">▼</button>
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
                  <span className="workout-name" onClick={() => setEditingId(w.id)}>{w.name}</span>
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

          <button className="btn-secondary" onClick={addWorkout}>+ Add workout</button>

          <div className="wizard-actions">
            <button className="btn-ghost" onClick={() => setStep('name')}>Back</button>
            <button
              className="btn-primary"
              onClick={() => { setExpandedWorkoutId(workouts[0]?.id ?? null); setStep('exercises') }}
              disabled={workouts.length === 0}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 'exercises' && (
        <div className="wizard-body">
          <p className="wizard-hint">Add exercises to each workout. You can skip and add them later.</p>

          {workouts.map(w => (
            <div key={w.id} className="workout-exercises-section">
              <button
                className="workout-exercises-toggle"
                onClick={() => setExpandedWorkoutId(expandedWorkoutId === w.id ? null : w.id)}
              >
                <span className="workout-exercises-title">{w.name}</span>
                <span className="workout-exercises-count">
                  {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}
                </span>
                <span className="workout-exercises-chevron">{expandedWorkoutId === w.id ? '▲' : '▼'}</span>
              </button>
              {expandedWorkoutId === w.id && (
                <div className="workout-exercises-body">
                  <ExerciseEditor
                    exercises={w.exercises}
                    onChange={exs => setExercises(w.id, exs)}
                  />
                </div>
              )}
            </div>
          ))}

          <div className="wizard-actions">
            <button className="btn-ghost" onClick={() => setStep('workouts')}>Back</button>
            <button className="btn-primary" onClick={handleSave}>Save program</button>
          </div>
        </div>
      )}
    </div>
  )
}
