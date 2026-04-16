import { useState, type ReactNode } from 'react'
import type { ThemeConfig } from '../../schema/theme'
import {
  validateColorTokens,
  validateTypographyTokens,
  validateSpacingTokens,
  validateShadowTokens,
  validateRadiusTokens,
} from '../../schema/theme'
import { PRESETS } from '../../lib/theme/presets'
import styles from './ThemeEditor.module.css'

const FONT_OPTIONS = [
  { label: 'System', value: 'system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'ui-monospace, monospace' },
  { label: 'Inter', value: 'Inter, sans-serif' },
]

const COLOR_SLOTS = [
  'primary',
  'secondary',
  'background',
  'text',
  'muted',
  'hairline',
  'inkSoft',
  'surfaceInvert',
  'onInvert',
] as const satisfies ReadonlyArray<keyof ThemeConfig['colors']>

const SHADOW_SLOTS = ['primary', 'secondary', 'card', 'float'] as const satisfies ReadonlyArray<keyof ThemeConfig['shadows']>
const RADIUS_SLOTS = ['pill', 'sm', 'md', 'lg', 'xl'] as const satisfies ReadonlyArray<keyof ThemeConfig['radii']>

interface Props {
  theme: ThemeConfig
  onColorsChange: (c: Partial<ThemeConfig['colors']>) => void
  onTypographyChange: (t: Partial<ThemeConfig['typography']>) => void
  onSpacingChange: (s: Partial<ThemeConfig['spacing']>) => void
  onShadowsChange: (s: Partial<ThemeConfig['shadows']>) => void
  onRadiiChange: (r: Partial<ThemeConfig['radii']>) => void
  onNameChange: (name: string) => void
  onPresetApply: (preset: ThemeConfig) => void
  onReset: () => void
  onAdoptTheme: (candidate: unknown) => { success: boolean; errors?: Array<{ path: string; message: string }> }
}

type ColorErrorKeys = typeof COLOR_SLOTS[number]
type ShadowErrorKeys = `shadow-${typeof SHADOW_SLOTS[number]}`
type RadiusErrorKeys = `radius-${typeof RADIUS_SLOTS[number]}`
type Errors = Partial<Record<
  ColorErrorKeys | ShadowErrorKeys | RadiusErrorKeys |
  'fontFamily' | 'baseSizePx' | 'scaleRatio' | 'baseUnitPx' | 'name',
  string
>>

function colorLabel(slot: typeof COLOR_SLOTS[number]): string {
  // 'inkSoft' → 'Ink soft', 'surfaceInvert' → 'Surface invert'
  return slot
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, c => c.toUpperCase())
}

/**
 * Collapsible section — native <details>/<summary> so contents stay in the DOM
 * for queries + a11y. Styled to match the existing `.sectionTitle` weight via
 * matching CSS rules. `defaultOpen` is locked to the `open` attribute at mount.
 */
function Collapsible({
  title,
  defaultOpen,
  children,
}: {
  title: string
  defaultOpen: boolean
  children: ReactNode
}) {
  return (
    <details className={styles.collapsible} open={defaultOpen}>
      <summary className={styles.summary}>
        <span className={styles.summaryTitle}>{title}</span>
        <span className={styles.summaryChevron} aria-hidden>▾</span>
      </summary>
      <div className={styles.collapsibleBody}>{children}</div>
    </details>
  )
}

export default function ThemeEditor({
  theme,
  onColorsChange,
  onTypographyChange,
  onSpacingChange,
  onShadowsChange,
  onRadiiChange,
  onNameChange,
  onPresetApply,
  onReset,
}: Props) {
  const [errors, setErrors] = useState<Errors>({})
  // Local hex draft for color text inputs (so user can type partial values).
  const [hexDraft, setHexDraft] = useState({ ...theme.colors })
  // Local string draft for shadow textareas.
  const [shadowDraft, setShadowDraft] = useState({ ...theme.shadows })
  // Local number draft for radius inputs.
  const [radiusDraft, setRadiusDraft] = useState({ ...theme.radii })
  // Sync drafts when theme changes externally (undo/redo/preset).
  const [prevTheme, setPrevTheme] = useState(theme)
  if (prevTheme !== theme) {
    setPrevTheme(theme)
    setHexDraft({ ...theme.colors })
    setShadowDraft({ ...theme.shadows })
    setRadiusDraft({ ...theme.radii })
    setErrors({})
  }

  // ── Color controls ──────────────────────────────────────────────────────────

  const handleColorPicker = (slot: typeof COLOR_SLOTS[number]) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHexDraft(prev => ({ ...prev, [slot]: val }))
    setErrors(prev => ({ ...prev, [slot]: undefined }))
    onColorsChange({ [slot]: val })
  }

  const handleHexText = (slot: typeof COLOR_SLOTS[number]) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHexDraft(prev => ({ ...prev, [slot]: val }))
    const result = validateColorTokens({ ...theme.colors, [slot]: val })
    if (result.success) {
      setErrors(prev => ({ ...prev, [slot]: undefined }))
      onColorsChange({ [slot]: val })
    } else {
      const err = result.errors.find(r => r.path === slot)
      setErrors(prev => ({ ...prev, [slot]: err?.message ?? 'Invalid hex color' }))
    }
  }

  // ── Typography controls ─────────────────────────────────────────────────────

  const handleFontFamily = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    const result = validateTypographyTokens({ ...theme.typography, fontFamily: val })
    if (result.success) {
      setErrors(prev => ({ ...prev, fontFamily: undefined }))
      onTypographyChange({ fontFamily: val })
    } else {
      setErrors(prev => ({ ...prev, fontFamily: 'Invalid font family' }))
    }
  }

  const handleBaseSizePx = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    const result = validateTypographyTokens({ ...theme.typography, baseSizePx: val })
    if (result.success) {
      setErrors(prev => ({ ...prev, baseSizePx: undefined }))
      onTypographyChange({ baseSizePx: val })
    } else {
      const err = result.errors.find(r => r.path === 'baseSizePx')
      setErrors(prev => ({ ...prev, baseSizePx: err?.message ?? 'Out of range' }))
    }
  }

  const handleScaleRatio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.round(Number(e.target.value) * 100) / 100
    const result = validateTypographyTokens({ ...theme.typography, scaleRatio: val })
    if (result.success) {
      setErrors(prev => ({ ...prev, scaleRatio: undefined }))
      onTypographyChange({ scaleRatio: val })
    } else {
      const err = result.errors.find(r => r.path === 'scaleRatio')
      setErrors(prev => ({ ...prev, scaleRatio: err?.message ?? 'Out of range' }))
    }
  }

  // ── Spacing controls ────────────────────────────────────────────────────────

  const handleBaseUnit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    const result = validateSpacingTokens({ baseUnitPx: val })
    if (result.success) {
      setErrors(prev => ({ ...prev, baseUnitPx: undefined }))
      onSpacingChange({ baseUnitPx: val })
    } else {
      const err = result.errors.find(r => r.path === 'baseUnitPx')
      setErrors(prev => ({ ...prev, baseUnitPx: err?.message ?? 'Out of range' }))
    }
  }

  // ── Shadow controls (T-125) ────────────────────────────────────────────────

  const handleShadow = (slot: typeof SHADOW_SLOTS[number]) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setShadowDraft(prev => ({ ...prev, [slot]: val }))
    const errKey = `shadow-${slot}` as const
    const result = validateShadowTokens({ ...theme.shadows, [slot]: val })
    if (result.success) {
      setErrors(prev => ({ ...prev, [errKey]: undefined }))
      onShadowsChange({ [slot]: val })
    } else {
      const err = result.errors.find(r => r.path === slot)
      setErrors(prev => ({ ...prev, [errKey]: err?.message ?? 'Invalid box-shadow' }))
    }
  }

  // ── Radius controls (T-126) ────────────────────────────────────────────────

  const handleRadius = (slot: typeof RADIUS_SLOTS[number]) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setRadiusDraft(prev => ({ ...prev, [slot]: val }))
    const errKey = `radius-${slot}` as const
    const result = validateRadiusTokens({ ...theme.radii, [slot]: val })
    if (result.success) {
      setErrors(prev => ({ ...prev, [errKey]: undefined }))
      onRadiiChange({ [slot]: val })
    } else {
      const err = result.errors.find(r => r.path === slot || r.path === '')
      setErrors(prev => ({ ...prev, [errKey]: err?.message ?? 'Invalid radius' }))
    }
  }

  // ── Name control ────────────────────────────────────────────────────────────

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!val.trim()) {
      setErrors(prev => ({ ...prev, name: 'Name cannot be empty' }))
    } else {
      setErrors(prev => ({ ...prev, name: undefined }))
      onNameChange(val)
    }
  }

  return (
    <div className={styles.editor}>
      {/* ── Identity (name + presets) ────────────────────────────────────── */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>Identity</p>
        <label className={styles.stackField}>
          <input
            className={styles.textInput}
            type="text"
            defaultValue={theme.name}
            key={theme.name}
            onChange={handleName}
            placeholder="Theme name"
            aria-label="Theme name"
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </label>

        <p className={styles.subsectionTitle}>Presets</p>
        <div className={styles.presetGrid}>
          {PRESETS.map(({ label, theme: preset }) => (
            <button
              key={label}
              type="button"
              className={styles.presetBtn}
              onClick={() => onPresetApply(preset)}
              style={{ borderColor: preset.colors.primary }}
            >
              <span
                className={styles.presetSwatch}
                style={{ background: preset.colors.primary }}
              />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Colors (9 slots) ─────────────────────────────────────────────── */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>Colors</p>
        {COLOR_SLOTS.map(slot => (
          <div key={slot} className={styles.colorRow}>
            <label className={styles.field}>
              <span className={styles.slotLabel}>{colorLabel(slot)}</span>
              <div className={styles.colorInputs}>
                <input
                  type="color"
                  value={hexDraft[slot]}
                  onChange={handleColorPicker(slot)}
                  className={styles.colorPicker}
                  aria-label={`${colorLabel(slot)} color picker`}
                />
                <input
                  type="text"
                  value={hexDraft[slot]}
                  onChange={handleHexText(slot)}
                  className={styles.hexText}
                  maxLength={7}
                  spellCheck={false}
                  aria-label={`${colorLabel(slot)} hex value`}
                />
              </div>
            </label>
            {errors[slot] && <span className={styles.error}>{errors[slot]}</span>}
          </div>
        ))}
      </section>

      {/* ── Typography ───────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>Typography</p>

        <label className={styles.field}>
          <span>Font</span>
          <select
            value={theme.typography.fontFamily}
            onChange={handleFontFamily}
            className={styles.select}
          >
            {FONT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        {errors.fontFamily && <span className={styles.error}>{errors.fontFamily}</span>}

        <label className={styles.field}>
          <span>Base size <em>{theme.typography.baseSizePx}px</em></span>
          <input
            type="range"
            min={8}
            max={32}
            step={1}
            value={theme.typography.baseSizePx}
            onChange={handleBaseSizePx}
            className={styles.range}
            aria-label="Base font size"
          />
        </label>
        {errors.baseSizePx && <span className={styles.error}>{errors.baseSizePx}</span>}

        <label className={styles.field}>
          <span>Scale ratio <em>{theme.typography.scaleRatio.toFixed(2)}×</em></span>
          <input
            type="range"
            min={1.1}
            max={2.0}
            step={0.01}
            value={theme.typography.scaleRatio}
            onChange={handleScaleRatio}
            className={styles.range}
            aria-label="Type scale ratio"
          />
        </label>
        {errors.scaleRatio && <span className={styles.error}>{errors.scaleRatio}</span>}
      </section>

      {/* ── Spacing ──────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>Spacing</p>
        <label className={styles.field}>
          <span>Base unit <em>{theme.spacing.baseUnitPx}px</em></span>
          <input
            type="range"
            min={2}
            max={16}
            step={1}
            value={theme.spacing.baseUnitPx}
            onChange={handleBaseUnit}
            className={styles.range}
            aria-label="Base spacing unit"
          />
        </label>
        {errors.baseUnitPx && <span className={styles.error}>{errors.baseUnitPx}</span>}
      </section>

      {/* ── Advanced (collapsible, closed by default) ────────────────────── */}
      <Collapsible title="Advanced" defaultOpen={false}>
        {/* Shadows (T-125, 4 named CSS box-shadow strings) */}
        <div className={styles.advancedGroup}>
          <p className={styles.subsectionTitle}>Shadows</p>
          {SHADOW_SLOTS.map(slot => {
            const errKey = `shadow-${slot}` as const
            return (
              <div key={slot} className={styles.shadowRow}>
                <label className={styles.stackField}>
                  <span className={styles.slotLabel}>{slot.charAt(0).toUpperCase() + slot.slice(1)}</span>
                  <textarea
                    className={styles.shadowTextarea}
                    value={shadowDraft[slot]}
                    onChange={handleShadow(slot)}
                    rows={2}
                    spellCheck={false}
                    aria-label={`${slot} shadow`}
                  />
                </label>
                {errors[errKey] && <span className={styles.error}>{errors[errKey]}</span>}
              </div>
            )
          })}
        </div>

        {/* Radii (T-126, 5 numeric pixel slots) */}
        <div className={styles.advancedGroup}>
          <p className={styles.subsectionTitle}>Radii</p>
          {RADIUS_SLOTS.map(slot => {
            const errKey = `radius-${slot}` as const
            return (
              <div key={slot} className={styles.radiusRow}>
                <label className={styles.field}>
                  <span className={styles.slotLabel}>{slot}</span>
                  <input
                    type="number"
                    className={styles.radiusInput}
                    value={radiusDraft[slot]}
                    onChange={handleRadius(slot)}
                    min={0}
                    max={9999}
                    step={1}
                    aria-label={`${slot} radius`}
                  />
                </label>
                {errors[errKey] && <span className={styles.error}>{errors[errKey]}</span>}
              </div>
            )
          })}
        </div>
      </Collapsible>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <button type="button" className={styles.resetBtn} onClick={onReset}>
          Reset to default
        </button>
      </section>
    </div>
  )
}
