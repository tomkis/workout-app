import type { Program, Workout } from './db'

interface Props {
  program: Program | null
  suggestedWorkoutIndex: number | null
  onCreateProgram: () => void
  onReplaceProgram: () => void
  onStartWorkout: (workout: Workout) => void
}

export function HomeScreen({
  program,
  suggestedWorkoutIndex,
  onCreateProgram,
  onReplaceProgram,
  onStartWorkout,
}: Props) {
  if (!program) {
    return (
      <div className="placeholder">
        <p>No program yet</p>
        <p className="muted">Create a program to get started.</p>
        <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={onCreateProgram}>
          Create program
        </button>
      </div>
    )
  }

  return (
    <div className="home-screen">
      <div className="home-header">
        <div>
          <h2 className="program-title">{program.name}</h2>
          <p className="muted">{program.workouts.length} workout{program.workouts.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-ghost small" onClick={onReplaceProgram}>Replace</button>
      </div>

      <ul className="program-workout-list">
        {program.workouts.map((w, i) => (
          <li key={w.id} className={`program-workout-item${i === suggestedWorkoutIndex ? ' suggested' : ''}`}>
            <span className="workout-index">{i + 1}</span>
            <div className="program-workout-info">
              <div className="workout-name-row">
                <span className="workout-name">{w.name}</span>
                {i === suggestedWorkoutIndex && (
                  <span className="next-up-badge">Next up</span>
                )}
              </div>
              {w.exercises.length > 0 && (
                <span className="workout-exercise-count muted">
                  {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button className="btn-start" onClick={() => onStartWorkout(w)}>Start</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
