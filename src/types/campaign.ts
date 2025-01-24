import { Database } from "@/integrations/supabase/types";

export type CampaignStatus = Database["public"]["Enums"]["campaign_status"];
export type CampaignType = "one_time" | "recurring";
export type RecurringFrequency = Database["public"]["Enums"]["recurring_frequency"];
export type InstanceStatus = Database["public"]["Enums"]["instance_status"];

export type Campaign = Database["public"]["Tables"]["survey_campaigns"]["Row"];
export type CampaignInstance = Database["public"]["Tables"]["campaign_instances"]["Row"];

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