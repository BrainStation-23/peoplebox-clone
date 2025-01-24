import { User } from "../types";

type ProgressCallback = (processed: number) => void;

export const exportUsers = async (users: User[], onProgress?: ProgressCallback) => {
  const headers = [
    "Email",
    "First Name",
    "Last Name",
    "Organization ID",
    "Level",
    "Primary SBU",
    "Additional SBUs",
  ];

  const processUsers = async () => {
    const rows = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      rows.push([
        user.email,
        user.first_name || "",
        user.last_name || "",
        user.org_id || "",
        user.level?.name || "",
        user.user_sbus?.find((sbu) => sbu.is_primary)?.sbu.name || "",
        user.user_sbus?.filter((sbu) => !sbu.is_primary).map((sbu) => sbu.sbu.name).join(", ") || "",
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