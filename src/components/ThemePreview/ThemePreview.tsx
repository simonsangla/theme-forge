import type { CSSProperties } from 'react'
import type { ThemeConfig } from '../../schema/theme'
import { themeToStyleVars } from '../../lib/theme/applyTheme'
import { toCSSVars } from '../../export/exportTheme'
import styles from './ThemePreview.module.css'

interface Props {
  theme: ThemeConfig
}

export default function ThemePreview({ theme }: Props) {
  const styleVars = themeToStyleVars(theme) as CSSProperties

  return (
    <div className={styles.preview}>
      <div className={styles.canvas} style={styleVars}>
        <header className={styles.bar}>
          <span className={styles.barTitle}>Preview</span>
        </header>
        <div className={styles.body}>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Card heading</p>
            <p className={styles.cardBody}>
              Body text rendered in your selected font and size. The quick brown
              fox jumps over the lazy dog.
            </p>
            <button className={styles.btn} type="button">
              Primary action
            </button>
            <input
              className={styles.input}
              type="text"
              placeholder="Text input field"
              readOnly
            />
          </div>
          <p className={styles.caption}>Caption · Small text sample</p>
        </div>
      </div>

      <details className={styles.export}>
        <summary className={styles.exportSummary}>CSS export</summary>
        <pre className={styles.exportCode}>{toCSSVars(theme)}</pre>
      </details>
    </div>
  )
}
