import { CSVRow, ProcessingResult, ValidationError, ImportError } from '../types';
import { createProcessingLog } from './createProcessingLog';
import { getLevelId, getLocationId, getEmploymentTypeId, assignSBUs } from './entityValidation';
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

    const rowData = {
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

    try {
      if (!rowData.email) {
        throw new Error("Email is required");
      }

      const validatedRow = rowData as CSVRow;

      if (validatedRow.id) {
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", validatedRow.id)
          .single();

        if (existingUser) {
          result.existingUsers.push({ ...validatedRow, id: existingUser.id });
          result.stats.updates++;
          result.logs.push(
            createProcessingLog(i + 1, "update", "success", validatedRow)
          );
        } else {
          result.errors.push({
            row: i + 1,
            errors: [`User with ID ${validatedRow.id} not found`],
            type: "reference",
            context: rowData,
          });
          result.stats.failed++;
          result.logs.push(
            createProcessingLog(
              i + 1, 
              "update", 
              "error", 
              validatedRow, 
              `User with ID ${validatedRow.id} not found`
            )
          );
        }
      } else {
        result.newUsers.push(validatedRow);
        result.stats.newUsers++;
        result.logs.push(
          createProcessingLog(i + 1, "new", "success", validatedRow)
        );
      }
    } catch (error) {
      const systemError: ValidationError = {
        row: i + 1,
        errors: [(error as Error).message],
        type: "system",
        context: rowData,
      };
      result.errors.push(systemError);
      result.stats.failed++;
      result.logs.push(
        createProcessingLog(
          i + 1,
          rowData.id ? "update" : "new",
          "error",
          rowData as CSVRow,
          (error as Error).message
        )
      );
    }
  }

  return result;
}

export { getLevelId, getLocationId, getEmploymentTypeId, assignSBUs };
export type { ProcessingResult, ImportError };