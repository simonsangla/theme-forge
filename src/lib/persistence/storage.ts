/**
 * T-033-T-039: Persistence layer
 *
 * - T-033 (R1): auto-save active theme to localStorage
 * - T-034 (R2): restore on load (valid → load, missing → default, corrupt → default + notice)
 * - T-035 (R3): clear persisted theme
 * - T-036 (R6): schema versioning — version field in every record
 * - T-037 (R7): storage availability detection
 */

import type { ThemeConfig } from '../../schema/theme'
import { validateThemeConfig } from '../../schema/theme'

const STORAGE_KEY = 'theme-forge:active-theme'
const CURRENT_VERSION = 1

interface PersistedRecord {
  version: number
  theme: unknown
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
  | { status: 'ok'; theme: ThemeConfig }
  | { status: 'missing' }
  | { status: 'corrupt'; reason: string }
  | { status: 'unavailable' }

/** T-034: load and validate the persisted theme */
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

  const result = validateThemeConfig((record as PersistedRecord).theme)
  if (!result.success) {
    return { status: 'corrupt', reason: result.errors.map(e => `${e.path}: ${e.message}`).join('; ') }
  }

  return { status: 'ok', theme: result.data }
}

export type SaveResult = 'ok' | 'quota' | 'unavailable'

/** T-033: persist the theme; returns save result for error surfacing */
export function saveTheme(theme: ThemeConfig): SaveResult {
  if (!isStorageAvailable()) return 'unavailable'
  const record: PersistedRecord = { version: CURRENT_VERSION, theme }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
    return 'ok'
  } catch (err) {
    // DOMException name varies by browser; quota exceeded is the common case
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
