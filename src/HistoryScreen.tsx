import { useState } from 'react'
import type { WorkoutSession } from './db'
import type { Unit } from './units'
import { formatWeight } from './units'

interface Props {
  sessions: WorkoutSession[]
  unit: Unit
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDuration(startedAt: number, completedAt: number): string {
  const mins = Math.round((completedAt - startedAt) / 60000)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function HistoryScreen({ sessions, unit }: Props) {
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null)

  if (selectedSession) {
    return (
      <div className="history-detail">
        <button className="btn-back" onClick={() => setSelectedSession(null)}>
          ← Back
        </button>
        <h2 className="history-detail-title">{selectedSession.workoutName}</h2>
        <p className="muted history-detail-meta">
          {formatDate(selectedSession.startedAt)} · {formatDuration(selectedSession.startedAt, selectedSession.completedAt)}
        </p>

        {selectedSession.exercises.map(ex => (
          <div key={ex.exerciseId} className="history-exercise">
            <h3 className="history-exercise-name">{ex.exerciseName}</h3>
            {ex.sets.length > 0 ? (
              <table className="history-sets-table">
                <thead>
                  <tr>
                    <th>Set</th>
                    <th>Weight</th>
                    <th>Reps</th>
                  </tr>
                </thead>
                <tbody>
                  {ex.sets.map((s, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{formatWeight(s.weight, unit)}</td>
                      <td>{s.reps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted" style={{ fontSize: '0.8125rem' }}>No sets logged</p>
            )}
          </div>
        ))}
      </div>
    )
  }

  const sorted = [...sessions].sort((a, b) => b.completedAt - a.completedAt)

  if (sorted.length === 0) {
    return (
      <div className="placeholder">
        <p>No workouts yet</p>
        <p className="muted">Completed workouts will appear here.</p>
      </div>
    )
  }

  return (
    <div className="history-list">
      <ul className="history-entries">
        {sorted.map((s, i) => (
          <li key={s.id ?? i} className="history-entry" onClick={() => setSelectedSession(s)}>
            <div className="history-entry-info">
              <span className="history-workout-name">{s.workoutName}</span>
              <span className="history-workout-meta muted">
                {formatDate(s.completedAt)} · {formatDuration(s.startedAt, s.completedAt)}
              </span>
            </div>
            <span className="history-entry-chevron">›</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
