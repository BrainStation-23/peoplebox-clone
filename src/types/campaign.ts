import { Database } from "@/integrations/supabase/types";
import { Survey } from "./survey";

export type Campaign = Database["public"]["Tables"]["survey_campaigns"]["Row"] & {
  survey?: Survey;
};

export type CampaignInstance = Database["public"]["Tables"]["campaign_instances"]["Row"];

export type CampaignStatus = "draft" | "active" | "completed" | "archived";

export type CampaignType = "one_time" | "recurring";

export type RecurringFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export type InstanceStatus = "upcoming" | "active" | "completed";

// Campaign form-specific types
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