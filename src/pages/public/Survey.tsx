import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { LayeredDarkPanelless } from "survey-core/themes";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import "survey-core/defaultV2.min.css";

export default function PublicSurveyPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<Model | null>(null);

  // Query to fetch assignment and check for existing response
  const { data: assignmentData, isLoading } = useQuery({
    queryKey: ["public-survey", token],
    queryFn: async () => {
      // First get the assignment
      const { data: assignment, error: assignmentError } = await supabase
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

      if (assignmentError) throw assignmentError;
      if (!assignment) throw new Error("Survey not found");

      // Check for existing response
      const { data: existingResponse, error: responseError } = await supabase
        .from("survey_responses")
        .select("submitted_at")
        .eq("assignment_id", assignment.id)
        .not("submitted_at", "is", null)
        .maybeSingle();

      if (responseError) throw responseError;

      return {
        assignment,
        existingResponse
      };
    },
  });

  useEffect(() => {
    if (assignmentData?.assignment?.survey?.json_data && !assignmentData.existingResponse) {
      const surveyModel = new Model(assignmentData.assignment.survey.json_data);
      surveyModel.applyTheme(LayeredDarkPanelless);
      
      surveyModel.onComplete.add(async (sender) => {
        try {
          // Double-check for existing response before submitting
          const { data: existingResponse } = await supabase
            .from("survey_responses")
            .select("id")
            .eq("assignment_id", assignmentData.assignment.id)
            .not("submitted_at", "is", null)
            .maybeSingle();

          if (existingResponse) {
            toast({
              title: "Already submitted",
              description: "You have already submitted a response to this survey.",
              variant: "destructive",
            });
            navigate(`/public/survey/${token}/thank-you`);
            return;
          }

          const responseData = {
            assignment_id: assignmentData.assignment.id,
            user_id: assignmentData.assignment.user_id,
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
  }, [assignmentData, navigate, toast, token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!assignmentData?.assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Survey Not Found</h1>
        <p className="text-muted-foreground">
          The survey you're looking for doesn't exist or has expired.
        </p>
      </div>
    );
  }

  if (assignmentData.existingResponse) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Already Submitted</AlertTitle>
            <AlertDescription>
              You have already submitted your response to this survey on{" "}
              {new Date(assignmentData.existingResponse.submitted_at).toLocaleDateString()}{" "}
              at{" "}
              {new Date(assignmentData.existingResponse.submitted_at).toLocaleTimeString()}.
              <br />
              <br />
              Thank you for your participation!
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{assignmentData.assignment.survey.name}</h1>
        {assignmentData.assignment.survey.description && (
          <p className="text-muted-foreground mb-8">{assignmentData.assignment.survey.description}</p>
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