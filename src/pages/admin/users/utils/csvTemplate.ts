export const CSV_HEADERS = [
  "Email",
  "First Name",
  "Last Name",
  "Org ID",
  "Level",
  "SBUs",
  "Role"
];

export const CSV_TEMPLATE_ROW = [
  "user@example.com",
  "John",
  "Doe",
  "ORG123",
  "Level 1",
  "SBU1;SBU2",
  "user"
];

export const CSV_GUIDELINES = [
  "Email: Required, must be a valid email address",
  "First Name: Optional",
  "Last Name: Optional",
  "Org ID: Optional, organization identifier",
  "Level: Optional, must match an existing level name",
  "SBUs: Optional, multiple SBUs should be separated by semicolons (;)",
  "Role: Optional, must be either 'admin' or 'user' (defaults to 'user')"
];

export function generateTemplateCSV(): string {
  const headers = CSV_HEADERS.join(",");
  const exampleRow = CSV_TEMPLATE_ROW.join(",");
  return `${headers}\n${exampleRow}`;
}