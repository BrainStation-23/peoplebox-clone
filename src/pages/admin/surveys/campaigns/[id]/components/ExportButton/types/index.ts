import type { Database } from "@/integrations/supabase/types";

export type Campaign = Database["public"]["Tables"]["survey_campaigns"]["Row"] & {
  survey: {
    name: string;
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
  gender: Array<{ category: string; count: number; percentage: number }>;
  location: Array<{ category: string; count: number; percentage: number }>;
  employmentType: Array<{ category: string; count: number; percentage: number }>;
  sbu: Array<{ category: string; count: number; percentage: number }>;
};

export type PdfSection = {
  title: string;
  content: () => Promise<void>;
};