export interface Location {
  id: string;
  name: string;
  google_maps_url: string | null;
  address: string | null;
  created_at: string;
}

export interface LocationFormValues {
  name: string;
  google_maps_url?: string;
  address?: string;
}