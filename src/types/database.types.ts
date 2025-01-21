export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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