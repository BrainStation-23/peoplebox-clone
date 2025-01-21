import { Database } from "./database.types";

export type SurveysTable = {
  Row: {
    created_at: string
    created_by: string
    description: string | null
    id: string
    json_data: Json
    name: string
    status: Database["public"]["Enums"]["survey_status"] | null
    tags: string[] | null
    updated_at: string
  }
  Insert: {
    created_at?: string
    created_by: string
    description?: string | null
    id?: string
    json_data: Json
    name: string
    status?: Database["public"]["Enums"]["survey_status"] | null
    tags?: string[] | null
    updated_at?: string
  }
  Update: {
    created_at?: string
    created_by?: string
    description?: string | null
    id?: string
    json_data?: Json
    name?: string
    status?: Database["public"]["Enums"]["survey_status"] | null
    tags?: string[] | null
    updated_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "surveys_created_by_fkey"
      columns: ["created_by"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
  ]
}

export type SurveyAssignmentsTable = {
  Row: {
    assignment_type: Database["public"]["Enums"]["assignment_type"]
    created_at: string | null
    created_by: string
    due_date: string | null
    id: string
    status: Database["public"]["Enums"]["assignment_status"] | null
    survey_id: string
    target_id: string | null
    updated_at: string | null
  }
  Insert: {
    assignment_type: Database["public"]["Enums"]["assignment_type"]
    created_at?: string | null
    created_by: string
    due_date?: string | null
    id?: string
    status?: Database["public"]["Enums"]["assignment_status"] | null
    survey_id: string
    target_id?: string | null
    updated_at?: string | null
  }
  Update: {
    assignment_type?: Database["public"]["Enums"]["assignment_type"]
    created_at?: string | null
    created_by?: string
    due_date?: string | null
    id?: string
    status?: Database["public"]["Enums"]["assignment_status"] | null
    survey_id?: string
    target_id?: string | null
    updated_at?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "survey_assignments_created_by_fkey"
      columns: ["created_by"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "survey_assignments_survey_id_fkey"
      columns: ["survey_id"]
      isOneToOne: false
      referencedRelation: "surveys"
      referencedColumns: ["id"]
    }
  ]
}

export type SurveyResponsesTable = {
  Row: {
    assignment_id: string
    created_at: string | null
    id: string
    response_data: Json
    submitted_at: string | null
    updated_at: string | null
    user_id: string
  }
  Insert: {
    assignment_id: string
    created_at?: string | null
    id?: string
    response_data: Json
    submitted_at?: string | null
    updated_at?: string | null
    user_id: string
  }
  Update: {
    assignment_id?: string
    created_at?: string | null
    id?: string
    response_data?: Json
    submitted_at?: string | null
    updated_at?: string | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "survey_responses_assignment_id_fkey"
      columns: ["assignment_id"]
      isOneToOne: false
      referencedRelation: "survey_assignments"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "survey_responses_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
  ]
}