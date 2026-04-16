/**
 * WidgetPreview — read-only mini-rendering of a single catalog widget.
 *
 * Pure presentational. Themed entirely via inherited CSS custom properties
 * (`--color-primary`, `--color-secondary`, `--color-background`, `--color-text`,
 * `--font-family`, `--font-size-base`, `--spacing-base`) provided by App.tsx.
 *
 * No state, no handlers, no dependencies on theme objects — the preview
 * automatically reflects whatever theme the parent has applied. All copy
 * is fixed deterministic.
 */
import type { WidgetId } from '../../schema/widgets'
import styles from './WidgetPreview.module.css'

interface Props {
  widget: WidgetId
}

export default function WidgetPreview({ widget }: Props) {
  switch (widget) {
    case 'button':
      return (
        <div className={styles.preview} data-widget-preview="button">
          <span className={`${styles.btn} ${styles.btnPrimary}`}>Action</span>
          <span className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</span>
        </div>
      )

    case 'card':
      return (
        <div className={styles.preview} data-widget-preview="card">
          <div className={styles.cardBox}>
            <div className={styles.cardTitle}>Card title</div>
            <div className={styles.cardBody}>Brief description line.</div>
            <div className={styles.cardLink}>Learn more →</div>
          </div>
        </div>
      )

    case 'empty-state':
      return (
        <div className={styles.preview} data-widget-preview="empty-state">
          <div className={styles.emptyBox}>
            <div className={styles.emptyGlyph}>⊘</div>
            <div className={styles.emptyCaption}>No items yet</div>
          </div>
        </div>
      )

    case 'input':
      return (
        <div className={styles.preview} data-widget-preview="input">
          <div className={styles.inputLabel}>Email</div>
          <div className={styles.inputBox}>name@example.com</div>
        </div>
      )

    case 'kpi-tile':
      return (
        <div className={styles.preview} data-widget-preview="kpi-tile">
          <div className={styles.kpiBox}>
            <div className={styles.kpiValue}>1,284</div>
            <div className={styles.kpiLabel}>Active users <span className={styles.kpiTrend}>▲</span></div>
          </div>
        </div>
      )

    case 'modal':
      return (
        <div className={styles.preview} data-widget-preview="modal">
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>Confirm</div>
            <div className={styles.modalBody}>Apply these changes?</div>
            <div className={styles.modalFooter}>
              <span className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>No</span>
              <span className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}>Yes</span>
            </div>
          </div>
        </div>
      )

    case 'navbar':
      return (
        <div className={styles.preview} data-widget-preview="navbar">
          <div className={styles.navBox}>
            <span className={styles.navBrand}>◆ Brand</span>
            <span className={styles.navLinks}>
              <span>Home</span>
              <span>Docs</span>
              <span>About</span>
            </span>
            <span className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}>Sign in</span>
          </div>
        </div>
      )

    case 'table':
      return (
        <div className={styles.preview} data-widget-preview="table">
          <div className={styles.tableBox}>
            <div className={`${styles.tableRow} ${styles.tableHead}`}>
              <span>Name</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            <div className={styles.tableRow}>
              <span>Alpha</span>
              <span>Active</span>
              <span>Apr 14</span>
            </div>
            <div className={`${styles.tableRow} ${styles.tableRowAlt}`}>
              <span>Beta</span>
              <span>Pending</span>
              <span>Apr 15</span>
            </div>
          </div>
        </div>
      )
  }
}
