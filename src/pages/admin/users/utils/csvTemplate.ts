export const CSV_HEADERS = [
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
  "ID" // Added ID as the last column to match export format
];

export const CSV_TEMPLATE_ROW = [
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
  "SBU1;SBU2",
  "" // Empty ID for new users
];

export const CSV_GUIDELINES = [
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
  "SBUs: Optional, multiple SBUs should be separated by semicolons (;)",
  "ID: Optional, if provided will update existing user, if empty will create new user"
];

export function generateTemplateCSV(): string {
  const csvContent = CSV_HEADERS.join(",") + "\n" + CSV_TEMPLATE_ROW.join(",");
  return csvContent;
}