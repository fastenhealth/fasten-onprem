import {MetadataSource} from '../fasten/metadata-source';

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
    hits: {
      _index: string;
      _type: string;
      _id: string;
      _score: number;
      _source: MetadataSource;
    }[];
  };
  aggregations: {
    by_platform_type: {
      sum_other_doc_count: number;
      buckets: {
        key: string;
        doc_count: number;
      }[]
    },
    by_category: {
      sum_other_doc_count: number;
      buckets: {
        key: string;
        doc_count: number;
      }[]
    }
  }
}
