import { z } from 'zod'

/**
 * Schéma de validation pour création/édition de catégorie de produit
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur
 * ✅ RÈGLE #6 : Messages i18n (clés, pas de texte)
 *
 * Tous les messages d'erreur sont des clés i18n qui seront traduites
 * dans le composant via `t(error.message)`
 *
 * @example
 * ```typescript
 * const result = productCategorySchema.safeParse(data)
 * if (!result.success) {
 *   const errors = result.error.flatten().fieldErrors
 *   // errors.code = ['productCategory.validation.code.required']
 * }
 * ```
 */
export const productCategorySchema = z.object({
  /**
   * Code unique
   * - Requis
   * - Max 50 caractères
   * - Format : majuscules, chiffres, tirets, underscores
   */
  code: z.string()
    .min(1, 'productCategory.validation.code.required')
    .max(50, 'productCategory.validation.code.maxLength')
    .regex(
      /^[A-Z0-9_-]+$/,
      'productCategory.validation.code.pattern'
    ),

  /**
   * Nom de la catégorie
   * - Requis
   * - Max 200 caractères
   */
  name: z.string()
    .min(1, 'productCategory.validation.name.required')
    .max(200, 'productCategory.validation.name.maxLength'),

  /**
   * Description (optionnel)
   * - Max 1000 caractères
   */
  description: z.string()
    .max(1000, 'productCategory.validation.description.maxLength')
    .optional()
    .or(z.literal('')), // Accepte chaîne vide

  /**
   * Statut actif/inactif (optionnel)
   */
  isActive: z.boolean().optional(),
})

/**
 * Schéma pour mise à jour
 * Ajoute le champ `version` obligatoire pour optimistic locking
 */
export const updateProductCategorySchema = productCategorySchema.extend({
  /**
   * Version pour optimistic locking
   * Doit être un entier positif
   */
  version: z.number()
    .int('productCategory.validation.version.integer')
    .positive('productCategory.validation.version.positive'),
})

/**
 * Type inféré pour les formulaires de création
 * Utilisé avec react-hook-form
 */
export type ProductCategoryFormData = z.infer<typeof productCategorySchema>

/**
 * Type inféré pour les formulaires de mise à jour
 * Utilisé avec react-hook-form
 */
export type UpdateProductCategoryFormData = z.infer<typeof updateProductCategorySchema>
