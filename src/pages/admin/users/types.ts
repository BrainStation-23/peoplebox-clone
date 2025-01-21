import { Database } from "@/integrations/supabase/types";

export type UserRole = Database["public"]["Enums"]["user_role"];

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_roles: {
    role: UserRole;
  };
}