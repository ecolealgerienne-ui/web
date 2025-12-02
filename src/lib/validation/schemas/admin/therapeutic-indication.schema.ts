import { z } from 'zod'

/**
 * Schéma de validation pour création/édition d'une indication thérapeutique
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur
 * ✅ RÈGLE #6 : Messages i18n (clés relatives, pas de texte)
 * ✅ RÈGLE Section 5.3 : z.number() pour délais (pas de z.coerce)
 * ✅ RÈGLE Section 5.5 : Messages avec clés RELATIVES (sans préfixe entité)
 *
 * Tous les messages d'erreur sont des clés i18n relatives qui seront traduites
 * dans le composant via `t(error.message)` avec useTranslations('therapeuticIndication')
 *
 * @example
 * ```typescript
 * const result = therapeuticIndicationSchema.safeParse(data)
 * if (!result.success) {
 *   const errors = result.error.flatten().fieldErrors
 *   // errors.code = ['validation.code.required']
 *   // Avec useTranslations('therapeuticIndication'), t('validation.code.required')
 *   // → therapeuticIndication.validation.code.required
 * }
 * ```
 */
export const therapeuticIndicationSchema = z.object({
  /**
   * Code unique de l'indication
   * - Requis
   * - Max 100 caractères
   * - Pattern: lettres, chiffres, tirets, underscores
   */
  code: z.string()
    .min(1, 'validation.code.required')
    .max(100, 'validation.code.maxLength')
    .regex(/^[A-Z0-9_-]+$/i, 'validation.code.pattern'),

  /**
   * Pathologie traitée
   * - Requis
   * - Max 200 caractères
   */
  pathology: z.string()
    .min(1, 'validation.pathology.required')
    .max(200, 'validation.pathology.maxLength'),

  /**
   * ID du produit (foreign key)
   * - Requis
   * - Format UUID
   */
  productId: z.string()
    .min(1, 'validation.productId.required')
    .uuid('validation.productId.invalid'),

  /**
   * ID de l'espèce (foreign key)
   * - Requis
   * - Format UUID
   */
  speciesId: z.string()
    .min(1, 'validation.speciesId.required')
    .uuid('validation.speciesId.invalid'),

  /**
   * Code pays ISO 3166-1 alpha-2
   * - Requis
   * - Format: 2 caractères majuscules (ex: DZ, FR, MA)
   */
  countryCode: z.string()
    .min(1, 'validation.countryCode.required')
    .length(2, 'validation.countryCode.length')
    .regex(/^[A-Z]{2}$/, 'validation.countryCode.pattern'),

  /**
   * ID de la voie d'administration (foreign key)
   * - Requis
   * - Format UUID
   */
  routeId: z.string()
    .min(1, 'validation.routeId.required')
    .uuid('validation.routeId.invalid'),

  /**
   * Vérifiée (optionnel)
   * Par défaut: false
   */
  isVerified: z.boolean().optional(),

  /**
   * Dosage recommandé (optionnel)
   * - Max 200 caractères
   * - Ex: "10 mg/kg", "500 mg par animal"
   */
  dosage: z.string()
    .max(200, 'validation.dosage.maxLength')
    .optional()
    .or(z.literal('')), // Accepte chaîne vide

  /**
   * Fréquence d'administration (optionnel)
   * - Max 200 caractères
   * - Ex: "2 fois par jour", "1 fois par semaine"
   */
  frequency: z.string()
    .max(200, 'validation.frequency.maxLength')
    .optional()
    .or(z.literal('')), // Accepte chaîne vide

  /**
   * Durée du traitement (optionnel)
   * - Max 200 caractères
   * - Ex: "5 jours", "3 semaines"
   */
  duration: z.string()
    .max(200, 'validation.duration.maxLength')
    .optional()
    .or(z.literal('')), // Accepte chaîne vide

  /**
   * Délai d'attente viande en jours (optionnel)
   * - Doit être >= 0
   * - Converti par react-hook-form avec valueAsNumber: true
   * - ✅ z.number() simple (pas de z.coerce)
   */
  withdrawalMeat: z.number()
    .int('validation.withdrawalMeat.integer')
    .min(0, 'validation.withdrawalMeat.min')
    .optional(),

  /**
   * Délai d'attente lait en jours (optionnel)
   * - Doit être >= 0
   * - Converti par react-hook-form avec valueAsNumber: true
   */
  withdrawalMilk: z.number()
    .int('validation.withdrawalMilk.integer')
    .min(0, 'validation.withdrawalMilk.min')
    .optional(),

  /**
   * Délai d'attente œufs en jours (optionnel)
   * - Doit être >= 0
   * - Converti par react-hook-form avec valueAsNumber: true
   */
  withdrawalEggs: z.number()
    .int('validation.withdrawalEggs.integer')
    .min(0, 'validation.withdrawalEggs.min')
    .optional(),

  /**
   * Instructions détaillées (optionnel)
   * - Max 2000 caractères
   */
  instructions: z.string()
    .max(2000, 'validation.instructions.maxLength')
    .optional()
    .or(z.literal('')), // Accepte chaîne vide

  /**
   * Contre-indications (optionnel)
   * - Max 2000 caractères
   */
  contraindications: z.string()
    .max(2000, 'validation.contraindications.maxLength')
    .optional()
    .or(z.literal('')), // Accepte chaîne vide

  /**
   * Avertissements et précautions (optionnel)
   * - Max 2000 caractères
   */
  warnings: z.string()
    .max(2000, 'validation.warnings.maxLength')
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
 * Type explicite pour les formulaires de création
 * Utilisé avec react-hook-form
 *
 * ✅ Type explicite au lieu de z.infer pour éviter unknown avec z.preprocess
 */
export type TherapeuticIndicationFormData = {
  code: string
  pathology: string
  productId: string
  speciesId: string
  countryCode: string
  routeId: string
  isVerified?: boolean
  dosage?: string
  frequency?: string
  duration?: string
  withdrawalMeat?: number
  withdrawalMilk?: number
  withdrawalEggs?: number
  instructions?: string
  contraindications?: string
  warnings?: string
  isActive?: boolean
}

/**
 * Type pour les formulaires de mise à jour
 * Utilisé avec react-hook-form
 */
export type UpdateTherapeuticIndicationFormData = TherapeuticIndicationFormData & {
  version: number
}
