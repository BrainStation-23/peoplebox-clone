export * from "@/types/survey";

// Campaign-specific types that aren't part of the core survey types
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type Campaign = {
  id: string;
  name: string;
  description: string | null;
  survey_id: string;
  starts_at: string;
  is_recurring: boolean;
  recurring_frequency?: RecurringFrequency;
  recurring_ends_at?: string;
  instance_duration_days?: number;
  instance_end_time?: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Assignment = {
  id: string;
  status: "pending" | "completed" | "expired";
  due_date: string | null;
  user: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    user_sbus?: {
      sbu: {
        id: string;
        name: string;
      };
      is_primary: boolean;
    }[];
  };
};