export interface ProcessedAnswer {
  question: string;
  answer: any;
  questionType: string;
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
  answers: Record<string, ProcessedAnswer>;
}

export interface ProcessedData {
  responses: ProcessedResponse[];
  data: any[]; // Adding the data property that's being accessed
}