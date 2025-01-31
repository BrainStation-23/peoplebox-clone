export interface Question {
  name: string;
  title: string;
  type: string;
  rateCount?: number;
}

export interface ProcessedResponse {
  id: string;
  respondent: {
    name: string;
    email: string;
    gender: string | null;
    location: {
      id: string;
      name: string;
    } | null;
    sbu: {
      id: string;
      name: string;
    } | null;
    employment_type: {
      id: string;
      name: string;
    } | null;
  };
  submitted_at: string;
  answers: Record<string, {
    question: string;
    answer: any;
    questionType: string;
  }>;
}

export type QuestionResponseData = 
  | { type: 'boolean'; data: { yes: number; no: number; } }
  | { type: 'rating'; data: { rating: number; count: number; }[]; rateCount?: number }
  | { type: 'text'; data: { text: string; value: number; }[] };

export interface ProcessedData {
  questions: Question[];
  responses: ProcessedResponse[];
}

export interface SatisfactionData {
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
  median: number;
}