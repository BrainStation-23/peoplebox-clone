import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResponseProcessing } from "./hooks/useResponseProcessing";
import { BooleanCharts } from "./charts/BooleanCharts";
import { NpsChart } from "./charts/NpsChart";

interface ReportsTabProps {
  campaignId: string;
}

type ProcessedAnswerData = {
  boolean: { yes: number; no: number };
  rating: Array<{ rating: number; count: number }>;
};

export function ReportsTab({ campaignId }: ReportsTabProps) {
  const { data, isLoading } = useResponseProcessing(campaignId);

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

  const formatAnswer = (answer: any, type: string) => {
    if (answer === null || answer === undefined) return "-";

    switch (type) {
      case "boolean":
        return answer ? "Yes" : "No";
      case "rating":
        return `${answer}/10`;
      case "nps":
        return `${answer}/10`;
      case "date":
        return format(new Date(answer), "PP");
      case "comment":
      case "text":
        return String(answer);
      default:
        return String(answer);
    }
  };

  return (
    <div className="space-y-8">
      {data.questions.map((question: any) => (
        <Card key={question.name} className="p-6">
          <CardHeader>
            <CardTitle>{question.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Charts based on question type */}
            {question.type === "boolean" && (
              <BooleanCharts
                title={question.title}
                data={processAnswersForQuestion(question.name, question.type) as { yes: number; no: number }}
              />
            )}
            
            {(question.type === "nps" || question.type === "rating") && (
              <NpsChart
                title={question.title}
                data={processAnswersForQuestion(question.name, question.type) as Array<{ rating: number; count: number }>}
              />
            )}

            {/* Detailed responses table */}
            <div className="rounded-md border mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Respondent</TableHead>
                    <TableHead className="w-[200px]">Email</TableHead>
                    <TableHead className="w-[200px]">Submitted At</TableHead>
                    <TableHead>Response</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.responses.map((response) => (
                    <TableRow key={`${response.id}-${question.name}`}>
                      <TableCell className="font-medium">
                        {response.respondent.name || "Anonymous"}
                      </TableCell>
                      <TableCell>{response.respondent.email}</TableCell>
                      <TableCell>
                        {format(new Date(response.submitted_at), "PPp")}
                      </TableCell>
                      <TableCell>
                        {formatAnswer(
                          response.answers[question.name]?.answer,
                          question.type
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}