import { Database } from "@/integrations/supabase/types";

export type UserRole = Database["public"]["Enums"]["user_role"];
export type GenderType = Database["public"]["Enums"]["gender_type"];

export interface Level {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

export interface Location {
  id: string;
  name: string;
  google_maps_url: string | null;
  address: string | null;
}

export interface UserSBU {
  id: string;
  user_id: string;
  sbu_id: string;
  is_primary: boolean;
  sbu: {
    id: string;
    name: string;
  };
}

export interface Supervisor {
  id: string;
  first_name: string | null;
  last_name: string | null;
  is_primary: boolean;
}

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  profile_image_url?: string | null;
  level_id?: string | null;
  org_id: string | null;
  level?: Level | null;
  user_roles: {
    role: UserRole;
  };
  user_sbus?: UserSBU[];
}