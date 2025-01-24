import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import DueDateInfo from "./components/DueDateInfo";

type Assignment = {
  id: string;
  survey_id: string;
  user_id: string;
  due_date: string | null;
  status: Database["public"]["Enums"]["assignment_status"] | null;
  created_by: string;
  created_at: string | null;
  updated_at: string | null;
  is_organization_wide: boolean | null;
  campaign_id: string | null;
  survey: {
    id: string;
    name: string;
    description: string | null;
    status: Database["public"]["Enums"]["survey_status"] | null;
    created_at: string;
    created_by: string;
    json_data: Database["public"]["Tables"]["surveys"]["Row"]["json_data"];
    tags: string[] | null;
    updated_at: string;
  };
  campaign?: {
    id: string;
    name: string;
    description: string | null;
    completion_rate: number | null;
    status: string;
    campaign_type: string;
    created_at: string;
    created_by: string;
    ends_at: string | null;
    is_recurring: boolean | null;
    recurring_days: number[] | null;
    recurring_ends_at: string | null;
    recurring_frequency: string | null;
    starts_at: string;
    instance_duration_days: number | null;
    instance_end_time: string | null;
    updated_at: string;
  };
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
  const effectiveDueDate = assignment.due_date || assignment.campaign?.ends_at;
  const daysRemaining = effectiveDueDate ? getDaysRemaining(effectiveDueDate) : null;
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
      <CardContent>
        <DueDateInfo
          dueDate={effectiveDueDate}
          daysRemaining={daysRemaining}
          isOverdue={isOverdue}
          isDueSoon={isDueSoon}
        />
      </CardContent>
    </Card>
  );
}