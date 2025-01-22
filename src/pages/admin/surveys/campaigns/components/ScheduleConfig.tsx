import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn, useWatch } from "react-hook-form";
import { CalendarDateTime } from "@/components/ui/calendar-datetime";
import { CampaignFormData } from "./CampaignForm";
import { cn } from "@/lib/utils";

interface ScheduleConfigProps {
  form: UseFormReturn<CampaignFormData>;
}

const frequencyOptions = [
  { value: "daily", label: "Daily (Runs every day)" },
  { value: "weekly", label: "Weekly (Runs every week)" },
  { value: "monthly", label: "Monthly (Runs once a month)" },
  { value: "quarterly", label: "Quarterly (Runs every 3 months)" },
  { value: "yearly", label: "Yearly (Runs once a year)" },
];

export function ScheduleConfig({ form }: ScheduleConfigProps) {
  const isRecurring = useWatch({
    control: form.control,
    name: "is_recurring",
  });

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="is_recurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Recurring Campaign</FormLabel>
                <FormDescription>
                  Enable if this campaign should repeat on a schedule
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {!isRecurring ? (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="starts_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date & Time</FormLabel>
                  <FormControl>
                    <CalendarDateTime 
                      value={field.value} 
                      onChange={field.onChange}
                      showMonthYearPicker
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ends_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date & Time</FormLabel>
                  <FormControl>
                    <CalendarDateTime 
                      value={field.value} 
                      onChange={field.onChange}
                      showMonthYearPicker
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="starts_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time</FormLabel>
                    <FormControl>
                      <CalendarDateTime 
                        value={field.value} 
                        onChange={field.onChange}
                        showMonthYearPicker
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="recurring_frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instance_duration_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response Window (days)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How many days should each instance last?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instance_end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response Due Time</FormLabel>
                  <FormControl>
                    <Input 
                      type="time" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    What time should responses be due each day?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recurring_ends_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign End Date & Time</FormLabel>
                  <FormControl>
                    <CalendarDateTime 
                      value={field.value} 
                      onChange={field.onChange}
                      showMonthYearPicker
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </Card>
  );
}