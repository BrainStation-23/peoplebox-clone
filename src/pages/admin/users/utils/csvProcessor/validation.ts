import { CSVRow } from '../types';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['admin', 'user']).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.string().optional(),
  // Add other validations as needed
});

export async function validateRow(rowData: Partial<CSVRow>): Promise<{ isValid: boolean; errors: string[] }> {
  try {
    await userSchema.parseAsync(rowData);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      isValid: false,
      errors: ['Invalid data format'],
    };
  }
}