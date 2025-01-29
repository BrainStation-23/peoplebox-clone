import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProcessedResponses } from "@/pages/admin/surveys/hooks/useProcessedResponses";
import { ComparisonSelector } from "./components/ComparisonSelector";
import { useState } from "react";
import { ComparisonDimension } from "./types/comparison";
import { ProcessorFactory, QUESTION_PROCESSORS } from "@/pages/admin/surveys/types/processors";
import { BarChart } from "./charts/BarChart";
import { DonutChart } from "./charts/DonutChart";
import { LineChart } from "./charts/LineChart";

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

  const renderVisualization = (question: any) => {
    const processor = QUESTION_PROCESSORS[question.type]?.();
    if (!processor) {
      console.warn(`No processor found for question type: ${question.type}`);
      return null;
    }

    const config = processor.getConfig();
    const { visualization } = config;

    switch (visualization.type) {
      case 'donut':
        return <DonutChart data={question.data.responses} colors={config.colors} />;
      case 'bar':
        return <BarChart data={question.data.responses} colors={config.colors} />;
      default:
        return <div>Unsupported visualization type</div>;
    }
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
              {renderVisualization(question)}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}