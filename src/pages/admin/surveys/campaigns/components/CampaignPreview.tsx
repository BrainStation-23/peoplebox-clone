import { format, addDays, isAfter, isBefore } from "date-fns";
import { CalendarDays, Clock } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { CampaignFormData } from "./CampaignForm";

interface CampaignPreviewProps {
  form: UseFormReturn<CampaignFormData>;
}

export function CampaignPreview({ form }: CampaignPreviewProps) {
  const values = useWatch({ control: form.control });
  
  const getInstancePeriods = () => {
    if (!values.starts_at) return [];
    
    const periods = [];
    let currentStart = values.starts_at;
    
    if (!values.is_recurring) {
      if (values.ends_at) {
        periods.push({
          start: currentStart,
          end: values.ends_at,
          dueTime: format(values.ends_at, 'HH:mm'),
        });
      }
      return periods;
    }

    while (values.recurring_ends_at && isBefore(currentStart, values.recurring_ends_at)) {
      const endDate = addDays(currentStart, values.instance_duration_days || 0);
      
      if (isAfter(endDate, values.recurring_ends_at)) break;
      
      periods.push({
        start: currentStart,
        end: endDate,
        dueTime: values.instance_end_time,
      });

      // Calculate next period start based on frequency
      switch (values.recurring_frequency) {
        case 'weekly':
          currentStart = addDays(currentStart, 7);
          break;
        case 'monthly':
          currentStart = new Date(currentStart.setMonth(currentStart.getMonth() + 1));
          break;
        case 'quarterly':
          currentStart = new Date(currentStart.setMonth(currentStart.getMonth() + 3));
          break;
        case 'yearly':
          currentStart = new Date(currentStart.setFullYear(currentStart.getFullYear() + 1));
          break;
        default:
          currentStart = addDays(currentStart, 1); // daily
      }
    }

    return periods;
  };

  const periods = getInstancePeriods();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Campaign Timeline</h3>
      
      <div className="space-y-4">
        {periods.map((period, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <CalendarDays className="h-4 w-4" />
              <span>Period {index + 1}</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm">
                {format(period.start, 'MMM d')} - {format(period.end, 'MMM d, yyyy')}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Due by {period.dueTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {periods.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Summary</h4>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total Periods:</dt>
              <dd className="font-medium">{periods.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">First Response Due:</dt>
              <dd className="font-medium">
                {format(periods[0].end, 'MMM d, yyyy')} at {periods[0].dueTime}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Last Response Due:</dt>
              <dd className="font-medium">
                {format(periods[periods.length - 1].end, 'MMM d, yyyy')} at {periods[periods.length - 1].dueTime}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}