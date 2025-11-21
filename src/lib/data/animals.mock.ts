import { Animal, AnimalDetail, Weight, Treatment, Vaccination, Movement } from "@/lib/types/animal";

// Helper pour générer des EIDs
const generateEID = (index: number) => `250${String(index).padStart(12, "0")}`;

export const mockAnimals: Animal[] = [
  {
    id: "1",
    eid: generateEID(1),
    internalId: "A001",
    name: "Bella",
    species: "sheep",
    breed: "Ouled Djellal",
    sex: "female",
    birthDate: "2022-03-15",
    status: "active",
    currentWeight: 45.5,
    acquisitionDate: "2022-03-15",
    acquisitionType: "birth",
    lotId: "lot-1",
    farmId: "farm-1",
    createdAt: "2022-03-15T10:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
  },
  {
    id: "2",
    eid: generateEID(2),
    internalId: "A002",
    name: "Sultan",
    species: "sheep",
    breed: "Rembi",
    sex: "male",
    birthDate: "2021-05-20",
    status: "active",
    currentWeight: 68.2,
    acquisitionDate: "2021-05-20",
    acquisitionType: "birth",
    motherId: "10",
    fatherId: "11",
    lotId: "lot-1",
    farmId: "farm-1",
    createdAt: "2021-05-20T10:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
  },
  {
    id: "3",
    eid: generateEID(3),
    internalId: "A003",
    species: "goat",
    breed: "Arabia",
    sex: "female",
    birthDate: "2023-01-10",
    status: "active",
    currentWeight: 32.0,
    acquisitionDate: "2023-01-10",
    acquisitionType: "birth",
    lotId: "lot-2",
    farmId: "farm-1",
    createdAt: "2023-01-10T10:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
  },
  {
    id: "4",
    eid: generateEID(4),
    internalId: "A004",
    name: "Noir",
    species: "cattle",
    breed: "Brune",
    sex: "male",
    birthDate: "2020-08-12",
    status: "active",
    currentWeight: 420.5,
    acquisitionDate: "2021-03-15",
    acquisitionType: "purchase",
    lotId: "lot-3",
    farmId: "farm-1",
    createdAt: "2021-03-15T10:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
  },
  {
    id: "5",
    eid: generateEID(5),
    internalId: "A005",
    name: "Zahra",
    species: "sheep",
    breed: "Ouled Djellal",
    sex: "female",
    birthDate: "2023-04-22",
    status: "active",
    currentWeight: 38.0,
    acquisitionDate: "2023-04-22",
    acquisitionType: "birth",
    motherId: "1",
    lotId: "lot-1",
    farmId: "farm-1",
    createdAt: "2023-04-22T10:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
  },
  {
    id: "6",
    eid: generateEID(6),
    internalId: "A006",
    species: "sheep",
    breed: "Rembi",
    sex: "male",
    birthDate: "2024-02-10",
    status: "active",
    currentWeight: 25.0,
    acquisitionDate: "2024-02-10",
    acquisitionType: "birth",
    motherId: "1",
    fatherId: "2",
    lotId: "lot-1",
    farmId: "farm-1",
    createdAt: "2024-02-10T10:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
  },
  {
    id: "7",
    eid: generateEID(7),
    internalId: "A007",
    species: "goat",
    breed: "Makatia",
    sex: "female",
    birthDate: "2022-11-05",
    status: "sold",
    currentWeight: 35.5,
    acquisitionDate: "2022-11-05",
    acquisitionType: "birth",
    lotId: "lot-2",
    farmId: "farm-1",
    createdAt: "2022-11-05T10:00:00Z",
    updatedAt: "2024-10-15T10:00:00Z",
  },
  {
    id: "8",
    eid: generateEID(8),
    internalId: "A008",
    name: "Blanc",
    species: "sheep",
    breed: "D'man",
    sex: "male",
    birthDate: "2021-07-18",
    status: "active",
    currentWeight: 55.0,
    acquisitionDate: "2021-12-01",
    acquisitionType: "purchase",
    lotId: "lot-1",
    farmId: "farm-1",
    createdAt: "2021-12-01T10:00:00Z",
    updatedAt: "2024-11-20T10:00:00Z",
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
      date: "2024-11-01",
      note: "Pesée mensuelle",
    },
    {
      id: "w2",
      animalId: "1",
      weight: 43.2,
      date: "2024-10-01",
    },
    {
      id: "w3",
      animalId: "1",
      weight: 40.8,
      date: "2024-09-01",
    },
    {
      id: "w4",
      animalId: "1",
      weight: 38.5,
      date: "2024-08-01",
    },
  ],
  treatments: [
    {
      id: "t1",
      animalId: "1",
      product: "Ivermectine",
      date: "2024-10-15",
      administeredBy: "Dr. Benali",
      withdrawalPeriod: 14,
      note: "Traitement antiparasitaire",
    },
    {
      id: "t2",
      animalId: "1",
      product: "Antibiotique",
      date: "2024-08-20",
      administeredBy: "Dr. Benali",
      withdrawalPeriod: 21,
      note: "Infection respiratoire",
    },
  ],
  vaccinations: [
    {
      id: "v1",
      animalId: "1",
      vaccine: "Enterotoxémie",
      date: "2024-09-01",
      administeredBy: "Dr. Benali",
      nextDate: "2025-09-01",
    },
    {
      id: "v2",
      animalId: "1",
      vaccine: "Pasteurellose",
      date: "2024-09-01",
      administeredBy: "Dr. Benali",
      nextDate: "2025-09-01",
    },
  ],
  movements: [
    {
      id: "m1",
      animalId: "1",
      type: "birth",
      date: "2022-03-15",
      note: "Naissance dans la ferme",
    },
    {
      id: "m2",
      animalId: "1",
      type: "transfer",
      date: "2023-05-10",
      fromLocation: "Bergerie A",
      toLocation: "Bergerie B",
      note: "Changement de lot",
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
