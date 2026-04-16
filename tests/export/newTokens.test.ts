/**
 * T-131 — Per-format export emission tests for the batch-9 token additions.
 *
 * Asserts that every export format actually carries the 5 new color slots
 * (muted, hairline, inkSoft, surfaceInvert, onInvert), the 4 shadow slots
 * (primary, secondary, card, float), and the 5 radius slots (pill, sm, md,
 * lg, xl). Closes coverage GAP #2 from the Batch 9 surveyor report.
 */
import { describe, it, expect } from 'vitest'
import {
  toCSSVars, toCSSVarsVariant,
  toSCSSVars, toSCSSVarsVariant,
  toTailwindConfig, toTailwindConfigVariant,
  toStyleDictionary, toStyleDictionaryVariant,
  toJSON, toJSONVariant,
  toTSObject, toTSObjectVariant,
} from '../../src/export/exportTheme'
import type { ThemeVariantPair } from '../../src/schema/theme'
import { DEFAULT_THEME } from '../../src/lib/theme/defaults'

const baseTheme = DEFAULT_THEME

const variantPair: ThemeVariantPair = {
  name: 'pair',
  light: baseTheme,
  dark: { ...baseTheme, name: 'dark', colors: { ...baseTheme.colors, background: '#000000' } },
}

const NEW_COLOR_VAR_NAMES = [
  '--color-muted',
  '--color-hairline',
  '--color-ink-soft',
  '--color-surface-invert',
  '--color-on-invert',
] as const

const SHADOW_VAR_NAMES = ['--shadow-primary', '--shadow-secondary', '--shadow-card', '--shadow-float'] as const
const RADIUS_VAR_NAMES = ['--radius-pill', '--radius-sm', '--radius-md', '--radius-lg', '--radius-xl'] as const

const NEW_SCSS_COLOR_NAMES = [
  '$color-muted',
  '$color-hairline',
  '$color-ink-soft',
  '$color-surface-invert',
  '$color-on-invert',
] as const

const SCSS_SHADOW_NAMES = ['$shadow-primary', '$shadow-secondary', '$shadow-card', '$shadow-float'] as const
const SCSS_RADIUS_NAMES = ['$radius-pill', '$radius-sm', '$radius-md', '$radius-lg', '$radius-xl'] as const

// ── CSS ──────────────────────────────────────────────────────────────────────

describe('toCSSVars — new token emission', () => {
  it('emits all 5 new color CSS vars', () => {
    const out = toCSSVars(baseTheme)
    for (const name of NEW_COLOR_VAR_NAMES) expect(out).toContain(name)
  })

  it('emits all 4 shadow CSS vars', () => {
    const out = toCSSVars(baseTheme)
    for (const name of SHADOW_VAR_NAMES) expect(out).toContain(name)
  })

  it('emits all 5 radius CSS vars with px suffix', () => {
    const out = toCSSVars(baseTheme)
    for (const name of RADIUS_VAR_NAMES) expect(out).toContain(name)
    // sample value must be `<n>px`
    expect(out).toMatch(/--radius-sm: \d+px;/)
  })
})

describe('toCSSVarsVariant — new token emission', () => {
  it('emits new color/shadow/radius vars in both :root and :root[data-theme="dark"] blocks', () => {
    const out = toCSSVarsVariant(variantPair)
    expect(out).toContain(':root {')
    expect(out).toContain(':root[data-theme="dark"] {')
    for (const name of [...NEW_COLOR_VAR_NAMES, ...SHADOW_VAR_NAMES, ...RADIUS_VAR_NAMES]) {
      // appears at least once in light or dark block — both blocks cite the same vars
      expect(out).toContain(name)
    }
  })
})

// ── SCSS ─────────────────────────────────────────────────────────────────────

describe('toSCSSVars — new token emission', () => {
  it('emits all 5 new color SCSS vars', () => {
    const out = toSCSSVars(baseTheme)
    for (const name of NEW_SCSS_COLOR_NAMES) expect(out).toContain(name + ':')
  })

  it('emits all 4 shadow SCSS vars', () => {
    const out = toSCSSVars(baseTheme)
    for (const name of SCSS_SHADOW_NAMES) expect(out).toContain(name + ':')
  })

  it('emits all 5 radius SCSS vars with px suffix', () => {
    const out = toSCSSVars(baseTheme)
    for (const name of SCSS_RADIUS_NAMES) expect(out).toContain(name + ':')
    expect(out).toMatch(/\$radius-sm: \d+px;/)
  })
})

describe('toSCSSVarsVariant — new token emission', () => {
  it('emits both $light- and $dark- color prefixes for the 5 new color slots', () => {
    const out = toSCSSVarsVariant(variantPair)
    for (const slot of ['muted', 'hairline', 'ink-soft', 'surface-invert', 'on-invert']) {
      expect(out).toContain(`$light-color-${slot}`)
      expect(out).toContain(`$dark-color-${slot}`)
    }
  })

  it('emits shared shadow + radius vars (single light copy — pair guarantees equality)', () => {
    const out = toSCSSVarsVariant(variantPair)
    for (const name of [...SCSS_SHADOW_NAMES, ...SCSS_RADIUS_NAMES]) expect(out).toContain(name + ':')
  })
})

// ── Tailwind ─────────────────────────────────────────────────────────────────

function parseTailwind(raw: string): { theme: { extend: Record<string, unknown> } } {
  const idx = raw.lastIndexOf('export default ')
  return JSON.parse(raw.slice(idx + 'export default '.length))
}

describe('toTailwindConfig — new token emission', () => {
  it('emits theme.extend.colors with all 9 color keys (kebab-case for camel)', () => {
    const obj = parseTailwind(toTailwindConfig(baseTheme))
    const colors = (obj.theme.extend as { colors: Record<string, string> }).colors
    expect(Object.keys(colors).sort()).toEqual([
      'background', 'hairline', 'ink-soft', 'muted', 'on-invert',
      'primary', 'secondary', 'surface-invert', 'text',
    ])
  })

  it('emits theme.extend.boxShadow with 4 keys', () => {
    const obj = parseTailwind(toTailwindConfig(baseTheme))
    const boxShadow = (obj.theme.extend as { boxShadow: Record<string, string> }).boxShadow
    expect(Object.keys(boxShadow).sort()).toEqual(['card', 'float', 'primary', 'secondary'])
  })

  it('emits theme.extend.borderRadius with 5 keys + px suffix', () => {
    const obj = parseTailwind(toTailwindConfig(baseTheme))
    const borderRadius = (obj.theme.extend as { borderRadius: Record<string, string> }).borderRadius
    expect(Object.keys(borderRadius).sort()).toEqual(['lg', 'md', 'pill', 'sm', 'xl'])
    expect(borderRadius.sm).toMatch(/^\d+px$/)
  })
})

describe('toTailwindConfigVariant — new token emission', () => {
  it('emits theme.extend.colors.light + .dark each with 9 keys', () => {
    const obj = parseTailwind(toTailwindConfigVariant(variantPair))
    const colors = (obj.theme.extend as { colors: { light: Record<string, string>; dark: Record<string, string> } }).colors
    expect(Object.keys(colors.light)).toHaveLength(9)
    expect(Object.keys(colors.dark)).toHaveLength(9)
    expect(colors.light).toHaveProperty('ink-soft')
    expect(colors.dark).toHaveProperty('on-invert')
  })

  it('emits boxShadow + borderRadius from the shared (light) values', () => {
    const obj = parseTailwind(toTailwindConfigVariant(variantPair))
    const ext = obj.theme.extend as { boxShadow: Record<string, string>; borderRadius: Record<string, string> }
    expect(Object.keys(ext.boxShadow).sort()).toEqual(['card', 'float', 'primary', 'secondary'])
    expect(Object.keys(ext.borderRadius).sort()).toEqual(['lg', 'md', 'pill', 'sm', 'xl'])
  })
})

// ── Style Dictionary ─────────────────────────────────────────────────────────

describe('toStyleDictionary — new token emission', () => {
  it('emits color group with all 9 keys, each typed "color"', () => {
    const obj = JSON.parse(toStyleDictionary(baseTheme))
    expect(Object.keys(obj.color).sort()).toEqual([
      'background', 'hairline', 'inkSoft', 'muted', 'onInvert',
      'primary', 'secondary', 'surfaceInvert', 'text',
    ])
    for (const k of Object.keys(obj.color)) {
      expect(obj.color[k].type).toBe('color')
    }
  })

  it('emits shadow group with type "boxShadow"', () => {
    const obj = JSON.parse(toStyleDictionary(baseTheme))
    expect(Object.keys(obj.shadow).sort()).toEqual(['card', 'float', 'primary', 'secondary'])
    for (const k of Object.keys(obj.shadow)) {
      expect(obj.shadow[k].type).toBe('boxShadow')
    }
  })

  it('emits radius group with type "dimension" and px values', () => {
    const obj = JSON.parse(toStyleDictionary(baseTheme))
    expect(Object.keys(obj.radius).sort()).toEqual(['lg', 'md', 'pill', 'sm', 'xl'])
    for (const k of Object.keys(obj.radius)) {
      expect(obj.radius[k].type).toBe('dimension')
      expect(obj.radius[k].value).toMatch(/^\d+px$/)
    }
  })
})

describe('toStyleDictionaryVariant — new token emission', () => {
  it('emits light + dark sub-trees each carrying color/shadow/radius groups', () => {
    const obj = JSON.parse(toStyleDictionaryVariant(variantPair))
    for (const branch of ['light', 'dark'] as const) {
      expect(obj[branch].color).toBeDefined()
      expect(obj[branch].shadow).toBeDefined()
      expect(obj[branch].radius).toBeDefined()
      expect(Object.keys(obj[branch].color)).toHaveLength(9)
    }
  })
})

// ── JSON / TS round-trip surface ─────────────────────────────────────────────

describe('toJSON / toTSObject — schema-extended object surfaces new fields', () => {
  it('toJSON includes shadows + radii + 9 color slots', () => {
    const obj = JSON.parse(toJSON(baseTheme))
    expect(Object.keys(obj.colors)).toHaveLength(9)
    expect(obj.shadows).toEqual(baseTheme.shadows)
    expect(obj.radii).toEqual(baseTheme.radii)
  })

  it('toJSONVariant carries shadows + radii under each variant', () => {
    const obj = JSON.parse(toJSONVariant(variantPair))
    expect(obj.light.shadows).toEqual(baseTheme.shadows)
    expect(obj.light.radii).toEqual(baseTheme.radii)
    expect(obj.dark.shadows).toEqual(baseTheme.shadows) // pair guarantees equality
    expect(obj.dark.radii).toEqual(baseTheme.radii)
  })

  it('toTSObject literal contains shadows + radii field names', () => {
    const out = toTSObject(baseTheme)
    expect(out).toContain('"shadows":')
    expect(out).toContain('"radii":')
    expect(out).toContain('"muted":')
    expect(out).toContain('"surfaceInvert":')
  })

  it('toTSObjectVariant literal contains shadows + radii under both variants', () => {
    const out = toTSObjectVariant(variantPair)
    // Two occurrences of "shadows" (one per variant)
    expect((out.match(/"shadows":/g) ?? []).length).toBe(2)
    expect((out.match(/"radii":/g) ?? []).length).toBe(2)
  })
})
