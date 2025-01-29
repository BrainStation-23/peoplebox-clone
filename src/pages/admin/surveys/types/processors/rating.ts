import { QuestionProcessor, ProcessorConfig, RatingVisualizationType } from './base';

export class RatingProcessor implements QuestionProcessor {
  private npsConfig: ProcessorConfig = {
    categories: ['Detractors', 'Passives', 'Promoters'],
    colors: ['#ef4444', '#eab308', '#22c55e'],
    visualization: {
      primary: 'nps-combined',
      score: true,
      distribution: true,
      colors: {
        detractor: '#ef4444',
        passive: '#eab308',
        promoter: '#22c55e'
      }
    }
  };

  private satisfactionConfig: ProcessorConfig = {
    categories: ['Very Unsatisfied', 'Unsatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
    colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#15803d'],
    visualization: {
      primary: 'bar',
      showAverage: true,
      colors: {
        1: '#ef4444',
        2: '#f97316',
        3: '#eab308',
        4: '#22c55e',
        5: '#15803d'
      }
    }
  };

  detectRatingType(responses: any[]): RatingVisualizationType {
    const maxRating = Math.max(...responses.map(r => r.answer).filter(Number.isFinite));
    return maxRating > 5 ? 'nps' : 'satisfaction';
  }

  process(responses: any[]): { 
    type: RatingVisualizationType; 
    data: Array<{ rating: number; count: number }> 
  } {
    const ratingType = this.detectRatingType(responses);
    const answers = responses
      .filter(r => typeof r.answer === 'number')
      .map(r => r.answer);

    const maxRating = ratingType === 'nps' ? 10 : 5;
    const ratingCounts = new Array(maxRating + 1).fill(0);
    
    answers.forEach((rating) => {
      if (typeof rating === 'number' && rating >= 0 && rating <= maxRating) {
        ratingCounts[rating]++;
      }
    });

    return {
      type: ratingType,
      data: ratingCounts.map((count, rating) => ({ rating, count })),
    };
  }

  getConfig(): ProcessorConfig {
    return this.npsConfig;
  }
}

export const createRatingProcessor: () => QuestionProcessor = () => new RatingProcessor();