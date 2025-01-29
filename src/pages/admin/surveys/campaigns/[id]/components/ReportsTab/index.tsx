import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComparisonSelector } from "./components/ComparisonSelector";
import { ComparisonDimension } from "./types/comparison";
import { ProcessorFactory, QUESTION_PROCESSORS } from "@/pages/admin/surveys/types/processors";
import { BarChart } from "./charts/BarChart";
import { DonutChart } from "./charts/DonutChart";
import { LineChart } from "./charts/LineChart";
import { NpsVisualization } from "@/components/shared/charts/NpsVisualization";
import { useToast } from "@/hooks/use-toast";
import { useProcessedResponses } from "@/pages/admin/surveys/hooks/useProcessedResponses";
import { ChartType } from "@/pages/admin/surveys/types/processors/base";

interface ReportsTabProps {
  campaignId: string;
  instanceId?: string;
}

interface BooleanData {
  yes: number;
  no: number;
}

interface NpsData {
  rating: number;
  count: number;
}

interface WordData {
  text: string;
  value: number;
}

interface ProcessedQuestion {
  name: string;
  title: string;
  type: string;
  rateCount?: number;
  data: {
    responses: BooleanData | NpsData[] | WordData[];
  };
}

export function ReportsTab({ campaignId, instanceId }: ReportsTabProps) {
  const { questions, isLoading, error } = useProcessedResponses(campaignId, instanceId);
  const [comparisonDimensions, setComparisonDimensions] = useState<
    Record<string, ComparisonDimension>
  >({});
  const { toast } = useToast();

  console.log("[ReportsTab] Initial questions data:", questions);
  console.log("[ReportsTab] Loading state:", isLoading);
  console.log("[ReportsTab] Error state:", error);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading reports",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (!isLoading && !error && !questions?.length) {
      toast({
        title: "No data available",
        description: "No questions found for this survey",
        variant: "destructive",
      });
    }
  }, [isLoading, error, questions, toast]);

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
    console.log("[ReportsTab] Comparison dimension changed:", { questionName, dimension });
    setComparisonDimensions((prev) => ({
      ...prev,
      [questionName]: dimension,
    }));
  };

  const renderVisualization = (question: ProcessedQuestion) => {
    console.log("[ReportsTab] Rendering visualization for question:", {
      name: question.name,
      type: question.type,
      data: question.data,
      rateCount: question.rateCount,
    });

    const processor = QUESTION_PROCESSORS[question.type]?.();
    if (!processor) {
      console.warn(`[ReportsTab] No processor found for question type: ${question.type}`);
      return null;
    }

    const config = processor.getConfig();
    console.log("[ReportsTab] Processor config:", config);
    const { visualization } = config;

    console.log("[ReportsTab] Question data before visualization:", {
      primary: visualization.primary,
      data: question.data.responses,
    });

    const chartType: ChartType = visualization.primary;
    const colorArray = Object.values(visualization.colors);

    // Check if it's a rating question and determine the type based on rateCount
    if (question.type === 'rating') {
      if (question.rateCount === 10) {
        // NPS rating (0-10)
        return <NpsVisualization data={question.data.responses as NpsData[]} />;
      } else {
        // Satisfaction rating (1-5)
        return <BarChart 
          data={(question.data.responses as NpsData[]).map((item) => ({
            name: String(item.rating),
            value: item.count
          }))} 
          colors={colorArray}
        />;
      }
    }

    switch (chartType) {
      case 'donut':
        return <DonutChart data={question.data.responses} colors={colorArray} />;
      case 'bar':
        console.log("[ReportsTab] Rendering bar chart with data:", question.data.responses);
        return <BarChart data={question.data.responses} colors={colorArray} />;
      case 'nps-combined':
        return <NpsVisualization data={question.data.responses as NpsData[]} />;
      default:
        console.warn(`[ReportsTab] Unsupported visualization type: ${visualization.primary}`);
        return <div>Unsupported visualization type</div>;
    }
  };

  return (
    <div className="grid gap-6">
      {questions.map((question) => {
        const currentDimension = comparisonDimensions[question.name] || "none";
        console.log("[ReportsTab] Processing question:", {
          name: question.name,
          type: question.type,
          dimension: currentDimension,
          rateCount: question.rateCount,
        });

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