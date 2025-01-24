import { Database } from "@/integrations/supabase/types";

export type UserRole = Database["public"]["Enums"]["user_role"];
export type GenderType = Database["public"]["Enums"]["gender_type"];

export interface CSVRow {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  orgId?: string;
  level?: string;
  sbus?: string;
  role?: "admin" | "user";
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  designation?: string;
  location?: string;
  employmentType?: string;
}

export type CSVRowType = "new" | "update";
export type ProcessingStatus = "success" | "error" | "skipped";

export interface ProcessingLogEntry {
  row: number;
  type: CSVRowType;
  status: ProcessingStatus;
  email: string;
  id?: string;
  error?: string;
  details: {
    attemptedChanges: Partial<CSVRow>;
    actualChanges?: Partial<CSVRow>;
  };
}

export interface ValidationError {
  row: number;
  errors: string[];
  type: 'validation' | 'reference' | 'system';
  context?: Record<string, any>;
}

export interface ProcessingResult {
  newUsers: CSVRow[];
  existingUsers: (CSVRow & { id: string })[];
  errors: ValidationError[];
  logs: ProcessingLogEntry[];
  stats: {
    totalRows: number;
    newUsers: number;
    updates: number;
    skipped: number;
    failed: number;
  };
}

export interface ImportError {
  row: number;
  type: 'validation' | 'creation' | 'update' | 'sbu' | 'level' | 'role' | 'location' | 'employment' | 'gender' | 'date';
  message: string;
  data?: Partial<CSVRow>;
}

export interface ImportResult {
  successful: number;
  failed: number;
  errors: ImportError[];
}

export interface BatchProgress {
  processed: number;
  total: number;
  currentBatch: number;
  totalBatches: number;
  estimatedTimeRemaining: number;
  errors: ImportError[];
}