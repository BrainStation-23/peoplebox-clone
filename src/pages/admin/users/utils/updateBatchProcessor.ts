import { CSVRow } from "./csvProcessor";
import { supabase } from "@/integrations/supabase/client";
import { ImportError } from "./errorReporting";

export type BatchProgress = {
  processed: number;
  total: number;
  currentBatch: number;
  totalBatches: number;
  estimatedTimeRemaining: number;
};

type BatchProcessorOptions = {
  batchSize?: number;
  onProgress?: (progress: BatchProgress) => void;
  onError?: (error: ImportError) => void;
  signal?: AbortSignal;
};

async function* updateBatchProcessor(
  processingResult: { existingUsers: CSVRow[] },
  options: BatchProcessorOptions = {}
) {
  const {
    batchSize = 50,
    onProgress,
    onError,
    signal,
  } = options;

  const users = processingResult.existingUsers;
  const total = users.length;
  const totalBatches = Math.ceil(total / batchSize);
  let processed = 0;
  let startTime = Date.now();

  for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
    if (signal?.aborted) {
      throw new Error("Operation cancelled");
    }

    const start = batchNum * batchSize;
    const end = Math.min(start + batchSize, total);
    const batchUsers = users.slice(start, end);

    try {
      const { data: responseData, error } = await supabase.functions.invoke('manage-users-bulk', {
        body: {
          users: batchUsers.map(user => ({
            id: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.role,
            level: user.level,
            employment_type: user.employmentType,
            designation: user.designation,
            org_id: user.orgId,
            location: user.location,
            gender: user.gender,
            date_of_birth: user.dateOfBirth,
            employee_role: user.employeeRole,
            employee_type: user.employeeType,
            sbus: user.sbus
          }))
        }
      });

      if (error) {
        console.error('Batch update error:', error);
        throw error;
      }

      if (responseData?.errors) {
        responseData.errors.forEach(err => {
          if (onError) {
            onError({
              row: users.findIndex(u => u.email === err.user.email) + 1,
              type: 'update',
              message: err.error,
              data: err.user,
            });
          }
        });
      }

      processed += batchUsers.length;
      const elapsedTime = Date.now() - startTime;
      const averageTimePerItem = elapsedTime / processed;
      const remainingItems = total - processed;
      const estimatedTimeRemaining = averageTimePerItem * remainingItems;

      const progress: BatchProgress = {
        processed,
        total,
        currentBatch: batchNum + 1,
        totalBatches,
        estimatedTimeRemaining,
      };

      onProgress?.(progress);
      yield progress;

    } catch (error) {
      if (onError && error instanceof Error) {
        batchUsers.forEach(user => {
          onError({
            row: users.findIndex(u => u.email === user.email) + 1,
            type: 'update',
            message: error.message,
            data: user,
          });
        });
      }
      throw error;
    }
  }
}

export { updateBatchProcessor };