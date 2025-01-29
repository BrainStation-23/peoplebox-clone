import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProcessedResponses } from "@/pages/admin/surveys/hooks/useProcessedResponses";
import { BooleanCharts } from "./charts/BooleanCharts";
import { NpsChart } from "./charts/NpsChart";
import { WordCloud } from "./charts/WordCloud";
import { ComparisonSelector } from "./components/ComparisonSelector";
import { BooleanComparison } from "./components/comparisons/BooleanComparison";
import { NpsComparison } from "./components/comparisons/NpsComparison";
import { TextComparison } from "./components/comparisons/TextComparison";
import { useState } from "react";
import { ComparisonDimension } from "./types/comparison";

interface ReportsTabProps {
  campaignId: string;
  instanceId?: string;
}

export function ReportsTab({ campaignId, instanceId }: ReportsTabProps) {
  const { questions, isLoading, error } = useProcessedResponses(campaignId, instanceId);
  const [comparisonDimensions, setComparisonDimensions] = useState<
    Record<string, ComparisonDimension>
  >({});

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!questions?.length) {
    return <div>No data available</div>;
  }

  const handleComparisonChange = (questionName: string, dimension: ComparisonDimension) => {
    setComparisonDimensions((prev) => ({
      ...prev,
      [questionName]: dimension,
    }));
  };

  return (
    <div className="grid gap-6">
      {questions.map((question) => {
        const currentDimension = comparisonDimensions[question.name] || "none";

        return (
          <Card key={question.name} className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>{question.title}</CardTitle>
              <ComparisonSelector
                value={currentDimension}
                onChange={(dimension) =>
                  handleComparisonChange(question.name, dimension)
                }
              />
            </CardHeader>
            <CardContent className="space-y-4">
              {currentDimension === "none" && (
                <>
                  {question.type === "boolean" && (
                    <BooleanCharts data={question.data.data} />
                  )}
                  {(question.type === "nps" || question.type === "rating") && (
                    <NpsChart data={question.data.data} />
                  )}
                  {(question.type === "text" || question.type === "comment") && (
                    <WordCloud words={question.data.data} />
                  )}
                </>
              )}

              {currentDimension !== "none" && (
                <>
                  {question.type === "boolean" && (
                    <BooleanComparison
                      responses={question.data.data}
                      questionName={question.name}
                      dimension={currentDimension}
                    />
                  )}
                  {(question.type === "nps" || question.type === "rating") && (
                    <NpsComparison
                      responses={question.data.data}
                      questionName={question.name}
                      dimension={currentDimension}
                    />
                  )}
                  {(question.type === "text" || question.type === "comment") && (
                    <TextComparison
                      responses={question.data.data}
                      questionName={question.name}
                      dimension={currentDimension}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}