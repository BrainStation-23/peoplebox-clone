import { QuestionProcessor } from './base';
import { createBooleanProcessor } from './boolean';
import { createRatingProcessor } from './rating';
import { createTextProcessor } from './text';

export const QUESTION_PROCESSORS: Record<string, () => QuestionProcessor> = {
  boolean: createBooleanProcessor,
  nps: createRatingProcessor,
  rating: createRatingProcessor, // Using NPS processor for now, can be extended
  text: createTextProcessor,
  comment: createTextProcessor, // Using text processor for comments
};

export * from './base';
export * from './boolean';
export * from './rating';
export * from './text';