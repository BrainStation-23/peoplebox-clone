export type RatingVisualizationType = 'nps' | 'satisfaction';
export type ChartType = 'bar' | 'donut' | 'nps-combined';

export type ProcessedData = {
  type: 'boolean' | RatingVisualizationType | 'text';
  data: any;
};

export type NpsConfig = {
  type: 'nps';
  visualization: {
    primary: 'nps-combined';
    score: boolean;
    distribution: boolean;
    colors: {
      detractor: string;
      passive: string;
      promoter: string;
    };
  };
};

export type SatisfactionConfig = {
  type: 'satisfaction';
  visualization: {
    primary: 'bar';
    showAverage: boolean;
    colors: {
      [key: number]: string;
    };
  };
};

export type ProcessorConfig = {
  categories: string[];
  colors: string[];
  visualization: NpsConfig['visualization'] | SatisfactionConfig['visualization'];
};

export interface QuestionProcessor {
  process: (responses: any[]) => ProcessedData;
  getConfig: () => ProcessorConfig;
  detectRatingType: (responses: any[]) => RatingVisualizationType;
}

export type ProcessorFactory = () => QuestionProcessor;