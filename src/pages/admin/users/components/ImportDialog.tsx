import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle } from "lucide-react";
import { validateCSV, type ValidationResult, type CSVValidationError } from "../utils/csvValidator";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export function ImportDialog({ open, onOpenChange, onImportComplete }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      try {
        const result = await validateCSV(selectedFile);
        setValidationResult(result);
      } catch (error) {
        console.error("Validation error:", error);
      }
    }
  };

  const handleImport = async () => {
    if (!validationResult?.validRows.length) return;
    
    setImporting(true);
    setProgress(0);

    try {
      // Import logic will be implemented here
      setProgress(100);
      onImportComplete();
      onOpenChange(false);
    } catch (error) {
      console.error("Import error:", error);
    } finally {
      setImporting(false);
    }
  };

  const renderValidationErrors = (errors: CSVValidationError[]) => {
    return errors.map((error, index) => (
      <Alert key={index} variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Row {error.row}: {error.errors.join(", ")}
        </AlertDescription>
      </Alert>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Users</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!importing && (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">CSV file only</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {validationResult && (
                <div className="space-y-4">
                  {validationResult.errors.length > 0 ? (
                    <div className="space-y-2">
                      <h3 className="font-medium">Validation Errors</h3>
                      {renderValidationErrors(validationResult.errors)}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        {validationResult.validRows.length} rows ready to import
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {validationResult?.isValid && (
                <Button
                  onClick={handleImport}
                  className="w-full"
                  disabled={importing}
                >
                  Import Users
                </Button>
              )}
            </div>
          )}

          {importing && (
            <div className="space-y-4">
              <Progress value={progress} />
              <p className="text-sm text-center text-gray-500">
                Importing users... {progress}%
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}