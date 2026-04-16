import { useState, useEffect, useRef } from 'react'
import type { ThemeConfig } from '../../schema/theme'
import { validateColorTokens, validateTypographyTokens, validateSpacingTokens } from '../../schema/theme'
import { PRESETS } from '../../lib/theme/presets'
import styles from './ThemeEditor.module.css'

const FONT_OPTIONS = [
  { label: 'System', value: 'system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'ui-monospace, monospace' },
  { label: 'Inter', value: 'Inter, sans-serif' },
]

interface Props {
  theme: ThemeConfig
  onColorsChange: (c: Partial<ThemeConfig['colors']>) => void
  onTypographyChange: (t: Partial<ThemeConfig['typography']>) => void
  onSpacingChange: (s: Partial<ThemeConfig['spacing']>) => void
  onNameChange: (name: string) => void
  onPresetApply: (preset: ThemeConfig) => void
  onReset: () => void
  onAdoptTheme: (candidate: unknown) => { success: boolean; errors?: Array<{ path: string; message: string }> }
}

type Errors = Partial<Record<
  'primary' | 'secondary' | 'background' | 'text' |
  'fontFamily' | 'baseSizePx' | 'scaleRatio' | 'baseUnitPx' | 'name',
  string
>>

export default function ThemeEditor({
  theme,
  onColorsChange,
  onTypographyChange,
  onSpacingChange,
  onNameChange,
  onPresetApply,
  onReset,
}: Props) {
  const [errors, setErrors] = useState<Errors>({})
  // Local hex text state so user can type partial values
  const [hexDraft, setHexDraft] = useState({ ...theme.colors })
  // Track when theme changes externally (undo/redo/preset) to reset drafts
  const prevThemeRef = useRef(theme)

  useEffect(() => {
    if (prevThemeRef.current !== theme) {
      setHexDraft({ ...theme.colors })
      setErrors({})
      prevThemeRef.current = theme
    }
  }, [theme])

  // ── Color controls ──────────────────────────────────────────────────────────

  const handleColorPicker = (slot: keyof ThemeConfig['colors']) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHexDraft(prev => ({ ...prev, [slot]: val }))
    setErrors(prev => ({ ...prev, [slot]: undefined }))
    onColorsChange({ [slot]: val })
  }

  const handleHexText = (slot: keyof ThemeConfig['colors']) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
      {/* ── Name ─────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>Theme name</p>
        <label className={styles.stackField}>
          <input
            className={styles.textInput}
            type="text"
            defaultValue={theme.name}
            key={theme.name}
            onChange={handleName}
            placeholder="Theme name"
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </label>
      </section>

      {/* ── Colors ───────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>Colors</p>
        {(['primary', 'secondary', 'background', 'text'] as const).map(slot => (
          <div key={slot} className={styles.colorRow}>
            <label className={styles.field}>
              <span className={styles.slotLabel}>{slot.charAt(0).toUpperCase() + slot.slice(1)}</span>
              <div className={styles.colorInputs}>
                <input
                  type="color"
                  value={hexDraft[slot]}
                  onChange={handleColorPicker(slot)}
                  className={styles.colorPicker}
                />
                <input
                  type="text"
                  value={hexDraft[slot]}
                  onChange={handleHexText(slot)}
                  className={styles.hexText}
                  maxLength={7}
                  spellCheck={false}
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
          />
        </label>
        {errors.baseUnitPx && <span className={styles.error}>{errors.baseUnitPx}</span>}
      </section>

      {/* ── Presets ──────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>Presets</p>
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

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <button type="button" className={styles.resetBtn} onClick={onReset}>
          Reset to default
        </button>
      </section>
    </div>
  )
}
