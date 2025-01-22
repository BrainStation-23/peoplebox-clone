import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DueDateInfoProps {
  dueDate: string | null;
  daysRemaining: number | null;
  isOverdue: boolean;
  isDueSoon: boolean;
}

export default function DueDateInfo({
  dueDate,
  daysRemaining,
  isOverdue,
  isDueSoon,
}: DueDateInfoProps) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        {dueDate ? (
          <span className={cn(
            isOverdue && "text-destructive",
            isDueSoon && "text-yellow-500"
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
          <span className={isDueSoon ? "text-yellow-500" : ""}>
            {daysRemaining} days remaining
          </span>
        </div>
      )}
    </div>
  );
}