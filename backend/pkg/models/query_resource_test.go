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
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{CountBy: "test"}}, "", false},
		{QueryResource{Select: []string{"test"}, From: "test", Aggregations: &QueryResourceAggregations{}}, "cannot use 'select' and 'aggregations' together", true},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{CountBy: "test", GroupBy: "test"}}, "cannot use 'count_by' and 'group_by' together", true},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{CountBy: "test", OrderBy: "test"}}, "cannot use 'count_by' and 'order_by' together", true},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{}}, "aggregations must have at least one of 'count_by', 'group_by', or 'order_by'", true},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{CountBy: "test:property"}}, "", false},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{CountBy: "test:property as HELLO"}}, "count_by cannot have spaces (or aliases)", true},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{GroupBy: "test:property as HELLO"}}, "group_by cannot have spaces (or aliases)", true},
		{QueryResource{From: "test", Aggregations: &QueryResourceAggregations{OrderBy: "test:property as HELLO"}}, "order_by cannot have spaces (or aliases)", true},
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
