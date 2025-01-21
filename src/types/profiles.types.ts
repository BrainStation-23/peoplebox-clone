import { Database } from "./database.types";

export type ProfilesTable = {
  Row: {
    created_at: string
    email: string
    first_name: string | null
    id: string
    last_name: string | null
    level_id: string | null
    profile_image_url: string | null
    updated_at: string
  }
  Insert: {
    created_at?: string
    email: string
    first_name?: string | null
    id: string
    last_name?: string | null
    level_id?: string | null
    profile_image_url?: string | null
    updated_at?: string
  }
  Update: {
    created_at?: string
    email?: string
    first_name?: string | null
    id?: string
    last_name?: string | null
    level_id?: string | null
    profile_image_url?: string | null
    updated_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "profiles_level_id_fkey"
      columns: ["level_id"]
      isOneToOne: false
      referencedRelation: "levels"
      referencedColumns: ["id"]
    }
  ]
}