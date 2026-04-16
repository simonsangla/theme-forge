/**
 * Widget manifest schema (V1).
 *
 * Constrained, fixed-set widget catalog. No open-ended schema, no per-widget config.
 * Each widget is a boolean: included in export package or not.
 *
 * The export layer reads `WidgetSelection` and emits a deterministic, sorted
 * `widgets` manifest (alphabetical) into every export format.
 */
import { z } from 'zod'

export const WIDGET_IDS = [
  'button',
  'card',
  'empty-state',
  'input',
  'kpi-tile',
  'modal',
  'navbar',
  'table',
] as const

export type WidgetId = typeof WIDGET_IDS[number]

export const WIDGET_LABELS: Readonly<Record<WidgetId, string>> = {
  button: 'Button',
  card: 'Card',
  'empty-state': 'Empty state',
  input: 'Input',
  'kpi-tile': 'KPI tile',
  modal: 'Modal',
  navbar: 'Navbar',
  table: 'Table',
}

export const WidgetSelectionSchema = z
  .object({
    button: z.boolean(),
    card: z.boolean(),
    'empty-state': z.boolean(),
    input: z.boolean(),
    'kpi-tile': z.boolean(),
    modal: z.boolean(),
    navbar: z.boolean(),
    table: z.boolean(),
  })
  .strict()

export type WidgetSelection = z.infer<typeof WidgetSelectionSchema>

/** Default selection — all off. User opts in. */
export const DEFAULT_WIDGET_SELECTION: WidgetSelection = {
  button: false,
  card: false,
  'empty-state': false,
  input: false,
  'kpi-tile': false,
  modal: false,
  navbar: false,
  table: false,
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
