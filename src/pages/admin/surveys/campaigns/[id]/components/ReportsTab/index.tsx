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
import { SatisfactionDonutChart } from "./charts/SatisfactionDonutChart";

interface ReportsTabProps {
  campaignId: string;
  instanceId?: string;
}

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

  const calculateMedian = (ratings: number[]) => {
    const sorted = [...ratings].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  };

  const processAnswersForQuestion = (questionName: string, type: string, question: any) => {
    const answers = data.responses.map(
      (response) => response.answers[questionName]?.answer
    );

    switch (type) {
      case "boolean":
        return {
          yes: answers.filter((a) => a === true).length,
          no: answers.filter((a) => a === false).length,
        };

      case "rating":
      case "nps": {
        const isNps = question.rateCount === 10;
        
        if (isNps) {
          const ratingCounts = new Array(11).fill(0);
          answers.forEach((rating) => {
            if (typeof rating === "number" && rating >= 0 && rating <= 10) {
              ratingCounts[rating]++;
            }
          });
          return ratingCounts.map((count, rating) => ({ rating, count }));
        } else {
          const validAnswers = answers.filter(
            (rating) => typeof rating === "number" && rating >= 1 && rating <= 5
          );
          
          return {
            unsatisfied: validAnswers.filter((r) => r <= 2).length,
            neutral: validAnswers.filter((r) => r === 3).length,
            satisfied: validAnswers.filter((r) => r >= 4).length,
            total: validAnswers.length,
            median: calculateMedian(validAnswers)
          };
        }
      }

      case "text":
      case "comment": {
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
      }

      default:
        throw new Error(`Unsupported question type: ${type}`);
    }
  };

  return (
    <div className="grid gap-6">
      {data.questions.map((question) => {
        const currentDimension = comparisonDimensions[question.name] || "none";
        const processedData = processAnswersForQuestion(
          question.name,
          question.type,
          question
        );
        const isNpsQuestion = question.type === "rating" && question.rateCount === 10;

        return (
          <Card key={question.name} className="w-full overflow-hidden">
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
                      data={processedData as { yes: number; no: number }}
                    />
                  )}
                  {(question.type === "nps" || question.type === "rating") && (
                    <>
                      {isNpsQuestion ? (
                        <NpsChart
                          data={processedData as { rating: number; count: number }[]}
                        />
                      ) : (
                        <SatisfactionDonutChart
                          data={processedData as { 
                            unsatisfied: number;
                            neutral: number;
                            satisfied: number;
                            total: number;
                            median: number;
                          }}
                        />
                      )}
                    </>
                  )}
                  {(question.type === "text" || question.type === "comment") && (
                    <WordCloud
                      words={processedData as { text: string; value: number }[]}
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
                      isNps={isNpsQuestion}
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