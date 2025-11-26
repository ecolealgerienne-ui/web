import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vaccination } from "@/lib/types/vaccination";

interface AnimalVaccinationsCardProps {
  vaccinations: Vaccination[];
}

export function AnimalVaccinationsCard({
  vaccinations,
}: AnimalVaccinationsCardProps) {
  const sortedVaccinations = [...vaccinations].sort(
    (a, b) => new Date(b.vaccinationDate).getTime() - new Date(a.vaccinationDate).getTime()
  );

  const isUpcoming = (nextDate?: string) => {
    if (!nextDate) return false;
    const next = new Date(nextDate);
    const now = new Date();
    const diffDays = Math.ceil(
      (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays > 0 && diffDays <= 30;
  };

  const isOverdue = (nextDate?: string) => {
    if (!nextDate) return false;
    return new Date(nextDate) < new Date();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vaccinations</CardTitle>
      </CardHeader>
      <CardContent>
        {vaccinations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucune vaccination enregistrée
          </p>
        ) : (
          <div className="space-y-4">
            {sortedVaccinations.map((vaccination) => (
              <div
                key={vaccination.id}
                className="flex flex-col gap-2 pb-4 border-b last:border-0"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{vaccination.vaccineName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(vaccination.vaccinationDate).toLocaleDateString("fr-FR")}{" "}
                      • {vaccination.administeredBy}
                    </p>
                  </div>
                  {vaccination.nextDueDate && (
                    <div className="text-right">
                      <p className="text-sm font-medium mb-1">Prochain rappel</p>
                      <p className="text-sm text-muted-foreground mb-1">
                        {new Date(vaccination.nextDueDate).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                      {isOverdue(vaccination.nextDueDate) && (
                        <Badge variant="destructive">En retard</Badge>
                      )}
                      {isUpcoming(vaccination.nextDueDate) && (
                        <Badge variant="warning">À venir</Badge>
                      )}
                    </div>
                  )}
                </div>
                {vaccination.notes && (
                  <p className="text-sm text-muted-foreground">
                    {vaccination.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
