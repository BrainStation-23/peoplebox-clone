import { CSVRow, ProcessingResult } from "./csvProcessor";
import { ImportError } from "./errorReporting";
import { supabase } from "@/integrations/supabase/client";

const BATCH_SIZE = 50;

export interface BatchProgress {
  processed: number;
  total: number;
  currentBatch: number;
  totalBatches: number;
  estimatedTimeRemaining: number;
  errors: ImportError[];
}

export interface BatchProcessorOptions {
  onProgress: (progress: BatchProgress) => void;
  onError: (error: ImportError) => void;
  signal?: AbortSignal;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function* batchProcessor(
  data: ProcessingResult,
  options: BatchProcessorOptions
): AsyncGenerator<BatchProgress> {
  const { onProgress, onError, signal } = options;
  const allUsers = [...data.newUsers, ...data.existingUsers];
  const totalBatches = Math.ceil(allUsers.length / BATCH_SIZE);
  const startTime = Date.now();
  let processed = 0;

  for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
    if (signal?.aborted) {
      throw new Error('Operation cancelled');
    }

    const start = batchNum * BATCH_SIZE;
    const batchUsers = allUsers.slice(start, start + BATCH_SIZE);

    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          method: 'BATCH_CREATE',
          action: {
            users: batchUsers.map(user => ({
              email: user.email,
              first_name: user.firstName,
              last_name: user.lastName,
              is_admin: user.role === 'admin',
            }))
          }
        }
      });

      if (error) {
        console.error('Batch processing error:', error);
        throw error;
      }

      // Handle individual errors from the batch operation
      if (data.errors) {
        data.errors.forEach(err => {
          onError({
            row: allUsers.findIndex(u => u.email === err.user.email) + 1,
            type: 'creation',
            message: err.error,
            data: err.user,
          });
        });
      }

      processed += batchUsers.length;
      const elapsedTime = Date.now() - startTime;
      const avgTimePerItem = elapsedTime / processed;
      const remainingItems = allUsers.length - processed;
      const estimatedTimeRemaining = avgTimePerItem * remainingItems;

      const progress: BatchProgress = {
        processed,
        total: allUsers.length,
        currentBatch: batchNum + 1,
        totalBatches,
        estimatedTimeRemaining,
        errors: [],
      };

      onProgress(progress);
      yield progress;

      // Small delay between batches to prevent overwhelming the server
      await sleep(100);
    } catch (error: any) {
      console.error('Error processing batch:', error);
      batchUsers.forEach((user, index) => {
        onError({
          row: start + index + 1,
          type: 'creation',
          message: error.message || 'Failed to process user',
          data: user,
        });
      });
    }
  }
}