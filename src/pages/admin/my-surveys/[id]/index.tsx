import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

// Import all theme CSS files
import "survey-core/defaultV2.min.css";
import "survey-core/defaultV2-dark.min.css";
import "survey-core/modern.min.css";
import "survey-core/modern-dark.min.css";
import "survey-core/survey.min.css";
import "survey-core/survey-dark.min.css";

type SurveyTheme = 
  | "defaultV2" 
  | "defaultV2-dark" 
  | "modern" 
  | "modern-dark" 
  | "bootstrap" 
  | "bootstrap-dark";

export default function SurveyResponsePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<Model | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [theme, setTheme] = useState<SurveyTheme>("defaultV2-dark");

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
          ),
          campaign:survey_campaigns (
            id,
            name
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch active campaign instance if this is a campaign-based survey
  const { data: activeInstance } = useQuery({
    queryKey: ["active-campaign-instance", assignment?.campaign_id],
    enabled: !!assignment?.campaign_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_instances")
        .select("*")
        .eq("campaign_id", assignment.campaign_id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Check for existing response
  const { data: existingResponse } = useQuery({
    queryKey: ["survey-response", id, activeInstance?.id],
    queryFn: async () => {
      const query = supabase
        .from("survey_responses")
        .select("*")
        .eq("assignment_id", id);

      // If this is a campaign instance, check for response in this instance
      if (activeInstance?.id) {
        query.eq("campaign_instance_id", activeInstance.id);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (assignment?.survey.json_data) {
      const surveyModel = new Model(assignment.survey.json_data);
      
      // Apply theme
      surveyModel.applyTheme(theme);
      
      // Load existing response data if available
      if (existingResponse?.response_data) {
        surveyModel.data = existingResponse.response_data;
      }
      
      // Make survey read-only if completed
      if (assignment.status === 'completed') {
        surveyModel.mode = 'display';
      } else {
        // Handle auto-save
        surveyModel.onValueChanged.add(async (sender, options) => {
          try {
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) throw new Error("User not authenticated");

            const responseData = {
              assignment_id: id,
              user_id: userId,
              response_data: sender.data,
              updated_at: new Date().toISOString(),
              campaign_instance_id: activeInstance?.id || null,
            };

            const { error } = await supabase
              .from("survey_responses")
              .upsert(responseData, {
                onConflict: activeInstance?.id 
                  ? 'assignment_id,user_id,campaign_instance_id' 
                  : 'assignment_id,user_id'
              });

            if (error) throw error;
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
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) throw new Error("User not authenticated");

            const responseData = {
              assignment_id: id,
              user_id: userId,
              response_data: sender.data,
              submitted_at: new Date().toISOString(),
              campaign_instance_id: activeInstance?.id || null,
            };

            const { error: responseError } = await supabase
              .from("survey_responses")
              .upsert(responseData, {
                onConflict: activeInstance?.id 
                  ? 'assignment_id,user_id,campaign_instance_id' 
                  : 'assignment_id,user_id'
              });

            if (responseError) throw responseError;

            // Update assignment status
            const { error: assignmentError } = await supabase
              .from("survey_assignments")
              .update({ status: "completed" })
              .eq("id", id);

            if (assignmentError) throw assignmentError;

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
      }

      setSurvey(surveyModel);
    }
  }, [assignment, existingResponse, id, navigate, toast, activeInstance, theme]);

  const handleThemeChange = (newTheme: SurveyTheme) => {
    setTheme(newTheme);
    localStorage.setItem("surveyTheme", newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("surveyTheme") as SurveyTheme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

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
          <h1 className="text-2xl font-bold">
            {assignment.campaign?.name || assignment.survey.name}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <p className="text-sm text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
          <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Light Themes</SelectLabel>
                <SelectItem value="defaultV2">Default V2</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="bootstrap">Bootstrap</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Dark Themes</SelectLabel>
                <SelectItem value="defaultV2-dark">Default V2 Dark</SelectItem>
                <SelectItem value="modern-dark">Modern Dark</SelectItem>
                <SelectItem value="bootstrap-dark">Bootstrap Dark</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="bg-card rounded-lg border p-6">
        <Survey model={survey} />
      </div>
    </div>
  );
}
