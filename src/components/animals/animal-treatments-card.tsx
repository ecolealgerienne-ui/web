import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Treatment } from "@/lib/types/treatment";

interface AnimalTreatmentsCardProps {
  treatments: Treatment[];
}

export function AnimalTreatmentsCard({
  treatments,
}: AnimalTreatmentsCardProps) {
  const sortedTreatments = [...treatments].sort(
    (a, b) => new Date(b.treatmentDate).getTime() - new Date(a.treatmentDate).getTime()
  );

  const getVeterinarianName = (treatment: Treatment) => {
    if (treatment.veterinarian) {
      return `Dr. ${treatment.veterinarian.lastName}`;
    }
    return treatment.veterinarianName || '-';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traitements</CardTitle>
      </CardHeader>
      <CardContent>
        {treatments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucun traitement enregistré
          </p>
        ) : (
          <div className="space-y-4">
            {sortedTreatments.map((treatment) => (
              <div
                key={treatment.id}
                className="flex flex-col gap-2 pb-4 border-b last:border-0"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{treatment.productName || '-'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(treatment.treatmentDate).toLocaleDateString("fr-FR")} •{" "}
                      {getVeterinarianName(treatment)}
                    </p>
                  </div>
                  {treatment.withdrawalEndDate && (
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Fin délai d&apos;attente
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(treatment.withdrawalEndDate).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  )}
                </div>
                {treatment.notes && (
                  <p className="text-sm text-muted-foreground">
                    {treatment.notes}
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
