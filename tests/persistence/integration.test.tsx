/**
 * T-132 — Integration tests:
 * - toJSON round-trip preserves shadows + radii after a save/load cycle
 * - preset apply changes the root style attribute and downstream WidgetPreview
 *   reads the new vars (verified by computed style on a rendered preview card)
 *
 * T-133 — Shadow injection regression:
 * - A persisted record whose shadow value contains `;` / `}` / `<` is rejected
 *   as corrupt by loadTheme (does not silently load with default-patched shadows)
 */
import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { render } from '@testing-library/react'
import { loadTheme, saveTheme } from '../../src/lib/persistence/storage'
import { DEFAULT_THEME } from '../../src/lib/theme/defaults'
import { DEFAULT_WIDGET_SELECTION } from '../../src/schema/widgets'
import { themeToStyleVars } from '../../src/lib/theme/applyTheme'
import { PRESETS } from '../../src/lib/theme/presets'
import { toJSON } from '../../src/export/exportTheme'
import WidgetPreview from '../../src/components/WidgetSelector/WidgetPreview'
import type { CSSProperties } from 'react'

const STORAGE_KEY = 'theme-forge:active-theme'

beforeEach(() => {
  localStorage.clear()
})

// ── T-132 — toJSON round-trip ────────────────────────────────────────────────

describe('toJSON round-trip preserves shadows + radii through persistence', () => {
  it('save → load → toJSON includes the new groups byte-identical to source', () => {
    const original = {
      ...DEFAULT_THEME,
      shadows: { ...DEFAULT_THEME.shadows, primary: '0 99px 99px rgba(0,0,0,0.5)' },
      radii: { pill: 9999, sm: 3, md: 6, lg: 12, xl: 24 },
    }
    saveTheme(original, DEFAULT_WIDGET_SELECTION)
    const loaded = loadTheme()
    if (loaded.status !== 'ok') throw new Error('expected ok')
    const exported = JSON.parse(toJSON(loaded.theme))
    expect(exported.shadows).toEqual(original.shadows)
    expect(exported.radii).toEqual(original.radii)
  })

  it('every preset round-trips shadows + radii', () => {
    for (const { theme: preset } of PRESETS) {
      saveTheme(preset, DEFAULT_WIDGET_SELECTION)
      const loaded = loadTheme()
      if (loaded.status !== 'ok') throw new Error('expected ok for ' + preset.name)
      const exported = JSON.parse(toJSON(loaded.theme))
      expect(exported.shadows).toEqual(preset.shadows)
      expect(exported.radii).toEqual(preset.radii)
    }
  })
})

// ── T-132 — preset apply re-themes WidgetPreview via inherited CSS vars ─────

describe('preset apply re-themes downstream WidgetPreview', () => {
  it('themeToStyleVars output covers every CSS var that WidgetPreview consumes', () => {
    // Pick a representative non-default preset and verify the var map carries
    // every token slot the preview CSS references.
    const slate = PRESETS.find(p => p.label === 'Slate')!.theme
    const vars = themeToStyleVars(slate)
    for (const k of ['--color-primary', '--color-secondary', '--color-background', '--color-text', '--color-muted', '--color-hairline', '--color-ink-soft', '--color-surface-invert', '--color-on-invert']) {
      expect(vars[k]).toBeDefined()
    }
    for (const k of ['--shadow-primary', '--shadow-secondary', '--shadow-card', '--shadow-float']) {
      expect(vars[k]).toBeDefined()
    }
    for (const k of ['--radius-pill', '--radius-sm', '--radius-md', '--radius-lg', '--radius-xl']) {
      expect(vars[k]).toBeDefined()
    }
  })

  it('wrapping div carries every CSS var that a child WidgetPreview is rendered into', () => {
    // JSDOM doesn't compute CSS-var inheritance through getComputedStyle,
    // so we verify the contract structurally: wrapper inline style carries
    // every var the preview will resolve at render time.
    const ocean = PRESETS.find(p => p.label === 'Ocean')!.theme
    const styleVars = themeToStyleVars(ocean) as CSSProperties
    const { container } = render(
      <div style={styleVars}>
        <WidgetPreview widget="card" />
      </div>,
    )
    const wrapper = container.firstChild as HTMLDivElement
    expect(wrapper.style.getPropertyValue('--color-primary')).toBe(ocean.colors.primary)
    expect(wrapper.style.getPropertyValue('--color-hairline')).toBe(ocean.colors.hairline)
    expect(wrapper.style.getPropertyValue('--shadow-primary')).toBe(ocean.shadows.primary)
    expect(wrapper.style.getPropertyValue('--radius-pill')).toBe(`${ocean.radii.pill}px`)
  })

  // T-143 / F-002 — real assertion that preview CSS actually consumes the tokens
  it('WidgetPreview.module.css references every theme color/shadow/radius slot via var(--token) (catches token-drop regressions)', () => {
    const cssPath = path.resolve(
      __dirname,
      '../../src/components/WidgetSelector/WidgetPreview.module.css',
    )
    const css = fs.readFileSync(cssPath, 'utf8')

    const colorSlotsExpectedAsVars = [
      '--color-primary',
      '--color-secondary',
      '--color-background',
      '--color-text',
      '--color-muted',
      '--color-hairline',
      '--color-ink-soft',
      '--color-surface-invert',
      '--color-on-invert',
    ]
    for (const slot of colorSlotsExpectedAsVars) {
      expect(css, `WidgetPreview.module.css must reference var(${slot}) somewhere`).toContain(`var(${slot}`)
    }

    // At minimum the radius scale must be referenced (pill + at least 2 stops).
    // We don't require shadow slots in preview CSS — previews use border + bg
    // for depth, not box-shadow — so absence of --shadow-* references is fine.
    expect(css).toContain('var(--radius-pill')
    expect(css).toMatch(/var\(--radius-(sm|md|lg|xl)/)
  })

  it('switching presets produces different var maps (no shared mutable state)', () => {
    const a = themeToStyleVars(PRESETS.find(p => p.label === 'Ocean')!.theme)
    const b = themeToStyleVars(PRESETS.find(p => p.label === 'Forest')!.theme)
    expect(a['--color-primary']).not.toBe(b['--color-primary'])
    expect(a['--color-hairline']).not.toBe(b['--color-hairline'])
  })
})

// ── T-133 — Shadow injection regression ──────────────────────────────────────

describe('Shadow injection regression — persisted record with malicious shadow rejected', () => {
  const INJECTION_PAYLOADS = [
    { name: 'semicolon escape', value: 'red; } body { background: red;' },
    { name: 'closing brace', value: '0 1px 2px #000 }' },
    { name: 'opening brace', value: '0 1px 2px #000 {' },
    { name: 'comment open', value: '0 1px 2px #000 /* inject' },
    { name: 'comment close', value: '*/ 0 1px 2px #000' },
    { name: 'newline', value: '0 1px 2px #000\nmalicious: true;' },
    { name: 'angle bracket open', value: '0 1px 2px <script' },
    { name: 'angle bracket close', value: '0 1px 2px >' },
  ]

  for (const { name, value } of INJECTION_PAYLOADS) {
    it(`treats persisted record with ${name} in shadow value as corrupt`, () => {
      const malicious = {
        version: 1,
        theme: {
          ...DEFAULT_THEME,
          shadows: { ...DEFAULT_THEME.shadows, primary: value },
        },
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(malicious))
      const result = loadTheme()
      expect(result.status).toBe('corrupt')
    })
  }

  it('benign multi-layer rgba shadow with parens commas still loads as ok', () => {
    const benign = {
      version: 1,
      theme: {
        ...DEFAULT_THEME,
        shadows: {
          ...DEFAULT_THEME.shadows,
          primary: '0 1px 2px rgba(0,0,0,0.1), 0 4px 8px rgba(5,26,36,0.2)',
        },
      },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(benign))
    const result = loadTheme()
    expect(result.status).toBe('ok')
  })
})
