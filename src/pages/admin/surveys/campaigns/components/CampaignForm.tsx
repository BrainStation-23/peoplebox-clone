import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CalendarDateTime } from "@/components/ui/calendar-datetime";

const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  survey_id: z.string().min(1, "Survey is required"),
  starts_at: z.date({
    required_error: "Start date is required",
  }),
  is_recurring: z.boolean().default(false),
  recurring_frequency: z.string().optional(),
  recurring_ends_at: z.date().optional(),
  instance_duration_days: z.number().optional(),
  instance_end_time: z.string().optional(),
  status: z.string().default("draft"),
}).refine((data) => {
  if (data.is_recurring) {
    return data.recurring_ends_at && data.instance_duration_days && data.instance_end_time;
  }
  return true;
}, {
  message: "Recurring campaigns require end date, duration, and end time",
  path: ["recurring_ends_at"],
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface Survey {
  id: string;
  name: string;
}

interface CampaignFormProps {
  onSubmit: (data: CampaignFormData) => void;
  surveys: Survey[];
  defaultValues?: Partial<CampaignFormData>;
}

const frequencyOptions = [
  { value: "daily", label: "Daily (Runs every day)" },
  { value: "weekly", label: "Weekly (Runs every week)" },
  { value: "monthly", label: "Monthly (Runs once a month)" },
  { value: "quarterly", label: "Quarterly (Runs every 3 months)" },
  { value: "yearly", label: "Yearly (Runs once a year)" },
];

export function CampaignForm({ onSubmit, surveys, defaultValues }: CampaignFormProps) {
  const navigate = useNavigate();
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      description: "",
      survey_id: "",
      starts_at: new Date(),
      is_recurring: false,
      recurring_frequency: undefined,
      instance_duration_days: 7,
      instance_end_time: "23:59",
      status: "draft",
      ...defaultValues,
    },
  });

  const isRecurring = form.watch("is_recurring");
  const frequency = form.watch("recurring_frequency");

  // Set default duration based on frequency
  const handleFrequencyChange = (value: string) => {
    form.setValue("recurring_frequency", value);
    let defaultDuration = 7; // default for weekly
    switch (value) {
      case "monthly":
        defaultDuration = 30;
        break;
      case "quarterly":
        defaultDuration = 90;
        break;
      case "yearly":
        defaultDuration = 365;
        break;
    }
    form.setValue("instance_duration_days", defaultDuration);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of the campaign's purpose
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="survey_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Survey</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a survey" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {surveys.map((survey) => (
                          <SelectItem key={survey.id} value={survey.id}>
                            {survey.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Only published surveys can be used in campaigns
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      />
                    </FormControl>
                    <FormDescription>
                      When should the campaign start?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {isRecurring && (
                <>
                  <FormField
                    control={form.control}
                    name="recurring_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select 
                          onValueChange={handleFrequencyChange} 
                          defaultValue={field.value}
                        >
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
                        <FormLabel>Instance Duration (days)</FormLabel>
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
                        <FormLabel>Instance End Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          What time should instances end each day?
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
                        <FormLabel>Recurring End Date & Time</FormLabel>
                        <FormControl>
                          <CalendarDateTime 
                            value={field.value} 
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          When should the recurring campaign stop?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/surveys/campaigns")}
          >
            Cancel
          </Button>
          <Button type="submit">
            {defaultValues ? "Update" : "Create"} Campaign
          </Button>
        </div>
      </form>
    </Form>
  );
}