import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle, Download, Pause, Play, XCircle, FileDown } from "lucide-react";
import { processCSVFile, type ProcessingResult } from "../utils/csvProcessor";
import { ImportError, ImportResult, downloadErrorReport } from "../utils/errorReporting";
import { toast } from "@/hooks/use-toast";
import { batchProcessor, type BatchProgress } from "../utils/batchProcessor";
import { formatDistanceToNow } from "date-fns";
import { CSV_GUIDELINES, generateTemplateCSV } from "../utils/csvTemplate";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export function ImportDialog({ open, onOpenChange, onImportComplete }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      try {
        const result = await processCSVFile(selectedFile);
        setProcessingResult(result);
        setImportResult(null);
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
    setProgress(null);
    const errors: ImportError[] = [];
    abortController.current = new AbortController();

    try {
      const processor = batchProcessor(processingResult, {
        onProgress: (batchProgress) => {
          setProgress(batchProgress);
        },
        onError: (error) => {
          errors.push(error);
        },
        signal: abortController.current.signal,
      });

      for await (const progress of processor) {
        if (paused) {
          await new Promise<void>(resolve => {
            const checkPause = () => {
              if (!paused) {
                resolve();
              } else {
                setTimeout(checkPause, 100);
              }
            };
            checkPause();
          });
        }
      }

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
      if (error instanceof Error && error.message === 'Operation cancelled') {
        toast({
          title: "Import cancelled",
          description: "The import operation was cancelled.",
        });
      } else {
        console.error("Import error:", error);
        toast({
          variant: "destructive",
          title: "Import failed",
          description: error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    } finally {
      setImporting(false);
      setPaused(false);
      abortController.current = null;
    }
  };

  const handleCancel = () => {
    abortController.current?.abort();
  };

  const togglePause = () => {
    setPaused(!paused);
  };

  const handleDownloadErrors = () => {
    if (importResult?.errors) {
      downloadErrorReport(importResult.errors);
    }
  };

  const formatEstimatedTime = (ms: number) => {
    return formatDistanceToNow(Date.now() + ms, { includeSeconds: true });
  };

  const downloadTemplate = () => {
    const csvContent = generateTemplateCSV();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "users_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Users</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!importing && !processingResult && (
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
                <h3 className="font-medium">Import Guidelines</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {CSV_GUIDELINES.map((guideline, index) => (
                    <li key={index}>{guideline}</li>
                  ))}
                </ul>
              </div>

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
            </div>
          )}

          {importing && progress && (
            <div className="space-y-4">
              <Progress value={(progress.processed / progress.total) * 100} />
              <div className="text-sm space-y-2">
                <p className="text-center text-gray-500">
                  Processing batch {progress.currentBatch} of {progress.totalBatches}
                </p>
                <p className="text-center text-gray-500">
                  {progress.processed} of {progress.total} users processed
                </p>
                <p className="text-center text-gray-500">
                  Estimated time remaining: {formatEstimatedTime(progress.estimatedTimeRemaining)}
                </p>
              </div>
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePause}
                >
                  {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {paused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancel}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
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
