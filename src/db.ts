import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { WeightValue } from './units'

export type { WeightValue }

export interface Program {
  id?: number
  name: string
  workoutIds: number[]
  createdAt: number
}

export interface WorkoutSession {
  id?: number
  programId: number | null
  date: number
  exercises: {
    exerciseId: number
    sets: { weight: WeightValue; reps: number }[]
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
    indexes: { 'by-name': string }
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
    dbPromise = openDB<WorkoutDB>('workout-app', 1, {
      upgrade(db) {
        const programs = db.createObjectStore('programs', {
          keyPath: 'id',
          autoIncrement: true,
        })
        programs.createIndex('by-name', 'name')

        const history = db.createObjectStore('history', {
          keyPath: 'id',
          autoIncrement: true,
        })
        history.createIndex('by-date', 'date')

        db.createObjectStore('settings', { keyPath: 'key' })
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
