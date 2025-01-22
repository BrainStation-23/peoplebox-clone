import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CampaignFormLayout } from "./CampaignFormLayout";
import { BasicInfoForm } from "./BasicInfoForm";
import { ScheduleConfig } from "./ScheduleConfig";
import { CampaignPreview } from "./CampaignPreview";

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
  ends_at: z.date().optional(),
  status: z.string().default("draft"),
}).refine((data) => {
  if (data.is_recurring) {
    return data.recurring_ends_at && data.instance_duration_days && data.instance_end_time;
  }
  return data.ends_at !== undefined;
}, {
  message: "Please fill in all required fields",
  path: ["ends_at"],
});

export type CampaignFormData = z.infer<typeof campaignSchema>;

interface Survey {
  id: string;
  name: string;
}

interface CampaignFormProps {
  onSubmit: (data: CampaignFormData) => void;
  surveys: Survey[];
  defaultValues?: Partial<CampaignFormData>;
}

export function CampaignForm({ onSubmit, surveys, defaultValues }: CampaignFormProps) {
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
      instance_end_time: "17:00",
      status: "draft",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CampaignFormLayout
          leftPanel={
            <>
              <BasicInfoForm form={form} surveys={surveys} />
              <ScheduleConfig form={form} />
            </>
          }
          rightPanel={
            <CampaignPreview form={form} />
          }
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button type="submit">
                {defaultValues ? "Update" : "Create"} Campaign
              </Button>
            </>
          }
        />
      </form>
    </Form>
  );
}