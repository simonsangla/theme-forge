import type { ThemeConfig } from '../../schema/theme'

// CSS-var-friendly key conversion: 'inkSoft' → 'ink-soft', 'pricing-card' stays
function kebab(s: string): string {
  return s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * Maps ThemeConfig to CSS custom property key/value pairs.
 * Pure — no browser APIs.
 *
 * T-127: emits color slots (9), shadow group (4), radius group (5), and the
 * existing typography/spacing base vars. Widgets and the live preview
 * inherit these via the App's root style attribute.
 */
export function themeToStyleVars(config: ThemeConfig): Record<string, string> {
  const out: Record<string, string> = {
    '--font-family': config.typography.fontFamily,
    '--font-size-base': `${config.typography.baseSizePx}px`,
    '--spacing-base': `${config.spacing.baseUnitPx}px`,
  }
  for (const k of Object.keys(config.colors) as Array<keyof typeof config.colors>) {
    out[`--color-${kebab(String(k))}`] = config.colors[k]
  }
  for (const k of Object.keys(config.shadows) as Array<keyof typeof config.shadows>) {
    out[`--shadow-${k}`] = config.shadows[k]
  }
  for (const k of Object.keys(config.radii) as Array<keyof typeof config.radii>) {
    out[`--radius-${k}`] = `${config.radii[k]}px`
  }
  return out
}
