import type { ThemeConfig } from '../../schema/theme'

/** Maps ThemeConfig to CSS custom property key/value pairs. Pure — no browser APIs. */
export function themeToStyleVars(config: ThemeConfig): Record<string, string> {
  return {
    '--color-primary': config.colors.primary,
    '--color-secondary': config.colors.secondary,
    '--color-background': config.colors.background,
    '--color-text': config.colors.text,
    '--font-family': config.typography.fontFamily,
    '--font-size-base': `${config.typography.baseSizePx}px`,
    '--spacing-base': `${config.spacing.baseUnitPx}px`,
  }
}
