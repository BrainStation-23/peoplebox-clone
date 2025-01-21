import { Database } from "./database.types";

export type UserRolesTable = {
  Row: {
    created_at: string
    id: string
    role: Database["public"]["Enums"]["user_role"]
    user_id: string
  }
  Insert: {
    created_at?: string
    id?: string
    role?: Database["public"]["Enums"]["user_role"]
    user_id: string
  }
  Update: {
    created_at?: string
    id?: string
    role?: Database["public"]["Enums"]["user_role"]
    user_id?: string
  }
  Relationships: []
}

export type UserSBUsTable = {
  Row: {
    created_at: string
    id: string
    is_primary: boolean | null
    sbu_id: string | null
    updated_at: string
    user_id: string | null
  }
  Insert: {
    created_at?: string
    id?: string
    is_primary?: boolean | null
    sbu_id?: string | null
    updated_at?: string
    user_id?: string | null
  }
  Update: {
    created_at?: string
    id?: string
    is_primary?: boolean | null
    sbu_id?: string | null
    updated_at?: string
    user_id?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "user_sbus_sbu_id_fkey"
      columns: ["sbu_id"]
      isOneToOne: false
      referencedRelation: "sbus"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "user_sbus_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
  ]
}

export type UserSupervisorsTable = {
  Row: {
    created_at: string
    id: string
    is_primary: boolean | null
    supervisor_id: string
    updated_at: string
    user_id: string
  }
  Insert: {
    created_at?: string
    id?: string
    is_primary?: boolean | null
    supervisor_id: string
    updated_at?: string
    user_id: string
  }
  Update: {
    created_at?: string
    id?: string
    is_primary?: boolean | null
    supervisor_id?: string
    updated_at?: string
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "user_supervisors_supervisor_id_fkey"
      columns: ["supervisor_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "user_supervisors_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
  ]
}