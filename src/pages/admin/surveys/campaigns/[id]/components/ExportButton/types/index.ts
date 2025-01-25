export type Campaign = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  starts_at: string;
  ends_at: string | null;
  survey: {
    name: string;
    json_data: any;
  };
};

export type ResponseStatistics = {
  totalResponses: number;
  completionRate: number;
  statusDistribution: {
    completed: number;
    pending: number;
  };
};

export type DemographicData = {
  gender: CategoryBreakdown[];
  location: CategoryBreakdown[];
  employmentType: CategoryBreakdown[];
  sbu: CategoryBreakdown[];
};

export type CategoryBreakdown = {
  category: string;
  count: number;
  percentage: number;
};

export type Question = {
  name: string;
  title: string;
  type: "boolean" | "rating" | "nps" | "text" | "comment";
};

export type ResponseData = {
  id: string;
  answers: Record<string, {
    question: string;
    answer: any;
    questionType: string;
  }>;
  respondent: {
    name: string;
    email: string;
    gender: string | null;
    location: {
      name: string;
    } | null;
    sbu: {
      name: string;
    } | null;
    employment_type: {
      name: string;
    } | null;
  };
};
