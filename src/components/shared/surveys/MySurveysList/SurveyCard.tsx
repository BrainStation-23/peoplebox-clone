import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import CampaignProgress from "./components/CampaignProgress";
import DueDateInfo from "./components/DueDateInfo";

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
  const isDueSoon = daysRemaining !== null && daysRemaining <= 3 && daysRemaining > 0;

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:bg-accent/50 transition-colors",
        isOverdue && "border-destructive",
        isDueSoon && "border-yellow-500"
      )}
      onClick={() => onSelect(assignment.id)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {assignment.campaign?.name || assignment.survey.name}
              {(isOverdue || isDueSoon) && (
                <AlertCircle 
                  className={cn(
                    "h-5 w-5",
                    isOverdue ? "text-destructive" : "text-yellow-500"
                  )} 
                />
              )}
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
        <DueDateInfo
          dueDate={assignment.due_date}
          daysRemaining={daysRemaining}
          isOverdue={isOverdue}
          isDueSoon={isDueSoon}
        />

        {assignment.campaign && (
          <CampaignProgress campaign={assignment.campaign} />
        )}
      </CardContent>
    </Card>
  );
}