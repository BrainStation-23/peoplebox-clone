// CSV Headers
export const IMPORT_CSV_HEADERS = [
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
  "SBUs"
];

export const UPDATE_CSV_HEADERS = [
  "ID",
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
  "SBUs"
];

// Template rows
export const IMPORT_CSV_TEMPLATE_ROW = [
  "user@example.com",
  "John",
  "Doe",
  "ORG123",
  "Level 1",
  "user",
  "male",
  "1990-01-01",
  "Software Engineer",
  "Head Office",
  "Full Time",
  "Developer",
  "Regular",
  "SBU1;SBU2"
];

export const UPDATE_CSV_TEMPLATE_ROW = [
  "user-uuid-here",
  "John",
  "Doe",
  "ORG123",
  "Level 1",
  "user",
  "male",
  "1990-01-01",
  "Software Engineer",
  "Head Office",
  "Full Time",
  "Developer",
  "Regular",
  "SBU1;SBU2"
];

// Guidelines
export const IMPORT_CSV_GUIDELINES = [
  "Email: Required, must be a valid email address",
  "First Name: Optional",
  "Last Name: Optional",
  "Org ID: Optional, organization identifier",
  "Level: Optional, must match an existing level name",
  "Role: Optional, must be either 'admin' or 'user' (defaults to 'user')",
  "Gender: Optional, must be 'male', 'female', or 'other'",
  "Date of Birth: Optional, must be in YYYY-MM-DD format",
  "Designation: Optional, job title or position",
  "Location: Optional, must match an existing location name",
  "Employment Type: Optional, must match an existing employment type name",
  "Employee Role: Optional, must match an existing employee role name",
  "Employee Type: Optional, must match an existing employee type name",
  "SBUs: Optional, multiple SBUs should be separated by semicolons (;)"
];

export const UPDATE_CSV_GUIDELINES = [
  "ID: Required, must be a valid user ID",
  "First Name: Optional, leave empty to keep existing value",
  "Last Name: Optional, leave empty to keep existing value",
  "Org ID: Optional, leave empty to keep existing value",
  "Level: Optional, must match an existing level name",
  "Role: Optional, must be either 'admin' or 'user'",
  "Gender: Optional, must be 'male', 'female', or 'other'",
  "Date of Birth: Optional, must be in YYYY-MM-DD format",
  "Designation: Optional, job title or position",
  "Location: Optional, must match an existing location name",
  "Employment Type: Optional, must match an existing employment type name",
  "Employee Role: Optional, must match an existing employee role name",
  "Employee Type: Optional, must match an existing employee type name",
  "SBUs: Optional, multiple SBUs should be separated by semicolons (;), overwrites existing assignments"
];

export function generateImportTemplateCSV(): string {
  return IMPORT_CSV_HEADERS.join(",") + "\n" + IMPORT_CSV_TEMPLATE_ROW.join(",");
}

export function generateUpdateTemplateCSV(): string {
  return UPDATE_CSV_HEADERS.join(",") + "\n" + UPDATE_CSV_TEMPLATE_ROW.join(",");
}