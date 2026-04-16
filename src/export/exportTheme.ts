import { type ThemeConfig, type ThemeVariantPair, ThemeConfigSchema } from '../schema/theme'

// ── helpers ──────────────────────────────────────────────────────────────────

function typeScale(base: number, ratio: number): [number, number, number, number] {
  return [
    Math.round(base / ratio),
    base,
    Math.round(base * ratio),
    Math.round(base * ratio * ratio),
  ]
}

function spacingScale(base: number): [number, number, number, number] {
  return [base, base * 2, base * 4, base * 8]
}

// ── T-022 JSON export ─────────────────────────────────────────────────────────

export function toJSON(config: ThemeConfig): string {
  ThemeConfigSchema.parse(config)
  return JSON.stringify(config, null, 2)
}

export function toJSONVariant(pair: ThemeVariantPair): string {
  return JSON.stringify({ light: pair.light, dark: pair.dark }, null, 2)
}

// ── T-023 CSS custom properties ───────────────────────────────────────────────

export function toCSSVars(config: ThemeConfig): string {
  ThemeConfigSchema.parse(config)
  const { colors, typography, spacing } = config
  const [tsXs, tsSm, tsMd, tsLg] = typeScale(typography.baseSizePx, typography.scaleRatio)
  const [sp1, sp2, sp4, sp8] = spacingScale(spacing.baseUnitPx)
  return [
    ':root {',
    `  --color-primary: ${colors.primary};`,
    `  --color-secondary: ${colors.secondary};`,
    `  --color-background: ${colors.background};`,
    `  --color-text: ${colors.text};`,
    `  --font-family: ${typography.fontFamily};`,
    `  --font-size-xs: ${tsXs}px;`,
    `  --font-size-sm: ${tsSm}px;`,
    `  --font-size-md: ${tsMd}px;`,
    `  --font-size-lg: ${tsLg}px;`,
    `  --font-scale-ratio: ${typography.scaleRatio};`,
    `  --spacing-1: ${sp1}px;`,
    `  --spacing-2: ${sp2}px;`,
    `  --spacing-4: ${sp4}px;`,
    `  --spacing-8: ${sp8}px;`,
    '}',
  ].join('\n')
}

export function toCSSVarsVariant(pair: ThemeVariantPair): string {
  const light = toCSSVars(pair.light).replace(':root {', ':root {')
  const dark = toCSSVars(pair.dark).replace(':root {', ':root[data-theme="dark"] {')
  return `${light}\n\n${dark}`
}

// ── T-024 TypeScript object export ────────────────────────────────────────────

export function toTSObject(config: ThemeConfig): string {
  ThemeConfigSchema.parse(config)
  return `export const theme = ${JSON.stringify(config, null, 2)} as const`
}

export function toTSObjectVariant(pair: ThemeVariantPair): string {
  return `export const theme = ${JSON.stringify({ light: pair.light, dark: pair.dark }, null, 2)} as const`
}

// ── T-025 Tailwind config export ──────────────────────────────────────────────

export function toTailwindConfig(config: ThemeConfig): string {
  ThemeConfigSchema.parse(config)
  const { colors, typography, spacing } = config
  const [tsXs, tsSm, tsMd, tsLg] = typeScale(typography.baseSizePx, typography.scaleRatio)
  const [sp1, sp2, sp4, sp8] = spacingScale(spacing.baseUnitPx)
  const obj = {
    theme: {
      extend: {
        colors: {
          primary: colors.primary,
          secondary: colors.secondary,
          background: colors.background,
          text: colors.text,
        },
        fontFamily: {
          base: [typography.fontFamily],
        },
        fontSize: {
          xs: `${tsXs}px`,
          sm: `${tsSm}px`,
          md: `${tsMd}px`,
          lg: `${tsLg}px`,
        },
        spacing: {
          '1': `${sp1}px`,
          '2': `${sp2}px`,
          '4': `${sp4}px`,
          '8': `${sp8}px`,
        },
      },
    },
  }
  return `/** @type {import('tailwindcss').Config} */\nexport default ${JSON.stringify(obj, null, 2)}`
}

export function toTailwindConfigVariant(pair: ThemeVariantPair): string {
  const [tsXs, tsSm, tsMd, tsLg] = typeScale(pair.light.typography.baseSizePx, pair.light.typography.scaleRatio)
  const [sp1, sp2, sp4, sp8] = spacingScale(pair.light.spacing.baseUnitPx)
  const obj = {
    theme: {
      extend: {
        colors: {
          light: {
            primary: pair.light.colors.primary,
            secondary: pair.light.colors.secondary,
            background: pair.light.colors.background,
            text: pair.light.colors.text,
          },
          dark: {
            primary: pair.dark.colors.primary,
            secondary: pair.dark.colors.secondary,
            background: pair.dark.colors.background,
            text: pair.dark.colors.text,
          },
        },
        fontFamily: { base: [pair.light.typography.fontFamily] },
        fontSize: { xs: `${tsXs}px`, sm: `${tsSm}px`, md: `${tsMd}px`, lg: `${tsLg}px` },
        spacing: { '1': `${sp1}px`, '2': `${sp2}px`, '4': `${sp4}px`, '8': `${sp8}px` },
      },
    },
  }
  return `/** @type {import('tailwindcss').Config} */\nexport default ${JSON.stringify(obj, null, 2)}`
}

// ── T-026 SCSS variables export ───────────────────────────────────────────────

export function toSCSSVars(config: ThemeConfig): string {
  ThemeConfigSchema.parse(config)
  const { colors, typography, spacing } = config
  const [tsXs, tsSm, tsMd, tsLg] = typeScale(typography.baseSizePx, typography.scaleRatio)
  const [sp1, sp2, sp4, sp8] = spacingScale(spacing.baseUnitPx)
  return [
    `$color-primary: ${colors.primary};`,
    `$color-secondary: ${colors.secondary};`,
    `$color-background: ${colors.background};`,
    `$color-text: ${colors.text};`,
    `$font-family: ${typography.fontFamily};`,
    `$font-size-xs: ${tsXs}px;`,
    `$font-size-sm: ${tsSm}px;`,
    `$font-size-md: ${tsMd}px;`,
    `$font-size-lg: ${tsLg}px;`,
    `$font-scale-ratio: ${typography.scaleRatio};`,
    `$spacing-1: ${sp1}px;`,
    `$spacing-2: ${sp2}px;`,
    `$spacing-4: ${sp4}px;`,
    `$spacing-8: ${sp8}px;`,
  ].join('\n')
}

export function toSCSSVarsVariant(pair: ThemeVariantPair): string {
  const [tsXs, tsSm, tsMd, tsLg] = typeScale(pair.light.typography.baseSizePx, pair.light.typography.scaleRatio)
  const [sp1, sp2, sp4, sp8] = spacingScale(pair.light.spacing.baseUnitPx)
  const lines: string[] = []
  for (const [variant, colors] of [['light', pair.light.colors], ['dark', pair.dark.colors]] as const) {
    lines.push(
      `$${variant}-color-primary: ${colors.primary};`,
      `$${variant}-color-secondary: ${colors.secondary};`,
      `$${variant}-color-background: ${colors.background};`,
      `$${variant}-color-text: ${colors.text};`,
    )
  }
  lines.push(
    `$font-family: ${pair.light.typography.fontFamily};`,
    `$font-size-xs: ${tsXs}px;`,
    `$font-size-sm: ${tsSm}px;`,
    `$font-size-md: ${tsMd}px;`,
    `$font-size-lg: ${tsLg}px;`,
    `$font-scale-ratio: ${pair.light.typography.scaleRatio};`,
    `$spacing-1: ${sp1}px;`,
    `$spacing-2: ${sp2}px;`,
    `$spacing-4: ${sp4}px;`,
    `$spacing-8: ${sp8}px;`,
  )
  return lines.join('\n')
}

// ── T-027 Style Dictionary export ─────────────────────────────────────────────

function sdTokens(config: ThemeConfig) {
  const [tsXs, tsSm, tsMd, tsLg] = typeScale(config.typography.baseSizePx, config.typography.scaleRatio)
  const [sp1, sp2, sp4, sp8] = spacingScale(config.spacing.baseUnitPx)
  return {
    color: {
      primary: { value: config.colors.primary, type: 'color' },
      secondary: { value: config.colors.secondary, type: 'color' },
      background: { value: config.colors.background, type: 'color' },
      text: { value: config.colors.text, type: 'color' },
    },
    typography: {
      fontFamily: { value: config.typography.fontFamily, type: 'fontFamily' },
      fontSizeXs: { value: `${tsXs}px`, type: 'fontSize' },
      fontSizeSm: { value: `${tsSm}px`, type: 'fontSize' },
      fontSizeMd: { value: `${tsMd}px`, type: 'fontSize' },
      fontSizeLg: { value: `${tsLg}px`, type: 'fontSize' },
      scaleRatio: { value: config.typography.scaleRatio, type: 'number' },
    },
    spacing: {
      s1: { value: `${sp1}px`, type: 'dimension' },
      s2: { value: `${sp2}px`, type: 'dimension' },
      s4: { value: `${sp4}px`, type: 'dimension' },
      s8: { value: `${sp8}px`, type: 'dimension' },
    },
  }
}

export function toStyleDictionary(config: ThemeConfig): string {
  ThemeConfigSchema.parse(config)
  return JSON.stringify(sdTokens(config), null, 2)
}

export function toStyleDictionaryVariant(pair: ThemeVariantPair): string {
  return JSON.stringify({ light: sdTokens(pair.light), dark: sdTokens(pair.dark) }, null, 2)
}
