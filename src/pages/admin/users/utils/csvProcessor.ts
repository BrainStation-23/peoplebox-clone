import { z } from "zod";
import { Level, User } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { ImportError } from "./errorReporting";
import Papa from 'papaparse';

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
  supervisorEmail: z.string().email("Invalid supervisor email format").optional(),
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
  return new Promise((resolve, reject) => {
    const result: ProcessingResult = {
      newUsers: [],
      existingUsers: [],
      errors: [],
    };

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          for (let i = 0; i < results.data.length; i++) {
            const row = results.data[i] as Record<string, string>;
            const rowData = {
              id: row['ID']?.trim(),
              email: row['Email']?.trim(),
              firstName: row['First Name']?.trim(),
              lastName: row['Last Name']?.trim(),
              orgId: row['Org ID']?.trim(),
              level: row['Level']?.trim(),
              sbus: row['SBUs']?.trim(),
              role: row['Role']?.trim()?.toLowerCase() as "admin" | "user",
              gender: row['Gender']?.trim()?.toLowerCase() as "male" | "female" | "other",
              dateOfBirth: row['Date of Birth']?.trim(),
              designation: row['Designation']?.trim(),
              location: row['Location']?.trim(),
              employmentType: row['Employment Type']?.trim(),
              employeeRole: row['Employee Role']?.trim(),
              employeeType: row['Employee Type']?.trim(),
              supervisorEmail: row['Supervisor Email']?.trim(),
            };

            try {
              const validatedRow = csvRowSchema.parse(rowData);
              
              if (validatedRow.id) {
                const isValid = await verifyExistingUser(validatedRow.id, validatedRow.email);
                if (!isValid) {
                  result.errors.push({
                    row: i + 2, // +2 because Papa.parse is 0-based and we want to account for header row
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
                  row: i + 2,
                  errors: error.errors.map(e => `${e.path.join(".")}: ${e.message}`),
                });
              }
            }
          }
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
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
