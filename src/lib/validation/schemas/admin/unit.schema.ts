import { z } from 'zod'
import { UnitType } from '@/lib/types/admin/unit'

/**
 * Schéma de validation pour création/édition d'unité de mesure
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur
 * ✅ RÈGLE #6 : Messages i18n (clés, pas de texte)
 *
 * Tous les messages d'erreur sont des clés i18n qui seront traduites
 * dans le composant via `t(error.message)`
 *
 * @example
 * ```typescript
 * const result = unitSchema.safeParse(data)
 * if (!result.success) {
 *   const errors = result.error.flatten().fieldErrors
 *   // errors.code = ['unit.validation.code.required']
 * }
 * ```
 */
export const unitSchema = z.object({
  /**
   * Code unique
   * - Requis
   * - Max 50 caractères
   * - Format : majuscules, chiffres, tirets, underscores
   */
  code: z.string()
    .min(1, 'unit.validation.code.required')
    .max(50, 'unit.validation.code.maxLength')
    .regex(
      /^[A-Z0-9_-]+$/,
      'unit.validation.code.pattern'
    ),

  /**
   * Nom de l'unité
   * - Requis
   * - Max 200 caractères
   */
  name: z.string()
    .min(1, 'unit.validation.name.required')
    .max(200, 'unit.validation.name.maxLength'),

  /**
   * Symbole de l'unité
   * - Requis
   * - Max 20 caractères
   * - Ex: "mg", "ml", "kg"
   */
  symbol: z.string()
    .min(1, 'unit.validation.symbol.required')
    .max(20, 'unit.validation.symbol.maxLength'),

  /**
   * Type d'unité
   * - Requis
   * - Doit être l'une des valeurs : WEIGHT, VOLUME, CONCENTRATION
   */
  type: z.nativeEnum(UnitType),

  /**
   * Statut actif/inactif (optionnel)
   */
  isActive: z.boolean().optional(),
})

/**
 * Schéma pour mise à jour
 * Ajoute le champ `version` obligatoire pour optimistic locking
 */
export const updateUnitSchema = unitSchema.extend({
  /**
   * Version pour optimistic locking
   * Doit être un entier positif
   */
  version: z.number()
    .int('unit.validation.version.integer')
    .positive('unit.validation.version.positive'),
})

/**
 * Type inféré pour les formulaires de création
 * Utilisé avec react-hook-form
 */
export type UnitFormData = z.infer<typeof unitSchema>

/**
 * Type inféré pour les formulaires de mise à jour
 * Utilisé avec react-hook-form
 */
export type UpdateUnitFormData = z.infer<typeof updateUnitSchema>
