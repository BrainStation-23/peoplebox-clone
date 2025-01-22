import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";

type Assignment = Database["public"]["Tables"]["survey_assignments"]["Row"] & {
  survey: Database["public"]["Tables"]["surveys"]["Row"];
};

interface SurveyCardProps {
  assignment: Assignment;
  onSelect: (id: string) => void;
}

export default function SurveyCard({ assignment, onSelect }: SurveyCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => onSelect(assignment.id)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{assignment.survey.name}</CardTitle>
          <Badge variant={assignment.status === "pending" ? "secondary" : "success"}>
            {assignment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          {assignment.survey.description}
        </p>
        {assignment.due_date && (
          <p className="text-sm">
            Due: {format(new Date(assignment.due_date), "PPP")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}