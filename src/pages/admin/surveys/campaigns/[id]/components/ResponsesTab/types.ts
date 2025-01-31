import type { Database } from "@/integrations/supabase/types";

export type Response = Database["public"]["Tables"]["survey_responses"]["Row"] & {
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    user_sbus: {
      is_primary: boolean;
      sbu: {
        id: string;
        name: string;
      };
    }[];
    user_supervisors: {
      is_primary: boolean;
      supervisor: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string;
      };
    }[];
  };
  assignment: {
    id: string;
    campaign_id: string;
    campaign: {
      id: string;
      name: string;
      anonymous: boolean;
    };
  };
};

export type SortOption = "date" | "name";
export type SortDirection = "asc" | "desc";

export type FilterOptions = {
  search: string;
  sortBy: SortOption;
  sortDirection: SortDirection;
};