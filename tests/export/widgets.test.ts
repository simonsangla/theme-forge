import { describe, it, expect } from 'vitest'
import {
  toJSON, toJSONVariant,
  toCSSVars, toCSSVarsVariant,
  toTSObject, toTSObjectVariant,
  toTailwindConfig, toTailwindConfigVariant,
  toSCSSVars, toSCSSVarsVariant,
  toStyleDictionary, toStyleDictionaryVariant,
} from '../../src/export/exportTheme'
import type { ThemeConfig, ThemeVariantPair } from '../../src/schema/theme'
import { DEFAULT_WIDGET_SELECTION, type WidgetSelection } from '../../src/schema/widgets'
import { DEFAULT_THEME } from '../../src/lib/theme/defaults'

const baseTheme: ThemeConfig = {
  ...DEFAULT_THEME,
  name: 'wtest',
  colors: {
    ...DEFAULT_THEME.colors,
    primary: '#000000',
    secondary: '#222222',
    background: '#ffffff',
    text: '#111111',
  },
  typography: { fontFamily: 'Inter, sans-serif', baseSizePx: 16, scaleRatio: 1.25 },
  spacing: { baseUnitPx: 4 },
}

const variantPair: ThemeVariantPair = {
  name: 'wtest-pair',
  light: baseTheme,
  dark: {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: '#ffffff',
      secondary: '#dddddd',
      background: '#000000',
      text: '#eeeeee',
    },
  },
}

const someSelected: WidgetSelection = {
  ...DEFAULT_WIDGET_SELECTION,
  button: true,
  card: true,
  table: true,
}

describe('exports — widgets manifest', () => {
  describe('toJSON', () => {
    it('omits widgets when no selection passed (back-compat)', () => {
      const parsed = JSON.parse(toJSON(baseTheme))
      expect(parsed.widgets).toBeUndefined()
    })

    it('emits sorted widgets array when selection passed', () => {
      const parsed = JSON.parse(toJSON(baseTheme, someSelected))
      expect(parsed.widgets).toEqual(['button', 'card', 'table'])
    })

    it('emits empty widgets array when nothing selected', () => {
      const parsed = JSON.parse(toJSON(baseTheme, DEFAULT_WIDGET_SELECTION))
      expect(parsed.widgets).toEqual([])
    })

    it('selection changes alter output (proof of wiring)', () => {
      const a = toJSON(baseTheme, { ...DEFAULT_WIDGET_SELECTION, button: true })
      const b = toJSON(baseTheme, { ...DEFAULT_WIDGET_SELECTION, modal: true })
      expect(a).not.toBe(b)
    })
  })

  describe('toJSONVariant', () => {
    it('omits widgets when no selection passed', () => {
      const parsed = JSON.parse(toJSONVariant(variantPair))
      expect(parsed.widgets).toBeUndefined()
    })

    it('emits widgets when selection passed', () => {
      const parsed = JSON.parse(toJSONVariant(variantPair, someSelected))
      expect(parsed.widgets).toEqual(['button', 'card', 'table'])
    })
  })

  describe('toCSSVars', () => {
    it('omits widgets header without selection', () => {
      expect(toCSSVars(baseTheme)).not.toContain('widgets:')
    })

    it('emits header comment listing selected widgets', () => {
      expect(toCSSVars(baseTheme, someSelected)).toContain('/* widgets: button, card, table */')
    })

    it('emits "(none)" header when selection is empty', () => {
      expect(toCSSVars(baseTheme, DEFAULT_WIDGET_SELECTION)).toContain('/* widgets: (none) */')
    })
  })

  describe('toCSSVarsVariant', () => {
    it('emits header when selection passed', () => {
      expect(toCSSVarsVariant(variantPair, someSelected)).toContain('widgets: button, card, table')
    })
  })

  describe('toTSObject', () => {
    it('omits widgets export without selection', () => {
      expect(toTSObject(baseTheme)).not.toContain('export const widgets')
    })

    it('emits widgets named export with selection', () => {
      const out = toTSObject(baseTheme, someSelected)
      expect(out).toContain('export const widgets =')
      expect(out).toContain('"button"')
      expect(out).toContain('"card"')
      expect(out).toContain('"table"')
    })
  })

  describe('toTSObjectVariant', () => {
    it('emits widgets named export with selection', () => {
      expect(toTSObjectVariant(variantPair, someSelected)).toContain('export const widgets =')
    })
  })

  describe('toTailwindConfig', () => {
    it('omits widgets key without selection', () => {
      const raw = toTailwindConfig(baseTheme)
      const json = raw.slice(raw.lastIndexOf('export default ') + 'export default '.length)
      const obj = JSON.parse(json)
      expect(obj.theme.extend.widgets).toBeUndefined()
    })

    it('emits widgets array under theme.extend with selection', () => {
      const raw = toTailwindConfig(baseTheme, someSelected)
      const json = raw.slice(raw.lastIndexOf('export default ') + 'export default '.length)
      const obj = JSON.parse(json)
      expect(obj.theme.extend.widgets).toEqual(['button', 'card', 'table'])
    })
  })

  describe('toTailwindConfigVariant', () => {
    it('emits widgets array under theme.extend with selection', () => {
      const raw = toTailwindConfigVariant(variantPair, someSelected)
      const json = raw.slice(raw.lastIndexOf('export default ') + 'export default '.length)
      const obj = JSON.parse(json)
      expect(obj.theme.extend.widgets).toEqual(['button', 'card', 'table'])
    })
  })

  describe('toSCSSVars', () => {
    it('omits widgets line without selection', () => {
      expect(toSCSSVars(baseTheme)).not.toContain('$widgets')
    })

    it('emits SCSS list with selected widgets', () => {
      const out = toSCSSVars(baseTheme, someSelected)
      expect(out).toContain('// widgets: button, card, table')
      expect(out).toContain('$widgets: ("button", "card", "table");')
    })

    it('emits empty SCSS list when nothing selected', () => {
      expect(toSCSSVars(baseTheme, DEFAULT_WIDGET_SELECTION)).toContain('$widgets: ();')
    })
  })

  describe('toSCSSVarsVariant', () => {
    it('emits SCSS list with selection', () => {
      expect(toSCSSVarsVariant(variantPair, someSelected)).toContain('$widgets: ("button", "card", "table");')
    })
  })

  describe('toStyleDictionary', () => {
    it('omits widgets group without selection', () => {
      const obj = JSON.parse(toStyleDictionary(baseTheme))
      expect(obj.widgets).toBeUndefined()
    })

    it('emits widgets token group with selection', () => {
      const obj = JSON.parse(toStyleDictionary(baseTheme, someSelected))
      expect(obj.widgets).toEqual({
        button: { value: true, type: 'boolean' },
        card: { value: true, type: 'boolean' },
        table: { value: true, type: 'boolean' },
      })
    })

    it('camelCases dashed widget ids in token keys', () => {
      const obj = JSON.parse(
        toStyleDictionary(baseTheme, { ...DEFAULT_WIDGET_SELECTION, 'kpi-tile': true, 'empty-state': true }),
      )
      expect(obj.widgets.kpiTile).toEqual({ value: true, type: 'boolean' })
      expect(obj.widgets.emptyState).toEqual({ value: true, type: 'boolean' })
    })
  })

  describe('toStyleDictionaryVariant', () => {
    it('emits widgets group with selection', () => {
      const obj = JSON.parse(toStyleDictionaryVariant(variantPair, someSelected))
      expect(obj.widgets.button).toEqual({ value: true, type: 'boolean' })
    })
  })

  describe('determinism', () => {
    it('same selection produces identical output across calls', () => {
      expect(toJSON(baseTheme, someSelected)).toBe(toJSON(baseTheme, someSelected))
      expect(toCSSVars(baseTheme, someSelected)).toBe(toCSSVars(baseTheme, someSelected))
      expect(toStyleDictionary(baseTheme, someSelected)).toBe(toStyleDictionary(baseTheme, someSelected))
    })

    it('insertion-order independence — sorted alphabetically regardless of selection key order', () => {
      const a: WidgetSelection = { ...DEFAULT_WIDGET_SELECTION, table: true, button: true }
      const b: WidgetSelection = { ...DEFAULT_WIDGET_SELECTION, button: true, table: true }
      expect(toJSON(baseTheme, a)).toBe(toJSON(baseTheme, b))
    })
  })
})
