import { Database } from "@/integrations/supabase/types";

export type CampaignStatus = "draft" | "active" | "completed" | "archived";
export type CampaignType = "one_time" | "recurring";
export type RecurringFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
export type InstanceStatus = Database["public"]["Enums"]["instance_status"];

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  survey_id: string;
  created_by: string;
  status: CampaignStatus;
  campaign_type: CampaignType;
  is_recurring: boolean;
  recurring_frequency: RecurringFrequency | null;
  recurring_days: number[] | null;
  recurring_ends_at: string | null;
  created_at: string;
  updated_at: string;
  completion_rate: number | null;
  starts_at: string;
  ends_at: string | null;
  instance_duration_days: number | null;
  instance_end_time: string | null;
}

export interface CampaignInstance {
  id: string;
  campaign_id: string;
  period_number: number;
  starts_at: string;
  ends_at: string;
  status: InstanceStatus;
  completion_rate: number | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignFormData {
  name: string;
  description?: string;
  survey_id: string;
  starts_at: Date;
  is_recurring: boolean;
  recurring_frequency?: RecurringFrequency;
  recurring_ends_at?: Date;
  instance_duration_days?: number;
  instance_end_time?: string;
  ends_at?: Date;
  status: string;
  recurring_days?: number[];
  completion_rate?: number;
}