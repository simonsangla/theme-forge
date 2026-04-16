import { describe, it, expect } from 'vitest'
import {
  WIDGET_IDS,
  WIDGET_LABELS,
  WidgetSelectionSchema,
  DEFAULT_WIDGET_SELECTION,
  selectedWidgetIds,
  validateWidgetSelection,
} from '../../src/schema/widgets'

describe('widget catalog', () => {
  it('is the canonical 11-widget catalog (boundary R3)', () => {
    expect(WIDGET_IDS).toEqual([
      'badge',
      'button',
      'card',
      'empty-state',
      'input',
      'kpi-tile',
      'modal',
      'navbar',
      'pricing-card',
      'table',
      'testimonial',
    ])
  })

  it('catalog has exactly 11 IDs', () => {
    expect(WIDGET_IDS.length).toBe(11)
  })

  it('includes the 3 batch-9 additions: badge, pricing-card, testimonial', () => {
    expect(WIDGET_IDS).toContain('badge')
    expect(WIDGET_IDS).toContain('pricing-card')
    expect(WIDGET_IDS).toContain('testimonial')
  })

  it('every id has a human label', () => {
    for (const id of WIDGET_IDS) {
      expect(WIDGET_LABELS[id]).toBeTruthy()
    }
  })

  it('default selection has all widgets off', () => {
    for (const id of WIDGET_IDS) {
      expect(DEFAULT_WIDGET_SELECTION[id]).toBe(false)
    }
  })
})

describe('WidgetSelectionSchema', () => {
  it('accepts a valid selection', () => {
    const result = WidgetSelectionSchema.safeParse(DEFAULT_WIDGET_SELECTION)
    expect(result.success).toBe(true)
  })

  it('rejects missing keys', () => {
    const partial = { ...DEFAULT_WIDGET_SELECTION } as Record<string, unknown>
    delete partial.button
    expect(WidgetSelectionSchema.safeParse(partial).success).toBe(false)
  })

  it('rejects extra keys (strict)', () => {
    const extra = { ...DEFAULT_WIDGET_SELECTION, dropdown: true }
    expect(WidgetSelectionSchema.safeParse(extra).success).toBe(false)
  })

  it('rejects non-boolean values', () => {
    const bad = { ...DEFAULT_WIDGET_SELECTION, button: 'yes' }
    expect(WidgetSelectionSchema.safeParse(bad).success).toBe(false)
  })
})

describe('selectedWidgetIds', () => {
  it('returns empty list when nothing selected', () => {
    expect(selectedWidgetIds(DEFAULT_WIDGET_SELECTION)).toEqual([])
  })

  it('returns ids in deterministic alphabetical order', () => {
    const sel = { ...DEFAULT_WIDGET_SELECTION, table: true, button: true, modal: true }
    expect(selectedWidgetIds(sel)).toEqual(['button', 'modal', 'table'])
  })

  it('returns all ids when all selected', () => {
    const all = Object.fromEntries(WIDGET_IDS.map(id => [id, true])) as typeof DEFAULT_WIDGET_SELECTION
    expect(selectedWidgetIds(all)).toEqual([...WIDGET_IDS])
  })
})

describe('validateWidgetSelection', () => {
  it('returns success + data for valid input', () => {
    const result = validateWidgetSelection(DEFAULT_WIDGET_SELECTION)
    expect(result.success).toBe(true)
    expect(result.data).toEqual(DEFAULT_WIDGET_SELECTION)
  })

  it('returns errors with paths for invalid input', () => {
    const result = validateWidgetSelection({ button: 'no' })
    expect(result.success).toBe(false)
    expect(result.errors?.length).toBeGreaterThan(0)
  })
})
