import {MetadataSource} from '../fasten/metadata-source';

export class LighthouseSourceSearchResult {
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: MetadataSource;
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
