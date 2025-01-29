import { Card } from "@/components/ui/card";
import { ProcessedResponse } from "../../hooks/useResponseProcessing";
import { ComparisonDimension } from "../../types/comparison";
import { HeatmapChart } from "../../charts/HeatmapChart";

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
    const groupedData: Record<string, Record<number, number>> = {};
    const allValues: Set<number> = new Set();

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
        groupedData[groupKey] = {};
      }

      if (typeof score === "number") {
        allValues.add(score);
        groupedData[groupKey][score] = (groupedData[groupKey][score] || 0) + 1;
      }
    });

    // Convert to heatmap format
    const heatmapData = Object.entries(groupedData).flatMap(([name, scores]) =>
      Array.from(allValues).map((value) => ({
        name,
        value: value.toString(),
        count: scores[value] || 0,
      }))
    );

    return {
      data: heatmapData,
      xCategories: Array.from(allValues).sort((a, b) => a - b).map(String),
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