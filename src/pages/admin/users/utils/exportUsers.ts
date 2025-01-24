import { supabase } from "@/integrations/supabase/client";

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
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          first_name,
          last_name,
          org_id,
          levels (
            name
          ),
          user_roles!inner (
            role
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

      // Transform data to CSV format
      const csvRows = profiles.map((profile) => [
        profile.id,
        profile.email,
        profile.first_name || "",
        profile.last_name || "",
        profile.org_id || "",
        profile.levels?.name || "",
        profile.user_roles?.role || "user",
        profile.user_sbus
          ?.filter((sbu) => sbu.is_primary)
          .map((sbu) => sbu.sbu.name)
          .join(", ") || "",
        profile.user_sbus
          ?.filter((sbu) => !sbu.is_primary)
          .map((sbu) => sbu.sbu.name)
          .join(", ") || "",
      ]);

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
  ];

  const csvContent = [
    headers,
    ...rows
  ]
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