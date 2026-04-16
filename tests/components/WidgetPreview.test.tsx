/**
 * WidgetPreview rendering tests — every catalog ID renders, kpi-tile metric
 * variant renders distinct content from the default tile.
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import WidgetPreview from '../../src/components/WidgetSelector/WidgetPreview'
import { WIDGET_IDS } from '../../src/schema/widgets'

describe('WidgetPreview — catalog coverage', () => {
  for (const id of WIDGET_IDS) {
    it(`renders widget "${id}" with data-widget-preview marker`, () => {
      const { container } = render(<WidgetPreview widget={id} />)
      const el = container.querySelector(`[data-widget-preview="${id}"]`)
      expect(el).not.toBeNull()
    })
  }

  it('every catalog ID produces a unique data-widget-preview marker', () => {
    const markers = new Set<string>()
    for (const id of WIDGET_IDS) {
      const { container } = render(<WidgetPreview widget={id} />)
      const el = container.querySelector('[data-widget-preview]')
      expect(el).not.toBeNull()
      markers.add(el!.getAttribute('data-widget-preview')!)
    }
    expect(markers.size).toBe(WIDGET_IDS.length)
  })
})

describe('WidgetPreview — kpi-tile metric variant', () => {
  it('renders kpi-tile in default tile mode without variant prop', () => {
    const { container } = render(<WidgetPreview widget="kpi-tile" />)
    const el = container.querySelector('[data-widget-preview="kpi-tile"]')
    expect(el).not.toBeNull()
    expect(el!.getAttribute('data-variant')).toBe('tile')
  })

  it('renders kpi-tile in tile mode when variant="tile"', () => {
    const { container } = render(<WidgetPreview widget="kpi-tile" variant="tile" />)
    const el = container.querySelector('[data-widget-preview="kpi-tile"]')
    expect(el!.getAttribute('data-variant')).toBe('tile')
  })

  it('renders kpi-tile in metric mode when variant="metric"', () => {
    const { container } = render(<WidgetPreview widget="kpi-tile" variant="metric" />)
    const el = container.querySelector('[data-widget-preview="kpi-tile"]')
    expect(el!.getAttribute('data-variant')).toBe('metric')
  })

  it('metric variant renders distinct innerHTML from tile variant', () => {
    const { container: tile } = render(<WidgetPreview widget="kpi-tile" variant="tile" />)
    const { container: metric } = render(<WidgetPreview widget="kpi-tile" variant="metric" />)
    expect(tile.innerHTML).not.toBe(metric.innerHTML)
  })
})

describe('WidgetPreview — new batch-9 widgets', () => {
  it('renders badge', () => {
    const { container } = render(<WidgetPreview widget="badge" />)
    expect(container.querySelector('[data-widget-preview="badge"]')).not.toBeNull()
  })

  it('renders pricing-card', () => {
    const { container } = render(<WidgetPreview widget="pricing-card" />)
    expect(container.querySelector('[data-widget-preview="pricing-card"]')).not.toBeNull()
  })

  it('renders testimonial', () => {
    const { container } = render(<WidgetPreview widget="testimonial" />)
    expect(container.querySelector('[data-widget-preview="testimonial"]')).not.toBeNull()
  })
})
