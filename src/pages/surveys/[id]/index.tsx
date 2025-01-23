import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";

export default function UserSurveyResponsePage() {
  const { id } = useParams();

  const { data: assignment, isLoading } = useQuery({
    queryKey: ["survey-assignment", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_assignments")
        .select(`
          *,
          survey:surveys (
            id,
            name,
            description,
            json_data
          ),
          campaign:survey_campaigns (
            id,
            name,
            description
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleComplete = async (survey: any) => {
    const { error } = await supabase
      .from("survey_responses")
      .insert({
        assignment_id: id,
        response_data: survey.data,
      });

    if (error) {
      console.error("Error submitting survey response:", error);
      return;
    }

    // Update assignment status
    await supabase
      .from("survey_assignments")
      .update({ status: "completed" })
      .eq("id", id);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!assignment) {
    return <div>Survey not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        {assignment.campaign?.name || assignment.survey.name}
      </h1>
      {assignment.campaign?.description && (
        <p className="text-muted-foreground mb-6">{assignment.campaign.description}</p>
      )}
      <Survey
        json={assignment.survey.json_data}
        onComplete={handleComplete}
      />
    </div>
  );
}