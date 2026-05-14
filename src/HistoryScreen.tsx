import { useState } from 'react'
import type { WorkoutSession } from './db'
import type { Unit } from './units'
import { formatWeight } from './units'
import { ExerciseHistoryScreen } from './ExerciseHistoryScreen'

interface Props {
  sessions: WorkoutSession[]
  unit: Unit
}

type View =
  | { type: 'list' }
  | { type: 'session-detail'; session: WorkoutSession }
  | { type: 'exercise-history'; exerciseId: string; exerciseName: string }

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
  const [view, setView] = useState<View>({ type: 'list' })

  if (view.type === 'exercise-history') {
    return (
      <ExerciseHistoryScreen
        sessions={sessions}
        exerciseId={view.exerciseId}
        exerciseName={view.exerciseName}
        unit={unit}
        onBack={() => setView({ type: 'list' })}
      />
    )
  }

  if (view.type === 'session-detail') {
    const session = view.session
    return (
      <div className="history-detail">
        <button className="btn-back" onClick={() => setView({ type: 'list' })}>
          ← Back
        </button>
        <h2 className="history-detail-title">{session.workoutName}</h2>
        <p className="muted history-detail-meta">
          {formatDate(session.startedAt)} · {formatDuration(session.startedAt, session.completedAt)}
        </p>

        {session.exercises.map(ex => (
          <div key={ex.exerciseId} className="history-exercise">
            <button
              className="history-exercise-name-btn"
              onClick={() => setView({ type: 'exercise-history', exerciseId: ex.exerciseId, exerciseName: ex.exerciseName })}
            >
              {ex.exerciseName} <span className="history-exercise-chevron">›</span>
            </button>
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
          <li key={s.id ?? i} className="history-entry" onClick={() => setView({ type: 'session-detail', session: s })}>
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
