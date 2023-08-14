package models

import (
	"fmt"
	"strings"
)

// maps to frontend/src/app/models/widget/dashboard-widget-query.ts
type QueryResource struct {
	Use    string                 `json:"use"`
	Select []string               `json:"select"`
	From   string                 `json:"from"`
	Where  map[string]interface{} `json:"where"`

	//aggregation fields
	Aggregations *QueryResourceAggregations `json:"aggregations"`
}

type QueryResourceAggregations struct {
	CountBy string `json:"count_by"` //alias for both groupby and orderby, cannot be used together

	GroupBy string `json:"group_by"`
	OrderBy string `json:"order_by"`
}

func (q *QueryResource) Validate() error {
	if len(q.Use) > 0 {
		return fmt.Errorf("'use' is not supported yet")
	}

	if len(q.From) == 0 {
		return fmt.Errorf("'from' is required")
	}

	if q.Aggregations != nil {
		if len(q.Select) > 0 {
			return fmt.Errorf("cannot use 'select' and 'aggregations' together")
		}
		if len(q.Aggregations.CountBy) > 0 {
			if len(q.Aggregations.GroupBy) > 0 {
				return fmt.Errorf("cannot use 'count_by' and 'group_by' together")
			}
			if len(q.Aggregations.OrderBy) > 0 {
				return fmt.Errorf("cannot use 'count_by' and 'order_by' together")
			}
		}
		if len(q.Aggregations.CountBy) == 0 && len(q.Aggregations.OrderBy) == 0 && len(q.Aggregations.GroupBy) == 0 {
			return fmt.Errorf("aggregations must have at least one of 'count_by', 'group_by', or 'order_by'")
		}
		if strings.Contains(q.Aggregations.CountBy, " ") {
			return fmt.Errorf("count_by cannot have spaces (or aliases)")
		}
		if strings.Contains(q.Aggregations.GroupBy, " ") {
			return fmt.Errorf("group_by cannot have spaces (or aliases)")
		}
		if strings.Contains(q.Aggregations.OrderBy, " ") {
			return fmt.Errorf("order_by cannot have spaces (or aliases)")
		}

	}

	return nil
}
