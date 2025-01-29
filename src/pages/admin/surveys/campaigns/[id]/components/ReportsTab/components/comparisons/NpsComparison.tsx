import { Card } from "@/components/ui/card";
import { ComparisonDimension } from "../../types/comparison";
import { BarChart } from "../../charts/BarChart";
import type { ProcessedResponse } from "@/pages/admin/surveys/hooks/useResponseProcessing";

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
      // Add null checks for response.answers
      if (!response.answers || !response.answers[questionName]?.answer) {
        console.warn(`Missing answer data for question: ${questionName}`);
        return;
      }

      const score = response.answers[questionName].answer;
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
    return Object.entries(groupedData)
      .filter(([_, data]) => data.total > 0) // Only include groups with responses
      .map(([name, data]) => ({
        name,
        value: Math.round(
          ((data.promoters - data.detractors) / (data.total || 1)) * 100
        ),
      }));
  };

  const data = processData();

  if (data.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          No data available for comparison
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <BarChart data={data} colors={["#3b82f6"]} />
      <div className="mt-4 text-sm text-center text-muted-foreground">
        NPS Score by {dimension.replace("_", " ").toUpperCase()}
      </div>
    </Card>
  );
}