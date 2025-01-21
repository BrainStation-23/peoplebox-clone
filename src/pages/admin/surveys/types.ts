export type Survey = {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  json_data: Record<string, any>;
  status: 'draft' | 'published' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
};