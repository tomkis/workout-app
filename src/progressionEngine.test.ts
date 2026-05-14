import { describe, it, expect } from 'vitest'
import { getNextWorkoutIndex, shouldAutoIncrement, getPrefillSets } from './progressionEngine'
import type { Exercise, Workout, WorkoutSession } from './db'

const workouts: Workout[] = [
  { id: 'w1', name: 'Push', exercises: [] },
  { id: 'w2', name: 'Pull', exercises: [] },
  { id: 'w3', name: 'Legs', exercises: [] },
]

const exercise: Exercise = {
  id: 'e1',
  name: 'Bench Press',
  muscleGroup: 'Chest',
  targetSets: 3,
}

function makeSession(
  workoutId: string,
  completedAt: number,
  programId: number | null = 1,
): WorkoutSession {
  return {
    programId,
    workoutId,
    workoutName: '',
    startedAt: completedAt - 3600000,
    completedAt,
    exercises: [],
  }
}

describe('getNextWorkoutIndex', () => {
  it('returns 0 when no sessions', () => {
    expect(getNextWorkoutIndex(workouts, [], 1)).toBe(0)
  })

  it('cycles to next workout after last completed', () => {
    const sessions = [makeSession('w1', 1000)]
    expect(getNextWorkoutIndex(workouts, sessions, 1)).toBe(1)
  })

  it('wraps around to first after last workout', () => {
    const sessions = [makeSession('w3', 1000)]
    expect(getNextWorkoutIndex(workouts, sessions, 1)).toBe(0)
  })

  it('uses the most recent session when multiple exist', () => {
    const sessions = [
      makeSession('w1', 1000),
      makeSession('w2', 2000),
    ]
    expect(getNextWorkoutIndex(workouts, sessions, 1)).toBe(2)
  })

  it('filters by programId', () => {
    const sessions = [
      makeSession('w3', 1000, 1),
      makeSession('w1', 2000, 2), // different program, more recent
    ]
    expect(getNextWorkoutIndex(workouts, sessions, 1)).toBe(0)
  })

  it('returns 0 when no workouts', () => {
    expect(getNextWorkoutIndex([], [], 1)).toBe(0)
  })

  it('returns 0 when workoutId not found in program', () => {
    const sessions = [makeSession('unknown', 1000)]
    expect(getNextWorkoutIndex(workouts, sessions, 1)).toBe(0)
  })
})

describe('shouldAutoIncrement', () => {
  const kgSets = (weight: number, reps: number, count = 3) =>
    Array.from({ length: count }, () => ({
      weight: { value: weight, unit: 'kg' as const },
      reps,
    }))

  it('returns true when all targetSets completed at same weight with reps', () => {
    expect(shouldAutoIncrement(exercise, kgSets(80, 8))).toBe(true)
  })

  it('returns false when fewer sets than targetSets', () => {
    expect(shouldAutoIncrement(exercise, kgSets(80, 8, 2))).toBe(false)
  })

  it('returns false when any set has 0 reps', () => {
    const sets = kgSets(80, 8)
    sets[1] = { weight: { value: 80, unit: 'kg' }, reps: 0 }
    expect(shouldAutoIncrement(exercise, sets)).toBe(false)
  })

  it('returns false when sets have different weights', () => {
    const sets = [
      { weight: { value: 80, unit: 'kg' as const }, reps: 8 },
      { weight: { value: 82.5, unit: 'kg' as const }, reps: 8 },
      { weight: { value: 80, unit: 'kg' as const }, reps: 8 },
    ]
    expect(shouldAutoIncrement(exercise, sets)).toBe(false)
  })

  it('returns true with mixed units when weights are equal in kg', () => {
    const sets = [
      { weight: { value: 80, unit: 'kg' as const }, reps: 5 },
      { weight: { value: 80, unit: 'kg' as const }, reps: 5 },
      { weight: { value: 80, unit: 'kg' as const }, reps: 5 },
    ]
    expect(shouldAutoIncrement(exercise, sets)).toBe(true)
  })
})

describe('getPrefillSets', () => {
  it('returns empty sets when no last session data', () => {
    const sets = getPrefillSets(exercise, null, 'kg')
    expect(sets).toHaveLength(3)
    sets.forEach(s => {
      expect(s.weight).toBe('')
      expect(s.reps).toBe('')
    })
  })

  it('prefills from last session without increment when not all sets completed', () => {
    const lastSets = [
      { weight: { value: 80, unit: 'kg' as const }, reps: 8 },
      { weight: { value: 80, unit: 'kg' as const }, reps: 8 },
    ]
    const sets = getPrefillSets(exercise, lastSets, 'kg')
    expect(sets[0].weight).toBe('80')
    expect(sets[0].reps).toBe('8')
  })

  it('auto-increments by default 2.5kg when all sets completed', () => {
    const lastSets = Array.from({ length: 3 }, () => ({
      weight: { value: 80, unit: 'kg' as const },
      reps: 8,
    }))
    const sets = getPrefillSets(exercise, lastSets, 'kg')
    expect(sets[0].weight).toBe('82.5')
  })

  it('auto-increments by per-exercise override in kg', () => {
    const exWithOverride: Exercise = { ...exercise, incrementKg: 5 }
    const lastSets = Array.from({ length: 3 }, () => ({
      weight: { value: 100, unit: 'kg' as const },
      reps: 5,
    }))
    const sets = getPrefillSets(exWithOverride, lastSets, 'kg')
    expect(sets[0].weight).toBe('105')
  })

  it('auto-increments by default 5lbs when unit is lbs', () => {
    const lastSets = Array.from({ length: 3 }, () => ({
      weight: { value: 175, unit: 'lbs' as const },
      reps: 8,
    }))
    const sets = getPrefillSets(exercise, lastSets, 'lbs')
    expect(sets[0].weight).toBe('180')
  })

  it('fills targetSets count of sets regardless of last session length', () => {
    const lastSets = [
      { weight: { value: 80, unit: 'kg' as const }, reps: 8 },
    ]
    const sets = getPrefillSets(exercise, lastSets, 'kg')
    expect(sets).toHaveLength(3)
  })

  it('repeats last available set for indices beyond last session length', () => {
    const lastSets = [
      { weight: { value: 80, unit: 'kg' as const }, reps: 8 },
    ]
    const sets = getPrefillSets(exercise, lastSets, 'kg')
    expect(sets[2].weight).toBe('80')
    expect(sets[2].reps).toBe('8')
  })

  it('converts weight to display unit when different from stored unit', () => {
    // Use 2 sets (below targetSets=3) so auto-increment does not trigger
    const lastSets = Array.from({ length: 2 }, () => ({
      weight: { value: 80, unit: 'kg' as const },
      reps: 8,
    }))
    const sets = getPrefillSets(exercise, lastSets, 'lbs')
    // 80 kg * 2.20462 ≈ 176.4 lbs, rounded to nearest 0.5 = 176.5
    expect(parseFloat(sets[0].weight)).toBeCloseTo(176.5, 0)
  })

  it('returns empty weight string when weight is 0', () => {
    // Use 2 sets (below targetSets=3) so auto-increment does not trigger
    const lastSets = Array.from({ length: 2 }, () => ({
      weight: { value: 0, unit: 'kg' as const },
      reps: 8,
    }))
    const sets = getPrefillSets(exercise, lastSets, 'kg')
    expect(sets[0].weight).toBe('')
  })
})
