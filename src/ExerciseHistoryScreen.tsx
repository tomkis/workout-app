import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from 'recharts'
import type { WorkoutSession } from './db'
import type { Unit } from './units'
import { formatWeight } from './units'
import { getExerciseSessions, getTopWeightPerSession } from './exerciseStats'

interface Props {
  sessions: WorkoutSession[]
  exerciseId: string
  exerciseName: string
  unit: Unit
  onBack: () => void
}

function formatShortDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatFullDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function ExerciseHistoryScreen({
  sessions,
  exerciseId,
  exerciseName,
  unit,
  onBack,
}: Props) {
  const chartData = getTopWeightPerSession(sessions, exerciseId, unit)
  const exerciseSessions = getExerciseSessions(sessions, exerciseId).reverse()

  return (
    <div className="exercise-history">
      <button className="btn-back" onClick={onBack}>
        ← Back
      </button>
      <h2 className="exercise-history-title">{exerciseName}</h2>

      {chartData.length === 0 ? (
        <p className="muted" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          No data to chart yet
        </p>
      ) : (
        <div className="exercise-chart-container">
          <p className="exercise-chart-label muted">Top weight per session ({unit})</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface-raised)',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={(label) => formatShortDate(label as number)}
                formatter={(value) => [`${value} ${unit}`, 'Top weight']}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={chartData.length === 1
                  ? <Dot r={4} fill="var(--accent)" strokeWidth={0} cx={0} cy={0} />
                  : false}
                activeDot={{ r: 5, fill: 'var(--accent)', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <h3 className="exercise-history-section-title">Sessions</h3>
      {exerciseSessions.length === 0 ? (
        <p className="muted" style={{ fontSize: '0.875rem' }}>No sessions recorded</p>
      ) : (
        exerciseSessions.map((s, i) => (
          <div key={s.sessionId ?? i} className="history-exercise">
            <p className="exercise-session-date muted">{formatFullDate(s.date)}</p>
            {s.sets.length > 0 ? (
              <table className="history-sets-table">
                <thead>
                  <tr>
                    <th>Set</th>
                    <th>Weight</th>
                    <th>Reps</th>
                  </tr>
                </thead>
                <tbody>
                  {s.sets.map((set, j) => (
                    <tr key={j}>
                      <td>{j + 1}</td>
                      <td>{formatWeight(set.weight, unit)}</td>
                      <td>{set.reps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted" style={{ fontSize: '0.8125rem' }}>No sets logged</p>
            )}
          </div>
        ))
      )}
    </div>
  )
}
