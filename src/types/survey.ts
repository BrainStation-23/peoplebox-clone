import { Database } from "@/integrations/supabase/types";

export type SurveyStatus = Database["public"]["Enums"]["survey_status"];
export type AssignmentStatus = Database["public"]["Enums"]["assignment_status"];

export interface Survey {
  id: string;
  name: string;
  description: string | null;
  tags: string[] | null;
  json_data: Record<string, any>;
  status: SurveyStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SurveyAssignment {
  id: string;
  survey_id: string;
  user_id: string;
  due_date: string | null;
  status: AssignmentStatus | null;
  created_by: string;
  created_at: string | null;
  updated_at: string | null;
  is_organization_wide: boolean | null;
  campaign_id: string | null;
  last_reminder_sent: string | null;
  survey: Survey;
  campaign?: {
    id: string;
    name: string;
    description: string | null;
    completion_rate: number | null;
    status: string;
    campaign_type: string;
    created_at: string;
    created_by: string;
    ends_at: string | null;
    is_recurring: boolean | null;
    recurring_days: number[] | null;
    recurring_ends_at: string | null;
    recurring_frequency: string | null;
    starts_at: string;
    instance_duration_days: number | null;
    instance_end_time: string | null;
    updated_at: string;
  };
}

export interface SurveyResponse {
  id: string;
  assignment_id: string;
  user_id: string;
  response_data: Record<string, any>;
  submitted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  campaign_instance_id: string | null;
  state_data: SurveyStateData | null;
}

export interface SurveyStateData {
  lastPageNo: number;
  lastUpdated: string;
  [key: string]: any;
}

// Type guard for SurveyStateData
export function isSurveyStateData(json: any): json is SurveyStateData {
  if (typeof json !== 'object' || json === null) return false;
  
  return (
    typeof json.lastPageNo === 'number' &&
    typeof json.lastUpdated === 'string'
  );
}