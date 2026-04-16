import type { ThemeConfig } from '../../schema/theme'
import styles from './ThemeEditor.module.css'

const FONT_OPTIONS = [
  { label: 'System', value: 'system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'ui-monospace, monospace' },
]

interface Props {
  theme: ThemeConfig
  onColorsChange: (c: Partial<ThemeConfig['colors']>) => void
  onTypographyChange: (t: Partial<ThemeConfig['typography']>) => void
  onSpacingChange: (s: Partial<ThemeConfig['spacing']>) => void
}

export default function ThemeEditor({
  theme,
  onColorsChange,
  onTypographyChange,
  onSpacingChange,
}: Props) {
  return (
    <div className={styles.editor}>
      <p className={styles.heading}>Theme</p>

      <section className={styles.section}>
        <p className={styles.sectionTitle}>Colors</p>
        <label className={styles.field}>
          <span>Accent</span>
          <input
            type="color"
            value={theme.colors.primary}
            onChange={(e) => onColorsChange({ primary: e.target.value })}
          />
        </label>
        <label className={styles.field}>
          <span>Background</span>
          <input
            type="color"
            value={theme.colors.background}
            onChange={(e) => onColorsChange({ background: e.target.value })}
          />
        </label>
        <label className={styles.field}>
          <span>Text</span>
          <input
            type="color"
            value={theme.colors.text}
            onChange={(e) => onColorsChange({ text: e.target.value })}
          />
        </label>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionTitle}>Typography</p>
        <label className={styles.field}>
          <span>Font</span>
          <select
            value={theme.typography.fontFamily}
            onChange={(e) => onTypographyChange({ fontFamily: e.target.value })}
          >
            {FONT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>
            Size <em>{theme.typography.baseSizePx}px</em>
          </span>
          <input
            type="range"
            min={12}
            max={24}
            value={theme.typography.baseSizePx}
            onChange={(e) =>
              onTypographyChange({ baseSizePx: Number(e.target.value) })
            }
          />
        </label>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionTitle}>Spacing</p>
        <label className={styles.field}>
          <span>
            Base unit <em>{theme.spacing.baseUnitPx}px</em>
          </span>
          <input
            type="range"
            min={2}
            max={12}
            value={theme.spacing.baseUnitPx}
            onChange={(e) =>
              onSpacingChange({ baseUnitPx: Number(e.target.value) })
            }
          />
        </label>
      </section>
    </div>
  )
}
