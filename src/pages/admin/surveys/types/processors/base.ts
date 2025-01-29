export type RatingVisualizationType = 'nps' | 'satisfaction';
export type ChartType = 'bar' | 'donut' | 'nps-combined';

export type ProcessedData = {
  type: 'boolean' | RatingVisualizationType | 'text';
  data: any;
};

export type VisualizationConfig = {
  primary: ChartType;
  showAverage?: boolean;
  score?: boolean;
  distribution?: boolean;
  colors: {
    [key: string]: string;
  };
};

export type ProcessorConfig = {
  categories: string[];
  colors: string[];
  visualization: VisualizationConfig;
};

export interface QuestionProcessor {
  process: (responses: any[]) => ProcessedData;
  getConfig: () => ProcessorConfig;
  detectRatingType: (responses: any[]) => RatingVisualizationType;
}

export type ProcessorFactory = () => QuestionProcessor;