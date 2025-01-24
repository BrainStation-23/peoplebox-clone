import { Survey, SurveyAssignment, SurveyResponse } from "@/types/survey";
import { Campaign, CampaignInstance } from "@/types/campaign";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      email_config: {
        Row: {
          created_at: string
          from_email: string
          from_name: string
          id: string
          is_singleton: boolean | null
          provider: Database["public"]["Enums"]["email_provider"]
          provider_settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_email: string
          from_name: string
          id?: string
          is_singleton?: boolean | null
          provider: Database["public"]["Enums"]["email_provider"]
          provider_settings: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_email?: string
          from_name?: string
          id?: string
          is_singleton?: boolean | null
          provider?: Database["public"]["Enums"]["email_provider"]
          provider_settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      surveys: {
        Row: Survey
        Insert: Omit<Survey, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Survey>
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
      survey_assignments: {
        Row: SurveyAssignment
        Insert: Omit<SurveyAssignment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<SurveyAssignment>
        Relationships: [
          {
            foreignKeyName: "survey_assignments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          },
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
          },
          {
            foreignKeyName: "survey_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      survey_responses: {
        Row: SurveyResponse
        Insert: Omit<SurveyResponse, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<SurveyResponse>
        Relationships: [
          {
            foreignKeyName: "survey_responses_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "survey_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_campaign_instance_id_fkey"
            columns: ["campaign_instance_id"]
            isOneToOne: false
            referencedRelation: "campaign_instances"
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
      survey_campaigns: {
        Row: Campaign
        Insert: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Campaign>
        Relationships: [
          {
            foreignKeyName: "survey_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_campaigns_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          }
        ]
      }
      campaign_instances: {
        Row: CampaignInstance
        Insert: Omit<CampaignInstance, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<CampaignInstance>
        Relationships: [
          {
            foreignKeyName: "campaign_instances_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "survey_campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_campaign_cascade: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      generate_initial_instances: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      is_admin: {
        Args: {
          user_uid: string
        }
        Returns: boolean
      }
      update_campaign_completion_rate: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      validate_campaign_dates: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      assignment_status: "pending" | "completed" | "expired"
      email_provider: "resend"
      employment_type_status: "active" | "inactive"
      gender: "male" | "female" | "other"
      instance_status: "upcoming" | "active" | "completed"
      level_status: "active" | "inactive"
      survey_status: "draft" | "published" | "archived"
      user_role: "admin" | "user"
    }
  }
}
