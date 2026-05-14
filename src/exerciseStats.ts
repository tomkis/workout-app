import type { WorkoutSession, SessionSet } from './db'
import type { Unit } from './units'
import { convert } from './units'

export interface ExerciseSessionData {
  sessionId: number | undefined
  date: number
  sets: SessionSet[]
}

export interface TopWeightPoint {
  date: number
  weight: number
}

export function getExerciseSessions(
  sessions: WorkoutSession[],
  exerciseId: string,
): ExerciseSessionData[] {
  return sessions
    .filter(s => s.exercises.some(e => e.exerciseId === exerciseId))
    .map(s => {
      const ex = s.exercises.find(e => e.exerciseId === exerciseId)!
      return { sessionId: s.id, date: s.completedAt, sets: ex.sets }
    })
    .sort((a, b) => a.date - b.date)
}

export function getTopWeightPerSession(
  sessions: WorkoutSession[],
  exerciseId: string,
  unit: Unit,
): TopWeightPoint[] {
  return getExerciseSessions(sessions, exerciseId)
    .filter(s => s.sets.length > 0)
    .map(s => ({
      date: s.date,
      weight: Math.max(...s.sets.map(set => convert(set.weight, unit))),
    }))
}
