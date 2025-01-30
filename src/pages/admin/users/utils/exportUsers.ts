import { User } from "../types";
import { supabase } from "@/integrations/supabase/client";
import Papa from "papaparse";

type ProgressCallback = (processed: number, total: number) => void;

export const exportUsers = async (users: User[], onProgress?: ProgressCallback) => {
  const total = users.length;
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
    "Supervisor Email",
    "Supervisor Name",
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

      // Format supervisor name
      const supervisorName = user.primary_supervisor
        ? `${user.primary_supervisor.first_name || ''} ${user.primary_supervisor.last_name || ''}`.trim()
        : '';

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
        user.primary_supervisor?.email || "",
        supervisorName,
        user.id
      ];
      console.log("Generated row for user:", row);
      rows.push(row);
      
      if (onProgress) {
        onProgress(i + 1, total);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    return rows;
  };

  const rows = await processUsers();
  
  // Use PapaParse to generate CSV
  const csvContent = Papa.unparse({
    fields: headers,
    data: rows
  }, {
    quotes: true, // Always quote strings
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ",",
    header: true,
    newline: "\n"
  });

  console.log("Generated CSV content:", csvContent);

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `users_export_${new Date().toISOString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportAllUsers = async (onProgress?: ProgressCallback) => {
  console.log("Starting export all users");
  
  const { data, error } = await supabase.rpc('search_users', {
    search_text: '',
    page_number: 1,
    page_size: 100000,
    sbu_filter: null,
    level_filter: null,
    location_filter: null,
    employment_type_filter: null,
    employee_role_filter: null,
    employee_type_filter: null
  });

  if (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }

  // Convert the JSON data to User array by extracting the profile property
  const users = data.map(item => item.profile as unknown as User);
  
  if (onProgress) {
    onProgress(0, users.length);
  }
  
  await exportUsers(users, onProgress);
};