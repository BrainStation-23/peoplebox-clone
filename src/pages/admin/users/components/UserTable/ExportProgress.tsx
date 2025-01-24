import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ExportProgressProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: number;
  total: number;
  error?: string;
  isComplete?: boolean;
}

export function ExportProgress({
  open,
  onOpenChange,
  progress,
  total,
  error,
  isComplete,
}: ExportProgressProps) {
  const percentage = Math.round((progress / total) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exporting Users</DialogTitle>
          <DialogDescription>
            Processing {progress} of {total} users
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <Progress value={percentage} className="mb-2" />
          <div className="text-sm text-muted-foreground text-center">
            {percentage}% Complete
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        {isComplete && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Export completed successfully!</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}