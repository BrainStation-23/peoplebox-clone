import { Upload } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { processCSVFile, type ProcessingResult } from "../../utils/csvProcessor";

interface UploadAreaProps {
  isProcessing: boolean;
  onProcessingComplete: (result: ProcessingResult) => void;
}

export function UploadArea({ isProcessing, onProcessingComplete }: UploadAreaProps) {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      try {
        const result = await processCSVFile(selectedFile);
        onProcessingComplete(result);
        
        if (result.errors.length > 0) {
          toast.error(`Found ${result.errors.length} errors in the CSV file. Please check the error report.`);
        } else {
          toast.success(`Found ${result.existingUsers.length} users to update.`);
        }
      } catch (error) {
        console.error("Processing error:", error);
        toast.error(error instanceof Error ? error.message : "Unknown error occurred");
      }
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner />
              <p className="text-sm text-gray-500">Processing file...</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">CSV file only</p>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isProcessing}
        />
      </label>
    </div>
  );
}