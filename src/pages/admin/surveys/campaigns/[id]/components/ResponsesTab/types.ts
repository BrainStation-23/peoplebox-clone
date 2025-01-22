import type { Database } from "@/integrations/supabase/types";

export type Response = Database["public"]["Tables"]["survey_responses"]["Row"] & {
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  assignment: {
    id: string;
    campaign_id: string;
  };
};