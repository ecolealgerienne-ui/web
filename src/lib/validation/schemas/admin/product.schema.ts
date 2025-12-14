import { z } from 'zod'

/**
 * Schéma Zod pour la validation des produits vétérinaires
 *
 * ✅ RÈGLE #1 : Tous les messages d'erreur sont des clés i18n
 * ✅ RÈGLE #6 : i18n complet (product.validation.xxx)
 *
 * Correspond au CreateProductDto du backend
 */

/**
 * Schéma de création de produit (local)
 */
export const productSchema = z.object({
  nameFr: z
    .string()
    .min(1, 'product.validation.nameFr.required')
    .max(500, 'product.validation.nameFr.maxLength'),

  commercialName: z
    .string()
    .max(500, 'product.validation.commercialName.maxLength')
    .optional()
    .or(z.literal('')),

  manufacturer: z
    .string()
    .max(200, 'product.validation.manufacturer.maxLength')
    .optional()
    .or(z.literal('')),

  therapeuticForm: z
    .string()
    .max(200, 'product.validation.therapeuticForm.maxLength')
    .optional()
    .or(z.literal('')),

  dosage: z
    .string()
    .max(100, 'product.validation.dosage.maxLength')
    .optional()
    .or(z.literal('')),

  composition: z
    .string()
    .max(2000, 'product.validation.composition.maxLength')
    .optional()
    .or(z.literal('')),

  administrationRoute: z
    .string()
    .max(200, 'product.validation.administrationRoute.maxLength')
    .optional()
    .or(z.literal('')),

  description: z
    .string()
    .max(2000, 'product.validation.description.maxLength')
    .optional()
    .or(z.literal('')),

  withdrawalMeatDays: z
    .number()
    .int()
    .min(0)
    .optional()
    .or(z.literal('')),

  withdrawalMilkHours: z
    .number()
    .int()
    .min(0)
    .optional()
    .or(z.literal('')),

  prescriptionRequired: z.boolean().optional(),

  isActive: z.boolean().optional(),
})

/**
 * Schéma de mise à jour de produit
 * Ajoute le champ version obligatoire pour optimistic locking
 */
export const updateProductSchema = productSchema
  .partial()
  .extend({
    version: z
      .number()
      .int('product.validation.version.integer')
      .positive('product.validation.version.positive'),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'product.validation.noChanges',
  })

/**
 * Type inféré pour le formulaire de création
 */
export type ProductFormData = z.infer<typeof productSchema>

/**
 * Type inféré pour le formulaire de mise à jour
 */
export type UpdateProductFormData = z.infer<typeof updateProductSchema>
