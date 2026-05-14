import type { Unit } from './units'

interface Props {
  unit: Unit
  onUnitChange: (u: Unit) => void
}

export function SettingsScreen({ unit, onUnitChange }: Props) {
  return (
    <div className="settings-screen">
      <h2>Settings</h2>

      <div className="settings-row">
        <span className="settings-label">Weight unit</span>
        <div className="toggle-group">
          <button
            className={unit === 'kg' ? 'active' : ''}
            onClick={() => onUnitChange('kg')}
          >
            kg
          </button>
          <button
            className={unit === 'lbs' ? 'active' : ''}
            onClick={() => onUnitChange('lbs')}
          >
            lbs
          </button>
        </div>
      </div>
    </div>
  )
}
