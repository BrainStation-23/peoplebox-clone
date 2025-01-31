import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, Download } from "lucide-react";
import { ProcessingResult } from "../../utils/csvProcessor";
import { ImportError, ImportResult } from "../../utils/errorReporting";

interface ProcessingResultViewProps {
  processingResult: ProcessingResult | null;
  importResult: ImportResult | null;
  onDownloadErrors: (errors: ImportError[]) => void;
  onStartImport: () => void;
  actionLabel?: string;
}

export function ProcessingResultView({
  processingResult,
  importResult,
  onDownloadErrors,
  onStartImport,
  actionLabel = "Start Import"
}: ProcessingResultViewProps) {
  if (!processingResult && !importResult) return null;

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
              Users to update: {processingResult.existingUsers.length}
            </p>
          </div>

          {processingResult.errors.length > 0 ? (
            <Button
              onClick={() => onDownloadErrors([])}
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
            >
              {actionLabel}
            </Button>
          )}
        </>
      )}

      {importResult && (
        <div className="space-y-4">
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Update completed: {importResult.successful} successful, {importResult.failed} failed
            </AlertDescription>
          </Alert>

          {importResult.failed > 0 && (
            <Button
              onClick={() => onDownloadErrors([])}
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