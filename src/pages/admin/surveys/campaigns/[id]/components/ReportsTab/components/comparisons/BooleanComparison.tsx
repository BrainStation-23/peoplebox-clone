import { Card } from "@/components/ui/card";
import { ProcessedResponse } from "../../hooks/useResponseProcessing";
import { ComparisonDimension } from "../../types/comparison";
import { HeatmapChart } from "../../charts/HeatmapChart";

interface BooleanComparisonProps {
  responses: ProcessedResponse[];
  questionName: string;
  dimension: ComparisonDimension;
}

export function BooleanComparison({
  responses,
  questionName,
  dimension,
}: BooleanComparisonProps) {
  const processData = () => {
    const groupedData: Record<string, Record<string, number>> = {};

    responses.forEach((response) => {
      const answer = response.answers[questionName]?.answer;
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
        groupedData[groupKey] = { "Yes": 0, "No": 0 };
      }

      if (answer === true) {
        groupedData[groupKey]["Yes"]++;
      } else if (answer === false) {
        groupedData[groupKey]["No"]++;
      }
    });

    // Convert to heatmap format
    const heatmapData = Object.entries(groupedData).flatMap(([name, answers]) =>
      Object.entries(answers).map(([value, count]) => ({
        name,
        value,
        count,
      }))
    );

    return {
      data: heatmapData,
      xCategories: ["Yes", "No"],
    };
  };

  const { data, xCategories } = processData();

  return (
    <Card className="p-4">
      <HeatmapChart 
        data={data}
        xCategories={xCategories}
        height={400}
      />
      <div className="mt-4 text-sm text-center text-muted-foreground">
        Response Distribution by {dimension.replace('_', ' ').toUpperCase()}
      </div>
    </Card>
  );
}