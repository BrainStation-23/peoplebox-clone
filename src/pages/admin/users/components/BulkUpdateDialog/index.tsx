import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { processCSVFile, type ProcessingResult } from "../../utils/csvProcessor";
import { ImportError, ImportResult, downloadErrorReport, convertValidationErrorsToImportErrors } from "../../utils/errorReporting";
import { batchProcessor, type BatchProgress } from "../../utils/batchProcessor";
import { UploadArea } from "./UploadArea";
import { ImportGuidelines } from "./ImportGuidelines";
import { ImportProgress } from "./ImportProgress";
import { ProcessingResultView } from "./ProcessingResult";
import { supabase } from "@/integrations/supabase/client";

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

        // Call the manage-users-bulk edge function with the current batch
        const { data: responseData, error } = await supabase.functions.invoke('manage-users-bulk', {
          body: {
            users: processingResult.existingUsers.map(user => ({
              id: user.id,
              email: user.email,
              first_name: user.firstName,
              last_name: user.lastName,
              role: user.role,
              level: user.level,
              employment_type: user.employmentType,
              designation: user.designation,
              org_id: user.orgId,
              location: user.location,
              gender: user.gender,
              date_of_birth: user.dateOfBirth,
              employee_role: user.employeeRole,
              employee_type: user.employeeType,
              sbus: user.sbus
            }))
          }
        });

        if (error) {
          console.error('Bulk update error:', error);
          throw error;
        }

        if (responseData?.errors) {
          responseData.errors.forEach(err => {
            errors.push({
              row: processingResult.existingUsers.findIndex(u => u.email === err.user.email) + 1,
              type: 'update',
              message: err.error,
              data: err.user,
            });
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
                onProcessingComplete={handleProcessingComplete}
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