import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// CSV row validation schema
const csvRowSchema = z.object({
  email: z.string().email("Invalid email format"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  orgId: z.string().optional(),
  level: z.string().optional(),
  role: z.enum(["admin", "user"]).optional().default("user"),
  gender: z.enum(["male", "female", "other"]).optional(),
  dateOfBirth: z.string()
    .refine(val => {
      if (!val) return true; // Optional field
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, "Invalid date format. Use YYYY-MM-DD")
    .optional(),
  designation: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  employeeRole: z.string().optional(),
  employeeType: z.string().optional(),
  sbus: z.string().optional(),
  id: z.string().uuid("Invalid uuid").optional().nullable(),
});

export type CSVValidationError = {
  row: number;
  errors: string[];
};

export type ValidationResult = {
  isValid: boolean;
  errors: CSVValidationError[];
  validRows: z.infer<typeof csvRowSchema>[];
};

export async function validateCSV(file: File): Promise<ValidationResult> {
  const errors: CSVValidationError[] = [];
  const validRows: z.infer<typeof csvRowSchema>[] = [];

  // Get existing data for validation
  const [
    { data: sbus },
    { data: levels },
    { data: locations },
    { data: employmentTypes },
    { data: employeeRoles },
    { data: employeeTypes }
  ] = await Promise.all([
    supabase.from("sbus").select("name"),
    supabase.from("levels").select("name").eq("status", "active"),
    supabase.from("locations").select("name"),
    supabase.from("employment_types").select("name").eq("status", "active"),
    supabase.from("employee_roles").select("name").eq("status", "active"),
    supabase.from("employee_types").select("name").eq("status", "active")
  ]);

  const sbuNames = new Set(sbus?.map(sbu => sbu.name) || []);
  const levelNames = new Set(levels?.map(level => level.name) || []);
  const locationNames = new Set(locations?.map(loc => loc.name) || []);
  const employmentTypeNames = new Set(employmentTypes?.map(type => type.name) || []);
  const employeeRoleNames = new Set(employeeRoles?.map(role => role.name) || []);
  const employeeTypeNames = new Set(employeeTypes?.map(type => type.name) || []);

  try {
    const text = await file.text();
    const rows = text.split("\n").map(row => row.split(","));
    const headers = rows[0].map(h => h.trim());

    // Validate each row starting from index 1 (skip headers)
    for (let i = 1; i < rows.length; i++) {
      const rowErrors: string[] = [];
      const row = rows[i];
      
      // Skip empty rows
      if (row.length === 1 && !row[0]) continue;

      const rowData = {
        email: row[headers.indexOf("Email")]?.trim(),
        firstName: row[headers.indexOf("First Name")]?.trim(),
        lastName: row[headers.indexOf("Last Name")]?.trim(),
        orgId: row[headers.indexOf("Org ID")]?.trim(),
        level: row[headers.indexOf("Level")]?.trim(),
        role: row[headers.indexOf("Role")]?.trim()?.toLowerCase() as "admin" | "user",
        gender: row[headers.indexOf("Gender")]?.trim()?.toLowerCase() as "male" | "female" | "other",
        dateOfBirth: row[headers.indexOf("Date of Birth")]?.trim(),
        designation: row[headers.indexOf("Designation")]?.trim(),
        location: row[headers.indexOf("Location")]?.trim(),
        employmentType: row[headers.indexOf("Employment Type")]?.trim(),
        employeeRole: row[headers.indexOf("Employee Role")]?.trim(),
        employeeType: row[headers.indexOf("Employee Type")]?.trim(),
        sbus: row[headers.indexOf("SBUs")]?.trim(),
        id: row[headers.indexOf("ID")]?.trim() || null,
      };

      // Validate against schema
      const result = csvRowSchema.safeParse(rowData);
      
      if (!result.success) {
        result.error.errors.forEach(err => {
          // Skip ID-related errors if the ID field is empty
          if (err.path.includes('id') && !rowData.id) return;
          rowErrors.push(`${err.path.join(".")}: ${err.message}`);
        });
      }

      // Validate reference data if provided
      if (rowData.level && !levelNames.has(rowData.level)) {
        rowErrors.push(`Level "${rowData.level}" does not exist or is not active`);
      }

      if (rowData.location && !locationNames.has(rowData.location)) {
        rowErrors.push(`Location "${rowData.location}" does not exist`);
      }

      if (rowData.employmentType && !employmentTypeNames.has(rowData.employmentType)) {
        rowErrors.push(`Employment Type "${rowData.employmentType}" does not exist or is not active`);
      }

      if (rowData.employeeRole && !employeeRoleNames.has(rowData.employeeRole)) {
        rowErrors.push(`Employee Role "${rowData.employeeRole}" does not exist or is not active`);
      }

      if (rowData.employeeType && !employeeTypeNames.has(rowData.employeeType)) {
        rowErrors.push(`Employee Type "${rowData.employeeType}" does not exist or is not active`);
      }

      if (rowData.sbus) {
        const sbuList = rowData.sbus.split(";").map(s => s.trim());
        sbuList.forEach(sbu => {
          if (!sbuNames.has(sbu)) {
            rowErrors.push(`SBU "${sbu}" does not exist`);
          }
        });
      }

      if (rowErrors.length > 0) {
        errors.push({ row: i + 1, errors: rowErrors });
      } else {
        validRows.push(rowData);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      validRows,
    };
  } catch (error) {
    throw new Error("Failed to parse CSV file");
  }
}