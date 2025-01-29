import { Card } from "@/components/ui/card";
import { ComparisonDimension } from "../../types/comparison";
import { GroupedBarChart } from "../../charts/GroupedBarChart";
import { ProcessedResponse } from "@/pages/admin/surveys/hooks/useResponseProcessing";

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
    const groupedData: Record<string, { yes: number; no: number }> = {};

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
        groupedData[groupKey] = { yes: 0, no: 0 };
      }

      if (answer === true) {
        groupedData[groupKey].yes++;
      } else if (answer === false) {
        groupedData[groupKey].no++;
      }
    });

    // Convert to format needed for GroupedBarChart
    return Object.entries(groupedData).map(([name, data]) => ({
      name,
      Yes: data.yes,
      No: data.no,
    }));
  };

  const data = processData();
  const keys = ["Yes", "No"];
  const colors = ["#22c55e", "#ef4444"]; // Green for Yes, Red for No

  return (
    <Card className="p-4">
      <GroupedBarChart 
        data={data} 
        keys={keys} 
        colors={colors}
        height={300}
      />
    </Card>
  );
}