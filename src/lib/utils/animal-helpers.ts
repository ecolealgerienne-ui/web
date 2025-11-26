/**
 * Helper functions for animal data formatting and display
 */

import { Animal } from "@/lib/types/animal";

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - birth.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} jours`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} mois`;
  } else {
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return months > 0 ? `${years} ans ${months} mois` : `${years} ans`;
  }
}

/**
 * Species labels for display
 */
export const speciesLabels: Record<string, string> = {
  sheep: "Mouton",
  goat: "Chèvre",
  cattle: "Bovin",
};

/**
 * Sex labels for display
 */
export const sexLabels: Record<string, string> = {
  male: "Mâle",
  female: "Femelle",
};

/**
 * Status labels for display
 */
export const statusLabels: Record<string, string> = {
  alive: "Vivant",
  active: "Actif",
  sold: "Vendu",
  dead: "Décédé",
  missing: "Disparu",
  slaughtered: "Abattu",
};

/**
 * Get status variant for badge display
 */
export function getStatusVariant(status: Animal["status"]): "success" | "default" | "destructive" {
  switch (status) {
    case "alive":
      return "success";
    case "sold":
      return "default";
    case "dead":
    case "missing":
      return "destructive";
    default:
      return "default";
  }
}
