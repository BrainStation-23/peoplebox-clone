import { User } from "../types";

type ProgressCallback = (processed: number) => void;

export const exportUsers = async (users: User[], onProgress?: ProgressCallback) => {
  console.log("Starting export with users:", users);
  
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
    "ID" // Hidden technical field for import/update
  ];

  const processUsers = async () => {
    const rows = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log("Processing user for export:", user);
      
      // Combine primary and additional SBUs into semicolon-separated list
      const allSbus = user.user_sbus
        ?.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
        ?.map(sbu => sbu.sbu.name)
        ?.join(";") || "";

      const row = [
        user.email,
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
      console.log("Generated row for user:", row);
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

  console.log("Generated CSV content:", csvContent);

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `users_export_${new Date().toISOString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};