import { CSVRow, ProcessingResult, ValidationError, ImportError } from '../types';
import { createProcessingLog } from './createProcessingLog';
import { validateRow } from './validation';
import { supabase } from "@/integrations/supabase/client";

export async function processCSVFile(file: File): Promise<ProcessingResult> {
  const text = await file.text();
  const rows = text.split("\n").map(row => row.split(","));
  const headers = rows[0].map(h => h.trim());
  
  const result: ProcessingResult = {
    newUsers: [],
    existingUsers: [],
    errors: [],
    logs: [],
    stats: {
      totalRows: 0,
      newUsers: 0,
      updates: 0,
      skipped: 0,
      failed: 0,
    },
  };

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    result.stats.totalRows++;
    
    if (row.length === 1 && !row[0]) {
      result.stats.skipped++;
      continue;
    }

    const rowData = mapRowToData(row, headers);
    
    try {
      const validationResult = await validateRow(rowData);
      
      if (validationResult.isValid) {
        if (rowData.id) {
          await handleExistingUser(rowData, result);
        } else {
          result.newUsers.push(rowData as CSVRow);
          result.stats.newUsers++;
          result.logs.push(
            createProcessingLog(i + 1, "new", "success", rowData as CSVRow)
          );
        }
      } else {
        handleValidationError(i, rowData, validationResult.errors, result);
      }
    } catch (error) {
      handleProcessingError(i, rowData, error, result);
    }
  }

  return result;
}

function mapRowToData(row: string[], headers: string[]): Partial<CSVRow> {
  return {
    id: row[headers.indexOf("ID")]?.trim(),
    email: row[headers.indexOf("Email")]?.trim(),
    firstName: row[headers.indexOf("First Name")]?.trim(),
    lastName: row[headers.indexOf("Last Name")]?.trim(),
    orgId: row[headers.indexOf("Org ID")]?.trim(),
    level: row[headers.indexOf("Level")]?.trim(),
    sbus: row[headers.indexOf("SBUs")]?.trim(),
    role: row[headers.indexOf("Role")]?.trim()?.toLowerCase() as "admin" | "user",
    gender: row[headers.indexOf("Gender")]?.trim()?.toLowerCase() as "male" | "female" | "other",
    dateOfBirth: row[headers.indexOf("Date of Birth")]?.trim(),
    designation: row[headers.indexOf("Designation")]?.trim(),
    location: row[headers.indexOf("Location")]?.trim(),
    employmentType: row[headers.indexOf("Employment Type")]?.trim(),
  };
}

async function handleExistingUser(rowData: Partial<CSVRow>, result: ProcessingResult) {
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", rowData.id)
    .single();

  if (existingUser) {
    result.existingUsers.push({ ...rowData as CSVRow, id: existingUser.id });
    result.stats.updates++;
  } else {
    throw new Error(`User with ID ${rowData.id} not found`);
  }
}

function handleValidationError(
  rowIndex: number,
  rowData: Partial<CSVRow>,
  errors: string[],
  result: ProcessingResult
) {
  const validationError: ValidationError = {
    row: rowIndex + 1,
    errors,
    type: "validation",
    context: rowData,
  };
  result.errors.push(validationError);
  result.stats.failed++;
  result.logs.push(
    createProcessingLog(
      rowIndex + 1,
      rowData.id ? "update" : "new",
      "error",
      rowData as CSVRow,
      errors.join(", ")
    )
  );
}

function handleProcessingError(
  rowIndex: number,
  rowData: Partial<CSVRow>,
  error: any,
  result: ProcessingResult
) {
  const systemError: ValidationError = {
    row: rowIndex + 1,
    errors: [error instanceof Error ? error.message : "Unknown error occurred"],
    type: "system",
    context: rowData,
  };
  result.errors.push(systemError);
  result.stats.failed++;
  result.logs.push(
    createProcessingLog(
      rowIndex + 1,
      rowData.id ? "update" : "new",
      "error",
      rowData as CSVRow,
      error instanceof Error ? error.message : "Unknown error occurred"
    )
  );
}

export type { ProcessingResult, ImportError };
