export type ProcessedData = {
  type: 'boolean' | 'rating' | 'text';
  data: any;
};

export type VisualizationType = 'donut' | 'bar' | 'wordcloud' | 'heatmap';

export type ProcessorConfig = {
  categories: string[];
  colors: string[];
  visualization: {
    type: VisualizationType;
    config: Record<string, any>;
  };
};

export interface QuestionProcessor {
  process: (responses: any[]) => ProcessedData;
  getConfig: () => ProcessorConfig;
}

export type ProcessorFactory = () => QuestionProcessor;