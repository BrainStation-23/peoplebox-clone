import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { processCSVFile, type ProcessingResult } from "../../utils/csvProcessor";
import { ImportError, ImportResult, downloadErrorReport, convertValidationErrorsToImportErrors } from "../../utils/errorReporting";
import { batchProcessor, type BatchProgress } from "../../utils/batchProcessor";
import { UploadArea } from "./UploadArea";
import { ImportGuidelines } from "./ImportGuidelines";
import { ImportProgress } from "./ImportProgress";
import { ProcessingResultView } from "./ProcessingResult";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export function ImportDialog({ open, onOpenChange, onImportComplete }: ImportDialogProps) {
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const abortController = useRef<AbortController | null>(null);

  const handleProcessingComplete = (result: ProcessingResult) => {
    setProcessingResult(result);
    setImportResult(null);
    setIsProcessing(false);

    if (result.errors.length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Errors",
        description: `Found ${result.errors.length} errors in the CSV file. Please check the error report.`,
      });
    } else {
      toast({
        title: "File Processed Successfully",
        description: `Found ${result.newUsers.length} new users and ${result.existingUsers.length} existing users.`,
      });
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

  const handleDownloadErrors = () => {
    if (!processingResult?.errors && !importResult?.errors) {
      toast({
        variant: "destructive",
        title: "No errors to download",
        description: "There are no validation errors to report.",
      });
      return;
    }

    try {
      const errors = processingResult?.errors 
        ? convertValidationErrorsToImportErrors(processingResult.errors)
        : importResult?.errors || [];
      
      downloadErrorReport(errors);
      
      toast({
        title: "Error report downloaded",
        description: "The error report has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Failed to download the error report. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Users</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import users in bulk. Download the template to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!importing && !processingResult && (
            <>
              <ImportGuidelines />
              <UploadArea
                isProcessing={isProcessing}
                onProcessingComplete={handleProcessingComplete}
              />
            </>
          )}

          {importing && progress && (
            <ImportProgress
              progress={progress}
              paused={paused}
              onPauseToggle={() => setPaused(!paused)}
              onCancel={handleCancel}
            />
          )}

          <ProcessingResultView
            processingResult={processingResult}
            importResult={importResult}
            onDownloadErrors={handleDownloadErrors}
            onStartImport={handleImport}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}