/**
 * WidgetSelector — V1 widget builder surface (preview-card variant).
 *
 * Each widget in the fixed catalog is presented as a clickable preview card.
 * The card itself is the toggle — there is no separate text-only checkbox row.
 * Click → flips inclusion. Visual state mirrors selection. Previews are
 * read-only and themed via inherited CSS vars.
 */
import { useCallback, useState } from 'react'
import {
  WIDGET_IDS,
  WIDGET_LABELS,
  type WidgetId,
  type WidgetSelection,
} from '../../schema/widgets'
import WidgetPreview from './WidgetPreview'
import styles from './WidgetSelector.module.css'

interface Props {
  selection: WidgetSelection
  onChange: (next: WidgetSelection) => void
}

type KpiVariant = 'tile' | 'metric'

export default function WidgetSelector({ selection, onChange }: Props) {
  // T-134 — kpi-tile metric variant: transient per-session, not persisted, not in export.
  // Cavekit-widgets R4 (revised) explicitly scopes per-widget UI configuration to kpi-tile only.
  const [kpiVariant, setKpiVariant] = useState<KpiVariant>('tile')

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
        Click a card to include or exclude it from the export package.
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
              <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={WIDGET_LABELS[id]}
                data-widget-id={id}
                className={`${styles.cardBtn} ${checked ? styles.cardSelected : ''}`}
                onClick={() => toggle(id)}
              >
                {checked && (
                  <span className={styles.selectedBadge} aria-hidden>
                    <svg viewBox="0 0 12 12" width="10" height="10">
                      <path d="M2.5 6.2 L5 8.5 L9.5 3.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
                <span className={styles.cardPreview}>
                  <WidgetPreview widget={id} variant={id === 'kpi-tile' ? kpiVariant : undefined} />
                </span>
                <span className={styles.cardLabel}>{WIDGET_LABELS[id]}</span>
              </button>
              {id === 'kpi-tile' && (
                <div className={styles.variantRow} data-testid="kpi-tile-variant-toggle">
                  {(['tile', 'metric'] as const).map(v => {
                    const active = kpiVariant === v
                    return (
                      <button
                        key={v}
                        type="button"
                        aria-pressed={active}
                        aria-label={`${v === 'tile' ? 'Tile' : 'Metric'} variant`}
                        data-variant-option={v}
                        className={`${styles.variantBtn} ${active ? styles.variantBtnActive : ''}`}
                        onClick={() => setKpiVariant(v)}
                      >
                        {v === 'tile' ? 'Tile' : 'Metric'}
                      </button>
                    )
                  })}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
