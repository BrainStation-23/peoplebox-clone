import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Survey = Database["public"]["Tables"]["surveys"]["Row"];
type SurveyAssignment = Database["public"]["Tables"]["survey_assignments"]["Row"];
type Campaign = Database["public"]["Tables"]["survey_campaigns"]["Row"];

type Assignment = SurveyAssignment & {
  survey: Survey;
  campaign?: Campaign;
};

interface SurveyCardProps {
  assignment: Assignment;
  onSelect: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "success";
    case "expired":
      return "destructive";
    default:
      return "secondary";
  }
};

const getDaysRemaining = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function SurveyCard({ assignment, onSelect }: SurveyCardProps) {
  const daysRemaining = assignment.due_date ? getDaysRemaining(assignment.due_date) : null;
  const isOverdue = daysRemaining !== null && daysRemaining < 0;

  return (
    <Card 
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => onSelect(assignment.id)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {assignment.campaign?.name || assignment.survey.name}
            </CardTitle>
            {assignment.campaign?.description && (
              <p className="text-sm text-muted-foreground">
                {assignment.campaign.description}
              </p>
            )}
          </div>
          <Badge variant={getStatusColor(assignment.status || "pending")}>
            {assignment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {assignment.due_date ? (
              <span className={isOverdue ? "text-destructive" : ""}>
                Due: {format(new Date(assignment.due_date), "PPP")}
              </span>
            ) : (
              <span>No due date</span>
            )}
          </div>
          {daysRemaining !== null && !isOverdue && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{daysRemaining} days remaining</span>
            </div>
          )}
        </div>

        {assignment.campaign && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Campaign Progress</span>
              <span>{Math.round(assignment.campaign.completion_rate)}%</span>
            </div>
            <Progress value={assignment.campaign.completion_rate} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}