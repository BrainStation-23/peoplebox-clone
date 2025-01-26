import { Json } from "@/integrations/supabase/types";

export interface SurveyPage {
  name: string;
  elements: any[];
}

export interface SurveyJsonData {
  pages: SurveyPage[];
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
  description: string;
  starts_at: string;
  ends_at: string;
  completion_rate: number;
  survey: SurveyData;
}

export interface SlideProps {
  campaign: CampaignData;
  isActive: boolean;
}