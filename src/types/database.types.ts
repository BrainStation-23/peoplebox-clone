import { ProfilesTable } from "./profiles.types";
import { SBUsTable } from "./sbus.types";
import { SurveysTable, SurveyAssignmentsTable, SurveyResponsesTable } from "./surveys.types";
import { UserRolesTable, UserSBUsTable, UserSupervisorsTable } from "./users.types";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface DatabaseFunctions {
  is_admin: {
    Args: {
      user_uid: string
    }
    Returns: boolean
  }
}

export interface DatabaseEnums {
  level_status: "active" | "inactive"
  survey_status: "draft" | "published" | "archived"
  user_role: "admin" | "user"
  assignment_type: "individual" | "sbu" | "organization"
  assignment_status: "pending" | "completed" | "expired"
}

export type Database = {
  public: {
    Tables: {
      levels: {
        Row: {
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["level_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["level_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["level_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: ProfilesTable
      sbus: SBUsTable
      survey_assignments: SurveyAssignmentsTable
      survey_responses: SurveyResponsesTable
      surveys: SurveysTable
      user_roles: UserRolesTable
      user_sbus: UserSBUsTable
      user_supervisors: UserSupervisorsTable
    }
    Views: {
      [_ in never]: never
    }
    Functions: DatabaseFunctions
    Enums: DatabaseEnums
    CompositeTypes: {
      [_ in never]: never
    }
  }
}