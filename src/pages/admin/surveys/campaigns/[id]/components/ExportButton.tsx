import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

// Extend jsPDF type to include lastAutoTable property
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

  // Fetch responses for the campaign
  const { data: responses } = useQuery({
    queryKey: ["campaign-responses", campaign.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select(`
          id,
          response_data,
          submitted_at,
          user:profiles!survey_responses_user_id_fkey (
            first_name,
            last_name,
            email,
            gender,
            location:locations (name),
            employment_type:employment_types (name),
            user_sbus:user_sbus (
              sbu:sbus (name)
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

      // Title
      doc.setFontSize(20);
      doc.text(campaign.name, pageWidth / 2, 20, { align: "center" });

      // Campaign Details
      doc.setFontSize(12);
      doc.text(`Status: ${campaign.status}`, 20, 35);
      doc.text(`Start Date: ${format(new Date(campaign.starts_at), "PPP")}`, 20, 45);
      if (campaign.ends_at) {
        doc.text(`End Date: ${format(new Date(campaign.ends_at), "PPP")}`, 20, 55);
      }
      if (campaign.description) {
        doc.text("Description:", 20, 70);
        doc.setFontSize(10);
        const descriptionLines = doc.splitTextToSize(campaign.description, pageWidth - 40);
        doc.text(descriptionLines, 20, 80);
      }

      // Response Statistics
      if (responses) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Response Statistics", 20, 20);

        // Calculate statistics
        const totalResponses = responses.length;
        const genderStats = responses.reduce((acc: Record<string, number>, response) => {
          const gender = response.user?.gender || "Not Specified";
          acc[gender] = (acc[gender] || 0) + 1;
          return acc;
        }, {});

        const locationStats = responses.reduce((acc: Record<string, number>, response) => {
          const location = response.user?.location?.name || "Not Specified";
          acc[location] = (acc[location] || 0) + 1;
          return acc;
        }, {});

        // Add statistics tables
        doc.setFontSize(14);
        doc.text("Response Distribution by Gender", 20, 40);
        autoTable(doc, {
          startY: 50,
          head: [["Gender", "Count", "Percentage"]],
          body: Object.entries(genderStats).map(([gender, count]) => [
            gender,
            count,
            `${((count / totalResponses) * 100).toFixed(1)}%`,
          ]),
        });

        doc.text("Response Distribution by Location", 20, doc.lastAutoTable.finalY + 20);
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 30,
          head: [["Location", "Count", "Percentage"]],
          body: Object.entries(locationStats).map(([location, count]) => [
            location,
            count,
            `${((count / totalResponses) * 100).toFixed(1)}%`,
          ]),
        });

        // Add response details
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Individual Responses", 20, 20);
        
        const responseRows = responses.map((response) => [
          `${response.user?.first_name} ${response.user?.last_name}`,
          response.user?.email,
          format(new Date(response.submitted_at), "PPP"),
          response.user?.location?.name || "N/A",
          response.user?.employment_type?.name || "N/A",
        ]);

        autoTable(doc, {
          startY: 30,
          head: [["Name", "Email", "Submitted At", "Location", "Employment Type"]],
          body: responseRows,
        });
      }

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