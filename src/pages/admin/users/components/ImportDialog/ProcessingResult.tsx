import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, Download } from "lucide-react";
import { ProcessingResult } from "../../utils/csvProcessor";
import { ImportError, ImportResult, convertValidationErrorsToImportErrors } from "../../utils/errorReporting";

interface ProcessingResultViewProps {
  processingResult: ProcessingResult | null;
  importResult: ImportResult | null;
  onDownloadErrors: (errors: ImportError[]) => void;
  onStartImport: () => void;
}

export function ProcessingResultView({
  processingResult,
  importResult,
  onDownloadErrors,
  onStartImport,
}: ProcessingResultViewProps) {
  if (!processingResult && !importResult) return null;

  const handleDownloadErrors = () => {
    if (processingResult?.errors) {
      onDownloadErrors(convertValidationErrorsToImportErrors(processingResult.errors));
    } else if (importResult?.errors) {
      onDownloadErrors(importResult.errors);
    }
  };

  return (
    <div className="space-y-4">
      {processingResult && !importResult && (
        <>
          <Alert variant={processingResult.errors.length > 0 ? "destructive" : "default"}>
            <AlertDescription className="flex items-center gap-2">
              {processingResult.errors.length > 0 ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Found {processingResult.errors.length} validation errors
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  File validated successfully
                </>
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              New users to create: {processingResult.newUsers.length}
            </p>
            <p className="text-sm text-muted-foreground">
              Existing users to update: {processingResult.existingUsers.length}
            </p>
          </div>

          {processingResult.errors.length > 0 ? (
            <Button
              onClick={handleDownloadErrors}
              className="w-full"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Error Report
            </Button>
          ) : (
            <Button
              onClick={onStartImport}
              className="w-full"
              disabled={false}
            >
              Start Import
            </Button>
          )}
        </>
      )}

      {importResult && (
        <div className="space-y-4">
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <Check className="h-4 w-4" />
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
  );
}