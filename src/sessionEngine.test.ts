import { describe, it, expect } from 'vitest'
import { initSession, addSet, removeSet, updateSet, completeSession } from './sessionEngine'
import type { Workout } from './db'

const mockWorkout: Workout = {
  id: 'w1',
  name: 'Push Day',
  exercises: [
    { id: 'e1', name: 'Bench Press', muscleGroup: 'Chest', targetSets: 3 },
    { id: 'e2', name: 'OHP', muscleGroup: 'Shoulders', targetSets: 2 },
  ],
}

describe('initSession', () => {
  it('creates sets matching targetSets for each exercise', () => {
    const session = initSession(mockWorkout, null, 'kg')
    expect(session.exercises[0].sets).toHaveLength(3)
    expect(session.exercises[1].sets).toHaveLength(2)
  })

  it('sets all weights and reps to empty strings', () => {
    const session = initSession(mockWorkout, null, 'kg')
    session.exercises.forEach(ex =>
      ex.sets.forEach(s => {
        expect(s.weight).toBe('')
        expect(s.reps).toBe('')
      })
    )
  })

  it('records startedAt timestamp', () => {
    const before = Date.now()
    const session = initSession(mockWorkout, null, 'kg')
    expect(session.startedAt).toBeGreaterThanOrEqual(before)
  })

  it('preserves workout metadata', () => {
    const session = initSession(mockWorkout, 42, 'lbs')
    expect(session.workoutId).toBe('w1')
    expect(session.workoutName).toBe('Push Day')
    expect(session.programId).toBe(42)
    expect(session.unit).toBe('lbs')
  })
})

describe('addSet', () => {
  it('adds a set to the specified exercise', () => {
    const session = initSession(mockWorkout, null, 'kg')
    const updated = addSet(session, 0)
    expect(updated.exercises[0].sets).toHaveLength(4)
    expect(updated.exercises[1].sets).toHaveLength(2) // unchanged
  })

  it('new set has empty weight and reps', () => {
    const session = initSession(mockWorkout, null, 'kg')
    const updated = addSet(session, 1)
    const newSet = updated.exercises[1].sets[2]
    expect(newSet.weight).toBe('')
    expect(newSet.reps).toBe('')
  })

  it('does not mutate the original session', () => {
    const session = initSession(mockWorkout, null, 'kg')
    const original = session.exercises[0].sets.length
    addSet(session, 0)
    expect(session.exercises[0].sets).toHaveLength(original)
  })
})

describe('removeSet', () => {
  it('removes the set at the given index', () => {
    const session = initSession(mockWorkout, null, 'kg')
    const updated = removeSet(session, 0, 1)
    expect(updated.exercises[0].sets).toHaveLength(2)
  })

  it('removes the correct set (not adjacent)', () => {
    let session = initSession(mockWorkout, null, 'kg')
    session = updateSet(session, 0, 0, 'reps', '10')
    session = updateSet(session, 0, 1, 'reps', '8')
    session = updateSet(session, 0, 2, 'reps', '6')
    const updated = removeSet(session, 0, 1) // remove middle set
    expect(updated.exercises[0].sets[0].reps).toBe('10')
    expect(updated.exercises[0].sets[1].reps).toBe('6')
  })

  it('does not affect other exercises', () => {
    const session = initSession(mockWorkout, null, 'kg')
    const updated = removeSet(session, 0, 0)
    expect(updated.exercises[1].sets).toHaveLength(2)
  })
})

describe('updateSet', () => {
  it('updates weight field', () => {
    const session = initSession(mockWorkout, null, 'kg')
    const updated = updateSet(session, 0, 0, 'weight', '80')
    expect(updated.exercises[0].sets[0].weight).toBe('80')
  })

  it('updates reps field', () => {
    const session = initSession(mockWorkout, null, 'kg')
    const updated = updateSet(session, 0, 1, 'reps', '12')
    expect(updated.exercises[0].sets[1].reps).toBe('12')
  })

  it('does not affect other sets', () => {
    const session = initSession(mockWorkout, null, 'kg')
    const updated = updateSet(session, 0, 0, 'weight', '100')
    expect(updated.exercises[0].sets[1].weight).toBe('')
    expect(updated.exercises[0].sets[2].weight).toBe('')
  })
})

describe('completeSession', () => {
  it('records completedAt timestamp', () => {
    const session = initSession(mockWorkout, null, 'kg')
    const before = Date.now()
    const completed = completeSession(session)
    expect(completed.completedAt).toBeGreaterThanOrEqual(before)
  })

  it('filters out sets with empty reps', () => {
    let session = initSession(mockWorkout, null, 'kg')
    session = updateSet(session, 0, 0, 'reps', '10')
    session = updateSet(session, 0, 0, 'weight', '80')
    // sets[1] and sets[2] have empty reps
    const completed = completeSession(session)
    expect(completed.exercises[0].sets).toHaveLength(1)
    expect(completed.exercises[0].sets[0].reps).toBe(10)
    expect(completed.exercises[0].sets[0].weight.value).toBe(80)
  })

  it('tags weight with the session unit', () => {
    let session = initSession(mockWorkout, null, 'lbs')
    session = updateSet(session, 0, 0, 'weight', '185')
    session = updateSet(session, 0, 0, 'reps', '5')
    const completed = completeSession(session)
    expect(completed.exercises[0].sets[0].weight.unit).toBe('lbs')
  })

  it('defaults to 0 for unparseable weight', () => {
    let session = initSession(mockWorkout, null, 'kg')
    session = updateSet(session, 0, 0, 'weight', '')
    session = updateSet(session, 0, 0, 'reps', '5')
    const completed = completeSession(session)
    expect(completed.exercises[0].sets[0].weight.value).toBe(0)
  })
})
