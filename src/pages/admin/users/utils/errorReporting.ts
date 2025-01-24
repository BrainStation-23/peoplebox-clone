import { ImportError } from "./types";

export type ImportResult = {
  successful: number;
  failed: number;
  errors: ImportError[];
};

export function convertValidationErrorsToImportErrors(validationErrors: { row: number; errors: string[] }[]): ImportError[] {
  return validationErrors.flatMap(error => 
    error.errors.map(message => ({
      row: error.row,
      type: 'validation',
      message,
    }))
  );
}

export function generateErrorReport(errors: ImportError[]): string {
  // Group errors by type for better organization
  const groupedErrors = errors.reduce((acc, error) => {
    if (!acc[error.type]) {
      acc[error.type] = [];
    }
    acc[error.type].push(error);
    return acc;
  }, {} as Record<string, ImportError[]>);

  // Generate CSV content with detailed error information
  let csvContent = "Row,Error Type,Message,Data\n";
  
  errors.forEach(error => {
    const errorType = error.type.charAt(0).toUpperCase() + error.type.slice(1);
    csvContent += `${error.row},${errorType},"${error.message}","${
      error.data ? JSON.stringify(error.data).replace(/"/g, '""') : ''
    }"\n`;
  });

  return csvContent;
}

export function downloadErrorReport(errors: ImportError[]): void {
  const csvContent = generateErrorReport(errors);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `import-errors-${new Date().toISOString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}