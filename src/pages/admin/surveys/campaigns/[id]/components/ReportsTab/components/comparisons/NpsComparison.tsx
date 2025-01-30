import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatMapChart } from "../../charts/HeatMapChart";
import { NpsChart } from "../../charts/NpsChart";
import type { ProcessedResponse } from "../../hooks/useResponseProcessing";

interface NpsComparisonProps {
  responses: ProcessedResponse[];
  questionName: string;
  dimension: "sbu" | "gender" | "location" | "employment_type" | "none";
}

export function NpsComparison({
  responses,
  questionName,
  dimension,
}: NpsComparisonProps) {
  const processResponses = () => {
    const groupedData = new Map();

    responses.forEach((response) => {
      const questionData = response.answers[questionName];
      if (!questionData || typeof questionData.answer !== "number") return;

      const answer = questionData.answer;
      const isNpsQuestion = questionData.questionType === "rating" && 
                           response.answers[questionName]?.rateCount === 10;

      let dimensionValue = "Unknown";
      switch (dimension) {
        case "sbu":
          dimensionValue = response.respondent.sbu?.name || "Unknown";
          break;
        case "gender":
          dimensionValue = response.respondent.gender || "Unknown";
          break;
        case "location":
          dimensionValue = response.respondent.location?.name || "Unknown";
          break;
        case "employment_type":
          dimensionValue = response.respondent.employment_type?.name || "Unknown";
          break;
      }

      if (!groupedData.has(dimensionValue)) {
        groupedData.set(dimensionValue, {
          dimension: dimensionValue,
          unsatisfied: 0,
          neutral: 0,
          satisfied: 0,
          total: 0,
          ratings: [],
          isNps: isNpsQuestion
        });
      }

      const group = groupedData.get(dimensionValue);
      group.total += 1;
      group.ratings.push(answer);

      if (isNpsQuestion) {
        // NPS ratings are already handled by the NpsChart component
        return;
      }

      // For satisfaction ratings (1-5)
      if (answer <= 3) {
        group.unsatisfied += 1;
      } else if (answer === 4) {
        group.neutral += 1;
      } else {
        group.satisfied += 1;
      }
    });

    return Array.from(groupedData.values());
  };

  const data = processResponses();
  
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No data available</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Check if this is an NPS question by looking at the first response
  const firstResponse = responses.find(r => r.answers[questionName])?.answers[questionName];
  const isNpsQuestion = firstResponse?.questionType === "rating" && firstResponse?.rateCount === 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Distribution by {dimension.toUpperCase()}</CardTitle>
      </CardHeader>
      <CardContent>
        {isNpsQuestion ? (
          <NpsChart 
            data={data.flatMap(group => 
              group.ratings.map(rating => ({ 
                rating, 
                count: 1,
                group: group.dimension 
              }))
            )} 
          />
        ) : (
          <HeatMapChart data={data} />
        )}
      </CardContent>
    </Card>
  );
}