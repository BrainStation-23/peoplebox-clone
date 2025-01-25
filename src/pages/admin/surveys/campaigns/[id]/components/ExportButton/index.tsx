import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { generateCampaignOverview } from "./generators/CampaignOverview";
import { generateResponseStatistics } from "./generators/ResponseStatistics";
import { generateQuestionAnalysis } from "./generators/QuestionAnalysis";
import type { Campaign, ResponseStatistics, DemographicData, Question, ResponseData } from "./types";

interface ExportButtonProps {
  campaignId: string;
}

export function ExportButton({ campaignId }: ExportButtonProps) {
  const { toast } = useToast();

  const { data: campaign } = useQuery({
    queryKey: ["campaign-export", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_campaigns")
        .select(`
          *,
          survey:surveys (
            name,
            json_data
          )
        `)
        .eq("id", campaignId)
        .single();

      if (error) throw error;
      return data as Campaign;
    },
  });

  const { data: statistics } = useQuery({
    queryKey: ["campaign-statistics", campaignId],
    queryFn: async () => {
      const { data: assignments, error } = await supabase
        .from("survey_assignments")
        .select(`
          id,
          status,
          responses:survey_responses (
            id
          )
        `)
        .eq("campaign_id", campaignId);

      if (error) throw error;

      const totalResponses = assignments?.length || 0;
      const completed = assignments?.filter(a => a.status === "completed").length || 0;

      return {
        totalResponses,
        completionRate: (completed / totalResponses) * 100,
        statusDistribution: {
          completed,
          pending: totalResponses - completed,
        },
      } as ResponseStatistics;
    },
  });

  const { data: responses } = useQuery({
    queryKey: ["campaign-responses", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select(`
          id,
          response_data,
          user:profiles!survey_responses_user_id_fkey (
            first_name,
            last_name,
            email,
            gender,
            location:locations (
              name
            ),
            employment_type:employment_types (
              name
            ),
            user_sbus:user_sbus (
              is_primary,
              sbu:sbus (
                name
              )
            )
          )
        `)
        .eq("assignment.campaign_id", campaignId);

      if (error) throw error;

      return data.map(response => ({
        id: response.id,
        answers: response.response_data,
        respondent: {
          name: `${response.user.first_name || ""} ${response.user.last_name || ""}`.trim(),
          email: response.user.email,
          gender: response.user.gender,
          location: response.user.location,
          sbu: response.user.user_sbus?.find((us: any) => us.is_primary)?.sbu || null,
          employment_type: response.user.employment_type,
        },
      })) as ResponseData[];
    },
  });

  const handleExport = async () => {
    if (!campaign || !statistics || !responses) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Required data is not available.",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Generate campaign overview
      await generateCampaignOverview(doc, campaign, statistics);
      
      // Generate response statistics
      await generateResponseStatistics(doc, statistics, demographicData);

      // Get questions from survey json_data
      const surveyData = typeof campaign.survey.json_data === 'string' 
        ? JSON.parse(campaign.survey.json_data)
        : campaign.survey.json_data;

      const questions = surveyData.pages?.flatMap(
        (page: any) => page.elements || []
      ).map((q: any) => ({
        name: q.name,
        title: q.title,
        type: q.type,
      })) || [];

      // Generate question analysis
      await generateQuestionAnalysis(doc, questions, responses);

      // Save the PDF
      doc.save(`${campaign.name}-Report.pdf`);

      toast({
        title: "Export successful",
        description: "The campaign report has been downloaded.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting the campaign data.",
      });
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
}