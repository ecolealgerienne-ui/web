import { z } from 'zod'

/**
 * Schéma Zod pour la validation des produits vétérinaires
 *
 * ✅ RÈGLE #1 : Tous les messages d'erreur sont des clés i18n
 * ✅ RÈGLE #6 : i18n complet (product.validation.xxx)
 *
 * Utilisé avec react-hook-form via zodResolver
 */

/**
 * Schéma de création de produit
 */
export const productSchema = z.object({
  code: z
    .string()
    .min(1, 'product.validation.code.required')
    .max(50, 'product.validation.code.maxLength')
    .regex(/^[A-Z0-9_-]+$/, 'product.validation.code.pattern'),

  commercialName: z
    .string()
    .min(1, 'product.validation.commercialName.required')
    .max(200, 'product.validation.commercialName.maxLength'),

  laboratoryName: z
    .string()
    .min(1, 'product.validation.laboratoryName.required')
    .max(200, 'product.validation.laboratoryName.maxLength'),

  therapeuticForm: z
    .string()
    .min(1, 'product.validation.therapeuticForm.required')
    .max(100, 'product.validation.therapeuticForm.maxLength'),

  dosage: z
    .string()
    .min(1, 'product.validation.dosage.required')
    .max(100, 'product.validation.dosage.maxLength'),

  packaging: z
    .string()
    .min(1, 'product.validation.packaging.required')
    .max(200, 'product.validation.packaging.maxLength'),

  activeSubstanceIds: z
    .array(z.string().uuid('product.validation.activeSubstanceIds.invalidUuid'))
    .min(1, 'product.validation.activeSubstanceIds.required')
    .max(10, 'product.validation.activeSubstanceIds.maxLength'),

  description: z
    .string()
    .max(2000, 'product.validation.description.maxLength')
    .optional()
    .or(z.literal('')),

  usageInstructions: z
    .string()
    .max(2000, 'product.validation.usageInstructions.maxLength')
    .optional()
    .or(z.literal('')),

  contraindications: z
    .string()
    .max(1000, 'product.validation.contraindications.maxLength')
    .optional()
    .or(z.literal('')),

  storageConditions: z
    .string()
    .max(500, 'product.validation.storageConditions.maxLength')
    .optional()
    .or(z.literal('')),

  isVeterinaryPrescriptionRequired: z.boolean().optional(),

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
