import { Json } from "@/integrations/supabase/types";

export interface SurveyStateData {
  lastPageNo: number;
  lastUpdated: string;
}

// Helper function to type check state data
export function isSurveyStateData(json: Json): json is SurveyStateData {
  if (typeof json !== 'object' || json === null) return false;
  
  const state = json as Record<string, unknown>;
  return (
    typeof state.lastPageNo === 'number' &&
    typeof state.lastUpdated === 'string'
  );
}