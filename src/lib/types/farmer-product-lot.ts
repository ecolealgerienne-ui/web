/**
 * Types pour les lots de produits médicaments (FarmerProductLot)
 *
 * Un lot représente un achat/batch de médicament avec date de péremption.
 * Lié à une préférence de produit (FarmProductPreference).
 */

export interface FarmerProductLot {
  id: string
  /** ID de la préférence produit (FarmProductPreference) */
  configId: string

  /** Surnom du lot (ex: "Lot Décembre 2024") */
  nickname: string

  /** Numéro de lot officiel (ex: "ABC123-9A") */
  officialLotNumber: string

  /** Date de péremption */
  expiryDate: string

  /** Lot actif */
  isActive: boolean

  /** Date d'achat (si renseignée) */
  purchaseDate?: string

  /** Prix d'achat (si renseigné) */
  purchasePrice?: number

  createdAt: string
  updatedAt: string
}

export interface CreateFarmerProductLotDto {
  /** Surnom du lot */
  nickname: string

  /** Numéro de lot officiel */
  officialLotNumber: string

  /** Date de péremption (ISO 8601) */
  expiryDate: string

  /** Actif (défaut: true) */
  isActive?: boolean

  /** Date d'achat (optionnel) */
  purchaseDate?: string

  /** Prix d'achat (optionnel) */
  purchasePrice?: number
}

export interface UpdateFarmerProductLotDto {
  nickname?: string
  officialLotNumber?: string
  expiryDate?: string
  isActive?: boolean
  purchaseDate?: string
  purchasePrice?: number
}

/**
 * Statut d'expiration calculé
 */
export type LotExpiryStatus = 'valid' | 'expiring_soon' | 'expired'

/**
 * Calcule le statut d'expiration d'un lot
 * @param expiryDate Date de péremption
 * @param warningDays Nombre de jours avant péremption pour warning (défaut: 30)
 */
export function getLotExpiryStatus(
  expiryDate: string,
  warningDays = 30
): LotExpiryStatus {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const warningDate = new Date()
  warningDate.setDate(warningDate.getDate() + warningDays)

  if (expiry < now) {
    return 'expired'
  }
  if (expiry <= warningDate) {
    return 'expiring_soon'
  }
  return 'valid'
}
