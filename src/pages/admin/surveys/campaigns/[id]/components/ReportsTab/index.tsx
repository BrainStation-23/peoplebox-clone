import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResponseProcessing } from "./hooks/useResponseProcessing";
import { BooleanCharts } from "./charts/BooleanCharts";
import { NpsChart } from "./charts/NpsChart";
import { WordCloud } from "./charts/WordCloud";

interface ReportsTabProps {
  campaignId: string;
  instanceId?: string;
}

type ProcessedAnswerData = {
  boolean: { yes: number; no: number };
  rating: Array<{ rating: number; count: number }>;
  text: Array<{ text: string; value: number }>;
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
        const ratingCounts = new Array(11).fill(0);
        answers.forEach(rating => {
          if (typeof rating === 'number' && rating >= 0 && rating <= 10) {
            ratingCounts[rating]++;
          }
        });
        return ratingCounts.map((count, rating) => ({ rating, count }));
      
      case "text":
      case "comment":
        // Process text responses
        const wordFrequency: Record<string, number> = {};
        
        // Combine all text responses and split into words
        answers.forEach(answer => {
          if (typeof answer === 'string') {
            // Convert to lowercase, remove punctuation, and split into words
            const words = answer.toLowerCase()
              .replace(/[^\w\s]/g, '')
              .split(/\s+/)
              .filter(word => word.length > 2); // Filter out short words
            
            // Count word frequencies
            words.forEach(word => {
              wordFrequency[word] = (wordFrequency[word] || 0) + 1;
            });
          }
        });
        
        // Convert to array format required by WordCloud
        return Object.entries(wordFrequency)
          .map(([text, value]) => ({ text, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 50); // Limit to top 50 words
      
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

            {(question.type === "text" || question.type === "comment") && (
              <WordCloud
                title={question.title}
                words={processAnswersForQuestion(question.name, question.type) as Array<{ text: string; value: number }>}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}