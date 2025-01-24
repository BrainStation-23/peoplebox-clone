import { z } from "zod";
import { Level, User } from "../types";
import { supabase } from "@/integrations/supabase/client";

// Schema for CSV row validation
const csvRowSchema = z.object({
  email: z.string().email("Invalid email format"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  orgId: z.string().optional(),
  level: z.string().optional(),
  sbus: z.string().optional(),
  role: z.enum(["admin", "user"]).optional().default("user"),
});

export type CSVRow = z.infer<typeof csvRowSchema>;

export type ProcessingResult = {
  newUsers: CSVRow[];
  existingUsers: (CSVRow & { id: string })[];
  errors: { row: number; errors: string[] }[];
};

export async function processCSVFile(file: File): Promise<ProcessingResult> {
  const text = await file.text();
  const rows = text.split("\n").map(row => row.split(","));
  const headers = rows[0].map(h => h.trim());
  
  const result: ProcessingResult = {
    newUsers: [],
    existingUsers: [],
    errors: [],
  };

  // Process each row starting from index 1 (skip headers)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 1 && !row[0]) continue; // Skip empty rows

    const rowData = {
      email: row[headers.indexOf("Email")]?.trim(),
      firstName: row[headers.indexOf("First Name")]?.trim(),
      lastName: row[headers.indexOf("Last Name")]?.trim(),
      orgId: row[headers.indexOf("Org ID")]?.trim(),
      level: row[headers.indexOf("Level")]?.trim(),
      sbus: row[headers.indexOf("SBUs")]?.trim(),
      role: row[headers.indexOf("Role")]?.trim()?.toLowerCase() as "admin" | "user",
    };

    try {
      const validatedRow = csvRowSchema.parse(rowData);
      
      // Check if user exists
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", validatedRow.email)
        .maybeSingle();

      if (existingUser) {
        result.existingUsers.push({ ...validatedRow, id: existingUser.id });
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
  onProgress: (current: number, total: number) => void
): Promise<void> {
  const total = data.newUsers.length + data.existingUsers.length;
  let processed = 0;

  // Process new users
  for (const user of data.newUsers) {
    try {
      // Create auth user and profile
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

      if (authError) throw authError;

      // Update profile with additional info
      if (user.level || user.orgId) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            org_id: user.orgId,
            level_id: await getLevelId(user.level),
          })
          .eq("email", user.email);

        if (profileError) throw profileError;
      }

      // Handle SBU assignments
      if (user.sbus) {
        await assignSBUs(authUser.id, user.sbus);
      }

      processed++;
      onProgress(processed, total);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Process existing users
  for (const user of data.existingUsers) {
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: user.firstName,
          last_name: user.lastName,
          org_id: user.orgId,
          level_id: await getLevelId(user.level),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update role if needed
      if (user.role) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .update({ role: user.role })
          .eq("user_id", user.id);

        if (roleError) throw roleError;
      }

      // Handle SBU assignments
      if (user.sbus) {
        await assignSBUs(user.id, user.sbus);
      }

      processed++;
      onProgress(processed, total);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
}

// Helper functions
function generateTempPassword(): string {
  return Math.random().toString(36).slice(-8);
}

async function getLevelId(levelName?: string): Promise<string | null> {
  if (!levelName) return null;
  
  const { data } = await supabase
    .from("levels")
    .select("id")
    .eq("name", levelName)
    .maybeSingle();

  return data?.id || null;
}

async function assignSBUs(userId: string, sbuString: string): Promise<void> {
  const sbuNames = sbuString.split(";").map(s => s.trim());
  
  // Get SBU IDs
  const { data: sbus } = await supabase
    .from("sbus")
    .select("id, name")
    .in("name", sbuNames);

  if (!sbus?.length) return;

  // Delete existing assignments
  await supabase
    .from("user_sbus")
    .delete()
    .eq("user_id", userId);

  // Create new assignments
  const assignments = sbus.map((sbu, index) => ({
    user_id: userId,
    sbu_id: sbu.id,
    is_primary: index === 0, // First SBU in the list is primary
  }));

  await supabase.from("user_sbus").insert(assignments);
}