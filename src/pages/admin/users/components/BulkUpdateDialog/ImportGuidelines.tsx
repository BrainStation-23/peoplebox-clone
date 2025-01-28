import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { CSV_GUIDELINES, generateTemplateCSV } from "../../utils/csvTemplate";

export function ImportGuidelines() {
  const downloadTemplate = () => {
    const csvContent = generateTemplateCSV();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "users_update_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          Download Template
        </Button>
      </div>

      <div className="bg-muted p-4 rounded-lg space-y-2">
        <h3 className="font-medium">Update Guidelines</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          {CSV_GUIDELINES.map((guideline, index) => (
            <li key={index}>{guideline}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}