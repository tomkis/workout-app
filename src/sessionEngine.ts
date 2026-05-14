import type { Workout, SessionSet, WorkoutSession } from './db'
import type { Unit } from './units'

export interface ActiveSet {
  weight: string // raw input string
  reps: string
}

export interface ActiveExercise {
  exerciseId: string
  exerciseName: string
  targetSets: number
  sets: ActiveSet[]
}

export interface ActiveSession {
  programId: number | null
  workoutId: string
  workoutName: string
  startedAt: number
  exercises: ActiveExercise[]
  unit: Unit
}

export function initSession(workout: Workout, programId: number | null, unit: Unit): ActiveSession {
  return {
    programId,
    workoutId: workout.id,
    workoutName: workout.name,
    startedAt: Date.now(),
    unit,
    exercises: workout.exercises.map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      targetSets: ex.targetSets,
      sets: Array.from({ length: ex.targetSets }, () => ({ weight: '', reps: '' })),
    })),
  }
}

export function addSet(session: ActiveSession, exerciseIndex: number): ActiveSession {
  const exercises = session.exercises.map((ex, i) => {
    if (i !== exerciseIndex) return ex
    return { ...ex, sets: [...ex.sets, { weight: '', reps: '' }] }
  })
  return { ...session, exercises }
}

export function removeSet(session: ActiveSession, exerciseIndex: number, setIndex: number): ActiveSession {
  const exercises = session.exercises.map((ex, i) => {
    if (i !== exerciseIndex) return ex
    return { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) }
  })
  return { ...session, exercises }
}

export function updateSet(
  session: ActiveSession,
  exerciseIndex: number,
  setIndex: number,
  field: 'weight' | 'reps',
  value: string,
): ActiveSession {
  const exercises = session.exercises.map((ex, i) => {
    if (i !== exerciseIndex) return ex
    const sets = ex.sets.map((s, si) =>
      si === setIndex ? { ...s, [field]: value } : s
    )
    return { ...ex, sets }
  })
  return { ...session, exercises }
}

export function completeSession(session: ActiveSession): WorkoutSession {
  return {
    programId: session.programId,
    workoutId: session.workoutId,
    workoutName: session.workoutName,
    startedAt: session.startedAt,
    completedAt: Date.now(),
    exercises: session.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      sets: ex.sets
        .filter(s => s.reps.trim() !== '')
        .map(s => ({
          weight: {
            value: parseFloat(s.weight) || 0,
            unit: session.unit,
          } as SessionSet['weight'],
          reps: parseInt(s.reps) || 0,
        })),
    })),
  }
}
