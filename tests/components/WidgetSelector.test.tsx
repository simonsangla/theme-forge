import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WidgetSelector from '../../src/components/WidgetSelector/WidgetSelector'
import {
  WIDGET_IDS,
  WIDGET_LABELS,
  DEFAULT_WIDGET_SELECTION,
  selectedWidgetIds,
  type WidgetSelection,
} from '../../src/schema/widgets'
import { toJSON } from '../../src/export/exportTheme'
import type { ThemeConfig } from '../../src/schema/theme'
import { DEFAULT_THEME } from '../../src/lib/theme/defaults'

const sampleTheme: ThemeConfig = {
  ...DEFAULT_THEME,
  name: 'sample',
  colors: {
    ...DEFAULT_THEME.colors,
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#ffffff',
    text: '#111827',
  },
  typography: { fontFamily: 'Inter, sans-serif', baseSizePx: 16, scaleRatio: 1.25 },
  spacing: { baseUnitPx: 4 },
}

/** Test harness: renders the controlled selector and exposes the live selection. */
function Harness({
  initial = DEFAULT_WIDGET_SELECTION,
  onSelectionChange,
}: {
  initial?: WidgetSelection
  onSelectionChange?: (s: WidgetSelection) => void
}) {
  const [selection, setSelection] = useState<WidgetSelection>(initial)
  return (
    <WidgetSelector
      selection={selection}
      onChange={next => {
        setSelection(next)
        onSelectionChange?.(next)
      }}
    />
  )
}

describe('WidgetSelector — preview-card surface', () => {
  it('renders one toggle per widget id', () => {
    render(<Harness />)
    const toggles = screen.getAllByRole('switch')
    expect(toggles).toHaveLength(WIDGET_IDS.length)
  })

  it('every toggle has accessible name matching WIDGET_LABELS', () => {
    render(<Harness />)
    for (const id of WIDGET_IDS) {
      const toggle = screen.getByRole('switch', { name: WIDGET_LABELS[id] })
      expect(toggle).toBeInTheDocument()
    }
  })

  it('aria-checked reflects selection state', () => {
    const initial: WidgetSelection = { ...DEFAULT_WIDGET_SELECTION, button: true }
    render(<Harness initial={initial} />)
    expect(screen.getByRole('switch', { name: 'Button' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('switch', { name: 'Card' })).toHaveAttribute('aria-checked', 'false')
  })

  it('clicking a toggle calls onChange with that id flipped', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<WidgetSelector selection={DEFAULT_WIDGET_SELECTION} onChange={onChange} />)
    await user.click(screen.getByRole('switch', { name: 'Button' }))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ ...DEFAULT_WIDGET_SELECTION, button: true }),
    )
  })

  it('Select all turns every widget on; Clear turns them all off', async () => {
    const user = userEvent.setup()
    let latest: WidgetSelection = DEFAULT_WIDGET_SELECTION
    render(<Harness onSelectionChange={s => { latest = s }} />)

    await user.click(screen.getByRole('button', { name: /select all/i }))
    for (const id of WIDGET_IDS) expect(latest[id]).toBe(true)

    await user.click(screen.getByRole('button', { name: /^clear$/i }))
    for (const id of WIDGET_IDS) expect(latest[id]).toBe(false)
  })

  it('count badge updates as selection changes', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.getByText(`0/${WIDGET_IDS.length} selected`)).toBeInTheDocument()
    await user.click(screen.getByRole('switch', { name: 'Modal' }))
    expect(screen.getByText(`1/${WIDGET_IDS.length} selected`)).toBeInTheDocument()
  })
})

describe('WidgetSelector — kpi-tile variant toggle (T-134/T-135)', () => {
  it('renders the kpi-tile variant toggle with two pressable options', () => {
    render(<Harness />)
    expect(screen.getByRole('button', { name: 'Tile variant' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Metric variant' })).toBeInTheDocument()
  })

  it('defaults to tile variant on mount (Tile pressed, Metric not)', () => {
    render(<Harness />)
    expect(screen.getByRole('button', { name: 'Tile variant' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Metric variant' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking Metric flips aria-pressed and switches preview to data-variant="metric"', async () => {
    const user = userEvent.setup()
    const { container } = render(<Harness />)
    expect(container.querySelector('[data-widget-preview="kpi-tile"]')).toHaveAttribute('data-variant', 'tile')
    await user.click(screen.getByRole('button', { name: 'Metric variant' }))
    expect(screen.getByRole('button', { name: 'Tile variant' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Metric variant' })).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('[data-widget-preview="kpi-tile"]')).toHaveAttribute('data-variant', 'metric')
  })

  it('clicking the variant toggle does NOT change the kpi-tile selection (sibling structure isolates events)', async () => {
    const user = userEvent.setup()
    let latest: WidgetSelection = DEFAULT_WIDGET_SELECTION
    render(<Harness onSelectionChange={s => { latest = s }} />)
    const before = latest['kpi-tile']
    await user.click(screen.getByRole('button', { name: 'Metric variant' }))
    expect(latest['kpi-tile']).toBe(before)
  })

  it('only the kpi-tile widget exposes a variant toggle (no other widget gains config UI)', () => {
    const { container } = render(<Harness />)
    // exactly one variant-toggle row in the entire selector
    const toggles = container.querySelectorAll('[data-testid="kpi-tile-variant-toggle"]')
    expect(toggles).toHaveLength(1)
  })

  // T-146 / cavekit-widgets R4 (revised) — toggle is operable regardless of selection state
  it('renders + responds to clicks even when kpi-tile is excluded from selection', async () => {
    const user = userEvent.setup()
    const allOff: WidgetSelection = { ...DEFAULT_WIDGET_SELECTION }
    const { container } = render(<Harness initial={allOff} />)
    // kpi-tile is unselected
    expect(screen.getByRole('switch', { name: 'KPI tile' })).toHaveAttribute('aria-checked', 'false')
    // variant toggle still rendered
    expect(container.querySelectorAll('[data-testid="kpi-tile-variant-toggle"]')).toHaveLength(1)
    // and still operable
    await user.click(screen.getByRole('button', { name: 'Metric variant' }))
    expect(container.querySelector('[data-widget-preview="kpi-tile"]')).toHaveAttribute('data-variant', 'metric')
  })
})

describe('WidgetSelector → export linkage', () => {
  it('clicking two cards yields a JSON export containing those two widgets in alphabetical order', async () => {
    const user = userEvent.setup()
    let latest: WidgetSelection = DEFAULT_WIDGET_SELECTION
    render(<Harness onSelectionChange={s => { latest = s }} />)

    await user.click(screen.getByRole('switch', { name: 'Table' }))
    await user.click(screen.getByRole('switch', { name: 'Button' }))

    expect(selectedWidgetIds(latest)).toEqual(['button', 'table'])

    const exportObj = JSON.parse(toJSON(sampleTheme, latest))
    expect(exportObj.widgets).toEqual(['button', 'table'])
  })

  it('toggling a card off removes it from the next export', async () => {
    const user = userEvent.setup()
    let latest: WidgetSelection = { ...DEFAULT_WIDGET_SELECTION, button: true, card: true }
    render(<Harness initial={latest} onSelectionChange={s => { latest = s }} />)

    expect(JSON.parse(toJSON(sampleTheme, latest)).widgets).toEqual(['button', 'card'])

    await user.click(screen.getByRole('switch', { name: 'Button' }))

    expect(JSON.parse(toJSON(sampleTheme, latest)).widgets).toEqual(['card'])
  })
})
