export const mockDashboardStats = {
  totalAnimals: 1247,
  births: {
    count: 45,
    period: "30 derniers jours",
  },
  deaths: {
    count: 12,
    period: "30 derniers jours",
  },
  vaccinations: {
    upcoming: 23,
    label: "à faire",
  },
};

export const mockChartData = [
  { month: "june", animals: 1150 },
  { month: "july", animals: 1180 },
  { month: "august", animals: 1195 },
  { month: "september", animals: 1210 },
  { month: "october", animals: 1230 },
  { month: "november", animals: 1247 },
];

export const mockAlerts = [
  {
    id: 1,
    type: "destructive" as const,
    count: 5,
    label: "Vaccinations en retard",
  },
  {
    id: 2,
    type: "warning" as const,
    count: 2,
    label: "Traitements à compléter",
  },
  {
    id: 3,
    type: "warning" as const,
    count: 12,
    label: "Pesées dues",
  },
];

export const mockRecentActivities = [
  {
    id: 1,
    label: "Vaccination - Lot A",
    time: "il y a 1 jour",
  },
  {
    id: 2,
    label: "Naissance - EID 123456",
    time: "il y a 2 jours",
  },
  {
    id: 3,
    label: "Vente - 5 animaux",
    time: "il y a 3 jours",
  },
  {
    id: 4,
    label: "Traitement - Lot B",
    time: "il y a 5 jours",
  },
];
