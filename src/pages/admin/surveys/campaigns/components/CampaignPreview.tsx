import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn, useWatch } from "react-hook-form";
import { CampaignFormData } from "./CampaignForm";
import { format, addDays, addWeeks, addMonths, addYears } from "date-fns";

interface CampaignPreviewProps {
  form: UseFormReturn<CampaignFormData>;
}

export function CampaignPreview({ form }: CampaignPreviewProps) {
  const isRecurring = useWatch({
    control: form.control,
    name: "is_recurring",
  });

  const frequency = useWatch({
    control: form.control,
    name: "recurring_frequency",
  });

  const startsAt = useWatch({
    control: form.control,
    name: "starts_at",
  });

  const instanceDurationDays = useWatch({
    control: form.control,
    name: "instance_duration_days",
  });

  const recurringEndsAt = useWatch({
    control: form.control,
    name: "recurring_ends_at",
  });

  if (!isRecurring) {
    return null;
  }

  const getNextDate = (date: Date) => {
    switch (frequency) {
      case "daily":
        return addDays(date, 1);
      case "weekly":
        return addWeeks(date, 1);
      case "monthly":
        return addMonths(date, 1);
      case "quarterly":
        return addMonths(date, 3);
      case "yearly":
        return addYears(date, 1);
      default:
        return date;
    }
  };

  const generateTimelineEvents = () => {
    if (!startsAt || !frequency) return [];

    const events = [];
    let currentDate = new Date(startsAt);
    let count = 0;
    const maxEvents = 5;

    while (count < maxEvents) {
      if (recurringEndsAt && currentDate > recurringEndsAt) break;

      events.push({
        startDate: currentDate,
        endDate: addDays(currentDate, instanceDurationDays || 7),
      });

      currentDate = getNextDate(currentDate);
      count++;
    }

    return events;
  };

  const events = generateTimelineEvents();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 space-y-2"
            >
              <div className="text-sm font-medium">
                Instance {index + 1}
              </div>
              <div className="text-sm text-muted-foreground">
                Starts: {format(event.startDate, "PPP")}
              </div>
              <div className="text-sm text-muted-foreground">
                Ends: {format(event.endDate, "PPP")}
              </div>
            </div>
          ))}
          {recurringEndsAt && (
            <div className="text-sm text-muted-foreground mt-4">
              Campaign ends on {format(recurringEndsAt, "PPP")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}