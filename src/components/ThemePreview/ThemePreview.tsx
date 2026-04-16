import type { CSSProperties } from 'react'
import type { ThemeConfig, ThemeVariantPair } from '../../schema/theme'
import { themeToStyleVars } from '../../lib/theme/applyTheme'
import styles from './ThemePreview.module.css'

interface Props {
  /** Single theme or variant pair */
  theme: ThemeConfig
  variantPair?: ThemeVariantPair
}

export default function ThemePreview({ theme }: Props) {
  const displayTheme = theme
  const styleVars = themeToStyleVars(displayTheme) as CSSProperties

  const { baseSizePx, scaleRatio } = displayTheme.typography
  const { baseUnitPx } = displayTheme.spacing

  // Type scale — 3 steps anchored to baseSizePx (T-020 / R4)
  const sizes = {
    heading: Math.round(baseSizePx * scaleRatio * scaleRatio),
    subheading: Math.round(baseSizePx * scaleRatio),
    body: baseSizePx,
    caption: Math.round(baseSizePx / scaleRatio),
  }

  return (
    <div className={styles.preview}>
      {/* T-019: no toggle for single theme (variant pair not yet supported in store) */}

      {/* Preview header strip — app chrome, does NOT use theme vars */}
      <div className={styles.previewHeader}>
        <span className={styles.previewLabel}>Preview</span>
        <span className={styles.previewThemeName} title={displayTheme.name}>
          {displayTheme.name}
        </span>
      </div>

      {/* Canvas — tokens scoped here, do not leak to chrome (T-017 / R1) */}
      <div className={styles.canvas} style={styleVars}>
        {/* App bar */}
        <header className={styles.bar}>
          <span className={styles.barTitle}>Preview</span>
        </header>

        {/* Body */}
        <div className={styles.body}>
          {/* Type scale visualization (T-020 / R4) */}
          <div className={styles.typeScale}>
            <p style={{ fontSize: sizes.heading, fontFamily: 'var(--font-family)', fontWeight: 700, color: 'var(--color-text)', margin: 0, lineHeight: 1.2 }}>
              Heading — {sizes.heading}px
            </p>
            <p style={{ fontSize: sizes.subheading, fontFamily: 'var(--font-family)', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
              Subheading — {sizes.subheading}px
            </p>
            <p style={{ fontSize: sizes.body, fontFamily: 'var(--font-family)', color: 'var(--color-text)', margin: 0 }}>
              Body — {sizes.body}px. The quick brown fox jumps over the lazy dog.
            </p>
            <p style={{ fontSize: sizes.caption, fontFamily: 'var(--font-family)', color: 'var(--color-text)', opacity: 0.5, margin: 0 }}>
              Caption — {sizes.caption}px
            </p>
          </div>

          {/* Spacing visualization — gap derived from base unit (T-020 / R5) */}
          <div
            className={styles.spacingDemo}
            style={{ gap: `${baseUnitPx * 2}px`, padding: `${baseUnitPx * 3}px` }}
          >
            <div className={styles.spBlock} style={{ background: 'var(--color-primary)', width: `${baseUnitPx * 4}px`, height: `${baseUnitPx * 4}px` }} />
            <div className={styles.spBlock} style={{ background: 'var(--color-secondary)', width: `${baseUnitPx * 6}px`, height: `${baseUnitPx * 4}px` }} />
            <div className={styles.spBlock} style={{ background: 'var(--color-primary)', opacity: 0.4, width: `${baseUnitPx * 8}px`, height: `${baseUnitPx * 4}px` }} />
            <span style={{ fontSize: sizes.caption, color: 'var(--color-text)', opacity: 0.4, fontFamily: 'var(--font-family)' }}>
              {baseUnitPx}px unit
            </span>
          </div>

          {/* Component card */}
          <div className={styles.card}>
            <p className={styles.cardTitle}>Card heading</p>
            <p className={styles.cardBody}>
              Body text rendered in your selected font and size.
            </p>
            <div className={styles.btnRow}>
              {/* Primary button (T-017 / R1) */}
              <button className={styles.btnPrimary} type="button">
                Primary action
              </button>
              {/* Secondary button (T-017 / R1) */}
              <button className={styles.btnSecondary} type="button">
                Secondary
              </button>
            </div>
            <input
              className={styles.input}
              type="text"
              placeholder="Text input field"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  )
}
