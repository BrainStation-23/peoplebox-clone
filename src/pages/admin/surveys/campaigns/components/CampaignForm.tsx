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
  ends_at: z.date({
    required_error: "End date is required",
  }),
  is_recurring: z.boolean().default(false),
  recurring_frequency: z.string().optional(),
  recurring_ends_at: z.date().optional(),
  status: z.string().default("draft"),
}).refine((data) => {
  // Ensure end date is after start date
  if (data.ends_at <= data.starts_at) {
    return false;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["ends_at"],
}).refine((data) => {
  // If recurring, ensure recurring end date is after start date
  if (data.is_recurring && data.recurring_ends_at && data.recurring_ends_at <= data.starts_at) {
    return false;
  }
  return true;
}, {
  message: "Recurring end date must be after start date",
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
  { value: "weekly", label: "Weekly (Runs every week on selected days)" },
  { value: "monthly", label: "Monthly (Runs once a month on selected date)" },
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
      ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
      is_recurring: false,
      recurring_frequency: "one_time",
      status: "draft",
      ...defaultValues,
    },
  });

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

              <div className="grid gap-4">
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
                  name="ends_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date & Time</FormLabel>
                      <FormControl>
                        <CalendarDateTime 
                          value={field.value} 
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        When should the campaign end?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              {form.watch("is_recurring") && (
                <>
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