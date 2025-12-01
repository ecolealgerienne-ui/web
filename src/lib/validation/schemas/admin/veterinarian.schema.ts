/**
 * Schémas de validation Zod pour les Vétérinaires (Admin Reference Data)
 *
 * ✅ RÈGLE #1 : Toutes les erreurs utilisent des clés i18n
 * ✅ RÈGLE #6 : Messages d'erreur multilingues
 *
 * Utilisé par react-hook-form via zodResolver pour la validation côté client.
 *
 * @example
 * ```tsx
 * const form = useForm({
 *   resolver: zodResolver(veterinarianSchema)
 * })
 * ```
 */

import { z } from 'zod'

/**
 * Constantes de validation
 */
export const MAX_SPECIALTIES = 10 // Limite maximale de spécialités par vétérinaire

/**
 * Schéma pour les informations de contact
 */
const contactInfoSchema = z.object({
  phone: z
    .string()
    .min(1, 'veterinarian.validation.contactInfo.phone.required')
    .max(20, 'veterinarian.validation.contactInfo.phone.maxLength')
    .regex(
      /^[\d\s+()-]+$/,
      'veterinarian.validation.contactInfo.phone.pattern'
    ),

  mobile: z
    .string()
    .max(20, 'veterinarian.validation.contactInfo.mobile.maxLength')
    .regex(
      /^[\d\s+()-]*$/,
      'veterinarian.validation.contactInfo.mobile.pattern'
    )
    .optional()
    .or(z.literal('')),

  email: z
    .string()
    .email('veterinarian.validation.contactInfo.email.invalid')
    .max(100, 'veterinarian.validation.contactInfo.email.maxLength')
    .optional()
    .or(z.literal('')),

  address: z
    .string()
    .max(200, 'veterinarian.validation.contactInfo.address.maxLength')
    .optional()
    .or(z.literal('')),

  city: z
    .string()
    .max(100, 'veterinarian.validation.contactInfo.city.maxLength')
    .optional()
    .or(z.literal('')),

  postalCode: z
    .string()
    .max(20, 'veterinarian.validation.contactInfo.postalCode.maxLength')
    .optional()
    .or(z.literal('')),

  country: z
    .string()
    .max(100, 'veterinarian.validation.contactInfo.country.maxLength')
    .optional()
    .or(z.literal('')),
})

/**
 * Schéma de validation pour la création d'un vétérinaire
 *
 * Tous les champs requis doivent être fournis.
 * Utilisé dans le formulaire de création.
 */
export const veterinarianSchema = z.object({
  code: z
    .string()
    .min(1, 'veterinarian.validation.code.required')
    .max(50, 'veterinarian.validation.code.maxLength')
    .regex(
      /^[A-Z0-9_-]+$/,
      'veterinarian.validation.code.pattern'
    ),

  firstName: z
    .string()
    .min(1, 'veterinarian.validation.firstName.required')
    .max(100, 'veterinarian.validation.firstName.maxLength'),

  lastName: z
    .string()
    .min(1, 'veterinarian.validation.lastName.required')
    .max(100, 'veterinarian.validation.lastName.maxLength'),

  licenseNumber: z
    .string()
    .min(1, 'veterinarian.validation.licenseNumber.required')
    .max(50, 'veterinarian.validation.licenseNumber.maxLength')
    .regex(
      /^[A-Z0-9-]+$/,
      'veterinarian.validation.licenseNumber.pattern'
    ),

  specialties: z
    .array(
      z
        .string()
        .min(1, 'veterinarian.validation.specialties.item.required')
        .max(100, 'veterinarian.validation.specialties.item.maxLength')
    )
    .min(1, 'veterinarian.validation.specialties.required')
    .max(MAX_SPECIALTIES, 'veterinarian.validation.specialties.maxItems'),

  clinic: z
    .string()
    .max(200, 'veterinarian.validation.clinic.maxLength')
    .optional()
    .or(z.literal('')),

  contactInfo: contactInfoSchema,

  isActive: z.boolean().default(true),
})

/**
 * Schéma de validation pour la mise à jour d'un vétérinaire
 *
 * Tous les champs sont optionnels sauf la version (optimistic locking).
 * Utilisé dans le formulaire d'édition.
 */
export const updateVeterinarianSchema = z.object({
  code: z
    .string()
    .min(1, 'veterinarian.validation.code.required')
    .max(50, 'veterinarian.validation.code.maxLength')
    .regex(
      /^[A-Z0-9_-]+$/,
      'veterinarian.validation.code.pattern'
    )
    .optional(),

  firstName: z
    .string()
    .min(1, 'veterinarian.validation.firstName.required')
    .max(100, 'veterinarian.validation.firstName.maxLength')
    .optional(),

  lastName: z
    .string()
    .min(1, 'veterinarian.validation.lastName.required')
    .max(100, 'veterinarian.validation.lastName.maxLength')
    .optional(),

  licenseNumber: z
    .string()
    .min(1, 'veterinarian.validation.licenseNumber.required')
    .max(50, 'veterinarian.validation.licenseNumber.maxLength')
    .regex(
      /^[A-Z0-9-]+$/,
      'veterinarian.validation.licenseNumber.pattern'
    )
    .optional(),

  specialties: z
    .array(
      z
        .string()
        .min(1, 'veterinarian.validation.specialties.item.required')
        .max(100, 'veterinarian.validation.specialties.item.maxLength')
    )
    .min(1, 'veterinarian.validation.specialties.required')
    .max(MAX_SPECIALTIES, 'veterinarian.validation.specialties.maxItems')
    .optional(),

  clinic: z
    .string()
    .max(200, 'veterinarian.validation.clinic.maxLength')
    .optional()
    .or(z.literal('')),

  contactInfo: contactInfoSchema.optional(),

  isActive: z.boolean().optional(),

  /**
   * Version pour l'optimistic locking (REQUIS en mode update)
   */
  version: z.number().int().positive(),
})

/**
 * Types inférés des schémas Zod
 */
export type VeterinarianFormData = z.infer<typeof veterinarianSchema>
export type UpdateVeterinarianFormData = z.infer<
  typeof updateVeterinarianSchema
>
