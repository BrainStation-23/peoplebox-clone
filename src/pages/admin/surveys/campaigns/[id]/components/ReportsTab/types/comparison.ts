export type ComparisonDimension = 'sbu' | 'gender' | 'location' | 'employment_type' | 'none';

export interface ComparisonProps {
  dimension: ComparisonDimension;
  onDimensionChange: (dimension: ComparisonDimension) => void;
}