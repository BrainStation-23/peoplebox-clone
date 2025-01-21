import { Database } from "@/integrations/supabase/types";

export type AssignmentType = Database["public"]["Enums"]["assignment_type"];
export type AssignmentStatus = Database["public"]["Enums"]["assignment_status"];

export type SurveyAssignment = {
  id: string;
  survey_id: string;
  assignment_type: AssignmentType;
  target_id: string | null;
  due_date: string | null;
  status: AssignmentStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
};