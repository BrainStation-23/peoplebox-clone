import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResponseProcessing } from "./hooks/useResponseProcessing";
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

type BooleanAnswer = {
  yes: number;
  no: number;
};

type RatingAnswer = {
  rating: number;
  count: number;
}[];

type TextAnswer = {
  text: string;
  value: number;
}[];

type ProcessedAnswer = BooleanAnswer | RatingAnswer | TextAnswer;

export function ReportsTab({ campaignId, instanceId }: ReportsTabProps) {
  const { data, isLoading } = useResponseProcessing(campaignId, instanceId);
  const [comparisonDimensions, setComparisonDimensions] = useState<
    Record<string, ComparisonDimension>
  >({});

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || !data.questions || !data.responses) {
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
      {data.questions.map((question: any) => {
        const currentDimension = comparisonDimensions[question.name] || "none";
        const processedData = processAnswersForQuestion(
          question.name,
          question.type,
          data.responses
        );

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
                    <BooleanCharts
                      data={processedData as BooleanAnswer}
                    />
                  )}
                  {(question.type === "nps" || question.type === "rating") && (
                    <NpsChart
                      data={processedData as RatingAnswer}
                    />
                  )}
                  {(question.type === "text" || question.type === "comment") && (
                    <WordCloud
                      words={processedData as TextAnswer}
                    />
                  )}
                </>
              )}

              {currentDimension !== "none" && (
                <>
                  {question.type === "boolean" && (
                    <BooleanComparison
                      responses={data.responses}
                      questionName={question.name}
                      dimension={currentDimension}
                    />
                  )}
                  {(question.type === "nps" || question.type === "rating") && (
                    <NpsComparison
                      responses={data.responses}
                      questionName={question.name}
                      dimension={currentDimension}
                    />
                  )}
                  {(question.type === "text" || question.type === "comment") && (
                    <TextComparison
                      responses={data.responses}
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

function processAnswersForQuestion(
  questionName: string,
  type: string,
  responses: any[]
): ProcessedAnswer {
  const answers = responses.map(
    (response) => response.answers[questionName]?.answer
  );

  switch (type) {
    case "boolean":
      return {
        yes: answers.filter((a) => a === true).length,
        no: answers.filter((a) => a === false).length,
      };

    case "nps":
    case "rating":
      const ratingCounts = new Array(11).fill(0);
      answers.forEach((rating) => {
        if (typeof rating === "number" && rating >= 0 && rating <= 10) {
          ratingCounts[rating]++;
        }
      });
      return ratingCounts.map((count, rating) => ({ rating, count }));

    case "text":
    case "comment":
      const wordFrequency: Record<string, number> = {};
      answers.forEach((answer) => {
        if (typeof answer === "string") {
          const words = answer
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .split(/\s+/)
            .filter((word) => word.length > 2);

          words.forEach((word) => {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
          });
        }
      });

      return Object.entries(wordFrequency)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50);

    default:
      throw new Error(`Unsupported question type: ${type}`);
  }
}