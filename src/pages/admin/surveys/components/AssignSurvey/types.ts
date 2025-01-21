import { z } from "zod";

export const assignSurveySchema = z.object({
  targetId: z.string().uuid(),
  dueDate: z.date().optional(),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(["one_time", "daily", "weekly", "monthly"]).optional(),
  recurringEndsAt: z.date().optional(),
  recurringDays: z.array(z.number()).optional(),
});

export type AssignSurveyFormData = z.infer<typeof assignSurveySchema>;