import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// CSV row validation schema
const csvRowSchema = z.object({
  email: z.string().email(),
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
  sbus: z.string().optional(),
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
  const { data: sbus } = await supabase.from("sbus").select("name");
  const { data: levels } = await supabase.from("levels").select("name");
  const { data: locations } = await supabase.from("locations").select("name");
  const { data: employmentTypes } = await supabase.from("employment_types")
    .select("name")
    .eq("status", "active");

  const sbuNames = new Set(sbus?.map(sbu => sbu.name) || []);
  const levelNames = new Set(levels?.map(level => level.name) || []);
  const locationNames = new Set(locations?.map(loc => loc.name) || []);
  const employmentTypeNames = new Set(employmentTypes?.map(type => type.name) || []);

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
        sbus: row[headers.indexOf("SBUs")]?.trim(),
      };

      // Validate against schema
      const result = csvRowSchema.safeParse(rowData);
      
      if (!result.success) {
        result.error.errors.forEach(err => {
          rowErrors.push(`${err.path.join(".")}: ${err.message}`);
        });
      }

      // Validate level exists
      if (rowData.level && !levelNames.has(rowData.level)) {
        rowErrors.push(`Level "${rowData.level}" does not exist`);
      }

      // Validate location exists
      if (rowData.location && !locationNames.has(rowData.location)) {
        rowErrors.push(`Location "${rowData.location}" does not exist`);
      }

      // Validate employment type exists
      if (rowData.employmentType && !employmentTypeNames.has(rowData.employmentType)) {
        rowErrors.push(`Employment Type "${rowData.employmentType}" does not exist`);
      }

      // Validate SBUs exist
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