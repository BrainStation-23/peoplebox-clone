import { User } from "../types";

type ProgressCallback = (processed: number) => void;

export const exportUsers = async (users: User[], onProgress?: ProgressCallback) => {
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
    "SBUs",
    "ID" // Hidden technical field for import/update
  ];

  const processUsers = async () => {
    const rows = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      // Combine primary and additional SBUs into semicolon-separated list
      const allSbus = user.user_sbus
        ?.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
        ?.map(sbu => sbu.sbu.name)
        ?.join(";") || "";

      rows.push([
        user.email,
        user.first_name || "",
        user.last_name || "",
        user.org_id || "",
        user.level?.name || "",
        user.user_roles?.role || "user",
        user.gender || "",
        user.date_of_birth || "",
        user.designation || "",
        user.location?.name || "",
        user.employment_type?.name || "",
        allSbus,
        user.id // Include user ID for update operations
      ]);
      
      if (onProgress) {
        onProgress(i + 1);
        // Add a small delay to show progress
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
  link.setAttribute("download", `users_export_${new Date().toISOString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};