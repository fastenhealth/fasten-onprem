import {PatientAccessBrand, PatientAccessPortal} from '../patient-access-brands';

export interface LighthouseEndpointListDisplayItem {
  id: string;
  platform_type: string;
}

export interface LighthousePortalListDisplayItem extends PatientAccessPortal {
  endpoints?: LighthouseEndpointListDisplayItem[];
}

export interface LighthouseBrandListDisplayItem extends PatientAccessBrand {
  portals: LighthousePortalListDisplayItem[];
  hidden: boolean;
}



export class LighthouseSourceSearchResult {
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: LighthouseBrandListDisplayItem;
  sort: string[];
}

export class LighthouseSourceSearchAggregation {
  sum_other_doc_count: number;
  buckets: {
    key: string;
    doc_count: number;
  }[]
}

export class LighthouseSourceSearch {
  _scroll_id: string;
  took: number;
  timed_out: boolean;
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: number;
    hits: LighthouseSourceSearchResult[];
  };
  aggregations: {
    by_platform_type: LighthouseSourceSearchAggregation
    by_category: LighthouseSourceSearchAggregation
  };
}
