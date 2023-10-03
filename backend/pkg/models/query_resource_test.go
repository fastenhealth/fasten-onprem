package models

import (
	"github.com/stretchr/testify/require"
	"testing"
)

func TestQueryResource_Validate(t *testing.T) {
	var queryResourceValidateTests = []struct {
		queryResource       QueryResource
		expectedErrorString string
		expectedError       bool
	}{
		{QueryResource{Use: "test"}, "'use' is not supported yet", true},
		{QueryResource{}, "'from' is required", true},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{CountBy: &QueryResourceAggregation{Field: ""}}}, "if 'count_by' is present, field must be populated", true},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{GroupBy: &QueryResourceAggregation{Field: ""}}}, "if 'group_by' is present, field must be populated", true},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{OrderBy: &QueryResourceAggregation{Field: ""}}}, "if 'order_by' is present, field must be populated", true},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{CountBy: &QueryResourceAggregation{Field: "test"}}}, "", false},
		{QueryResource{Select: []string{"test"}, From: "test", Aggregations: &QueryResourceAggregations{}}, "cannot use 'select' and 'aggregations' together", true},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{CountBy: &QueryResourceAggregation{Field: "test"}, GroupBy: &QueryResourceAggregation{Field: "test"}}}, "cannot use 'count_by' and 'group_by' together", true},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{CountBy: &QueryResourceAggregation{Field: "test"}, OrderBy: &QueryResourceAggregation{Field: "test"}}}, "cannot use 'count_by' and 'order_by' together", true},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{}}, "aggregations must have at least one of 'count_by', 'group_by', or 'order_by'", true},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{CountBy: &QueryResourceAggregation{Field: "test:property"}}}, "", false},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{CountBy: &QueryResourceAggregation{Field: "test:property as HELLO"}}}, "count_by cannot have spaces (or aliases)", true},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{GroupBy: &QueryResourceAggregation{Field: "test:property as HELLO"}}}, "group_by cannot have spaces (or aliases)", true},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{OrderBy: &QueryResourceAggregation{Field: "test:property as HELLO"}}}, "order_by cannot have spaces (or aliases)", true},
	}

	//test && assert
	for ndx, tt := range queryResourceValidateTests {
		actualErr := tt.queryResource.Validate()
		if tt.expectedError {
			require.EqualError(t, actualErr, tt.expectedErrorString, "Expected error string to be '%s' but got '%s' for TestQueryResource_Validate[%d] %s", tt.expectedErrorString, actualErr, ndx, tt.queryResource)
		} else {
			require.NoError(t, actualErr, "Expected no error but got one for TestQueryResource_Validate[%d] `%s`", ndx, actualErr)
		}
	}
}
