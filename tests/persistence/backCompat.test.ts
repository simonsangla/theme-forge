/**
 * Read back-compat: legacy persisted records (pre-batch-9) load by patching
 * missing color slots / shadows / radii / widget keys from defaults.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { loadTheme, saveTheme } from '../../src/lib/persistence/storage'
import { DEFAULT_THEME } from '../../src/lib/theme/defaults'
import { DEFAULT_WIDGET_SELECTION } from '../../src/schema/widgets'

const STORAGE_KEY = 'theme-forge:active-theme'

beforeEach(() => {
  localStorage.clear()
})

describe('loadTheme — legacy theme back-compat', () => {
  it('patches a 4-color legacy theme (no shadows, no radii) with default values', () => {
    // Legacy v1 record: only 4 color slots, no shadows, no radii
    const legacy = {
      version: 1,
      theme: {
        name: 'Legacy',
        colors: {
          primary: '#0070f3',
          secondary: '#222222',
          background: '#ffffff',
          text: '#000000',
        },
        typography: { fontFamily: 'system-ui, sans-serif', baseSizePx: 16, scaleRatio: 1.25 },
        spacing: { baseUnitPx: 4 },
      },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy))

    const result = loadTheme()
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return

    // Original 4 slots preserved
    expect(result.theme.colors.primary).toBe('#0070f3')
    expect(result.theme.colors.background).toBe('#ffffff')
    // 5 new slots patched from DEFAULT_THEME
    expect(result.theme.colors.muted).toBe(DEFAULT_THEME.colors.muted)
    expect(result.theme.colors.hairline).toBe(DEFAULT_THEME.colors.hairline)
    expect(result.theme.colors.inkSoft).toBe(DEFAULT_THEME.colors.inkSoft)
    expect(result.theme.colors.surfaceInvert).toBe(DEFAULT_THEME.colors.surfaceInvert)
    expect(result.theme.colors.onInvert).toBe(DEFAULT_THEME.colors.onInvert)
    // Shadows + radii patched
    expect(result.theme.shadows).toEqual(DEFAULT_THEME.shadows)
    expect(result.theme.radii).toEqual(DEFAULT_THEME.radii)
  })

  it('preserves user-supplied shadows when present', () => {
    const legacy = {
      version: 1,
      theme: {
        ...DEFAULT_THEME,
        shadows: { ...DEFAULT_THEME.shadows, primary: '0 99px 99px #abc123' },
      },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy))
    const result = loadTheme()
    if (result.status !== 'ok') throw new Error('expected ok')
    expect(result.theme.shadows.primary).toBe('0 99px 99px #abc123')
  })

  it('preserves user-supplied radii when present', () => {
    const legacy = {
      version: 1,
      theme: {
        ...DEFAULT_THEME,
        radii: { ...DEFAULT_THEME.radii, sm: 3, md: 6, lg: 12, xl: 24 },
      },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy))
    const result = loadTheme()
    if (result.status !== 'ok') throw new Error('expected ok')
    expect(result.theme.radii.sm).toBe(3)
    expect(result.theme.radii.xl).toBe(24)
  })
})

describe('loadTheme — legacy widget selection back-compat', () => {
  it('patches an 8-widget legacy selection with the 3 new keys set to false', () => {
    const legacy = {
      version: 1,
      theme: DEFAULT_THEME,
      widgets: {
        button: true,
        card: true,
        'empty-state': false,
        input: true,
        'kpi-tile': false,
        modal: true,
        navbar: false,
        table: true,
        // No badge, pricing-card, testimonial — pre-batch-9 record
      },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy))

    const result = loadTheme()
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return

    // Original 8 keys preserved
    expect(result.widgets.button).toBe(true)
    expect(result.widgets.card).toBe(true)
    expect(result.widgets.navbar).toBe(false)
    // 3 new keys patched from DEFAULT_WIDGET_SELECTION (all false)
    expect(result.widgets.badge).toBe(DEFAULT_WIDGET_SELECTION.badge)
    expect(result.widgets['pricing-card']).toBe(DEFAULT_WIDGET_SELECTION['pricing-card'])
    expect(result.widgets.testimonial).toBe(DEFAULT_WIDGET_SELECTION.testimonial)
  })

  it('returns DEFAULT_WIDGET_SELECTION when widgets field is absent entirely', () => {
    const legacy = { version: 1, theme: DEFAULT_THEME }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy))
    const result = loadTheme()
    if (result.status !== 'ok') throw new Error('expected ok')
    expect(result.widgets).toEqual(DEFAULT_WIDGET_SELECTION)
  })
})

describe('saveTheme + loadTheme round-trip', () => {
  it('round-trips a full modern theme with all groups', () => {
    saveTheme(DEFAULT_THEME, DEFAULT_WIDGET_SELECTION)
    const result = loadTheme()
    if (result.status !== 'ok') throw new Error('expected ok')
    expect(result.theme.colors).toEqual(DEFAULT_THEME.colors)
    expect(result.theme.shadows).toEqual(DEFAULT_THEME.shadows)
    expect(result.theme.radii).toEqual(DEFAULT_THEME.radii)
    expect(result.widgets).toEqual(DEFAULT_WIDGET_SELECTION)
  })

  it('round-trip preserves all 9 color slots after a custom edit', () => {
    const custom = {
      ...DEFAULT_THEME,
      colors: { ...DEFAULT_THEME.colors, muted: '#aabbcc', hairline: '#ddeeff' },
    }
    saveTheme(custom, DEFAULT_WIDGET_SELECTION)
    const result = loadTheme()
    if (result.status !== 'ok') throw new Error('expected ok')
    expect(result.theme.colors.muted).toBe('#aabbcc')
    expect(result.theme.colors.hairline).toBe('#ddeeff')
  })

  it('round-trip preserves widget selection over all 11 IDs', () => {
    const allOn = Object.fromEntries(
      Object.keys(DEFAULT_WIDGET_SELECTION).map(k => [k, true]),
    ) as typeof DEFAULT_WIDGET_SELECTION
    saveTheme(DEFAULT_THEME, allOn)
    const result = loadTheme()
    if (result.status !== 'ok') throw new Error('expected ok')
    expect(result.widgets).toEqual(allOn)
  })
})
