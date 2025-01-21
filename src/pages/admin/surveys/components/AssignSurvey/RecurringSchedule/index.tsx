import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FrequencyPicker } from "./FrequencyPicker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RecurringScheduleProps {
  isRecurring: boolean;
  frequency: string;
  endsAt?: Date;
  onIsRecurringChange: (value: boolean) => void;
  onFrequencyChange: (value: string) => void;
  onEndsAtChange: (date?: Date) => void;
}

export function RecurringSchedule({
  isRecurring,
  frequency,
  endsAt,
  onIsRecurringChange,
  onFrequencyChange,
  onEndsAtChange,
}: RecurringScheduleProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={onIsRecurringChange}
        />
        <Label htmlFor="recurring">Recurring Assignment</Label>
      </div>

      {isRecurring && (
        <>
          <FrequencyPicker value={frequency} onChange={onFrequencyChange} />
          
          <div className="space-y-2">
            <Label>Ends At</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endsAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endsAt ? format(endsAt, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endsAt}
                  onSelect={onEndsAtChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </>
      )}
    </div>
  );
}