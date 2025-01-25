import { Json } from "@/integrations/supabase/types";

export interface Question {
  name: string;
  title: string;
  type: string;
}

export interface SurveyPage {
  elements: Question[];
}

export interface SurveyData {
  pages: SurveyPage[];
}

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  starts_at: string;
  ends_at: string | null;
  survey: {
    name: string;
    json_data: SurveyData;
  };
}

export interface ResponseStatistics {
  totalResponses: number;
  completionRate: number;
  statusDistribution: {
    completed: number;
    pending: number;
  };
}

export interface DemographicData {
  gender: CategoryBreakdown[];
  location: CategoryBreakdown[];
  employmentType: CategoryBreakdown[];
  sbu: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export interface ResponseData {
  id: string;
  answers: Record<string, {
    question: string;
    answer: any;
    questionType: string;
  }>;
  respondent: {
    name: string;
    email: string;
    gender: "male" | "female" | "other" | null;
    location: { name: string } | null;
    sbu: { name: string } | null;
    employment_type: { name: string } | null;
  };
}