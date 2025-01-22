import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AssignCampaignUsers } from "./AssignCampaignUsers";

interface Assignment {
  id: string;
  status: "pending" | "completed" | "expired";
  due_date: string | null;
  user: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
  sbu_assignments: {
    sbu: {
      id: string;
      name: string;
    };
  }[];
}

interface AssignmentInstanceListProps {
  assignments: Assignment[];
  isLoading?: boolean;
  campaignId?: string;
  surveyId?: string;
}

export function AssignmentInstanceList({ 
  assignments, 
  isLoading,
  campaignId,
  surveyId
}: AssignmentInstanceListProps) {
  if (isLoading) {
    return <div>Loading assignments...</div>;
  }

  const getStatusColor = (status: Assignment["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "expired":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Assignments</h3>
        {surveyId && campaignId && (
          <AssignCampaignUsers
            surveyId={surveyId}
            campaignId={campaignId}
          />
        )}
      </div>

      <ScrollArea className="h-[600px] rounded-md border">
        <div className="p-4 space-y-4">
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No assignments found
            </div>
          ) : (
            assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {assignment.user.first_name} {assignment.user.last_name}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {assignment.user.email}
                  </div>
                  {assignment.sbu_assignments.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      SBU: {assignment.sbu_assignments[0].sbu.name}
                    </div>
                  )}
                </div>
                <Badge className={getStatusColor(assignment.status)}>
                  {assignment.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}