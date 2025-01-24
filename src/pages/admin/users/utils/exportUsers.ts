import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface ExportProgress {
  processed: number;
  total: number;
  error?: string;
}

export async function* exportUsers(
  onProgress: (progress: ExportProgress) => void
): AsyncGenerator<string[][]> {
  try {
    // First, get total count
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (!count) {
      throw new Error("No users found");
    }

    onProgress({ processed: 0, total: count });

    const BATCH_SIZE = 100;
    // Process in batches
    for (let offset = 0; offset < count; offset += BATCH_SIZE) {
      // Get profiles with their related data
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          first_name,
          last_name,
          org_id,
          gender,
          date_of_birth,
          designation,
          levels (
            name
          ),
          locations (
            name,
            address
          ),
          employment_types (
            name
          ),
          user_sbus (
            is_primary,
            sbu:sbus (
              name
            )
          )
        `)
        .range(offset, offset + BATCH_SIZE - 1);

      if (profilesError) {
        throw profilesError;
      }

      if (!profiles) {
        continue;
      }

      // For each profile, get their role and format data
      const csvRows = await Promise.all(
        profiles.map(async (profile) => {
          // Get user role
          const { data: userRoles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id)
            .single();

          // Format gender to be human readable
          const formattedGender = profile.gender
            ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)
            : "";

          // Format date of birth
          const formattedDOB = profile.date_of_birth
            ? format(new Date(profile.date_of_birth), "dd MMM yyyy")
            : "";

          return [
            profile.id,
            profile.email,
            profile.first_name || "",
            profile.last_name || "",
            profile.org_id || "",
            profile.levels?.name || "",
            userRoles?.role || "user",
            profile.user_sbus
              ?.filter((sbu) => sbu.is_primary)
              .map((sbu) => sbu.sbu.name)
              .join(", ") || "",
            profile.user_sbus
              ?.filter((sbu) => !sbu.is_primary)
              .map((sbu) => sbu.sbu.name)
              .join(", ") || "",
            formattedGender,
            formattedDOB,
            profile.designation || "",
            profile.locations?.name || "",
            profile.locations?.address || "",
            profile.employment_types?.name || "",
          ];
        })
      );

      onProgress({ processed: offset + profiles.length, total: count });
      yield csvRows;
    }
  } catch (error: any) {
    onProgress({
      processed: 0,
      total: 0,
      error: error.message || "Failed to export users",
    });
  }
}

export function downloadCSV(rows: string[][], filename: string) {
  const headers = [
    "ID",
    "Email",
    "First Name",
    "Last Name",
    "Organization ID",
    "Level",
    "Role",
    "Primary SBU",
    "Additional SBUs",
    "Gender",
    "Date of Birth",
    "Designation",
    "Location",
    "Address",
    "Employment Type",
  ];

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}