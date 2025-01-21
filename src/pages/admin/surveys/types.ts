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