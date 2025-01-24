import { CSVRow, ProcessingLogEntry, CSVRowType, ProcessingStatus } from '../types';

export function createProcessingLog(
  row: number,
  type: CSVRowType,
  status: ProcessingStatus,
  data: CSVRow,
  error?: string,
  changes?: any
): ProcessingLogEntry {
  return {
    row,
    type,
    status,
    email: data.email,
    id: data.id,
    error,
    details: {
      attemptedChanges: changes || data,
      actualChanges: status === "success" ? changes : undefined,
    },
  };
}