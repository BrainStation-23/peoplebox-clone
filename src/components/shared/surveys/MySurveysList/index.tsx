import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import SurveyCard from "./SurveyCard";
import SurveyFilters from "./components/SurveyFilters";
import { SurveyAssignment } from "@/types/survey";

export default function MySurveysList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["my-survey-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_assignments")
        .select(`
          *,
          survey:surveys (
            id,
            name,
            description,
            status,
            created_at,
            created_by,
            json_data,
            tags,
            updated_at
          ),
          campaign:survey_campaigns (
            id,
            name,
            description,
            completion_rate,
            status,
            campaign_type,
            created_at,
            created_by,
            ends_at,
            is_recurring,
            recurring_days,
            recurring_ends_at,
            recurring_frequency,
            starts_at,
            instance_duration_days,
            instance_end_time,
            updated_at
          )
        `)
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Assignment[];
    },
  });

  // Check for due dates and show notifications
  useEffect(() => {
    if (assignments) {
      const now = new Date();
      assignments.forEach(assignment => {
        const effectiveDueDate = assignment.due_date || assignment.campaign?.ends_at;
        
        if (effectiveDueDate && assignment.status !== 'completed') {
          const dueDate = new Date(effectiveDueDate);
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue <= 3 && daysUntilDue > 0) {
            toast({
              title: "Survey Due Soon",
              description: `"${assignment.campaign?.name || assignment.survey.name}" is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
              variant: "default",
            });
          }
          else if (daysUntilDue < 0 && assignment.status !== 'expired') {
            toast({
              title: "Survey Overdue",
              description: `"${assignment.campaign?.name || assignment.survey.name}" is overdue`,
              variant: "destructive",
            });
          }
        }
      });
    }
  }, [assignments, toast]);

  const handleSelectSurvey = async (id: string) => {
    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (roleData?.role === 'admin') {
      navigate(`/admin/my-surveys/${id}`);
    } else {
      navigate(`/user/my-surveys/${id}`);
    }
  };

  const filteredAssignments = assignments?.filter((assignment) => {
    // Filter out assignments with draft campaigns
    if (assignment.campaign?.status === 'draft') {
      return false;
    }

    const matchesSearch = 
      assignment.campaign?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.survey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.campaign?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.survey.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === "all" || 
      assignment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <SurveyFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
      />

      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="space-y-4 p-4">
          {filteredAssignments?.map((assignment) => (
            <SurveyCard
              key={assignment.id}
              assignment={assignment}
              onSelect={handleSelectSurvey}
            />
          ))}
          {filteredAssignments?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No surveys found matching your criteria
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
