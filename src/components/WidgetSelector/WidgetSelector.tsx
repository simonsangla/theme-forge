/**
 * WidgetSelector — V1 widget builder surface.
 *
 * Constrained checkbox grid for the fixed canonical widget catalog.
 * No drag-and-drop, no layout, no per-widget config beyond on/off.
 * Selection bubbles up to the App and flows into every export format.
 */
import { useCallback } from 'react'
import {
  WIDGET_IDS,
  WIDGET_LABELS,
  type WidgetId,
  type WidgetSelection,
} from '../../schema/widgets'
import styles from './WidgetSelector.module.css'

interface Props {
  selection: WidgetSelection
  onChange: (next: WidgetSelection) => void
}

export default function WidgetSelector({ selection, onChange }: Props) {
  const toggle = useCallback(
    (id: WidgetId) => {
      onChange({ ...selection, [id]: !selection[id] })
    },
    [selection, onChange],
  )

  const setAll = useCallback(
    (value: boolean) => {
      const next = { ...selection }
      for (const id of WIDGET_IDS) next[id] = value
      onChange(next)
    },
    [selection, onChange],
  )

  const selectedCount = WIDGET_IDS.reduce((n, id) => (selection[id] ? n + 1 : n), 0)

  return (
    <section className={styles.section} aria-labelledby="widget-builder-heading">
      <header className={styles.header}>
        <h2 id="widget-builder-heading" className={styles.title}>Widgets</h2>
        <span className={styles.count} aria-live="polite">
          {selectedCount}/{WIDGET_IDS.length} selected
        </span>
      </header>
      <p className={styles.hint}>
        Choose which widgets to include in the export package.
      </p>

      <div className={styles.bulkRow}>
        <button
          type="button"
          className={styles.bulkBtn}
          onClick={() => setAll(true)}
          disabled={selectedCount === WIDGET_IDS.length}
        >
          Select all
        </button>
        <button
          type="button"
          className={styles.bulkBtn}
          onClick={() => setAll(false)}
          disabled={selectedCount === 0}
        >
          Clear
        </button>
      </div>

      <ul className={styles.grid}>
        {WIDGET_IDS.map(id => {
          const checked = selection[id]
          return (
            <li key={id}>
              <label className={`${styles.item} ${checked ? styles.itemOn : ''}`}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={checked}
                  onChange={() => toggle(id)}
                  data-widget-id={id}
                />
                <span className={styles.label}>{WIDGET_LABELS[id]}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
