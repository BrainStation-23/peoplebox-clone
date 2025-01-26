import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { LayeredDarkPanelless } from "survey-core/themes";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import "survey-core/defaultV2.min.css";

export default function PublicSurveyPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<Model | null>(null);

  const { data: assignment, isLoading } = useQuery({
    queryKey: ["public-survey", token],
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
        .eq("public_access_token", token)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Survey not found");
      return data;
    },
  });

  useEffect(() => {
    if (assignment?.survey?.json_data) {
      const surveyModel = new Model(assignment.survey.json_data);
      surveyModel.applyTheme(LayeredDarkPanelless);
      
      surveyModel.onComplete.add(async (sender) => {
        try {
          const responseData = {
            assignment_id: assignment.id,
            response_data: sender.data,
            submitted_at: new Date().toISOString(),
          };

          const { error: responseError } = await supabase
            .from("survey_responses")
            .insert(responseData);

          if (responseError) throw responseError;

          toast({
            title: "Survey completed",
            description: "Your response has been submitted successfully. Thank you!",
          });

          // Redirect to a thank you page or close the window
          navigate(`/public/survey/${token}/thank-you`);
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
  }, [assignment, navigate, toast, token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Survey Not Found</h1>
        <p className="text-muted-foreground">
          The survey you're looking for doesn't exist or has expired.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{assignment.survey.name}</h1>
        {assignment.survey.description && (
          <p className="text-muted-foreground mb-8">{assignment.survey.description}</p>
        )}
        <div className="bg-card rounded-lg border p-6">
          {survey ? (
            <Survey model={survey} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Unable to load survey. Please try again later.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}