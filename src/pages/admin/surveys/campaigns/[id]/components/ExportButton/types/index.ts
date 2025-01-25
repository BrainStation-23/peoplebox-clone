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