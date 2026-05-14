import { useRef, useState } from 'react'
import type { Unit } from './units'
import { exportAllData, importAllData, isValidAppExport } from './db'

interface Props {
  unit: Unit
  onUnitChange: (u: Unit) => void
}

export function SettingsScreen({ unit, onUnitChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [pendingImport, setPendingImport] = useState<string | null>(null)

  async function handleExport() {
    const data = await exportAllData()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workout-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    setImportError(null)
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      try {
        const parsed = JSON.parse(text)
        if (!isValidAppExport(parsed)) {
          setImportError('Invalid backup file — structure not recognised.')
          return
        }
        setPendingImport(text)
      } catch {
        setImportError('Could not parse file as JSON.')
      }
    }
    reader.readAsText(file)
  }

  async function confirmImport() {
    if (!pendingImport) return
    try {
      const data = JSON.parse(pendingImport)
      await importAllData(data)
      window.location.reload()
    } catch {
      setImportError('Import failed — please try again.')
      setPendingImport(null)
    }
  }

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

      <div className="settings-section-title">Data</div>

      <div className="settings-data-actions">
        <button className="btn-secondary" onClick={handleExport}>
          Export backup
        </button>
        <button className="btn-ghost" onClick={handleImportClick}>
          Import backup
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {importError && (
        <p className="import-error">{importError}</p>
      )}

      {pendingImport && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Replace all data?</h2>
            <p className="muted">This will overwrite your current program and entire workout history with the backup file. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setPendingImport(null)}>Cancel</button>
              <button className="btn-danger" onClick={confirmImport}>Replace</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
