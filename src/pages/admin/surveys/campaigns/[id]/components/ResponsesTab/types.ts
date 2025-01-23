import type { Json } from "@/integrations/supabase/types";

export type Response = {
  id: string;
  response_data: Record<string, any>;
  submitted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
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

export type SortOption = "date" | "name";
export type SortDirection = "asc" | "desc";

export type FilterOptions = {
  search: string;
  sortBy: SortOption;
  sortDirection: SortDirection;
};