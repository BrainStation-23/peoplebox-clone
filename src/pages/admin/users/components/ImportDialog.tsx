import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle } from "lucide-react";
import { processCSVFile, importUsers, type ProcessingResult } from "../utils/csvProcessor";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export function ImportDialog({ open, onOpenChange, onImportComplete }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      try {
        const result = await processCSVFile(selectedFile);
        setProcessingResult(result);
      } catch (error) {
        console.error("Processing error:", error);
      }
    }
  };

  const handleImport = async () => {
    if (!processingResult) return;
    
    setImporting(true);
    setProgress(0);

    try {
      await importUsers(processingResult, (current, total) => {
        setProgress((current / total) * 100);
      });
      onImportComplete();
      onOpenChange(false);
    } catch (error) {
      console.error("Import error:", error);
    } finally {
      setImporting(false);
    }
  };

  const renderValidationSummary = () => {
    if (!processingResult) return null;

    return (
      <div className="space-y-4">
        {processingResult.errors.length > 0 ? (
          <div className="space-y-2">
            <h3 className="font-medium">Validation Errors</h3>
            {processingResult.errors.map((error, index) => (
              <Alert key={index} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Row {error.row}: {error.errors.join(", ")}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              Ready to import {processingResult.newUsers.length} new users and update{" "}
              {processingResult.existingUsers.length} existing users
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
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

              {processingResult && (
                <>
                  {renderValidationSummary()}
                  {processingResult.errors.length === 0 && (
                    <Button
                      onClick={handleImport}
                      className="w-full"
                      disabled={importing}
                    >
                      Import Users
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {importing && (
            <div className="space-y-4">
              <Progress value={progress} />
              <p className="text-sm text-center text-gray-500">
                Importing users... {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}