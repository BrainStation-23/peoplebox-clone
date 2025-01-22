import { z } from "zod";
import { Database } from "@/integrations/supabase/types";

type RecurringFrequency = Database["public"]["Enums"]["recurring_frequency"];

export const assignSurveySchema = z.object({
  selectedUsers: z.array(z.string().uuid()),
  dueDate: z.date().optional(),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(['one_time', 'daily', 'weekly', 'monthly'] as const).optional(),
  recurringEndsAt: z.date().optional(),
  recurringDays: z.array(z.number()).optional(),
});

export type AssignSurveyFormData = z.infer<typeof assignSurveySchema>;

export type AssignSurveyProps = {
  surveyId: string;
  campaignId?: string;
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  onAssigned?: () => void;
};