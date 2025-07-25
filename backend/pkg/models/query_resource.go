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
	Limit  *int                   `json:"limit,omitempty"`
	Offset *int                   `json:"offset,omitempty"`

	//aggregation fields
	Aggregations *QueryResourceAggregations `json:"aggregations"`
}

type QueryResourceAggregations struct {
	CountBy *QueryResourceAggregation `json:"count_by,omitempty"` //alias for both groupby and orderby, cannot be used together

	GroupBy *QueryResourceAggregation `json:"group_by,omitempty"`
	OrderBy *QueryResourceAggregation `json:"order_by,omitempty"`
}

type QueryResourceAggregation struct {
	Field    string `json:"field"`
	Function string `json:"fn"` //built-in SQL aggregation functions (eg. Count, min, max, etc).
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

		if q.Aggregations.CountBy != nil {
			if len(q.Aggregations.CountBy.Field) == 0 {
				return fmt.Errorf("if 'count_by' is present, field must be populated")
			}
			if strings.Contains(q.Aggregations.CountBy.Field, " ") {
				return fmt.Errorf("count_by cannot have spaces (or aliases)")
			}
		}
		if q.Aggregations.GroupBy != nil {
			if len(q.Aggregations.GroupBy.Field) == 0 {
				return fmt.Errorf("if 'group_by' is present, field must be populated")
			}
			if strings.Contains(q.Aggregations.GroupBy.Field, " ") {
				return fmt.Errorf("group_by cannot have spaces (or aliases)")
			}
		}
		if q.Aggregations.OrderBy != nil {
			if len(q.Aggregations.OrderBy.Field) == 0 {
				return fmt.Errorf("if 'order_by' is present, field must be populated")
			}
			if strings.Contains(q.Aggregations.OrderBy.Field, " ") {
				return fmt.Errorf("order_by cannot have spaces (or aliases)")
			}
		}

		if q.Aggregations.CountBy != nil {
			if q.Aggregations.GroupBy != nil {
				return fmt.Errorf("cannot use 'count_by' and 'group_by' together")
			}
			if q.Aggregations.OrderBy != nil {
				return fmt.Errorf("cannot use 'count_by' and 'order_by' together")
			}
		}
		if q.Aggregations.CountBy == nil && q.Aggregations.OrderBy == nil && q.Aggregations.GroupBy == nil {
			return fmt.Errorf("aggregations must have at least one of 'count_by', 'group_by', or 'order_by'")
		}

	}

	if q.Limit != nil && *q.Limit < 0 {
		return fmt.Errorf("'limit' must be greater than or equal to zero")
	}
	if q.Offset != nil && *q.Offset < 0 {
		return fmt.Errorf("'offset' must be greater than or equal to zero")
	}

	return nil
}
