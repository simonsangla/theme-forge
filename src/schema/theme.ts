import { z } from 'zod'

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid 6-digit hex color (e.g. #aabbcc)')

// T-001 — Color token group (R1): exact 4 slots, hex validation, rejects extra
export const ColorTokenSchema = z
  .object({
    primary: hexColor,
    secondary: hexColor,
    background: hexColor,
    text: hexColor,
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

export const ThemeConfigSchema = z
  .object({
    name: z.string().min(1).max(64),
    colors: ColorTokenSchema,
    typography: TypographyTokenSchema,
    spacing: SpacingTokenSchema,
  })
  .strict()

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>
export type ColorTokens = z.infer<typeof ColorTokenSchema>
export type TypographyTokens = z.infer<typeof TypographyTokenSchema>
export type SpacingTokens = z.infer<typeof SpacingTokenSchema>

// T-006 — Validation surface (R6): pure result-returning functions, no throws

export type ValidationSuccess<T> = { success: true; data: T }
export type ValidationFailure = {
  success: false
  errors: Array<{ path: string; message: string }>
}
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure

function toResult<T>(parsed: z.SafeParseReturnType<unknown, T>): ValidationResult<T> {
  if (parsed.success) return { success: true, data: parsed.data }
  return {
    success: false,
    errors: parsed.error.issues.map((issue) => ({
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

export function validateThemeConfig(data: unknown): ValidationResult<ThemeConfig> {
  return toResult(ThemeConfigSchema.safeParse(data))
}
