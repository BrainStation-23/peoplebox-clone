export interface Question {
  name: string;
  title: string;
  type: string;
  rateCount?: number;
}

export type ProcessedResponse = {
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

export type BooleanResponseData = {
  yes: number;
  no: number;
};

export type RatingResponseData = {
  rating: number;
  count: number;
  group?: string;
}[];

export type SatisfactionResponseData = {
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
};

export type TextResponseData = {
  text: string;
  value: number;
}[];

export type ProcessedData = {
  questions: Question[];
  responses: ProcessedResponse[];
}