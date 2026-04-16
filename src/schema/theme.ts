import { z } from 'zod'

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid 6-digit hex color (e.g. #aabbcc)')

// CSS box-shadow string — non-empty.
// Splitting on commas to validate each layer is unsafe because rgba()/hsla()
// values contain commas. Zod is for shape, not exhaustive CSS validation —
// we accept any non-empty string and trust CSS to render-or-fail at runtime.
// Special-case 'none' is valid CSS and supported here.
const cssShadow = z
  .string()
  .min(1, 'shadow value must be a non-empty string')

// T-100 — Color token group (R1 expanded): 9 slots, hex validation, rejects extras
export const ColorTokenSchema = z
  .object({
    primary: hexColor,
    secondary: hexColor,
    background: hexColor,
    text: hexColor,
    muted: hexColor,
    hairline: hexColor,
    inkSoft: hexColor,
    surfaceInvert: hexColor,
    onInvert: hexColor,
  })
  .strict()

// T-002 — Typography token group (R2): exact 3 fields, ranges, non-empty string
export const TypographyTokenSchema = z
  .object({
    fontFamily: z.string().min(1, 'fontFamily must be a non-empty string'),
    baseSizePx: z.number().min(8, 'baseSizePx must be ≥ 8').max(32, 'baseSizePx must be ≤ 32'),
    scaleRatio: z.number().min(1.1, 'scaleRatio must be ≥ 1.1').max(2.0, 'scaleRatio must be ≤ 2.0'),
  })
  .strict()

// T-003 — Spacing token group (R3): exact 1 field, range
export const SpacingTokenSchema = z
  .object({
    baseUnitPx: z.number().min(2, 'baseUnitPx must be ≥ 2').max(16, 'baseUnitPx must be ≤ 16'),
  })
  .strict()

// T-101 — Shadow token group (R8): 4 named CSS box-shadow strings
export const ShadowTokenSchema = z
  .object({
    primary: cssShadow,
    secondary: cssShadow,
    card: cssShadow,
    float: cssShadow,
  })
  .strict()

// T-102 — Radius token group (R9): 5 numeric pixel values, sm<=md<=lg<=xl, range 0..9999
export const RadiusTokenSchema = z
  .object({
    pill: z.number().min(0, 'pill must be ≥ 0').max(9999, 'pill must be ≤ 9999'),
    sm: z.number().min(0, 'sm must be ≥ 0').max(9999, 'sm must be ≤ 9999'),
    md: z.number().min(0, 'md must be ≥ 0').max(9999, 'md must be ≤ 9999'),
    lg: z.number().min(0, 'lg must be ≥ 0').max(9999, 'lg must be ≤ 9999'),
    xl: z.number().min(0, 'xl must be ≥ 0').max(9999, 'xl must be ≤ 9999'),
  })
  .strict()
  .superRefine((val, ctx) => {
    if (!(val.sm <= val.md)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['md'],
        message: 'md must be ≥ sm (radii must be in ascending order)',
      })
    }
    if (!(val.md <= val.lg)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lg'],
        message: 'lg must be ≥ md (radii must be in ascending order)',
      })
    }
    if (!(val.lg <= val.xl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['xl'],
        message: 'xl must be ≥ lg (radii must be in ascending order)',
      })
    }
  })

// T-104 — ThemeConfig composition: now includes shadows + radii
export const ThemeConfigSchema = z
  .object({
    name: z.string().min(1).max(64),
    colors: ColorTokenSchema,
    typography: TypographyTokenSchema,
    spacing: SpacingTokenSchema,
    shadows: ShadowTokenSchema,
    radii: RadiusTokenSchema,
  })
  .strict()

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>
export type ColorTokens = z.infer<typeof ColorTokenSchema>
export type TypographyTokens = z.infer<typeof TypographyTokenSchema>
export type SpacingTokens = z.infer<typeof SpacingTokenSchema>
export type ShadowTokens = z.infer<typeof ShadowTokenSchema>
export type RadiusTokens = z.infer<typeof RadiusTokenSchema>

// T-105 — Theme variant pair (R5 extended): light + dark share typography, spacing, shadows, radii

export const ThemeVariantPairSchema = z
  .object({
    name: z.string().min(1),
    light: ThemeConfigSchema,
    dark: ThemeConfigSchema,
  })
  .strict()
  .superRefine((val, ctx) => {
    const typoFields = ['fontFamily', 'baseSizePx', 'scaleRatio'] as const
    for (const field of typoFields) {
      if (val.light.typography[field] !== val.dark.typography[field]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dark', 'typography', field],
          message: `typography.${field} must match between light and dark variants`,
        })
      }
    }
    if (val.light.spacing.baseUnitPx !== val.dark.spacing.baseUnitPx) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dark', 'spacing', 'baseUnitPx'],
        message: 'spacing.baseUnitPx must match between light and dark variants',
      })
    }
    const shadowFields = ['primary', 'secondary', 'card', 'float'] as const
    for (const field of shadowFields) {
      if (val.light.shadows[field] !== val.dark.shadows[field]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dark', 'shadows', field],
          message: `shadows.${field} must match between light and dark variants`,
        })
      }
    }
    const radiusFields = ['pill', 'sm', 'md', 'lg', 'xl'] as const
    for (const field of radiusFields) {
      if (val.light.radii[field] !== val.dark.radii[field]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dark', 'radii', field],
          message: `radii.${field} must match between light and dark variants`,
        })
      }
    }
  })

export type ThemeVariantPair = z.infer<typeof ThemeVariantPairSchema>

// T-006 — Validation surface (R6): pure result-returning functions, no throws

export type ValidationSuccess<T> = { success: true; data: T }
export type ValidationFailure = {
  success: false
  errors: Array<{ path: string; message: string }>
}
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure

function toResult<T>(parsed: { success: true; data: T } | { success: false; error: z.ZodError }): ValidationResult<T> {
  if (parsed.success) return { success: true, data: parsed.data }
  return {
    success: false,
    errors: parsed.error.issues.map((issue: z.core.$ZodIssue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  }
}

export function validateColorTokens(data: unknown): ValidationResult<ColorTokens> {
  return toResult(ColorTokenSchema.safeParse(data))
}

export function validateTypographyTokens(data: unknown): ValidationResult<TypographyTokens> {
  return toResult(TypographyTokenSchema.safeParse(data))
}

export function validateSpacingTokens(data: unknown): ValidationResult<SpacingTokens> {
  return toResult(SpacingTokenSchema.safeParse(data))
}

export function validateShadowTokens(data: unknown): ValidationResult<ShadowTokens> {
  return toResult(ShadowTokenSchema.safeParse(data))
}

export function validateRadiusTokens(data: unknown): ValidationResult<RadiusTokens> {
  return toResult(RadiusTokenSchema.safeParse(data))
}

export function validateThemeConfig(data: unknown): ValidationResult<ThemeConfig> {
  return toResult(ThemeConfigSchema.safeParse(data))
}

export function validateThemeVariantPair(data: unknown): ValidationResult<ThemeVariantPair> {
  return toResult(ThemeVariantPairSchema.safeParse(data))
}
