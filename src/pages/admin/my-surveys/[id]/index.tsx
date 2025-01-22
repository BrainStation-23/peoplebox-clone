import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import "survey-core/defaultV2.min.css";

export default function SurveyResponsePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<Model | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
            json_data,
            status
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Load or create survey response
  const { data: existingResponse } = useQuery({
    queryKey: ["survey-response", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("*")
        .eq("assignment_id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (assignment?.survey.json_data) {
      const surveyModel = new Model(assignment.survey.json_data);
      
      // Load existing response data if available
      if (existingResponse?.response_data) {
        surveyModel.data = existingResponse.response_data;
      }
      
      // Handle auto-save
      surveyModel.onValueChanged.add(async (sender, options) => {
        try {
          const response = existingResponse
            ? await supabase
                .from("survey_responses")
                .update({
                  response_data: sender.data,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", existingResponse.id)
            : await supabase
                .from("survey_responses")
                .insert({
                  assignment_id: id,
                  user_id: (await supabase.auth.getUser()).data.user?.id,
                  response_data: sender.data,
                });

          if (response.error) throw response.error;
          setLastSaved(new Date());
        } catch (error) {
          console.error("Error saving response:", error);
          toast({
            title: "Error saving response",
            description: "Your progress could not be saved. Please try again.",
            variant: "destructive",
          });
        }
      });

      // Handle survey completion
      surveyModel.onComplete.add(async (sender) => {
        try {
          const response = await supabase
            .from("survey_responses")
            .upsert({
              id: existingResponse?.id,
              assignment_id: id,
              user_id: (await supabase.auth.getUser()).data.user?.id,
              response_data: sender.data,
              submitted_at: new Date().toISOString(),
            });

          if (response.error) throw response.error;

          // Update assignment status
          const assignmentUpdate = await supabase
            .from("survey_assignments")
            .update({ status: "completed" })
            .eq("id", id);

          if (assignmentUpdate.error) throw assignmentUpdate.error;

          toast({
            title: "Survey completed",
            description: "Your response has been submitted successfully.",
          });

          navigate("/admin/my-surveys");
        } catch (error) {
          console.error("Error submitting response:", error);
          toast({
            title: "Error submitting response",
            description: "Your response could not be submitted. Please try again.",
            variant: "destructive",
          });
        }
      });

      setSurvey(surveyModel);
    }
  }, [assignment, existingResponse, id, navigate, toast]);

  if (isLoading || !survey) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/my-surveys")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{assignment.survey.name}</h1>
        </div>
        {lastSaved && (
          <p className="text-sm text-muted-foreground">
            Last saved: {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>
      
      <div className="bg-card rounded-lg border p-6">
        <Survey model={survey} />
      </div>
    </div>
  );
}