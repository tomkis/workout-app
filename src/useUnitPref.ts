import { useState, useEffect } from 'react'
import { getSetting, setSetting } from './db'
import type { Unit } from './units'

const SETTING_KEY = 'unitPreference'

export function useUnitPref(): [Unit, (u: Unit) => void, boolean] {
  const [unit, setUnitState] = useState<Unit>('kg')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSetting<Unit>(SETTING_KEY, 'kg').then(saved => {
      setUnitState(saved)
      setLoading(false)
    })
  }, [])

  function setUnit(u: Unit) {
    setUnitState(u)
    setSetting(SETTING_KEY, u)
  }

  return [unit, setUnit, loading]
}
