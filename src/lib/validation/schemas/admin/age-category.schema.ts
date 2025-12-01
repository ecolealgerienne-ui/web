import { z } from 'zod'

/**
 * Schéma de base (sans refine) pour permettre l'extension
 * ⚠️ Ne pas exporter - utiliser ageCategorySchema ou updateAgeCategorySchema
 */
const ageCategoryBaseSchema = z.object({
  /**
   * Code unique
   * - Requis
   * - Max 50 caractères
   * - Format : majuscules, chiffres, tirets, underscores
   */
  code: z.string()
    .min(1, 'ageCategory.validation.code.required')
    .max(50, 'ageCategory.validation.code.maxLength')
    .regex(
      /^[A-Z0-9_-]+$/,
      'ageCategory.validation.code.pattern'
    ),

  /**
   * Nom en français
   * - Requis
   * - Max 200 caractères
   */
  nameFr: z.string()
    .min(1, 'ageCategory.validation.nameFr.required')
    .max(200, 'ageCategory.validation.nameFr.maxLength'),

  /**
   * Nom en anglais
   * - Requis
   * - Max 200 caractères
   */
  nameEn: z.string()
    .min(1, 'ageCategory.validation.nameEn.required')
    .max(200, 'ageCategory.validation.nameEn.maxLength'),

  /**
   * Nom en arabe (optionnel)
   * - Max 200 caractères
   */
  nameAr: z.string()
    .max(200, 'ageCategory.validation.nameAr.maxLength')
    .optional()
    .or(z.literal('')), // Accepte chaîne vide

  /**
   * ID de l'espèce (foreign key)
   * - Requis
   * - Format UUID
   */
  speciesId: z.string()
    .min(1, 'ageCategory.validation.speciesId.required')
    .uuid('ageCategory.validation.speciesId.invalid'),

  /**
   * Âge minimum en jours
   * - Requis
   * - Doit être >= 0
   * - Converti par react-hook-form avec valueAsNumber: true
   */
  ageMinDays: z.number()
    .int('ageCategory.validation.ageMinDays.integer')
    .min(0, 'ageCategory.validation.ageMinDays.min'),

  /**
   * Âge maximum en jours (optionnel)
   * - Si fourni, doit être > ageMinDays
   * - Doit être >= 0
   * - Converti par react-hook-form avec valueAsNumber: true
   */
  ageMaxDays: z.number()
    .int('ageCategory.validation.ageMaxDays.integer')
    .min(0, 'ageCategory.validation.ageMaxDays.min')
    .optional(),

  /**
   * Ordre d'affichage (optionnel)
   * - Doit être >= 0
   * - Converti par react-hook-form avec valueAsNumber: true
   */
  displayOrder: z.number()
    .int('ageCategory.validation.displayOrder.integer')
    .min(0, 'ageCategory.validation.displayOrder.min')
    .optional(),

  /**
   * Statut actif/inactif (optionnel)
   */
  isActive: z.boolean().optional(),
})

/**
 * Schéma de validation pour création/édition d'une catégorie d'âge
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur
 * ✅ RÈGLE #6 : Messages i18n (clés, pas de texte)
 *
 * Tous les messages d'erreur sont des clés i18n qui seront traduites
 * dans le composant via `t(error.message)`
 *
 * @example
 * ```typescript
 * const result = ageCategorySchema.safeParse(data)
 * if (!result.success) {
 *   const errors = result.error.flatten().fieldErrors
 *   // errors.code = ['ageCategory.validation.code.required']
 * }
 * ```
 */
export const ageCategorySchema = ageCategoryBaseSchema
  // Validation cross-field : ageMaxDays doit être > ageMinDays
  .refine(
    (data) => {
      if (!data.ageMaxDays || data.ageMaxDays === undefined) {
        return true // Pas de limite supérieure, valide
      }
      return data.ageMaxDays > data.ageMinDays
    },
    {
      message: 'ageCategory.validation.ageMaxDays.greaterThanMin',
      path: ['ageMaxDays'],
    }
  )

/**
 * Schéma pour mise à jour
 * Ajoute le champ `version` obligatoire pour optimistic locking
 *
 * ⚠️ On étend le schéma de base AVANT le refine, puis on ajoute le refine
 * Car Zod ne permet pas d'utiliser .extend() sur un schéma avec refine
 */
export const updateAgeCategorySchema = ageCategoryBaseSchema
  .extend({
    /**
     * Version pour optimistic locking
     * Doit être un entier positif
     */
    version: z.number()
      .int('ageCategory.validation.version.integer')
      .positive('ageCategory.validation.version.positive'),
  })
  // Même validation cross-field que pour la création
  .refine(
    (data) => {
      if (!data.ageMaxDays || data.ageMaxDays === undefined) {
        return true // Pas de limite supérieure, valide
      }
      return data.ageMaxDays > data.ageMinDays
    },
    {
      message: 'ageCategory.validation.ageMaxDays.greaterThanMin',
      path: ['ageMaxDays'],
    }
  )

/**
 * Type explicite pour les formulaires de création
 * Utilisé avec react-hook-form
 *
 * ✅ Type explicite au lieu de z.infer pour éviter unknown avec z.preprocess
 */
export type AgeCategoryFormData = {
  code: string
  nameFr: string
  nameEn: string
  nameAr?: string
  speciesId: string
  ageMinDays: number
  ageMaxDays?: number
  displayOrder?: number
  isActive?: boolean
}

/**
 * Type pour les formulaires de mise à jour
 * Utilisé avec react-hook-form
 */
export type UpdateAgeCategoryFormData = AgeCategoryFormData & {
  version: number
}
