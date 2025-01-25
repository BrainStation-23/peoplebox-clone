import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const handleExport = async () => {
    try {
      // For now, just show a toast that export is coming soon
      toast({
        title: "Export feature coming soon",
        description: "The ability to export campaign data will be available shortly.",
      });
    } catch (error) {
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