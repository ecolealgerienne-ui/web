import { z } from 'zod'

/**
 * Schéma de validation pour création/édition de substance active
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur
 * ✅ RÈGLE #6 : Messages i18n (clés, pas de texte)
 *
 * Tous les messages d'erreur sont des clés i18n qui seront traduites
 * dans le composant via `t(error.message)`
 *
 * @example
 * ```typescript
 * const result = activeSubstanceSchema.safeParse(data)
 * if (!result.success) {
 *   const errors = result.error.flatten().fieldErrors
 *   // errors.code = ['activeSubstance.validation.code.required']
 * }
 * ```
 */
export const activeSubstanceSchema = z.object({
  /**
   * Code unique
   * - Requis
   * - Max 50 caractères
   * - Format : majuscules, chiffres, tirets, underscores
   */
  code: z.string()
    .min(1, 'activeSubstance.validation.code.required')
    .max(50, 'activeSubstance.validation.code.maxLength')
    .regex(
      /^[A-Z0-9_-]+$/,
      'activeSubstance.validation.code.pattern'
    ),

  /**
   * Nom DCI
   * - Requis
   * - Max 200 caractères
   */
  name: z.string()
    .min(1, 'activeSubstance.validation.name.required')
    .max(200, 'activeSubstance.validation.name.maxLength'),

  /**
   * Description (optionnel)
   * - Max 1000 caractères
   */
  description: z.string()
    .max(1000, 'activeSubstance.validation.description.maxLength')
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
export const updateActiveSubstanceSchema = activeSubstanceSchema.extend({
  /**
   * Version pour optimistic locking
   * Doit être un entier positif
   */
  version: z.number()
    .int('activeSubstance.validation.version.integer')
    .positive('activeSubstance.validation.version.positive'),
})

/**
 * Type inféré pour les formulaires de création
 * Utilisé avec react-hook-form
 */
export type ActiveSubstanceFormData = z.infer<typeof activeSubstanceSchema>

/**
 * Type inféré pour les formulaires de mise à jour
 * Utilisé avec react-hook-form
 */
export type UpdateActiveSubstanceFormData = z.infer<typeof updateActiveSubstanceSchema>
