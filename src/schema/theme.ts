import { z } from 'zod'

export const ColorTokenSchema = z.object({
  primary: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be hex color'),
  secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be hex color'),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be hex color'),
  text: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be hex color'),
})

export const TypographyTokenSchema = z.object({
  fontFamily: z.string().min(1),
  baseSizePx: z.number().int().min(8).max(32),
  scaleRatio: z.number().min(1.1).max(2.0),
})

export const SpacingTokenSchema = z.object({
  baseUnitPx: z.number().int().min(2).max(16),
})

export const ThemeConfigSchema = z.object({
  name: z.string().min(1).max(64),
  colors: ColorTokenSchema,
  typography: TypographyTokenSchema,
  spacing: SpacingTokenSchema,
})

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>
export type ColorTokens = z.infer<typeof ColorTokenSchema>
export type TypographyTokens = z.infer<typeof TypographyTokenSchema>
export type SpacingTokens = z.infer<typeof SpacingTokenSchema>
