/**
 * Widget manifest schema.
 *
 * Catalog frozen by cavekit-product-boundary R3. Adding/removing/renaming
 * any ID requires a dedicated boundary-revision PR.
 *
 * The export layer reads `WidgetSelection` and emits a deterministic, sorted
 * `widgets` manifest (alphabetical) into every export format.
 */
import { z } from 'zod'

// T-103 — frozen catalog: 11 IDs, alphabetical
export const WIDGET_IDS = [
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
] as const

export type WidgetId = typeof WIDGET_IDS[number]

// T-108 — labels for every catalog ID
export const WIDGET_LABELS: Readonly<Record<WidgetId, string>> = {
  badge: 'Badge',
  button: 'Button',
  card: 'Card',
  'empty-state': 'Empty state',
  input: 'Input',
  'kpi-tile': 'KPI tile',
  modal: 'Modal',
  navbar: 'Navbar',
  'pricing-card': 'Pricing card',
  table: 'Table',
  testimonial: 'Testimonial',
}

// T-107 — selection schema covers all 11 keys, strict
export const WidgetSelectionSchema = z
  .object({
    badge: z.boolean(),
    button: z.boolean(),
    card: z.boolean(),
    'empty-state': z.boolean(),
    input: z.boolean(),
    'kpi-tile': z.boolean(),
    modal: z.boolean(),
    navbar: z.boolean(),
    'pricing-card': z.boolean(),
    table: z.boolean(),
    testimonial: z.boolean(),
  })
  .strict()

export type WidgetSelection = z.infer<typeof WidgetSelectionSchema>

// T-108 — default: every ID off
export const DEFAULT_WIDGET_SELECTION: WidgetSelection = {
  badge: false,
  button: false,
  card: false,
  'empty-state': false,
  input: false,
  'kpi-tile': false,
  modal: false,
  navbar: false,
  'pricing-card': false,
  table: false,
  testimonial: false,
}

/** Returns selected widget IDs in deterministic alphabetical order. */
export function selectedWidgetIds(selection: WidgetSelection): WidgetId[] {
  return WIDGET_IDS.filter(id => selection[id])
}

export interface WidgetValidationResult {
  success: boolean
  data?: WidgetSelection
  errors?: { path: string; message: string }[]
}

export function validateWidgetSelection(input: unknown): WidgetValidationResult {
  const parsed = WidgetSelectionSchema.safeParse(input)
  if (parsed.success) return { success: true, data: parsed.data }
  return {
    success: false,
    errors: parsed.error.issues.map((issue: z.core.$ZodIssue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  }
}
