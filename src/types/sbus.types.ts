import { Database } from "./database.types";

export type SBUsTable = {
  Row: {
    created_at: string
    head_id: string | null
    id: string
    name: string
    profile_image_url: string | null
    updated_at: string
    website: string | null
  }
  Insert: {
    created_at?: string
    head_id?: string | null
    id?: string
    name: string
    profile_image_url?: string | null
    updated_at?: string
    website?: string | null
  }
  Update: {
    created_at?: string
    head_id?: string | null
    id?: string
    name?: string
    profile_image_url?: string | null
    updated_at?: string
    website?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "sbus_head_id_fkey"
      columns: ["head_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
  ]
}