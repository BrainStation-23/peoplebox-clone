import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResponseProcessing } from "./hooks/useResponseProcessing";
import { BooleanCharts } from "./charts/BooleanCharts";
import { NpsChart } from "./charts/NpsChart";

interface ReportsTabProps {
  campaignId: string;
  instanceId?: string;
}

type ProcessedAnswerData = {
  boolean: { yes: number; no: number };
  rating: Array<{ rating: number; count: number }>;
};

export function ReportsTab({ campaignId, instanceId }: ReportsTabProps) {
  const { data, isLoading } = useResponseProcessing(campaignId, instanceId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || !data.questions || !data.responses) {
    return <div>No data available</div>;
  }

  const processAnswersForQuestion = (questionName: string, type: string): ProcessedAnswerData[keyof ProcessedAnswerData] | null => {
    const answers = data.responses.map(response => response.answers[questionName]?.answer);
    
    switch (type) {
      case "boolean":
        return {
          yes: answers.filter(a => a === true).length,
          no: answers.filter(a => a === false).length,
        };
      
      case "nps":
      case "rating":
        const ratingCounts = new Array(11).fill(0); // 0-10 ratings
        answers.forEach(rating => {
          if (typeof rating === 'number' && rating >= 0 && rating <= 10) {
            ratingCounts[rating]++;
          }
        });
        return ratingCounts.map((count, rating) => ({ rating, count }));
      
      default:
        return null;
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {data.questions.map((question: any) => (
        <Card key={question.name} className="w-full">
          <CardHeader>
            <CardTitle>{question.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {question.type === "boolean" && (
              <BooleanCharts
                data={processAnswersForQuestion(question.name, question.type) as { yes: number; no: number }}
              />
            )}
            
            {(question.type === "nps" || question.type === "rating") && (
              <NpsChart
                data={processAnswersForQuestion(question.name, question.type) as Array<{ rating: number; count: number }>}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}