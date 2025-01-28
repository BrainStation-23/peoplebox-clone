import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { processCSVFile, type ProcessingResult } from "../../utils/csvProcessor";
import { ImportError, ImportResult, downloadErrorReport, convertValidationErrorsToImportErrors } from "../../utils/errorReporting";
import { updateBatchProcessor, type BatchProgress } from "../../utils/updateBatchProcessor";
import { UploadArea } from "./UploadArea";
import { ImportGuidelines } from "./ImportGuidelines";
import { ImportProgress } from "./ImportProgress";
import { ProcessingResultView } from "./ProcessingResult";

interface BulkUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateComplete: () => void;
}

export function BulkUpdateDialog({ open, onOpenChange, onUpdateComplete }: BulkUpdateDialogProps) {
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [updating, setUpdating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [updateResult, setUpdateResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const abortController = useRef<AbortController | null>(null);

  const handleProcessingComplete = (result: ProcessingResult) => {
    setProcessingResult(result);
    setUpdateResult(null);
    setIsProcessing(false);

    if (result.errors.length > 0) {
      toast.error(`Found ${result.errors.length} errors in the CSV file. Please check the error report.`);
    } else {
      toast.success(`Found ${result.existingUsers.length} users to update.`);
    }
  };

  const handleUpdate = async () => {
    if (!processingResult) return;
    
    setUpdating(true);
    setProgress(null);
    const errors: ImportError[] = [];
    abortController.current = new AbortController();

    try {
      const processor = updateBatchProcessor(processingResult, {
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
        successful: processingResult.existingUsers.length - errors.length,
        failed: errors.length,
        errors,
      };

      setUpdateResult(result);
      
      if (result.successful > 0) {
        toast.success(`Successfully updated ${result.successful} users. ${result.failed} failures.`);
        onUpdateComplete();
      }

      if (result.failed > 0) {
        toast.error(`${result.failed} records failed to update. Download the error report for details.`);
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Operation cancelled') {
        toast.info("Update operation was cancelled.");
      } else {
        console.error("Update error:", error);
        toast.error(error instanceof Error ? error.message : "Unknown error occurred");
      }
    } finally {
      setUpdating(false);
      setPaused(false);
      abortController.current = null;
    }
  };

  const handleCancel = () => {
    abortController.current?.abort();
  };

  const handleDownloadErrors = () => {
    if (!processingResult?.errors && !updateResult?.errors) {
      toast.error("No errors to download");
      return;
    }

    try {
      const errors = processingResult?.errors 
        ? convertValidationErrorsToImportErrors(processingResult.errors)
        : updateResult?.errors || [];
      
      downloadErrorReport(errors);
      toast.success("Error report downloaded successfully");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download the error report. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Update Users</DialogTitle>
          <DialogDescription>
            Upload a CSV file to update multiple users at once. Download the template to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!updating && !processingResult && (
            <>
              <ImportGuidelines />
              <UploadArea
                isProcessing={isProcessing}
                onProcessingComplete={async (file) => {
                  try {
                    setIsProcessing(true);
                    const result = await processCSVFile(file);
                    handleProcessingComplete(result);
                  } catch (error) {
                    setIsProcessing(false);
                    console.error("Processing error:", error);
                    toast.error(error instanceof Error ? error.message : "Unknown error occurred");
                  }
                }}
              />
            </>
          )}

          {updating && progress && (
            <ImportProgress
              progress={progress}
              paused={paused}
              onPauseToggle={() => setPaused(!paused)}
              onCancel={handleCancel}
            />
          )}

          <ProcessingResultView
            processingResult={processingResult}
            importResult={updateResult}
            onDownloadErrors={handleDownloadErrors}
            onStartImport={handleUpdate}
            actionLabel="Update Users"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}