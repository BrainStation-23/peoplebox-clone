import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { generateCampaignOverview } from "./generators/CampaignOverview";
import { generateResponseStatistics } from "./generators/ResponseStatistics";
import { generateQuestionAnalysis } from "./generators/QuestionAnalysis";
import { fetchCampaignData, fetchCampaignStatistics, fetchResponses, processDemographicData } from "./services/campaignExportService";

interface ExportButtonProps {
  campaignId: string;
}

export function ExportButton({ campaignId }: ExportButtonProps) {
  const { toast } = useToast();

  const { data: campaign } = useQuery({
    queryKey: ["campaign-export", campaignId],
    queryFn: () => fetchCampaignData(campaignId),
  });

  const { data: statistics } = useQuery({
    queryKey: ["campaign-statistics", campaignId],
    queryFn: () => fetchCampaignStatistics(campaignId),
  });

  const { data: responses } = useQuery({
    queryKey: ["campaign-responses", campaignId],
    queryFn: () => fetchResponses(campaignId),
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
      const demographicData = processDemographicData(responses);
      
      // Generate campaign overview
      await generateCampaignOverview(doc, campaign, statistics);
      
      // Generate response statistics
      await generateResponseStatistics(doc, statistics, demographicData);

      // Get questions from survey json_data
      const surveyData = campaign.survey.json_data;
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