import { CSVRow, ProcessingResult } from "./csvProcessor";
import { ImportError } from "./errorReporting";
import { supabase } from "@/integrations/supabase/client";

const BATCH_SIZE = 50;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

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

async function processWithRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return processWithRetry(operation, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

export async function processBatch(
  batch: CSVRow[],
  options: BatchProcessorOptions
): Promise<void> {
  const { onProgress, onError, signal } = options;
  
  for (let i = 0; i < batch.length; i++) {
    if (signal?.aborted) {
      throw new Error('Operation cancelled');
    }

    try {
      await processWithRetry(async () => {
        // Process single user with retry logic
        const user = batch[i];
        const { data, error } = await supabase.functions.invoke('manage-users', {
          body: {
            method: 'POST',
            action: {
              email: user.email,
              first_name: user.firstName,
              last_name: user.lastName,
              is_admin: user.role === 'admin',
            },
          }
        });

        if (error) throw error;
        return data;
      });
    } catch (error: any) {
      onError({
        row: i + 1,
        type: 'creation',
        message: error.message,
        data: batch[i],
      });
    }
  }
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
    const batch = allUsers.slice(start, start + BATCH_SIZE);

    await processBatch(batch, {
      onProgress,
      onError,
      signal,
    });

    processed += batch.length;
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
  }
}