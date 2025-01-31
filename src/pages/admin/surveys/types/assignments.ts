import { Database } from "@/integrations/supabase/types";

export type AssignmentStatus = Database["public"]["Enums"]["assignment_status"];

export type SurveyAssignment = {
  id: string;
  survey_id: string;
  user_id: string;
  due_date: string | null;
  status: AssignmentStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_recurring: boolean | null;
  recurring_frequency: Database["public"]["Enums"]["recurring_frequency"] | null;
  recurring_ends_at: string | null;
  recurring_days: number[] | null;
};