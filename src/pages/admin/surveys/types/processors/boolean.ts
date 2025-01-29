import { QuestionProcessor, ProcessorConfig } from './base';

export class BooleanProcessor implements QuestionProcessor {
  private config: ProcessorConfig = {
    categories: ['Yes', 'No'],
    colors: ['#22c55e', '#ef4444'],
    visualization: {
      type: 'donut',
      config: {
        innerRadius: 0.6,
        padAngle: 0.02,
      },
    },
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
}

export const createBooleanProcessor: () => QuestionProcessor = () => new BooleanProcessor();