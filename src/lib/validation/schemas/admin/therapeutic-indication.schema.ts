/**
 * Schéma de validation Zod pour Therapeutic-Indication
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur
 * ✅ RÈGLE #6 : Messages i18n (clés relatives, pas de texte)
 * ✅ RÈGLE Section 5.3 : z.number() pour champs numériques (pas de z.coerce)
 * ✅ RÈGLE Section 5.5 : Messages avec clés RELATIVES (sans préfixe entité)
 *
 * Pattern: Simple Reference Data (basé sur les données réelles du backend)
 *
 * @example
 * ```typescript
 * const result = therapeuticIndicationSchema.safeParse(data)
 * if (!result.success) {
 *   const errors = result.error.flatten().fieldErrors
 *   // errors.productId = ['validation.productId.required']
 *   // Avec useTranslations('therapeuticIndication'), t('validation.productId.required')
 *   // → therapeuticIndication.validation.productId.required
 * }
 * ```
 */

import { z } from 'zod'

/**
 * Schéma pour Therapeutic-Indication
 * Basé sur les champs réels retournés par le backend
 */
export const therapeuticIndicationSchema = z.object({
  // ===== IDs Relations (Foreign Keys) =====
  productId: z
    .string()
    .min(1, 'validation.productId.required')
    .uuid('validation.productId.invalid'),

  speciesId: z
    .string()
    .min(1, 'validation.speciesId.required'),

  ageCategoryId: z
    .string()
    .uuid('validation.ageCategoryId.invalid')
    .optional()
    .nullable()
    .or(z.literal('')), // Accepte chaîne vide

  countryCode: z
    .string()
    .length(2, 'validation.countryCode.length')
    .regex(/^[A-Z]{2}$/i, 'validation.countryCode.pattern')
    .optional()
    .nullable()
    .or(z.literal('')), // Accepte chaîne vide

  routeId: z
    .string()
    .min(1, 'validation.routeId.required')
    .uuid('validation.routeId.invalid'),

  doseUnitId: z
    .string()
    .min(1, 'validation.doseUnitId.required')
    .uuid('validation.doseUnitId.invalid'),

  // ===== Dosage =====
  doseMin: z
    .number()
    .min(0, 'validation.doseMin.min')
    .optional()
    .nullable(),

  doseMax: z
    .number()
    .min(0, 'validation.doseMax.min')
    .optional()
    .nullable(),

  doseOriginalText: z
    .string()
    .max(500, 'validation.doseOriginalText.maxLength')
    .optional()
    .nullable()
    .or(z.literal('')), // Accepte chaîne vide

  // ===== Durée protocole =====
  protocolDurationDays: z
    .number()
    .int('validation.protocolDurationDays.integer')
    .min(1, 'validation.protocolDurationDays.min')
    .optional()
    .nullable(),

  // ===== Délais d'attente =====
  withdrawalMeatDays: z
    .number()
    .int('validation.withdrawalMeatDays.integer')
    .min(0, 'validation.withdrawalMeatDays.min')
    .optional()
    .nullable(),

  withdrawalMilkDays: z
    .number()
    .int('validation.withdrawalMilkDays.integer')
    .min(0, 'validation.withdrawalMilkDays.min')
    .optional()
    .nullable(),

  // ===== Validation & Statut =====
  isVerified: z.boolean().default(false),

  validationNotes: z
    .string()
    .max(1000, 'validation.validationNotes.maxLength')
    .optional()
    .nullable()
    .or(z.literal('')), // Accepte chaîne vide

  isActive: z.boolean().default(true),
})

/**
 * Schéma pour mise à jour
 * Ajoute le champ `version` obligatoire pour optimistic locking
 */
export const updateTherapeuticIndicationSchema = therapeuticIndicationSchema.extend({
  /**
   * Version pour optimistic locking
   * Doit être un entier positif
   */
  version: z.number()
    .int('validation.version.integer')
    .positive('validation.version.positive'),
})

/**
 * Type explicite pour les formulaires
 * Utilisé avec react-hook-form
 *
 * ✅ Type explicite au lieu de z.infer pour éviter unknown avec z.preprocess
 */
export type TherapeuticIndicationFormData = {
  productId: string
  speciesId: string
  ageCategoryId?: string | null
  countryCode?: string | null
  routeId: string
  doseUnitId: string
  doseMin?: number | null
  doseMax?: number | null
  doseOriginalText?: string | null
  protocolDurationDays?: number | null
  withdrawalMeatDays?: number | null
  withdrawalMilkDays?: number | null
  isVerified?: boolean
  validationNotes?: string | null
  isActive?: boolean
}

/**
 * Type pour les formulaires de mise à jour
 * Utilisé avec react-hook-form
 */
export type UpdateTherapeuticIndicationFormData = TherapeuticIndicationFormData & {
  version: number
}
