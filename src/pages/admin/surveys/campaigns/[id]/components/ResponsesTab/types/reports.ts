import { Json } from "@/integrations/supabase/types";

export type QuestionType = 
  | "radiogroup"
  | "checkbox"
  | "rating"
  | "text"
  | "matrix"
  | "numeric"
  | "nps";

export interface SurveyQuestion {
  name: string;
  title: string;
  type: QuestionType;
  choices?: string[];
  rows?: string[];
  columns?: string[];
}

export interface ProcessedResponse {
  questionId: string;
  answer: Json;
  respondentId: string;
  submittedAt: string;
}

export interface QuestionAnalysis {
  question: SurveyQuestion;
  responses: ProcessedResponse[];
  summary: {
    totalResponses: number;
    [key: string]: number | string;
  };
}