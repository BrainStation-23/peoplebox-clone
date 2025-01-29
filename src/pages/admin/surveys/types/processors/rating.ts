import { QuestionProcessor, ProcessorConfig } from './base';

export class NPSProcessor implements QuestionProcessor {
  private config: ProcessorConfig = {
    categories: ['Detractors', 'Passives', 'Promoters'],
    colors: ['#ef4444', '#eab308', '#22c55e'],
    visualization: {
      type: 'bar',
      config: {
        barPadding: 0.2,
        showGrid: true,
      },
    },
  };

  process(responses: any[]): { 
    type: 'rating'; 
    data: Array<{ rating: number; count: number }> 
  } {
    const answers = responses
      .filter(r => typeof r.answer === 'number')
      .map(r => r.answer);

    const ratingCounts = new Array(11).fill(0);
    answers.forEach((rating) => {
      if (typeof rating === 'number' && rating >= 0 && rating <= 10) {
        ratingCounts[rating]++;
      }
    });

    return {
      type: 'rating',
      data: ratingCounts.map((count, rating) => ({ rating, count })),
    };
  }

  getConfig(): ProcessorConfig {
    return this.config;
  }
}

export const createNPSProcessor: () => QuestionProcessor = () => new NPSProcessor();