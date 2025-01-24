import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Pause, Play, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { BatchProgress } from "../../utils/types";

interface ImportProgressProps {
  progress: BatchProgress;
  paused: boolean;
  onPauseToggle: () => void;
  onCancel: () => void;
}

export function ImportProgress({ progress, paused, onPauseToggle, onCancel }: ImportProgressProps) {
  const formatEstimatedTime = (ms: number) => {
    return formatDistanceToNow(Date.now() + ms, { includeSeconds: true });
  };

  return (
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
          onClick={onPauseToggle}
          className="flex items-center gap-2"
        >
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          {paused ? 'Resume' : 'Pause'}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}