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
  pages: SurveyPage[];
}

export interface SurveyData {
  id: string;
  name: string;
  description?: string | null;
  json_data: Json;
}

export interface CampaignData {
  id: string;
  name: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  completion_rate: number;
  survey: SurveyData;
}

export interface SlideProps {
  campaign: CampaignData;
  isActive: boolean;
}