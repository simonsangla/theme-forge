import { useState, useEffect, useCallback, type CSSProperties, type ChangeEvent } from 'react'
import { themeToStyleVars } from './lib/theme/applyTheme'
import { useThemeStore } from './lib/theme/useThemeStore'
import { usePersistence } from './lib/persistence/usePersistence'
import { validateThemeConfig } from './schema/theme'
import type { ThemeConfig } from './schema/theme'
import { DEFAULT_THEME } from './lib/theme/defaults'
import {
  type WidgetSelection,
  DEFAULT_WIDGET_SELECTION,
  selectedWidgetIds,
} from './schema/widgets'
import ThemeEditor from './components/ThemeEditor/ThemeEditor'
import ThemePreview from './components/ThemePreview/ThemePreview'
import ExportPanel from './components/ExportPanel/ExportPanel'
import WidgetSelector from './components/WidgetSelector/WidgetSelector'
import styles from './App.module.css'

export default function App() {
  const persistence = usePersistence()

  // T-034: resolve initial theme + widgets from persistence
  const initialTheme: ThemeConfig =
    persistence.loadResult.status === 'ok' ? persistence.loadResult.theme : DEFAULT_THEME
  const initialWidgets: WidgetSelection =
    persistence.loadResult.status === 'ok' ? persistence.loadResult.widgets : DEFAULT_WIDGET_SELECTION

  const store = useThemeStore(initialTheme)
  const [widgets, setWidgets] = useState<WidgetSelection>(initialWidgets)

  // T-034 (cold-load): mark restored theme as initial history state
  const [coldLoadDone, setColdLoadDone] = useState(false)
  useEffect(() => {
    if (!coldLoadDone && persistence.loadResult.status === 'ok') {
      store.commitTheme(persistence.loadResult.theme, true)
      setColdLoadDone(true)
    } else if (!coldLoadDone) {
      setColdLoadDone(true)
    }
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // T-033: auto-save on theme OR widgets change
  const [saveError, setSaveError] = useState<string | null>(null)
  useEffect(() => {
    const result = persistence.save(store.theme, widgets)
    if (result === 'quota') setSaveError('Storage quota exceeded — changes not saved.')
    else if (result === 'unavailable') setSaveError(null) // storageNotice already shown
    else setSaveError(null)
  }, [store.theme, widgets, persistence])

  // T-034: corrupt theme notice
  const [corruptNotice, setCorruptNotice] = useState<string | null>(
    persistence.loadResult.status === 'corrupt'
      ? 'Saved theme was corrupt and discarded. Using default.'
      : null
  )

  // T-037: storage unavailability notice (one notice only)
  const [storageNotice] = useState<string | null>(
    !persistence.storageOk ? 'Local storage unavailable — changes will not persist.' : null
  )

  // T-038 import from JSON text
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState<string | null>(null)

  const handleImportSubmit = useCallback(() => {
    let parsed: unknown
    try {
      parsed = JSON.parse(importText)
    } catch {
      setImportError('Invalid JSON — parse failed.')
      return
    }
    const result = validateThemeConfig(parsed)
    if (!result.success) {
      setImportError(result.errors.map(e => `${e.path}: ${e.message}`).join('; '))
      return
    }
    setImportError(null)
    setImportText('')
    store.commitTheme(result.data) // undoable user-initiated import
  }, [importText, store])

  // T-039 import from JSON file
  const handleFileImport = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      let parsed: unknown
      try {
        parsed = JSON.parse(reader.result as string)
      } catch {
        setImportError('Invalid JSON — parse failed.')
        return
      }
      const result = validateThemeConfig(parsed)
      if (!result.success) {
        setImportError(result.errors.map(err => `${err.path}: ${err.message}`).join('; '))
        return
      }
      setImportError(null)
      store.commitTheme(result.data)
    }
    reader.onerror = () => { setImportError('File could not be read.') }
    reader.readAsText(file)
    e.target.value = ''
  }, [store])

  const widgetCount = selectedWidgetIds(widgets).length

  return (
    <div className={styles.app} style={themeToStyleVars(store.theme) as CSSProperties}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <span className={styles.brand}>theme-forge</span>
        <span className={styles.widgetBadge} data-testid="widget-badge">
          {widgetCount} widget{widgetCount === 1 ? '' : 's'} in export
        </span>
        <div className={styles.topbarActions}>
          <button
            type="button"
            className={styles.histBtn}
            disabled={!store.canUndo}
            onClick={store.undo}
            title="Undo"
          >
            ↩ Undo
          </button>
          <button
            type="button"
            className={styles.histBtn}
            disabled={!store.canRedo}
            onClick={store.redo}
            title="Redo"
          >
            Redo ↪
          </button>
        </div>
      </header>

      {/* Notices — T-034 corrupt, T-033 quota, T-037 unavailable */}
      {(corruptNotice || saveError || storageNotice) && (
        <div className={styles.notices}>
          {corruptNotice && (
            <div className={styles.notice}>
              {corruptNotice}
              <button type="button" onClick={() => setCorruptNotice(null)} className={styles.noticeClose}>×</button>
            </div>
          )}
          {saveError && <div className={styles.notice}>{saveError}</div>}
          {storageNotice && <div className={styles.notice}>{storageNotice}</div>}
        </div>
      )}

      <div className={styles.workspace}>
        {/* Sidebar — editor */}
        <aside className={styles.sidebar}>
          <ThemeEditor
            theme={store.theme}
            onColorsChange={store.updateColors}
            onTypographyChange={store.updateTypography}
            onSpacingChange={store.updateSpacing}
            onNameChange={store.updateName}
            onPresetApply={(preset: ThemeConfig) => { store.commitTheme(preset) }}
            onReset={() => { store.commitTheme(DEFAULT_THEME) }}
            onAdoptTheme={store.commitTheme}
          />

          {/* T-035: clear persisted theme */}
          <div className={styles.persistActions}>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={persistence.clear}
            >
              Clear saved theme
            </button>
          </div>
        </aside>

        {/* Main canvas */}
        <main className={styles.canvas}>
          <ThemePreview theme={store.theme} />

          {/* Widget selection — flow step 2 (theme → widgets → export) */}
          <WidgetSelector selection={widgets} onChange={setWidgets} />

          {/* Export panel — receives both theme + widgets */}
          <ExportPanel theme={store.theme} widgets={widgets} />

          {/* Import section — T-038 / T-039 */}
          <section className={styles.importSection}>
            <p className={styles.importTitle}>Import theme</p>
            <div className={styles.importRow}>
              <textarea
                className={styles.importTextarea}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Paste JSON theme…"
                rows={3}
              />
              <button
                type="button"
                className={styles.importBtn}
                onClick={handleImportSubmit}
              >
                Import JSON
              </button>
            </div>
            <label className={styles.fileLabel}>
              <input
                type="file"
                accept=".json"
                className={styles.fileInput}
                onChange={handleFileImport}
              />
              Choose .json file
            </label>
            {importError && <p className={styles.importError}>{importError}</p>}
          </section>
        </main>
      </div>
    </div>
  )
}
