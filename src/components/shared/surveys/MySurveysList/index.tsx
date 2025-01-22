import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SurveyCard from "./SurveyCard";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MySurveysList() {
  const navigate = useNavigate();
  
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
          )
        `)
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleSelectSurvey = (id: string) => {
    navigate(`/admin/my-surveys/${id}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ScrollArea className="h-[calc(100vh-10rem)]">
      <div className="space-y-4 p-4">
        {assignments?.map((assignment) => (
          <SurveyCard
            key={assignment.id}
            assignment={assignment}
            onSelect={handleSelectSurvey}
          />
        ))}
      </div>
    </ScrollArea>
  );
}