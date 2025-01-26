import { Card } from "@/components/ui/card";
import { ProcessedResponse } from "../../hooks/useResponseProcessing";
import { ComparisonDimension } from "../../types/comparison";
import { BarChart } from "../../charts/BarChart";

interface NpsComparisonProps {
  responses: ProcessedResponse[];
  questionName: string;
  dimension: ComparisonDimension;
}

export function NpsComparison({
  responses,
  questionName,
  dimension,
}: NpsComparisonProps) {
  const processData = () => {
    const groupedData: Record<
      string,
      { promoters: number; passives: number; detractors: number; total: number }
    > = {};

    responses.forEach((response) => {
      const score = response.answers[questionName]?.answer;
      let groupKey = "Unknown";

      // Get the group key based on the dimension
      switch (dimension) {
        case "sbu":
          groupKey = response.respondent.sbu?.name || "No SBU";
          break;
        case "gender":
          groupKey = response.respondent.gender || "Not Specified";
          break;
        case "location":
          groupKey = response.respondent.location?.name || "No Location";
          break;
        case "employment_type":
          groupKey = response.respondent.employment_type?.name || "Not Specified";
          break;
      }

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          promoters: 0,
          passives: 0,
          detractors: 0,
          total: 0,
        };
      }

      if (typeof score === "number") {
        if (score <= 6) {
          groupedData[groupKey].detractors++;
        } else if (score <= 8) {
          groupedData[groupKey].passives++;
        } else {
          groupedData[groupKey].promoters++;
        }
        groupedData[groupKey].total++;
      }
    });

    // Calculate NPS for each group
    return Object.entries(groupedData).map(([name, data]) => ({
      name,
      value: Math.round(
        ((data.promoters - data.detractors) / data.total) * 100
      ),
    }));
  };

  const data = processData();

  return (
    <Card className="p-4">
      <BarChart 
        data={data}
        colors={["#3b82f6"]} // Use blue as the primary color
      />
      <div className="mt-4 text-sm text-center text-muted-foreground">
        NPS Score by {dimension.replace('_', ' ').toUpperCase()}
      </div>
    </Card>
  );
}