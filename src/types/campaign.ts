import { Database } from "@/integrations/supabase/types";
import { Survey } from "./survey";

export type Campaign = {
  id: string;
  name: string;
  description: string | null;
  survey_id: string;
  created_by: string;
  status: string;
  campaign_type: string;
  is_recurring: boolean | null;
  recurring_frequency: string | null;
  recurring_days: number[] | null;
  recurring_ends_at: string | null;
  created_at: string;
  updated_at: string;
  completion_rate: number | null;
  starts_at: string;
  ends_at: string | null;
  instance_duration_days: number | null;
  instance_end_time: string | null;
  survey?: Survey;
};

export type CampaignInstance = {
  id: string;
  campaign_id: string;
  period_number: number;
  starts_at: string;
  ends_at: string;
  status: Database["public"]["Enums"]["instance_status"];
  completion_rate: number | null;
  created_at: string;
  updated_at: string;
};

export type CampaignStatus = "draft" | "active" | "completed" | "archived";
export type CampaignType = "one_time" | "recurring";
export type RecurringFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
export type InstanceStatus = Database["public"]["Enums"]["instance_status"];

export type CampaignFormData = {
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
};