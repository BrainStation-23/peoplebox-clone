import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DueDateInfoProps {
  dueDate: string | null;
  daysRemaining: number | null;
  isOverdue: boolean;
  isDueSoon: boolean;
  isPending: boolean;
}

export default function DueDateInfo({
  dueDate,
  daysRemaining,
  isOverdue,
  isDueSoon,
  isPending,
}: DueDateInfoProps) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        {dueDate ? (
          <span className={cn(
            isPending && isOverdue && "text-destructive",
            isPending && isDueSoon && "text-yellow-500"
          )}>
            Due: {format(new Date(dueDate), "PPP")}
          </span>
        ) : (
          <span>No due date</span>
        )}
      </div>
      {daysRemaining !== null && !isOverdue && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className={isPending && isDueSoon ? "text-yellow-500" : ""}>
            {daysRemaining} days remaining
          </span>
        </div>
      )}
    </div>
  );
}