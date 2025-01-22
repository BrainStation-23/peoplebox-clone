import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UseFormReturn, useWatch } from "react-hook-form";
import { CampaignFormData } from "./CampaignForm";
import { format, addDays, addWeeks, addMonths, addYears } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CampaignPreviewProps {
  form: UseFormReturn<CampaignFormData>;
}

const INSTANCES_PER_PAGE = 10;

export function CampaignPreview({ form }: CampaignPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);

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

  const generateAllTimelineEvents = () => {
    if (!startsAt || !frequency) return [];

    const events = [];
    let currentDate = new Date(startsAt);

    while (!recurringEndsAt || currentDate <= recurringEndsAt) {
      events.push({
        startDate: currentDate,
        endDate: addDays(currentDate, instanceDurationDays || 7),
      });

      currentDate = getNextDate(currentDate);
      
      // Safety check to prevent infinite loops
      if (events.length > 1000) break;
    }

    return events;
  };

  const allEvents = generateAllTimelineEvents();
  const totalPages = Math.ceil(allEvents.length / INSTANCES_PER_PAGE);
  
  const paginatedEvents = allEvents.slice(
    (currentPage - 1) * INSTANCES_PER_PAGE,
    currentPage * INSTANCES_PER_PAGE
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Campaign Timeline</CardTitle>
          <div className="text-sm text-muted-foreground">
            Total Instances: {allEvents.length}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Timeline navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Timeline events */}
          <div className="space-y-3">
            {paginatedEvents.map((event, index) => {
              const instanceNumber = (currentPage - 1) * INSTANCES_PER_PAGE + index + 1;
              const isActive = event.startDate <= new Date() && event.endDate > new Date();
              const isUpcoming = event.startDate > new Date();
              
              return (
                <div
                  key={index}
                  className="relative pl-8 border-l-2 border-primary/20 pb-4 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-2 w-4 h-4 rounded-full ${
                      isActive
                        ? "bg-green-500"
                        : isUpcoming
                        ? "bg-blue-500"
                        : "bg-gray-500"
                    }`}
                  />

                  {/* Instance card */}
                  <div className="border rounded-lg p-4 transition-colors hover:bg-accent/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline">Instance {instanceNumber}</Badge>
                        <h4 className="font-medium mt-2">
                          {format(event.startDate, "PPP")} -{" "}
                          {format(event.endDate, "PPP")}
                        </h4>
                      </div>
                      <Badge
                        variant={
                          isActive ? "success" : isUpcoming ? "default" : "secondary"
                        }
                      >
                        {isActive ? "Active" : isUpcoming ? "Upcoming" : "Completed"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Duration: {instanceDurationDays} days
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {recurringEndsAt && (
            <div className="text-sm text-muted-foreground mt-4 pt-4 border-t">
              Campaign ends on {format(recurringEndsAt, "PPP")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}