import { useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useResponseProcessing } from "./hooks/useResponseProcessing";
import { format } from "date-fns";

export function ReportsTab() {
  const { id } = useParams();
  const { data, isLoading } = useResponseProcessing(id!);

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
        return `${answer}/5`;
      case "date":
        return format(new Date(answer), "PP");
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
              <TableHead>Respondent</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Submitted At</TableHead>
              {data.questions.map((question: any) => (
                <TableHead key={question.name}>{question.title}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.responses.map((response) => (
              <TableRow key={response.id}>
                <TableCell>{response.respondent.name}</TableCell>
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