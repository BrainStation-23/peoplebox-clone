import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import SurveyCard from "./SurveyCard";
import SurveyFilters from "./components/SurveyFilters";

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
            survey_id,
            updated_at
          )
        `)
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Check for due dates and show notifications
  useEffect(() => {
    if (assignments) {
      const now = new Date();
      assignments.forEach(assignment => {
        if (assignment.due_date && assignment.status !== 'completed') {
          const dueDate = new Date(assignment.due_date);
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

  // Subscribe to real-time updates for new assignments
  useEffect(() => {
    const channel = supabase
      .channel('survey_assignments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'survey_assignments',
          filter: `user_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`
        },
        (payload) => {
          toast({
            title: "New Survey Assignment",
            description: "You have been assigned a new survey",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleSelectSurvey = async (id: string) => {
    navigate(`/admin/my-surveys/${id}`);
  };

  const filteredAssignments = assignments?.filter((assignment) => {
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