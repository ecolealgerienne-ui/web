/**
 * Zod validation schemas for Alert Templates
 */

import { z } from 'zod'

/**
 * Alert category enum schema
 */
export const alertCategorySchema = z.enum([
  'health',
  'vaccination',
  'treatment',
  'reproduction',
  'nutrition',
  'administrative',
  'other',
])

/**
 * Alert priority enum schema
 */
export const alertPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])

/**
 * Base alert template schema (shared fields for create and update)
 */
const baseAlertTemplateSchema = z.object({
  code: z
    .string()
    .min(1, 'alertTemplate.validation.code.required')
    .max(50, 'alertTemplate.validation.code.maxLength')
    .regex(/^[A-Z0-9_-]+$/, 'alertTemplate.validation.code.pattern'),

  nameFr: z
    .string()
    .min(1, 'alertTemplate.validation.nameFr.required')
    .max(200, 'alertTemplate.validation.nameFr.maxLength'),

  nameEn: z
    .string()
    .min(1, 'alertTemplate.validation.nameEn.required')
    .max(200, 'alertTemplate.validation.nameEn.maxLength'),

  nameAr: z
    .string()
    .min(1, 'alertTemplate.validation.nameAr.required')
    .max(200, 'alertTemplate.validation.nameAr.maxLength'),

  category: alertCategorySchema,

  priority: alertPrioritySchema,

  description: z
    .string()
    .max(1000, 'alertTemplate.validation.description.maxLength')
    .optional()
    .or(z.literal('')),

  messageTemplateFr: z
    .string()
    .max(500, 'alertTemplate.validation.messageTemplateFr.maxLength')
    .optional()
    .or(z.literal('')),

  messageTemplateEn: z
    .string()
    .max(500, 'alertTemplate.validation.messageTemplateEn.maxLength')
    .optional()
    .or(z.literal('')),

  messageTemplateAr: z
    .string()
    .max(500, 'alertTemplate.validation.messageTemplateAr.maxLength')
    .optional()
    .or(z.literal('')),

  isActive: z.boolean().default(true),
})

/**
 * Schema for creating a new alert template
 */
export const createAlertTemplateSchema = baseAlertTemplateSchema

/**
 * Schema for updating an existing alert template
 */
export const updateAlertTemplateSchema = baseAlertTemplateSchema
  .partial()
  .extend({
    version: z
      .number()
      .int('alertTemplate.validation.version.integer')
      .positive('alertTemplate.validation.version.positive'),
  })

/**
 * Form data type inferred from the create schema
 */
export type AlertTemplateFormData = z.infer<typeof createAlertTemplateSchema>
