import { describe, it, expect } from 'vitest'
import { getExerciseSessions, getTopWeightPerSession } from './exerciseStats'
import type { WorkoutSession } from './db'

function makeSession(
  id: number,
  completedAt: number,
  exercises: WorkoutSession['exercises'],
): WorkoutSession {
  return {
    id,
    programId: 1,
    workoutId: 'w1',
    workoutName: 'Push',
    startedAt: completedAt - 3600000,
    completedAt,
    exercises,
  }
}

const kg = (value: number) => ({ value, unit: 'kg' as const })
const lbs = (value: number) => ({ value, unit: 'lbs' as const })

const sessions: WorkoutSession[] = [
  makeSession(1, 1000, [
    {
      exerciseId: 'e1',
      exerciseName: 'Bench Press',
      sets: [
        { weight: kg(80), reps: 8 },
        { weight: kg(80), reps: 7 },
        { weight: kg(75), reps: 6 },
      ],
    },
  ]),
  makeSession(2, 2000, [
    {
      exerciseId: 'e1',
      exerciseName: 'Bench Press',
      sets: [
        { weight: kg(82.5), reps: 8 },
        { weight: kg(82.5), reps: 8 },
      ],
    },
    {
      exerciseId: 'e2',
      exerciseName: 'OHP',
      sets: [{ weight: kg(60), reps: 5 }],
    },
  ]),
  makeSession(3, 3000, [
    {
      exerciseId: 'e2',
      exerciseName: 'OHP',
      sets: [{ weight: lbs(140), reps: 5 }],
    },
  ]),
]

describe('getExerciseSessions', () => {
  it('returns only sessions containing the exercise', () => {
    const result = getExerciseSessions(sessions, 'e1')
    expect(result).toHaveLength(2)
  })

  it('returns sessions sorted chronologically', () => {
    const result = getExerciseSessions(sessions, 'e1')
    expect(result[0].date).toBe(1000)
    expect(result[1].date).toBe(2000)
  })

  it('returns correct sets for each session', () => {
    const result = getExerciseSessions(sessions, 'e1')
    expect(result[0].sets).toHaveLength(3)
    expect(result[1].sets).toHaveLength(2)
  })

  it('returns empty array when exercise never performed', () => {
    expect(getExerciseSessions(sessions, 'e99')).toHaveLength(0)
  })

  it('correctly filters by exerciseId not by name', () => {
    const result = getExerciseSessions(sessions, 'e2')
    expect(result).toHaveLength(2)
  })
})

describe('getTopWeightPerSession', () => {
  it('returns the maximum weight per session in kg', () => {
    const points = getTopWeightPerSession(sessions, 'e1', 'kg')
    expect(points).toHaveLength(2)
    expect(points[0].weight).toBe(80)
    expect(points[1].weight).toBe(82.5)
  })

  it('converts weights to the requested unit', () => {
    const points = getTopWeightPerSession(sessions, 'e1', 'lbs')
    // 82.5 kg * 2.20462 ≈ 181.88 lbs
    expect(points[1].weight).toBeCloseTo(181.88, 1)
  })

  it('handles mixed stored units by converting to display unit', () => {
    // e2: session 2 has 60 kg, session 3 has 140 lbs ≈ 63.5 kg
    const points = getTopWeightPerSession(sessions, 'e2', 'kg')
    expect(points[0].weight).toBe(60)
    expect(points[1].weight).toBeCloseTo(63.5, 0)
  })

  it('returns points sorted chronologically', () => {
    const points = getTopWeightPerSession(sessions, 'e1', 'kg')
    expect(points[0].date).toBeLessThan(points[1].date)
  })

  it('returns empty array when exercise never performed', () => {
    expect(getTopWeightPerSession(sessions, 'e99', 'kg')).toHaveLength(0)
  })

  it('returns single point for exercise with one session', () => {
    const single: WorkoutSession[] = [
      makeSession(10, 5000, [
        {
          exerciseId: 'e3',
          exerciseName: 'Squat',
          sets: [{ weight: kg(100), reps: 5 }],
        },
      ]),
    ]
    const points = getTopWeightPerSession(single, 'e3', 'kg')
    expect(points).toHaveLength(1)
    expect(points[0].weight).toBe(100)
  })
})
