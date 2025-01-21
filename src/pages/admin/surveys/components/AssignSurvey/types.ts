import { z } from "zod";

export type AssignmentType = "individual" | "sbu" | "organization";

export const assignSurveySchema = z.object({
  assignmentType: z.enum(["individual", "sbu", "organization"]),
  targetIds: z.array(z.string().uuid()).optional(),
  dueDate: z.date().optional(),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(["one_time", "daily", "weekly", "monthly"]).optional(),
  recurringEndsAt: z.date().optional(),
  recurringDays: z.array(z.number()).optional(),
});

export type AssignSurveyFormData = z.infer<typeof assignSurveySchema>;