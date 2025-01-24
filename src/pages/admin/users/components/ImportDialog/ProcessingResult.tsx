import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, Download } from "lucide-react";
import type { ProcessingResult } from "../../utils/csvProcessor";
import type { ImportResult } from "../../utils/errorReporting";

interface ProcessingResultProps {
  processingResult: ProcessingResult | null;
  importResult: ImportResult | null;
  onDownloadErrors: () => void;
  onStartImport: () => void;
}

export function ProcessingResultView({ 
  processingResult, 
  importResult, 
  onDownloadErrors, 
  onStartImport 
}: ProcessingResultProps) {
  if (!processingResult && !importResult) return null;

  return (
    <div className="space-y-4">
      {processingResult && (
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
              onClick={onDownloadErrors}
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
              Start Import
            </Button>
          )}
        </>
      )}

      {importResult && (
        <>
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Import completed: {importResult.successful} successful, {importResult.failed} failed
            </AlertDescription>
          </Alert>

          {importResult.failed > 0 && (
            <Button
              onClick={onDownloadErrors}
              className="w-full"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Error Report
            </Button>
          )}
        </>
      )}
    </div>
  );
}