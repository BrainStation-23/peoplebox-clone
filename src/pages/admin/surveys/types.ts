export type SurveyStatus = 'draft' | 'published' | 'archived';

export type Survey = {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  json_data: Record<string, any>;
  status: SurveyStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
};

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