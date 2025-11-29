import { Animal, AnimalDetail, Weight, Movement } from "@/lib/types/animal";
import { Treatment } from "@/lib/types/treatment";
import { Vaccination } from "@/lib/types/vaccination";

// Helper pour générer des EIDs
const generateEID = (index: number) => `250${String(index).padStart(12, "0")}`;

export const mockAnimals: Animal[] = [
  {
    id: "1",
    currentEid: generateEID(1),
    officialNumber: null,
    visualId: "A-001",
    speciesId: "sheep",
    breedId: "Ouled Djellal",
    sex: "female",
    birthDate: "2022-03-15",
    status: "alive",
    farmId: "farm-1",
    createdAt: "2022-03-15T10:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
    // Deprecated fields for compatibility
    name: "Bella",
    identificationNumber: generateEID(1),
    currentWeight: 45.5,
    acquisitionDate: "2022-03-15",
    isActive: true,
  },
  {
    id: "2",
    currentEid: generateEID(2),
    officialNumber: null,
    visualId: "A-002",
    speciesId: "sheep",
    breedId: "Rembi",
    sex: "male",
    birthDate: "2021-05-20",
    status: "alive",
    farmId: "farm-1",
    createdAt: "2021-05-20T10:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
    // Deprecated fields for compatibility
    name: "Sultan",
    identificationNumber: generateEID(2),
    currentWeight: 68.2,
    acquisitionDate: "2021-05-20",
    isActive: true,
  },
  {
    id: "3",
    currentEid: generateEID(3),
    officialNumber: null,
    visualId: "A-003",
    speciesId: "goat",
    breedId: "Arabia",
    sex: "female",
    birthDate: "2023-01-10",
    status: "alive",
    farmId: "farm-1",
    createdAt: "2023-01-10T10:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
    // Deprecated fields for compatibility
    identificationNumber: generateEID(3),
    currentWeight: 32.0,
    acquisitionDate: "2023-01-10",
    isActive: true,
  },
  {
    id: "4",
    currentEid: generateEID(4),
    officialNumber: null,
    visualId: "A-004",
    speciesId: "cattle",
    breedId: "Brune",
    sex: "male",
    birthDate: "2020-08-12",
    status: "alive",
    farmId: "farm-1",
    createdAt: "2021-03-15T10:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
    // Deprecated fields for compatibility
    name: "Noir",
    identificationNumber: generateEID(4),
    currentWeight: 420.5,
    acquisitionDate: "2021-03-15",
    isActive: true,
  },
  {
    id: "5",
    currentEid: generateEID(5),
    officialNumber: null,
    visualId: "A-005",
    speciesId: "sheep",
    breedId: "Ouled Djellal",
    sex: "female",
    birthDate: "2023-04-22",
    status: "alive",
    farmId: "farm-1",
    createdAt: "2023-04-22T10:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
    // Deprecated fields for compatibility
    name: "Zahra",
    identificationNumber: generateEID(5),
    currentWeight: 38.0,
    acquisitionDate: "2023-04-22",
    isActive: true,
  },
  {
    id: "6",
    currentEid: generateEID(6),
    officialNumber: null,
    visualId: "A-006",
    speciesId: "sheep",
    breedId: "Rembi",
    sex: "male",
    birthDate: "2024-02-10",
    status: "alive",
    farmId: "farm-1",
    createdAt: "2024-02-10T10:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
    // Deprecated fields for compatibility
    identificationNumber: generateEID(6),
    currentWeight: 25.0,
    acquisitionDate: "2024-02-10",
    isActive: true,
  },
  {
    id: "7",
    currentEid: generateEID(7),
    officialNumber: null,
    visualId: "A-007",
    speciesId: "goat",
    breedId: "Makatia",
    sex: "female",
    birthDate: "2022-11-05",
    status: "sold",
    farmId: "farm-1",
    createdAt: "2022-11-05T10:00:00Z",
    updatedAt: "2024-10-15T10:00:00Z",
    // Deprecated fields for compatibility
    identificationNumber: generateEID(7),
    currentWeight: 35.5,
    acquisitionDate: "2022-11-05",
    isActive: true,
  },
  {
    id: "8",
    currentEid: generateEID(8),
    officialNumber: null,
    visualId: "A-008",
    speciesId: "sheep",
    breedId: "D'man",
    sex: "male",
    birthDate: "2021-07-18",
    status: "alive",
    farmId: "farm-1",
    createdAt: "2021-12-01T10:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
    // Deprecated fields for compatibility
    name: "Blanc",
    identificationNumber: generateEID(8),
    currentWeight: 55.0,
    acquisitionDate: "2021-12-01",
    isActive: true,
  },
];

// Mock data détaillée pour un animal
export const mockAnimalDetail: AnimalDetail = {
  ...mockAnimals[0],
  weights: [
    {
      id: "w1",
      animalId: "1",
      weight: 45.5,
      weighDate: "2024-11-01",
    createdAt: "2025-01-01T00:00:00Z",
      notes: "Pesée mensuelle",
    },
    {
      id: "w2",
      animalId: "1",
      weight: 43.2,
      weighDate: "2024-10-01",
    createdAt: "2025-01-01T00:00:00Z",
    },
    {
      id: "w3",
      animalId: "1",
      weight: 40.8,
      weighDate: "2024-09-01",
    createdAt: "2025-01-01T00:00:00Z",
    },
    {
      id: "w4",
      animalId: "1",
      weight: 38.5,
      weighDate: "2024-08-01",
    createdAt: "2025-01-01T00:00:00Z",
    },
  ],
  treatments: [
    {
      id: "t1",
      animalId: "1",
      product: "Ivermectine",
      movementDate: "2024-10-15",
    createdAt: "2025-01-01T00:00:00Z",
      administeredBy: "Dr. Benali",
      withdrawalPeriod: 14,
      notes: "Traitement antiparasitaire",
    },
    {
      id: "t2",
      animalId: "1",
      product: "Antibiotique",
      movementDate: "2024-08-20",
    createdAt: "2025-01-01T00:00:00Z",
      administeredBy: "Dr. Benali",
      withdrawalPeriod: 21,
      notes: "Infection respiratoire",
    },
  ],
  vaccinations: [
    {
      id: "v1",
      animalId: "1",
      vaccine: "Enterotoxémie",
      movementDate: "2024-09-01",
    createdAt: "2025-01-01T00:00:00Z",
      administeredBy: "Dr. Benali",
      nextDate: "2025-09-01",
    },
    {
      id: "v2",
      animalId: "1",
      vaccine: "Pasteurellose",
      movementDate: "2024-09-01",
    createdAt: "2025-01-01T00:00:00Z",
      administeredBy: "Dr. Benali",
      nextDate: "2025-09-01",
    },
  ],
  movements: [
    {
      id: "m1",
      animalId: "1",
      fromLocation: "Bergerie",
      toLocation: "Bergerie",
      movementDate: "2022-03-15",
      createdAt: "2025-01-01T00:00:00Z",
      notes: "Naissance dans la ferme",
    },
    {
      id: "m2",
      animalId: "1",
      movementDate: "2023-05-10",
    createdAt: "2025-01-01T00:00:00Z",
      fromLocation: "Bergerie A",
      toLocation: "Bergerie B",
      notes: "Changement de lot",
    },
  ],
};

// Helper pour calculer l'âge
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

// Helper pour traduire les labels
export const speciesLabels: Record<string, string> = {
  sheep: "Mouton",
  goat: "Chèvre",
  cattle: "Bovin",
};

export const sexLabels: Record<string, string> = {
  male: "Mâle",
  female: "Femelle",
};

export const statusLabels: Record<string, string> = {
  active: "Actif",
  sold: "Vendu",
  dead: "Décédé",
  slaughtered: "Abattu",
};
