import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Treatment } from "@/lib/types/animal";

interface AnimalTreatmentsCardProps {
  treatments: Treatment[];
}

export function AnimalTreatmentsCard({
  treatments,
}: AnimalTreatmentsCardProps) {
  const sortedTreatments = [...treatments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
                    <p className="font-medium">{treatment.product}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(treatment.date).toLocaleDateString("fr-FR")} •{" "}
                      {treatment.administeredBy}
                    </p>
                  </div>
                  {treatment.withdrawalPeriod && (
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Délai d'attente
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {treatment.withdrawalPeriod} jours
                      </p>
                    </div>
                  )}
                </div>
                {treatment.note && (
                  <p className="text-sm text-muted-foreground">
                    {treatment.note}
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
