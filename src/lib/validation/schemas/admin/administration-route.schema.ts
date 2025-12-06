import { z } from 'zod'

/**
 * Schéma de validation pour création/édition de voie d'administration
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur
 * ✅ RÈGLE #6 : Messages i18n (clés, pas de texte)
 *
 * Tous les messages d'erreur sont des clés i18n qui seront traduites
 * dans le composant via `t(error.message)`
 *
 * @example
 * ```typescript
 * const result = administrationRouteSchema.safeParse(data)
 * if (!result.success) {
 *   const errors = result.error.flatten().fieldErrors
 *   // errors.code = ['administrationRoute.validation.code.required']
 * }
 * ```
 */
export const administrationRouteSchema = z.object({
  /**
   * Code unique
   * - Requis
   * - Max 50 caractères
   * - Format : majuscules, chiffres, tirets, underscores
   */
  code: z.string()
    .min(1, 'administrationRoute.validation.code.required')
    .max(50, 'administrationRoute.validation.code.maxLength')
    .regex(
      /^[A-Z0-9_-]+$/,
      'administrationRoute.validation.code.pattern'
    ),

  /**
   * Nom de la voie d'administration
   * - Requis
   * - Max 200 caractères
   */
  name: z.string()
    .min(1, 'administrationRoute.validation.name.required')
    .max(200, 'administrationRoute.validation.name.maxLength'),

  /**
   * Description (optionnel)
   * - Max 1000 caractères
   */
  description: z.string()
    .max(1000, 'administrationRoute.validation.description.maxLength')
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
export const updateAdministrationRouteSchema = administrationRouteSchema.extend({
  /**
   * Version pour optimistic locking
   * Doit être un entier positif
   */
  version: z.number()
    .int('administrationRoute.validation.version.integer')
    .positive('administrationRoute.validation.version.positive'),
})

/**
 * Type inféré pour les formulaires de création
 * Utilisé avec react-hook-form
 */
export type AdministrationRouteFormData = z.infer<typeof administrationRouteSchema>

/**
 * Type inféré pour les formulaires de mise à jour
 * Utilisé avec react-hook-form
 */
export type UpdateAdministrationRouteFormData = z.infer<typeof updateAdministrationRouteSchema>
