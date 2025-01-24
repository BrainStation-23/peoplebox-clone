import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle, Download } from "lucide-react";
import { processCSVFile, importUsers, type ProcessingResult } from "../utils/csvProcessor";
import { ImportError, ImportResult, downloadErrorReport } from "../utils/errorReporting";
import { toast } from "@/hooks/use-toast";

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
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      try {
        const result = await processCSVFile(selectedFile);
        setProcessingResult(result);
        setImportResult(null); // Reset import result when new file is selected
      } catch (error) {
        console.error("Processing error:", error);
        toast({
          variant: "destructive",
          title: "Error processing file",
          description: error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    }
  };

  const handleImport = async () => {
    if (!processingResult) return;
    
    setImporting(true);
    setProgress(0);
    const errors: ImportError[] = [];

    try {
      await importUsers(
        processingResult,
        (current, total) => {
          setProgress((current / total) * 100);
        },
        (error) => {
          errors.push(error);
        }
      );

      const result: ImportResult = {
        successful: processingResult.newUsers.length + processingResult.existingUsers.length - errors.length,
        failed: errors.length,
        errors,
      };

      setImportResult(result);
      
      if (result.successful > 0) {
        toast({
          title: "Import completed",
          description: `Successfully processed ${result.successful} users. ${result.failed} failures.`,
        });
        onImportComplete();
      }

      if (result.failed > 0) {
        toast({
          variant: "destructive",
          title: "Import completed with errors",
          description: `${result.failed} records failed to import. Download the error report for details.`,
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        variant: "destructive",
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadErrors = () => {
    if (importResult?.errors) {
      downloadErrorReport(importResult.errors);
    }
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

                  {processingResult.errors.length === 0 && (
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

          {importResult && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Import completed: {importResult.successful} successful, {importResult.failed} failed
                </AlertDescription>
              </Alert>

              {importResult.failed > 0 && (
                <Button
                  onClick={handleDownloadErrors}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Error Report
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}