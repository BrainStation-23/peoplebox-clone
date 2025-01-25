import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonProps {
  campaignName: string;
  statusData?: { name: string; value: number }[];
  completionRate?: number;
  responseData?: { date: string; count: number }[];
  genderData?: any[];
  locationData?: any[];
  employmentData?: any[];
}

export function ExportButton({
  campaignName,
  statusData = [],
  completionRate = 0,
  responseData = [],
  genderData = [],
  locationData = [],
  employmentData = [],
}: ExportButtonProps) {
  const { toast } = useToast();

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Title
      doc.setFontSize(20);
      doc.text(`Campaign Report: ${campaignName}`, 14, 20);
      
      // Completion Rate
      doc.setFontSize(14);
      doc.text(`Overall Completion Rate: ${completionRate.toFixed(1)}%`, 14, 35);

      // Status Distribution
      doc.setFontSize(16);
      doc.text("Status Distribution", 14, 50);
      
      const statusTableData = statusData.map(item => [
        item.name,
        item.value.toString()
      ]);

      autoTable(doc, {
        head: [["Status", "Count"]],
        body: statusTableData,
        startY: 55,
      });

      let currentY = doc.previousAutoTable?.finalY || 55;

      // Response Trends
      doc.setFontSize(16);
      doc.text("Response Trends", 14, currentY + 15);

      const responseTableData = responseData.map(item => [
        item.date,
        item.count.toString()
      ]);

      autoTable(doc, {
        head: [["Date", "Responses"]],
        body: responseTableData,
        startY: currentY + 20,
      });

      // Demographics
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Demographics Breakdown", 14, 20);

      // Gender Distribution
      const genderTableData = genderData.map(item => [
        item.gender,
        item.total_assignments.toString(),
        item.completed_assignments.toString(),
        `${item.response_rate.toFixed(1)}%`
      ]);

      autoTable(doc, {
        head: [["Gender", "Total", "Completed", "Rate"]],
        body: genderTableData,
        startY: 25,
      });

      currentY = doc.previousAutoTable?.finalY || 25;

      // Location Distribution
      const locationTableData = locationData.map(item => [
        item.location_name,
        item.total_assignments.toString(),
        item.completed_assignments.toString(),
        `${item.response_rate.toFixed(1)}%`
      ]);

      autoTable(doc, {
        head: [["Location", "Total", "Completed", "Rate"]],
        body: locationTableData,
        startY: currentY + 20,
      });

      currentY = doc.previousAutoTable?.finalY || currentY + 20;

      // Employment Type Distribution
      const employmentTableData = employmentData.map(item => [
        item.employment_type,
        item.total_assignments.toString(),
        item.completed_assignments.toString(),
        `${item.response_rate.toFixed(1)}%`
      ]);

      autoTable(doc, {
        head: [["Employment Type", "Total", "Completed", "Rate"]],
        body: employmentTableData,
        startY: currentY + 20,
      });

      // Save the PDF
      doc.save(`${campaignName.toLowerCase().replace(/\s+/g, '-')}-report.pdf`);

      toast({
        title: "Export Successful",
        description: "Your report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('PDF Export error:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error generating your report.",
      });
    }
  };

  return (
    <Button
      onClick={exportToPDF}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <FileDown className="h-4 w-4" />
      Export PDF
    </Button>
  );
}