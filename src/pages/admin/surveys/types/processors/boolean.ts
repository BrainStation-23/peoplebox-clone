import { QuestionProcessor, ProcessorConfig, RatingVisualizationType } from './base';

export class BooleanProcessor implements QuestionProcessor {
  private config: ProcessorConfig = {
    categories: ['Yes', 'No'],
    colors: ['#22c55e', '#ef4444'],
    visualization: {
      primary: 'donut',
      showAverage: false,
      colors: {
        'yes': '#22c55e',
        'no': '#ef4444'
      }
    }
  };

  process(responses: any[]): { type: 'boolean'; data: { yes: number; no: number } } {
    const answers = responses
      .filter(r => r.answer !== undefined)
      .map(r => r.answer);

    return {
      type: 'boolean',
      data: {
        yes: answers.filter((a) => a === true).length,
        no: answers.filter((a) => a === false).length,
      },
    };
  }

  getConfig(): ProcessorConfig {
    return this.config;
  }

  detectRatingType(): RatingVisualizationType {
    return 'satisfaction'; // Default, not used for boolean
  }
}

export const createBooleanProcessor: () => QuestionProcessor = () => new BooleanProcessor();