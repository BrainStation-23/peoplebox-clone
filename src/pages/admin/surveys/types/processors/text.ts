import { QuestionProcessor, ProcessorConfig, RatingVisualizationType } from './base';

export class TextProcessor implements QuestionProcessor {
  private config: ProcessorConfig = {
    categories: [], // Dynamic based on word frequency
    colors: [
      '#2563eb', // blue-600
      '#3b82f6', // blue-500
      '#60a5fa', // blue-400
      '#93c5fd', // blue-300
    ],
    visualization: {
      primary: 'bar',
      showAverage: false,
      colors: {
        1: '#2563eb',
        2: '#3b82f6',
        3: '#60a5fa',
        4: '#93c5fd'
      }
    }
  };

  process(responses: any[]): { 
    type: 'text'; 
    data: Array<{ text: string; value: number }> 
  } {
    const wordFrequency: Record<string, number> = {};
    
    responses.forEach((response) => {
      const answer = response.answer;
      if (typeof answer === 'string') {
        const words = answer
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter((word) => word.length > 2);

        words.forEach((word) => {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
      }
    });

    return {
      type: 'text',
      data: Object.entries(wordFrequency)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50),
    };
  }

  getConfig(): ProcessorConfig {
    return this.config;
  }

  detectRatingType(): RatingVisualizationType {
    return 'satisfaction'; // Default, not used for text
  }
}

export const createTextProcessor: () => QuestionProcessor = () => new TextProcessor();