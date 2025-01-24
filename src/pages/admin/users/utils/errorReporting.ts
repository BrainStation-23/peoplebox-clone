import { ImportError, ImportResult, ValidationError } from "./types";

export type { ImportError, ImportResult };

export function convertValidationErrorsToImportErrors(validationErrors: ValidationError[]): ImportError[] {
  return validationErrors.flatMap(error =>
    error.errors.map(errorMessage => ({
      row: error.row,
      type: 'validation',
      message: errorMessage,
      data: error.context,
    }))
  );
}

export function downloadErrorReport(errors: ImportError[]): void {
  const csvContent = [
    ['Row', 'Type', 'Message'].join(','),
    ...errors.map(error => [
      error.row,
      error.type,
      `"${error.message.replace(/"/g, '""')}"`,
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'import_errors.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}