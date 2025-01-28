import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  email: string;
  first_name: string | null;
  last_name: string | null;
  org_id: string | null;
  level: string | null;
  user_roles: { role: string };
  gender: string | null;
  date_of_birth: string | null;
  designation: string | null;
  location: string | null;
  employment_type: string | null;
  employee_role: string | null;
  employee_type: string | null;
  user_sbus: Array<{
    id: string;
    sbu: { name: string };
    is_primary: boolean;
  }>;
  id: string;
}

type ProgressCallback = (processed: number) => void;

export const exportUsers = async (onProgress?: ProgressCallback) => {
  try {
    const { data, error } = await supabase.rpc('search_users', {
      search_text: '',
      page_number: 1,
      page_size: 10000,
      sbu_filter: null,
      level_filter: null,
      location_filter: null,
      employment_type_filter: null,
      employee_role_filter: null,
      employee_type_filter: null
    });

    if (error) throw error;

    const users = data.map(d => d.profile as UserProfile);
    console.log("Exporting all users:", users.length);

    const headers = [
      "Email",
      "First Name",
      "Last Name",
      "Org ID",
      "Level",
      "Role",
      "Gender",
      "Date of Birth",
      "Designation",
      "Location",
      "Employment Type",
      "Employee Role",
      "Employee Type",
      "SBUs",
      "ID"
    ];

    const processUsers = async () => {
      const rows = [];
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        console.log("Processing user for export:", user);
        
        const allSbus = user.user_sbus
          ?.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
          ?.map(sbu => sbu.sbu.name)
          ?.join(";") || "";

        const row = [
          user.email || "",
          user.first_name || "",
          user.last_name || "",
          user.org_id || "",
          user.level || "",
          user.user_roles?.role || "user",
          user.gender || "",
          user.date_of_birth || "",
          user.designation || "",
          user.location || "",
          user.employment_type || "",
          user.employee_role || "",
          user.employee_type || "",
          allSbus,
          user.id
        ];
        rows.push(row);
        
        if (onProgress) {
          onProgress(i + 1);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      return rows;
    };

    const rows = await processUsers();
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `users_bulk_update_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting users:", error);
    throw error;
  }
};