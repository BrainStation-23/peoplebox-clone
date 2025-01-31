import { Json } from "@/integrations/supabase/types";

export interface SurveyQuestion {
  name: string;
  title: string;
  type: string;
}

export interface SurveyPage {
  elements?: SurveyQuestion[];
}

export interface SurveyJsonData {
  pages?: SurveyPage[];
}

export interface SurveyData {
  id: string;
  name: string;
  description?: string | null;
  json_data: SurveyJsonData;
}

export interface CampaignData {
  id: string;
  name: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  completion_rate: number;
  survey: SurveyData;
  instance?: {
    id: string;
    period_number: number;
    starts_at: string;
    ends_at: string;
    status: string;
    completion_rate: number;
  };
}

export interface SlideProps {
  campaign: CampaignData;
  isActive: boolean;
}

export type QuestionResponseData = 
  | { type: 'boolean'; data: { yes: number; no: number; } }
  | { type: 'rating'; data: { rating: number; count: number; }[] }
  | { type: 'text'; data: { text: string; value: number; }[] };

export interface SatisfactionData {
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
  median: number;
}