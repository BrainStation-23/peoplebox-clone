import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface ExtendedJsPDF extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

interface ExportButtonProps {
  campaign: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    created_at: string;
    starts_at: string;
    ends_at: string;
  };
}

export function ExportButton({ campaign }: ExportButtonProps) {
  const { toast } = useToast();

  // Fetch responses with all related data
  const { data: responses } = useQuery({
    queryKey: ["campaign-responses", campaign.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select(`
          id,
          response_data,
          submitted_at,
          assignment:survey_assignments!survey_responses_assignment_id_fkey(
            campaign_id,
            status
          ),
          user:profiles!survey_responses_user_id_fkey (
            first_name,
            last_name,
            email,
            gender,
            location:locations (name),
            employment_type:employment_types (name),
            user_sbus:user_sbus (
              sbu:sbus (name),
              is_primary
            )
          )
        `)
        .eq("assignment.campaign_id", campaign.id);

      if (error) throw error;
      return data;
    },
  });

  const handleExport = async () => {
    try {
      const doc = new jsPDF() as ExtendedJsPDF;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;

      // Title Page
      doc.setFontSize(24);
      doc.text("Campaign Report", pageWidth / 2, 40, { align: "center" });
      doc.setFontSize(16);
      doc.text(campaign.name, pageWidth / 2, 60, { align: "center" });
      doc.setFontSize(12);
      doc.text(format(new Date(), "PPP"), pageWidth / 2, 80, { align: "center" });

      // Campaign Overview
      doc.addPage();
      doc.setFontSize(18);
      doc.text("Campaign Overview", margin, 20);
      
      doc.setFontSize(12);
      const overviewData = [
        ["Status", campaign.status],
        ["Start Date", format(new Date(campaign.starts_at), "PPP")],
        ["End Date", format(new Date(campaign.ends_at), "PPP")],
        ["Total Responses", responses?.length.toString() || "0"],
        ["Completion Rate", `${calculateCompletionRate(responses)}%`],
      ];

      autoTable(doc, {
        startY: 30,
        head: [["Metric", "Value"]],
        body: overviewData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
      });

      if (campaign.description) {
        doc.text("Description:", margin, doc.lastAutoTable.finalY + 15);
        const descriptionLines = doc.splitTextToSize(campaign.description, pageWidth - 40);
        doc.text(descriptionLines, margin, doc.lastAutoTable.finalY + 25);
      }

      // Response Statistics
      doc.addPage();
      doc.setFontSize(18);
      doc.text("Response Statistics", margin, 20);

      // Gender Distribution
      const genderStats = calculateGenderDistribution(responses);
      autoTable(doc, {
        startY: 30,
        head: [["Gender", "Count", "Percentage"]],
        body: Object.entries(genderStats).map(([gender, { count, percentage }]) => [
          gender,
          count,
          `${percentage.toFixed(1)}%`,
        ]),
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Location Distribution
      const locationStats = calculateLocationDistribution(responses);
      doc.text("Response by Location", margin, doc.lastAutoTable.finalY + 15);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Location", "Count", "Percentage"]],
        body: Object.entries(locationStats).map(([location, { count, percentage }]) => [
          location,
          count,
          `${percentage.toFixed(1)}%`,
        ]),
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
      });

      // SBU Distribution
      const sbuStats = calculateSBUDistribution(responses);
      doc.text("Response by Department (SBU)", margin, doc.lastAutoTable.finalY + 15);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Department", "Count", "Percentage"]],
        body: Object.entries(sbuStats).map(([sbu, { count, percentage }]) => [
          sbu,
          count,
          `${percentage.toFixed(1)}%`,
        ]),
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Employment Type Distribution
      const employmentStats = calculateEmploymentDistribution(responses);
      doc.text("Response by Employment Type", margin, doc.lastAutoTable.finalY + 15);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Employment Type", "Count", "Percentage"]],
        body: Object.entries(employmentStats).map(([type, { count, percentage }]) => [
          type,
          count,
          `${percentage.toFixed(1)}%`,
        ]),
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
      });

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

// Helper functions for calculating statistics
function calculateCompletionRate(responses: any[] | undefined): string {
  if (!responses?.length) return "0";
  const completed = responses.filter(r => r.assignment?.status === "completed").length;
  return ((completed / responses.length) * 100).toFixed(1);
}

function calculateGenderDistribution(responses: any[] | undefined) {
  if (!responses?.length) return {};
  const stats: Record<string, { count: number; percentage: number }> = {};
  responses.forEach(response => {
    const gender = response.user?.gender || "Not Specified";
    stats[gender] = stats[gender] || { count: 0, percentage: 0 };
    stats[gender].count++;
  });
  Object.values(stats).forEach(stat => {
    stat.percentage = (stat.count / responses.length) * 100;
  });
  return stats;
}

function calculateLocationDistribution(responses: any[] | undefined) {
  if (!responses?.length) return {};
  const stats: Record<string, { count: number; percentage: number }> = {};
  responses.forEach(response => {
    const location = response.user?.location?.name || "Not Specified";
    stats[location] = stats[location] || { count: 0, percentage: 0 };
    stats[location].count++;
  });
  Object.values(stats).forEach(stat => {
    stat.percentage = (stat.count / responses.length) * 100;
  });
  return stats;
}

function calculateSBUDistribution(responses: any[] | undefined) {
  if (!responses?.length) return {};
  const stats: Record<string, { count: number; percentage: number }> = {};
  responses.forEach(response => {
    const primarySbu = response.user?.user_sbus?.find((us: any) => us.is_primary)?.sbu?.name || "Not Specified";
    stats[primarySbu] = stats[primarySbu] || { count: 0, percentage: 0 };
    stats[primarySbu].count++;
  });
  Object.values(stats).forEach(stat => {
    stat.percentage = (stat.count / responses.length) * 100;
  });
  return stats;
}

function calculateEmploymentDistribution(responses: any[] | undefined) {
  if (!responses?.length) return {};
  const stats: Record<string, { count: number; percentage: number }> = {};
  responses.forEach(response => {
    const employmentType = response.user?.employment_type?.name || "Not Specified";
    stats[employmentType] = stats[employmentType] || { count: 0, percentage: 0 };
    stats[employmentType].count++;
  });
  Object.values(stats).forEach(stat => {
    stat.percentage = (stat.count / responses.length) * 100;
  });
  return stats;
}