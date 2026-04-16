import { ThemeConfig, ThemeConfigSchema } from '../schema/theme'

export function toJSON(config: ThemeConfig): string {
  ThemeConfigSchema.parse(config)
  return JSON.stringify(config, null, 2)
}

export function toCSSVars(config: ThemeConfig): string {
  ThemeConfigSchema.parse(config)
  const { colors, typography, spacing } = config
  return [
    ':root {',
    `  --color-primary: ${colors.primary};`,
    `  --color-secondary: ${colors.secondary};`,
    `  --color-background: ${colors.background};`,
    `  --color-text: ${colors.text};`,
    `  --font-family: ${typography.fontFamily};`,
    `  --font-size-base: ${typography.baseSizePx}px;`,
    `  --font-scale-ratio: ${typography.scaleRatio};`,
    `  --spacing-base: ${spacing.baseUnitPx}px;`,
    '}',
  ].join('\n')
}

export function toTSObject(config: ThemeConfig): string {
  ThemeConfigSchema.parse(config)
  return `export const theme = ${JSON.stringify(config, null, 2)} as const`
}
