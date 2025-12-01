import { z } from 'zod'

/**
 * Schéma de validation pour création/édition d'une race
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur
 * ✅ RÈGLE #6 : Messages i18n (clés, pas de texte)
 * ✅ RÈGLE Section 5.3 : z.number() pour displayOrder (pas de z.coerce)
 *
 * Tous les messages d'erreur sont des clés i18n relatives qui seront traduites
 * dans le composant via `t(error.message)` avec useTranslations('breed')
 *
 * @example
 * ```typescript
 * const result = breedSchema.safeParse(data)
 * if (!result.success) {
 *   const errors = result.error.flatten().fieldErrors
 *   // errors.code = ['validation.code.required']
 *   // Avec useTranslations('breed'), t('validation.code.required') → breed.validation.code.required
 * }
 * ```
 */
export const breedSchema = z.object({
  /**
   * Code unique
   * - Requis
   * - Max 50 caractères
   * - Format : majuscules, chiffres, tirets, underscores
   */
  code: z.string()
    .min(1, 'validation.code.required')
    .max(50, 'validation.code.maxLength')
    .regex(
      /^[A-Z0-9_-]+$/,
      'validation.code.pattern'
    ),

  /**
   * Nom en français
   * - Requis
   * - Max 200 caractères
   */
  nameFr: z.string()
    .min(1, 'validation.nameFr.required')
    .max(200, 'validation.nameFr.maxLength'),

  /**
   * Nom en anglais
   * - Requis
   * - Max 200 caractères
   */
  nameEn: z.string()
    .min(1, 'validation.nameEn.required')
    .max(200, 'validation.nameEn.maxLength'),

  /**
   * Nom en arabe (optionnel)
   * - Max 200 caractères
   */
  nameAr: z.string()
    .max(200, 'validation.nameAr.maxLength')
    .optional()
    .or(z.literal('')), // Accepte chaîne vide

  /**
   * Description (optionnel)
   * - Max 1000 caractères
   */
  description: z.string()
    .max(1000, 'validation.description.maxLength')
    .optional()
    .or(z.literal('')), // Accepte chaîne vide

  /**
   * ID de l'espèce (foreign key)
   * - Requis
   * - Format UUID
   */
  speciesId: z.string()
    .min(1, 'validation.speciesId.required')
    .uuid('validation.speciesId.invalid'),

  /**
   * Ordre d'affichage (optionnel)
   * - Doit être >= 0
   * - Converti par react-hook-form avec valueAsNumber: true
   * - ✅ z.number() simple (pas de z.coerce)
   */
  displayOrder: z.number()
    .int('validation.displayOrder.integer')
    .min(0, 'validation.displayOrder.min')
    .optional(),

  /**
   * Statut actif/inactif (optionnel)
   */
  isActive: z.boolean().optional(),
})

/**
 * Schéma pour mise à jour
 * Ajoute le champ `version` obligatoire pour optimistic locking
 */
export const updateBreedSchema = breedSchema.extend({
  /**
   * Version pour optimistic locking
   * Doit être un entier positif
   */
  version: z.number()
    .int('validation.version.integer')
    .positive('validation.version.positive'),
})

/**
 * Type explicite pour les formulaires de création
 * Utilisé avec react-hook-form
 *
 * ✅ Type explicite au lieu de z.infer pour éviter unknown avec z.preprocess
 */
export type BreedFormData = {
  code: string
  nameFr: string
  nameEn: string
  nameAr?: string
  description?: string
  speciesId: string
  displayOrder?: number
  isActive?: boolean
}

/**
 * Type pour les formulaires de mise à jour
 * Utilisé avec react-hook-form
 */
export type UpdateBreedFormData = BreedFormData & {
  version: number
}
