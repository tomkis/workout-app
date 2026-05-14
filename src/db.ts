import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { WeightValue } from './units'

export type { WeightValue }

export const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'] as const

export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  targetSets: number
  incrementKg?: number // per-exercise override; defaults to 2.5 kg if unset
}

export interface Workout {
  id: string
  name: string
  exercises: Exercise[]
}

export interface Program {
  id?: number
  name: string
  workouts: Workout[]
  createdAt: number
}

export interface SessionSet {
  weight: WeightValue
  reps: number
}

export interface WorkoutSession {
  id?: number
  programId: number | null
  workoutId: string
  workoutName: string
  startedAt: number
  completedAt: number
  exercises: {
    exerciseId: string
    exerciseName: string
    sets: SessionSet[]
  }[]
}

export interface Settings {
  key: string
  value: unknown
}

interface WorkoutDB extends DBSchema {
  programs: {
    key: number
    value: Program
  }
  history: {
    key: number
    value: WorkoutSession
    indexes: { 'by-date': number }
  }
  settings: {
    key: string
    value: Settings
  }
}

let dbPromise: Promise<IDBPDatabase<WorkoutDB>> | null = null

export function getDB(): Promise<IDBPDatabase<WorkoutDB>> {
  if (!dbPromise) {
    dbPromise = openDB<WorkoutDB>('workout-app', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const history = db.createObjectStore('history', {
            keyPath: 'id',
            autoIncrement: true,
          })
          history.createIndex('by-date', 'date')
          db.createObjectStore('settings', { keyPath: 'key' })
        }
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('programs')) {
            db.createObjectStore('programs', {
              keyPath: 'id',
              autoIncrement: true,
            })
          }
          if (!db.objectStoreNames.contains('history')) {
            const history = db.createObjectStore('history', {
              keyPath: 'id',
              autoIncrement: true,
            })
            history.createIndex('by-date', 'date')
          }
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' })
          }
        }
      },
    })
  }
  return dbPromise
}

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const db = await getDB()
  const record = await db.get('settings', key)
  return record !== undefined ? (record.value as T) : defaultValue
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDB()
  await db.put('settings', { key, value })
}

export async function getActiveProgram(): Promise<Program | null> {
  const db = await getDB()
  const id = await getSetting<number | null>('activeProgramId', null)
  if (id === null) return null
  return (await db.get('programs', id)) ?? null
}

export async function saveProgram(program: Program): Promise<number> {
  const db = await getDB()
  const tx = db.transaction('programs', 'readwrite')
  await tx.store.clear()
  const id = await tx.store.add({ ...program, id: undefined } as Program)
  await tx.done
  await setSetting('activeProgramId', id)
  return id as number
}

export async function clearActiveProgram(): Promise<void> {
  await setSetting('activeProgramId', null)
}

export async function saveSession(session: WorkoutSession): Promise<number> {
  const db = await getDB()
  const id = await db.add('history', session)
  return id as number
}

export async function getAllSessions(): Promise<WorkoutSession[]> {
  const db = await getDB()
  return db.getAllFromIndex('history', 'by-date')
}
