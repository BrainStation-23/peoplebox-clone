import { z } from "zod";
import { Level, User } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { ImportError } from "./errorReporting";

const csvRowSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email("Invalid email format"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  orgId: z.string().optional(),
  level: z.string().optional(),
  sbus: z.string().optional(),
  role: z.enum(["admin", "user"]).optional().default("user"),
  gender: z.enum(["male", "female", "other"]).optional(),
  dateOfBirth: z.string().optional(),
  designation: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  employeeRole: z.string().optional(),
  employeeType: z.string().optional(),
});

export type CSVRow = z.infer<typeof csvRowSchema>;

export type ProcessingResult = {
  newUsers: CSVRow[];
  existingUsers: CSVRow[];
  errors: { row: number; errors: string[] }[];
};

async function getLevelId(levelName?: string): Promise<string | null> {
  if (!levelName) return null;
  
  const { data } = await supabase
    .from("levels")
    .select("id")
    .eq("name", levelName)
    .eq("status", "active")
    .maybeSingle();

  return data?.id || null;
}

async function getLocationId(locationName?: string): Promise<string | null> {
  if (!locationName) return null;

  const { data } = await supabase
    .from("locations")
    .select("id")
    .eq("name", locationName)
    .maybeSingle();

  return data?.id || null;
}

async function getEmploymentTypeId(typeName?: string): Promise<string | null> {
  if (!typeName) return null;

  const { data } = await supabase
    .from("employment_types")
    .select("id")
    .eq("name", typeName)
    .eq("status", "active")
    .maybeSingle();

  return data?.id || null;
}

async function getEmployeeRoleId(roleName?: string): Promise<string | null> {
  if (!roleName) return null;

  const { data } = await supabase
    .from("employee_roles")
    .select("id")
    .eq("name", roleName)
    .eq("status", "active")
    .maybeSingle();

  return data?.id || null;
}

async function getEmployeeTypeId(typeName?: string): Promise<string | null> {
  if (!typeName) return null;

  const { data } = await supabase
    .from("employee_types")
    .select("id")
    .eq("name", typeName)
    .eq("status", "active")
    .maybeSingle();

  return data?.id || null;
}

async function assignSBUs(userId: string, sbuString: string): Promise<void> {
  const sbuNames = sbuString.split(";").map(s => s.trim());
  
  const { data: sbus } = await supabase
    .from("sbus")
    .select("id, name")
    .in("name", sbuNames);

  if (!sbus?.length) return;

  await supabase
    .from("user_sbus")
    .delete()
    .eq("user_id", userId);

  const assignments = sbus.map((sbu, index) => ({
    user_id: userId,
    sbu_id: sbu.id,
    is_primary: index === 0,
  }));

  await supabase.from("user_sbus").insert(assignments);
}

async function verifyExistingUser(id: string, email: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", id)
    .single();

  return data?.email === email;
}

export async function processCSVFile(file: File): Promise<ProcessingResult> {
  const text = await file.text();
  const rows = text.split("\n").map(row => row.split(","));
  const headers = rows[0].map(h => h.trim());
  
  const result: ProcessingResult = {
    newUsers: [],
    existingUsers: [],
    errors: [],
  };

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 1 && !row[0]) continue;

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
      employeeRole: row[headers.indexOf("Employee Role")]?.trim(),
      employeeType: row[headers.indexOf("Employee Type")]?.trim(),
    };

    try {
      const validatedRow = csvRowSchema.parse(rowData);
      
      if (validatedRow.id) {
        // Verify if ID exists and matches email
        const isValid = await verifyExistingUser(validatedRow.id, validatedRow.email);
        if (!isValid) {
          result.errors.push({
            row: i + 1,
            errors: ["ID and email do not match or ID not found"],
          });
          continue;
        }
        result.existingUsers.push(validatedRow);
      } else {
        result.newUsers.push(validatedRow);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.errors.push({
          row: i + 1,
          errors: error.errors.map(e => `${e.path.join(".")}: ${e.message}`),
        });
      }
    }
  }

  return result;
}

export async function importUsers(
  data: ProcessingResult,
  onProgress: (current: number, total: number) => void,
  onError: (error: ImportError) => void
): Promise<void> {
  const total = data.newUsers.length + data.existingUsers.length;
  let processed = 0;

  // Process new users
  for (const user of data.newUsers) {
    try {
      const { data: authUser, error: authError } = await supabase.functions.invoke(
        "manage-users",
        {
          body: {
            method: "POST",
            action: {
              email: user.email,
              password: generateTempPassword(),
              first_name: user.firstName,
              last_name: user.lastName,
              is_admin: user.role === "admin",
            },
          },
        }
      );

      if (authError) {
        onError({
          row: processed + 1,
          type: "creation",
          message: authError.message,
          data: user,
        });
        continue;
      }

      // Get IDs for related entities
      const [levelId, locationId, employmentTypeId] = await Promise.all([
        getLevelId(user.level),
        getLocationId(user.location),
        getEmploymentTypeId(user.employmentType)
      ]);

      // Update profile with additional info
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          org_id: user.orgId,
          level_id: levelId,
          location_id: locationId,
          employment_type_id: employmentTypeId,
          gender: user.gender,
          date_of_birth: user.dateOfBirth,
          designation: user.designation,
        })
        .eq("email", user.email);

      if (profileError) {
        onError({
          row: processed + 1,
          type: "update",
          message: profileError.message,
          data: user,
        });
      }

      if (user.sbus) {
        try {
          await assignSBUs(authUser.id, user.sbus);
        } catch (error) {
          onError({
            row: processed + 1,
            type: "sbu",
            message: error instanceof Error ? error.message : "Failed to assign SBUs",
            data: user,
          });
        }
      }

      processed++;
      onProgress(processed, total);
    } catch (error) {
      onError({
        row: processed + 1,
        type: "creation",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        data: user,
      });
      processed++;
      onProgress(processed, total);
    }
  }

  // Process existing users
  for (const user of data.existingUsers) {
    try {
      // Get IDs for related entities
      const [levelId, locationId, employmentTypeId] = await Promise.all([
        getLevelId(user.level),
        getLocationId(user.location),
        getEmploymentTypeId(user.employmentType)
      ]);

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: user.firstName,
          last_name: user.lastName,
          org_id: user.orgId,
          level_id: levelId,
          location_id: locationId,
          employment_type_id: employmentTypeId,
          gender: user.gender,
          date_of_birth: user.dateOfBirth,
          designation: user.designation,
        })
        .eq("id", user.id);

      if (profileError) {
        onError({
          row: processed + 1,
          type: "update",
          message: profileError.message,
          data: user,
        });
      }

      // Update role if needed
      if (user.role) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .update({ role: user.role })
          .eq("user_id", user.id);

        if (roleError) {
          onError({
            row: processed + 1,
            type: "role",
            message: roleError.message,
            data: user,
          });
        }
      }

      // Handle SBU assignments
      if (user.sbus) {
        try {
          await assignSBUs(user.id, user.sbus);
        } catch (error) {
          onError({
            row: processed + 1,
            type: "sbu",
            message: error instanceof Error ? error.message : "Failed to assign SBUs",
            data: user,
          });
        }
      }

      processed++;
      onProgress(processed, total);
    } catch (error) {
      onError({
        row: processed + 1,
        type: "update",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        data: user,
      });
      processed++;
      onProgress(processed, total);
    }
  }
}

function generateTempPassword(): string {
  return Math.random().toString(36).slice(-8);
}