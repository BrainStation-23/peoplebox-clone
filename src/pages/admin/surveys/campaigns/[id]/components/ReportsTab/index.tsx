import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useResponseProcessing } from "./hooks/useResponseProcessing";

interface ReportsTabProps {
  campaignId: string;
}

export function ReportsTab({ campaignId }: ReportsTabProps) {
  const { data, isLoading } = useResponseProcessing(campaignId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || !data.questions || !data.responses) {
    return <div>No data available</div>;
  }

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
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Respondent</TableHead>
              <TableHead className="w-[200px]">Email</TableHead>
              <TableHead className="w-[200px]">Submitted At</TableHead>
              {data.questions.map((question: any) => (
                <TableHead key={question.name} className="min-w-[200px]">
                  {question.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.responses.map((response) => (
              <TableRow key={response.id}>
                <TableCell className="font-medium">
                  {response.respondent.name || "Anonymous"}
                </TableCell>
                <TableCell>{response.respondent.email}</TableCell>
                <TableCell>
                  {format(new Date(response.submitted_at), "PPp")}
                </TableCell>
                {data.questions.map((question: any) => (
                  <TableCell key={question.name}>
                    {formatAnswer(
                      response.answers[question.name]?.answer,
                      question.type
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}