import { type ThemeConfig, type ThemeVariantPair, ThemeConfigSchema } from '../schema/theme'
import { type WidgetSelection, selectedWidgetIds, type WidgetId } from '../schema/widgets'

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

/**
 * Resolve widgets argument into a deterministic, sorted, included-only list.
 * `undefined` → empty (no widgets line). Empty list → emit empty manifest.
 */
function resolveWidgets(widgets?: WidgetSelection): WidgetId[] {
  if (!widgets) return []
  return selectedWidgetIds(widgets)
}

// CSS-var-friendly key conversion: 'inkSoft' → 'ink-soft', 'pricing-card' stays
function kebab(s: string): string {
  return s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

// ── T-022 JSON export ─────────────────────────────────────────────────────────

export function toJSON(config: ThemeConfig, widgets?: WidgetSelection): string {
  ThemeConfigSchema.parse(config)
  if (!widgets) return JSON.stringify(config, null, 2)
  const payload = { ...config, widgets: resolveWidgets(widgets) }
  return JSON.stringify(payload, null, 2)
}

export function toJSONVariant(pair: ThemeVariantPair, widgets?: WidgetSelection): string {
  const payload: Record<string, unknown> = { light: pair.light, dark: pair.dark }
  if (widgets) payload.widgets = resolveWidgets(widgets)
  return JSON.stringify(payload, null, 2)
}

// ── T-023 + T-111 CSS custom properties ───────────────────────────────────────

function widgetsCommentLine(widgets?: WidgetSelection): string | null {
  if (!widgets) return null
  const ids = resolveWidgets(widgets)
  return `/* widgets: ${ids.length ? ids.join(', ') : '(none)'} */`
}

function colorVarLines(colors: ThemeConfig['colors']): string[] {
  return (Object.keys(colors) as Array<keyof typeof colors>).map(
    (k) => `  --color-${kebab(String(k))}: ${colors[k]};`,
  )
}

function shadowVarLines(shadows: ThemeConfig['shadows']): string[] {
  return (Object.keys(shadows) as Array<keyof typeof shadows>).map(
    (k) => `  --shadow-${k}: ${shadows[k]};`,
  )
}

function radiusVarLines(radii: ThemeConfig['radii']): string[] {
  return (Object.keys(radii) as Array<keyof typeof radii>).map(
    (k) => `  --radius-${k}: ${radii[k]}px;`,
  )
}

export function toCSSVars(config: ThemeConfig, widgets?: WidgetSelection): string {
  ThemeConfigSchema.parse(config)
  const { colors, typography, spacing, shadows, radii } = config
  const [tsXs, tsSm, tsMd, tsLg] = typeScale(typography.baseSizePx, typography.scaleRatio)
  const [sp1, sp2, sp4, sp8] = spacingScale(spacing.baseUnitPx)
  const lines: string[] = []
  const header = widgetsCommentLine(widgets)
  if (header) lines.push(header)
  lines.push(
    ':root {',
    ...colorVarLines(colors),
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
    ...shadowVarLines(shadows),
    ...radiusVarLines(radii),
    '}',
  )
  return lines.join('\n')
}

export function toCSSVarsVariant(pair: ThemeVariantPair, widgets?: WidgetSelection): string {
  const light = toCSSVars(pair.light)
  const dark = toCSSVars(pair.dark).replace(':root {', ':root[data-theme="dark"] {')
  const header = widgetsCommentLine(widgets)
  return [header, light, '', dark].filter(Boolean).join('\n')
}

// ── T-024 TypeScript object export ────────────────────────────────────────────

export function toTSObject(config: ThemeConfig, widgets?: WidgetSelection): string {
  ThemeConfigSchema.parse(config)
  const themeBlock = `export const theme = ${JSON.stringify(config, null, 2)} as const`
  if (!widgets) return themeBlock
  const widgetBlock = `export const widgets = ${JSON.stringify(resolveWidgets(widgets), null, 2)} as const`
  return `${themeBlock}\n\n${widgetBlock}`
}

export function toTSObjectVariant(pair: ThemeVariantPair, widgets?: WidgetSelection): string {
  const themeBlock = `export const theme = ${JSON.stringify({ light: pair.light, dark: pair.dark }, null, 2)} as const`
  if (!widgets) return themeBlock
  const widgetBlock = `export const widgets = ${JSON.stringify(resolveWidgets(widgets), null, 2)} as const`
  return `${themeBlock}\n\n${widgetBlock}`
}

// ── T-025 + T-113 Tailwind config export ─────────────────────────────────────

function twColorsObject(colors: ThemeConfig['colors']): Record<string, string> {
  const out: Record<string, string> = {}
  for (const k of Object.keys(colors) as Array<keyof typeof colors>) {
    out[kebab(String(k))] = colors[k]
  }
  return out
}

function twShadowsObject(shadows: ThemeConfig['shadows']): Record<string, string> {
  const out: Record<string, string> = {}
  for (const k of Object.keys(shadows) as Array<keyof typeof shadows>) out[k] = shadows[k]
  return out
}

function twRadiiObject(radii: ThemeConfig['radii']): Record<string, string> {
  const out: Record<string, string> = {}
  for (const k of Object.keys(radii) as Array<keyof typeof radii>) out[k] = `${radii[k]}px`
  return out
}

export function toTailwindConfig(config: ThemeConfig, widgets?: WidgetSelection): string {
  ThemeConfigSchema.parse(config)
  const { colors, typography, spacing, shadows, radii } = config
  const [tsXs, tsSm, tsMd, tsLg] = typeScale(typography.baseSizePx, typography.scaleRatio)
  const [sp1, sp2, sp4, sp8] = spacingScale(spacing.baseUnitPx)
  const themeExtend: Record<string, unknown> = {
    colors: twColorsObject(colors),
    fontFamily: { base: [typography.fontFamily] },
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
    boxShadow: twShadowsObject(shadows),
    borderRadius: twRadiiObject(radii),
  }
  if (widgets) themeExtend.widgets = resolveWidgets(widgets)
  const obj = { theme: { extend: themeExtend } }
  return `/** @type {import('tailwindcss').Config} */\nexport default ${JSON.stringify(obj, null, 2)}`
}

export function toTailwindConfigVariant(pair: ThemeVariantPair, widgets?: WidgetSelection): string {
  const [tsXs, tsSm, tsMd, tsLg] = typeScale(pair.light.typography.baseSizePx, pair.light.typography.scaleRatio)
  const [sp1, sp2, sp4, sp8] = spacingScale(pair.light.spacing.baseUnitPx)
  const themeExtend: Record<string, unknown> = {
    colors: {
      light: twColorsObject(pair.light.colors),
      dark: twColorsObject(pair.dark.colors),
    },
    fontFamily: { base: [pair.light.typography.fontFamily] },
    fontSize: { xs: `${tsXs}px`, sm: `${tsSm}px`, md: `${tsMd}px`, lg: `${tsLg}px` },
    spacing: { '1': `${sp1}px`, '2': `${sp2}px`, '4': `${sp4}px`, '8': `${sp8}px` },
    boxShadow: twShadowsObject(pair.light.shadows),
    borderRadius: twRadiiObject(pair.light.radii),
  }
  if (widgets) themeExtend.widgets = resolveWidgets(widgets)
  const obj = { theme: { extend: themeExtend } }
  return `/** @type {import('tailwindcss').Config} */\nexport default ${JSON.stringify(obj, null, 2)}`
}

// ── T-026 + T-112 SCSS variables export ──────────────────────────────────────

function scssColorLines(colors: ThemeConfig['colors'], prefix = ''): string[] {
  return (Object.keys(colors) as Array<keyof typeof colors>).map(
    (k) => `$${prefix}color-${kebab(String(k))}: ${colors[k]};`,
  )
}

function scssShadowLines(shadows: ThemeConfig['shadows']): string[] {
  return (Object.keys(shadows) as Array<keyof typeof shadows>).map(
    (k) => `$shadow-${k}: ${shadows[k]};`,
  )
}

function scssRadiusLines(radii: ThemeConfig['radii']): string[] {
  return (Object.keys(radii) as Array<keyof typeof radii>).map(
    (k) => `$radius-${k}: ${radii[k]}px;`,
  )
}

export function toSCSSVars(config: ThemeConfig, widgets?: WidgetSelection): string {
  ThemeConfigSchema.parse(config)
  const { colors, typography, spacing, shadows, radii } = config
  const [tsXs, tsSm, tsMd, tsLg] = typeScale(typography.baseSizePx, typography.scaleRatio)
  const [sp1, sp2, sp4, sp8] = spacingScale(spacing.baseUnitPx)
  const lines: string[] = []
  if (widgets) {
    const ids = resolveWidgets(widgets)
    lines.push(`// widgets: ${ids.length ? ids.join(', ') : '(none)'}`)
    lines.push(`$widgets: (${ids.map(id => `"${id}"`).join(', ')});`)
  }
  lines.push(
    ...scssColorLines(colors),
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
    ...scssShadowLines(shadows),
    ...scssRadiusLines(radii),
  )
  return lines.join('\n')
}

export function toSCSSVarsVariant(pair: ThemeVariantPair, widgets?: WidgetSelection): string {
  const [tsXs, tsSm, tsMd, tsLg] = typeScale(pair.light.typography.baseSizePx, pair.light.typography.scaleRatio)
  const [sp1, sp2, sp4, sp8] = spacingScale(pair.light.spacing.baseUnitPx)
  const lines: string[] = []
  if (widgets) {
    const ids = resolveWidgets(widgets)
    lines.push(`// widgets: ${ids.length ? ids.join(', ') : '(none)'}`)
    lines.push(`$widgets: (${ids.map(id => `"${id}"`).join(', ')});`)
  }
  lines.push(...scssColorLines(pair.light.colors, 'light-'))
  lines.push(...scssColorLines(pair.dark.colors, 'dark-'))
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
    ...scssShadowLines(pair.light.shadows),
    ...scssRadiusLines(pair.light.radii),
  )
  return lines.join('\n')
}

// ── T-027 + T-114 Style Dictionary export ────────────────────────────────────

function sdColorGroup(colors: ThemeConfig['colors']) {
  const group: Record<string, { value: string; type: 'color' }> = {}
  for (const k of Object.keys(colors) as Array<keyof typeof colors>) {
    group[k] = { value: colors[k], type: 'color' }
  }
  return group
}

function sdShadowGroup(shadows: ThemeConfig['shadows']) {
  const group: Record<string, { value: string; type: 'boxShadow' }> = {}
  for (const k of Object.keys(shadows) as Array<keyof typeof shadows>) {
    group[k] = { value: shadows[k], type: 'boxShadow' }
  }
  return group
}

function sdRadiusGroup(radii: ThemeConfig['radii']) {
  const group: Record<string, { value: string; type: 'dimension' }> = {}
  for (const k of Object.keys(radii) as Array<keyof typeof radii>) {
    group[k] = { value: `${radii[k]}px`, type: 'dimension' }
  }
  return group
}

function sdTokens(config: ThemeConfig) {
  const [tsXs, tsSm, tsMd, tsLg] = typeScale(config.typography.baseSizePx, config.typography.scaleRatio)
  const [sp1, sp2, sp4, sp8] = spacingScale(config.spacing.baseUnitPx)
  return {
    color: sdColorGroup(config.colors),
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
    shadow: sdShadowGroup(config.shadows),
    radius: sdRadiusGroup(config.radii),
  }
}

function sdWidgetGroup(widgets: WidgetSelection) {
  const group: Record<string, { value: boolean; type: 'boolean' }> = {}
  for (const id of selectedWidgetIds(widgets)) {
    // Style Dictionary token names use camelCase; "kpi-tile" -> "kpiTile"
    const key = id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    group[key] = { value: true, type: 'boolean' }
  }
  return group
}

export function toStyleDictionary(config: ThemeConfig, widgets?: WidgetSelection): string {
  ThemeConfigSchema.parse(config)
  const tokens = sdTokens(config)
  if (!widgets) return JSON.stringify(tokens, null, 2)
  return JSON.stringify({ ...tokens, widgets: sdWidgetGroup(widgets) }, null, 2)
}

export function toStyleDictionaryVariant(pair: ThemeVariantPair, widgets?: WidgetSelection): string {
  const payload: Record<string, unknown> = { light: sdTokens(pair.light), dark: sdTokens(pair.dark) }
  if (widgets) payload.widgets = sdWidgetGroup(widgets)
  return JSON.stringify(payload, null, 2)
}
