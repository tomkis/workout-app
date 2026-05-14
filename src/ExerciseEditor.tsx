import { useState } from 'react'
import { MUSCLE_GROUPS, type Exercise } from './db'

interface Props {
  exercises: Exercise[]
  onChange: (exercises: Exercise[]) => void
}

function generateId() {
  return Math.random().toString(36).slice(2)
}

const DEFAULT_INCREMENT_KG = 2.5

function emptyExercise(): Exercise {
  return {
    id: generateId(),
    name: '',
    muscleGroup: 'Chest',
    targetSets: 3,
  }
}

export function ExerciseEditor({ exercises, onChange }: Props) {
  const [adding, setAdding] = useState<Exercise | null>(null)

  function startAdd() {
    setAdding(emptyExercise())
  }

  function commitAdd() {
    if (!adding || !adding.name.trim()) return
    onChange([...exercises, { ...adding, name: adding.name.trim() }])
    setAdding(null)
  }

  function cancelAdd() {
    setAdding(null)
  }

  function removeExercise(id: string) {
    onChange(exercises.filter(e => e.id !== id))
  }

  function moveUp(index: number) {
    if (index === 0) return
    const next = [...exercises]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    onChange(next)
  }

  function moveDown(index: number) {
    if (index === exercises.length - 1) return
    const next = [...exercises]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    onChange(next)
  }

  return (
    <div className="exercise-editor">
      {exercises.length > 0 && (
        <ul className="exercise-list">
          {exercises.map((ex, i) => (
            <li key={ex.id} className="exercise-item">
              <div className="exercise-item-move">
                <button className="btn-icon" onClick={() => moveUp(i)} disabled={i === 0} aria-label="Move up">▲</button>
                <button className="btn-icon" onClick={() => moveDown(i)} disabled={i === exercises.length - 1} aria-label="Move down">▼</button>
              </div>
              <div className="exercise-item-info">
                <span className="exercise-name">{ex.name}</span>
                <span className="exercise-meta">
                  {ex.muscleGroup} · {ex.targetSets} sets
                  {ex.incrementKg !== undefined && ` · +${ex.incrementKg}kg`}
                </span>
              </div>
              <button className="btn-icon danger" onClick={() => removeExercise(ex.id)} aria-label="Remove">✕</button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <div className="exercise-form">
          <input
            className="text-input"
            placeholder="Exercise name (e.g. Bench Press)"
            value={adding.name}
            onChange={e => setAdding({ ...adding, name: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') commitAdd() }}
            autoFocus
          />
          <div className="exercise-form-row">
            <div className="exercise-form-field">
              <label className="field-label">Muscle group</label>
              <select
                className="select-input"
                value={MUSCLE_GROUPS.includes(adding.muscleGroup as typeof MUSCLE_GROUPS[number]) ? adding.muscleGroup : '__custom__'}
                onChange={e => setAdding({ ...adding, muscleGroup: e.target.value === '__custom__' ? '' : e.target.value })}
              >
                {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                <option value="__custom__">Custom…</option>
              </select>
              {!MUSCLE_GROUPS.includes(adding.muscleGroup as typeof MUSCLE_GROUPS[number]) && (
                <input
                  className="text-input"
                  style={{ marginTop: '0.375rem' }}
                  placeholder="Custom muscle group"
                  value={adding.muscleGroup}
                  onChange={e => setAdding({ ...adding, muscleGroup: e.target.value })}
                  autoFocus
                />
              )}
            </div>
            <div className="exercise-form-field">
              <label className="field-label">Target sets</label>
              <input
                className="text-input"
                type="number"
                min={1}
                max={20}
                value={adding.targetSets}
                onChange={e => setAdding({ ...adding, targetSets: Math.max(1, parseInt(e.target.value) || 1) })}
              />
            </div>
          </div>
          <div className="exercise-form-field">
            <label className="field-label">Increment override (kg, optional)</label>
            <input
              className="text-input"
              type="number"
              min={0}
              step={0.5}
              placeholder={`Default: ${DEFAULT_INCREMENT_KG} kg`}
              value={adding.incrementKg ?? ''}
              onChange={e => {
                const val = e.target.value
                setAdding({ ...adding, incrementKg: val === '' ? undefined : parseFloat(val) })
              }}
            />
          </div>
          <div className="exercise-form-actions">
            <button className="btn-ghost" onClick={cancelAdd}>Cancel</button>
            <button className="btn-primary" onClick={commitAdd} disabled={!adding.name.trim()} style={{ flex: 1 }}>
              Add exercise
            </button>
          </div>
        </div>
      ) : (
        <button className="btn-secondary" onClick={startAdd}>+ Add exercise</button>
      )}
    </div>
  )
}
