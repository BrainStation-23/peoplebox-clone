import { Database } from "@/integrations/supabase/types";

export type UserRole = Database["public"]["Enums"]["user_role"];
export type GenderType = Database["public"]["Enums"]["gender_type"];

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  profile_image_url?: string | null;
  level?: string | null; // Changed to string
  org_id?: string | null;
  gender?: GenderType | null;
  date_of_birth?: string | null;
  designation?: string | null;
  location?: string | null; // Changed to string
  employment_type?: string | null; // Changed to string
  user_roles: {
    role: UserRole;
  };
  user_sbus?: UserSBU[];
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

export interface Supervisor {
  id: string;
  first_name: string | null;
  last_name: string | null;
  is_primary: boolean;
}
