/**
 * Persistence layer.
 *
 * - T-033 (R1): auto-save active payload to localStorage
 * - T-034 (R2): restore on load (valid → load, missing → default, corrupt → default + notice)
 * - T-035 (R3): clear persisted payload
 * - T-036 (R6): schema versioning — version field in every record
 * - T-037 (R7): storage availability detection
 *
 * The persisted payload carries both the theme AND the widget selection.
 * Read back-compat:
 * - T-109: legacy records lacking the new color slots / shadows / radii
 *   load by patching missing groups with DEFAULT_THEME values
 * - T-110: legacy records lacking widget selection (or missing the 3 new widget
 *   keys) load by patching from DEFAULT_WIDGET_SELECTION
 */

import type { ThemeConfig } from '../../schema/theme'
import { validateThemeConfig } from '../../schema/theme'
import { DEFAULT_THEME } from '../theme/defaults'
import {
  type WidgetSelection,
  validateWidgetSelection,
  DEFAULT_WIDGET_SELECTION,
} from '../../schema/widgets'

const STORAGE_KEY = 'theme-forge:active-theme'
const CURRENT_VERSION = 1

interface PersistedRecord {
  version: number
  theme: unknown
  widgets?: unknown
}

/** T-037: returns true if localStorage is readable/writable */
export function isStorageAvailable(): boolean {
  try {
    const probe = '__tf_probe__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

export type LoadResult =
  | { status: 'ok'; theme: ThemeConfig; widgets: WidgetSelection }
  | { status: 'missing' }
  | { status: 'corrupt'; reason: string }
  | { status: 'unavailable' }

/**
 * T-109 — patch a legacy theme object so it satisfies the current schema.
 *
 * Adds any missing color slots, shadows group, or radii group from
 * DEFAULT_THEME. Existing values are preserved. If the input isn't an object,
 * returns it unchanged so the validator surfaces a structured error.
 */
function patchLegacyTheme(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) return raw
  const r = raw as Record<string, unknown>
  const colors = (typeof r.colors === 'object' && r.colors !== null)
    ? { ...DEFAULT_THEME.colors, ...(r.colors as Record<string, unknown>) }
    : { ...DEFAULT_THEME.colors }
  const shadows = (typeof r.shadows === 'object' && r.shadows !== null)
    ? { ...DEFAULT_THEME.shadows, ...(r.shadows as Record<string, unknown>) }
    : { ...DEFAULT_THEME.shadows }
  const radii = (typeof r.radii === 'object' && r.radii !== null)
    ? { ...DEFAULT_THEME.radii, ...(r.radii as Record<string, unknown>) }
    : { ...DEFAULT_THEME.radii }
  return { ...r, colors, shadows, radii }
}

/**
 * T-110 — patch a legacy widget selection so it satisfies the current schema.
 *
 * Fills in any missing keys (e.g., the 3 new IDs added in batch 9) with
 * `false` from DEFAULT_WIDGET_SELECTION. Existing booleans preserved.
 */
function patchLegacyWidgets(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) return raw
  return { ...DEFAULT_WIDGET_SELECTION, ...(raw as Record<string, unknown>) }
}

/** T-034: load and validate the persisted payload */
export function loadTheme(): LoadResult {
  if (!isStorageAvailable()) return { status: 'unavailable' }

  let raw: string | null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return { status: 'unavailable' }
  }

  if (raw === null) return { status: 'missing' }

  let record: unknown
  try {
    record = JSON.parse(raw)
  } catch {
    return { status: 'corrupt', reason: 'JSON parse failed' }
  }

  // T-036: version check — unknown version → corrupt path
  if (
    typeof record !== 'object' ||
    record === null ||
    typeof (record as PersistedRecord).version !== 'number' ||
    (record as PersistedRecord).version !== CURRENT_VERSION
  ) {
    return { status: 'corrupt', reason: 'unknown schema version' }
  }

  // T-109: patch legacy theme groups before validation so old payloads still load
  const patchedTheme = patchLegacyTheme((record as PersistedRecord).theme)
  const themeResult = validateThemeConfig(patchedTheme)
  if (!themeResult.success) {
    return {
      status: 'corrupt',
      reason: themeResult.errors.map(e => `${e.path}: ${e.message}`).join('; '),
    }
  }

  // T-110: patch legacy widget selection before validation. Missing field -> default.
  // Present-but-non-object stays raw so the validator catches the type error.
  let widgets: WidgetSelection = DEFAULT_WIDGET_SELECTION
  const rawWidgets = (record as PersistedRecord).widgets
  if (rawWidgets !== undefined) {
    const patchedWidgets = patchLegacyWidgets(rawWidgets)
    const widgetResult = validateWidgetSelection(patchedWidgets)
    if (!widgetResult.success || !widgetResult.data) {
      return {
        status: 'corrupt',
        reason: 'widget selection: ' + (widgetResult.errors ?? [])
          .map(e => `${e.path}: ${e.message}`)
          .join('; '),
      }
    }
    widgets = widgetResult.data
  }

  return { status: 'ok', theme: themeResult.data, widgets }
}

export type SaveResult = 'ok' | 'quota' | 'unavailable'

/** T-033: persist the theme + widgets; returns save result for error surfacing */
export function saveTheme(theme: ThemeConfig, widgets: WidgetSelection): SaveResult {
  if (!isStorageAvailable()) return 'unavailable'
  const record: PersistedRecord = { version: CURRENT_VERSION, theme, widgets }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
    return 'ok'
  } catch (err) {
    if (err instanceof DOMException) return 'quota'
    return 'unavailable'
  }
}

/** T-035: clear the persisted record; no-op if missing */
export function clearTheme(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // storage unavailable — silently ignore per R3 "does not error"
  }
}
