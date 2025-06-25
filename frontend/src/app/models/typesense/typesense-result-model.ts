export interface TypesenseDocument {
  id: string;
  sort_title: string;
  source_uri: string;
  user_id: string;
  source_id: string;
  source_resource_type: string;
  source_resource_id: string;
  sort_date: number;
  resource_raw: any; 
}

export interface TypesenseSearchResponse {
  results: TypesenseDocument[];
  total: number;
  page: number;
  per_page: number;
}
