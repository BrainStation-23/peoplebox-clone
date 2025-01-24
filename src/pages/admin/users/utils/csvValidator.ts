import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// CSV row validation schema
const csvRowSchema = z.object({
  id: z.string().uuid().optional(),
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
  type: 'validation' | 'reference' | 'system';
  context?: Record<string, any>;
};

export type ValidationResult = {
  isValid: boolean;
  errors: CSVValidationError[];
  validRows: z.infer<typeof csvRowSchema>[];
  stats: {
    totalRows: number;
    newUsers: number;
    updates: number;
    skipped: number;
  };
};

async function validateReferencedEntities(row: z.infer<typeof csvRowSchema>): Promise<string[]> {
  const errors: string[] = [];

  // Validate level exists if provided
  if (row.level) {
    const { data: level } = await supabase
      .from("levels")
      .select("id")
      .eq("name", row.level)
      .maybeSingle();
    
    if (!level) {
      errors.push(`Level "${row.level}" does not exist`);
    }
  }

  // Validate location exists if provided
  if (row.location) {
    const { data: location } = await supabase
      .from("locations")
      .select("id")
      .eq("name", row.location)
      .maybeSingle();
    
    if (!location) {
      errors.push(`Location "${row.location}" does not exist`);
    }
  }

  // Validate employment type exists if provided
  if (row.employmentType) {
    const { data: employmentType } = await supabase
      .from("employment_types")
      .select("id")
      .eq("name", row.employmentType)
      .eq("status", "active")
      .maybeSingle();
    
    if (!employmentType) {
      errors.push(`Employment Type "${row.employmentType}" does not exist or is not active`);
    }
  }

  // Validate SBUs exist if provided
  if (row.sbus) {
    const sbuList = row.sbus.split(";").map(s => s.trim());
    const { data: existingSbus } = await supabase
      .from("sbus")
      .select("name")
      .in("name", sbuList);
    
    const existingSbuNames = new Set(existingSbus?.map(sbu => sbu.name) || []);
    sbuList.forEach(sbu => {
      if (!existingSbuNames.has(sbu)) {
        errors.push(`SBU "${sbu}" does not exist`);
      }
    });
  }

  // If ID is provided, validate it exists in profiles
  if (row.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", row.id)
      .maybeSingle();
    
    if (!profile) {
      errors.push(`User with ID "${row.id}" does not exist`);
    }
  }

  return errors;
}

export async function validateCSV(file: File): Promise<ValidationResult> {
  const errors: CSVValidationError[] = [];
  const validRows: z.infer<typeof csvRowSchema>[] = [];
  const stats = {
    totalRows: 0,
    newUsers: 0,
    updates: 0,
    skipped: 0,
  };

  try {
    const text = await file.text();
    const rows = text.split("\n").map(row => row.split(","));
    const headers = rows[0].map(h => h.trim());
    
    // Validate headers
    const requiredHeaders = ["Email"];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(", ")}`);
    }

    // Process each row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      stats.totalRows++;
      
      // Skip empty rows
      if (row.length === 1 && !row[0]) {
        stats.skipped++;
        continue;
      }

      const rowData = {
        id: row[headers.indexOf("ID")]?.trim(),
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

      try {
        // Validate schema
        const validatedRow = csvRowSchema.parse(rowData);
        
        // Validate referenced entities
        const referenceErrors = await validateReferencedEntities(validatedRow);
        
        if (referenceErrors.length > 0) {
          errors.push({
            row: i + 1,
            errors: referenceErrors,
            type: 'reference',
            context: rowData
          });
        } else {
          validRows.push(validatedRow);
          if (validatedRow.id) {
            stats.updates++;
          } else {
            stats.newUsers++;
          }
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({
            row: i + 1,
            errors: error.errors.map(e => `${e.path.join(".")}: ${e.message}`),
            type: 'validation',
            context: rowData
          });
        } else {
          errors.push({
            row: i + 1,
            errors: [(error as Error).message],
            type: 'system',
            context: rowData
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      validRows,
      stats
    };
  } catch (error) {
    throw new Error(`Failed to parse CSV file: ${(error as Error).message}`);
  }
}