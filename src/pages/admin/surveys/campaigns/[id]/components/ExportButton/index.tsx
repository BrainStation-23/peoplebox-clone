import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import "jspdf-autotable";
import type { Campaign, ResponseStatistics, DemographicData } from "./types";
import { generateCampaignOverview } from "./generators/CampaignOverview";
import { generateResponseStatistics } from "./generators/ResponseStatistics";

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
            name
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

  const { data: demographicData } = useQuery({
    queryKey: ["demographic-data", campaignId],
    queryFn: async () => {
      // Fetch all the demographic data in parallel
      const [genderData, locationData, employmentData, sbuData] = await Promise.all([
        fetchGenderDistribution(),
        fetchLocationDistribution(),
        fetchEmploymentDistribution(),
        fetchSBUDistribution(),
      ]);

      return {
        gender: genderData,
        location: locationData,
        employmentType: employmentData,
        sbu: sbuData,
      } as DemographicData;
    },
  });

  const handleExport = async () => {
    if (!campaign || !statistics || !demographicData) {
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

  // Helper functions for fetching demographic data
  async function fetchGenderDistribution() {
    const { data } = await supabase
      .from("survey_assignments")
      .select(`
        user:profiles!survey_assignments_user_id_fkey (
          gender
        )
      `)
      .eq("campaign_id", campaignId);

    const distribution = processDistribution(data?.map(d => d.user?.gender || "Not Specified") || []);
    return distribution;
  }

  async function fetchLocationDistribution() {
    const { data } = await supabase
      .from("survey_assignments")
      .select(`
        user:profiles!survey_assignments_user_id_fkey (
          location:locations (name)
        )
      `)
      .eq("campaign_id", campaignId);

    const distribution = processDistribution(
      data?.map(d => d.user?.location?.name || "Not Specified") || []
    );
    return distribution;
  }

  async function fetchEmploymentDistribution() {
    const { data } = await supabase
      .from("survey_assignments")
      .select(`
        user:profiles!survey_assignments_user_id_fkey (
          employment_type:employment_types (name)
        )
      `)
      .eq("campaign_id", campaignId);

    const distribution = processDistribution(
      data?.map(d => d.user?.employment_type?.name || "Not Specified") || []
    );
    return distribution;
  }

  async function fetchSBUDistribution() {
    const { data } = await supabase
      .from("survey_assignments")
      .select(`
        user:profiles!survey_assignments_user_id_fkey (
          user_sbus (
            is_primary,
            sbu:sbus (name)
          )
        )
      `)
      .eq("campaign_id", campaignId);

    const distribution = processDistribution(
      data?.map(d => {
        const primarySbu = d.user?.user_sbus?.find(us => us.is_primary);
        return primarySbu?.sbu?.name || "Not Specified";
      }) || []
    );
    return distribution;
  }

  function processDistribution(items: string[]) {
    const total = items.length;
    const counts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([category, count]) => ({
      category,
      count,
      percentage: (count / total) * 100,
    }));
  }

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
}