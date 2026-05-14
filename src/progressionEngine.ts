import type { Exercise, Workout, WorkoutSession, SessionSet } from './db'
import type { Unit } from './units'
import type { ActiveSet } from './sessionEngine'
import { convert } from './units'

const DEFAULT_INCREMENT_KG = 2.5
const DEFAULT_INCREMENT_LBS = 5

export function getNextWorkoutIndex(
  workouts: Workout[],
  sessions: WorkoutSession[],
  programId: number | null,
): number {
  if (workouts.length === 0) return 0

  const programSessions = programId !== null
    ? sessions.filter(s => s.programId === programId)
    : sessions

  if (programSessions.length === 0) return 0

  const lastSession = programSessions.reduce((a, b) =>
    a.completedAt > b.completedAt ? a : b,
  )

  const lastIndex = workouts.findIndex(w => w.id === lastSession.workoutId)
  if (lastIndex === -1) return 0

  return (lastIndex + 1) % workouts.length
}

export function shouldAutoIncrement(exercise: Exercise, lastSets: SessionSet[]): boolean {
  if (lastSets.length < exercise.targetSets) return false
  if (lastSets.some(s => s.reps === 0)) return false

  const targetSets = lastSets.slice(0, exercise.targetSets)
  const firstKg = convert(targetSets[0].weight, 'kg')
  return targetSets.every(s => Math.abs(convert(s.weight, 'kg') - firstKg) < 0.001)
}

function getIncrementInUnit(exercise: Exercise, unit: Unit): number {
  if (exercise.incrementKg !== undefined) {
    return unit === 'kg' ? exercise.incrementKg : exercise.incrementKg * 2.20462262185
  }
  return unit === 'kg' ? DEFAULT_INCREMENT_KG : DEFAULT_INCREMENT_LBS
}

export function getPrefillSets(
  exercise: Exercise,
  lastSets: SessionSet[] | null,
  unit: Unit,
): ActiveSet[] {
  if (!lastSets || lastSets.length === 0) {
    return Array.from({ length: exercise.targetSets }, () => ({ weight: '', reps: '' }))
  }

  const doIncrement = shouldAutoIncrement(exercise, lastSets)
  const increment = doIncrement ? getIncrementInUnit(exercise, unit) : 0

  return Array.from({ length: exercise.targetSets }, (_, i) => {
    const src = lastSets[i] ?? lastSets[lastSets.length - 1]
    const baseWeight = convert(src.weight, unit)
    const displayWeight = baseWeight + increment
    const rounded = Math.round(displayWeight * 2) / 2
    return {
      weight: rounded > 0 ? String(rounded) : '',
      reps: src.reps > 0 ? String(src.reps) : '',
    }
  })
}
