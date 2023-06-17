package database

import (
	"github.com/stretchr/testify/require"
	"testing"
	"time"
)

//mimic tests from https://hl7.org/fhir/r4/search.html#token
func TestProcessSearchParameter(t *testing.T) {
	//setup
	t.Parallel()
	var processSearchParameterTests = []struct {
		searchParameterWithModifier string            // input
		searchParameterLookup       map[string]string // input (allowed search parameters)
		expected                    SearchParameter
		expectedError               bool // expected result
	}{
		{"test", map[string]string{"test": "string"}, SearchParameter{Type: "string", Name: "test", Modifier: ""}, false},
		{"test:begin", map[string]string{"test": "string"}, SearchParameter{Type: "string", Name: "test", Modifier: "begin"}, false},
		{"unknown:doesntmatter", map[string]string{"test": "string"}, SearchParameter{}, true}, //unknown search parameter shoudl throw error
		{"unknown", map[string]string{"test": "string"}, SearchParameter{}, true},              //unknown search parameter shoudl throw error
		{"test", map[string]string{"test": "faketype"}, SearchParameter{Type: "faketype", Name: "test", Modifier: ""}, false},

		{"given", map[string]string{"given": "string"}, SearchParameter{Type: "string", Name: "given", Modifier: ""}, false},
		{"given:contains", map[string]string{"given": "string"}, SearchParameter{Type: "string", Name: "given", Modifier: "contains"}, false},
		{"given:exact", map[string]string{"given": "string"}, SearchParameter{Type: "string", Name: "given", Modifier: "exact"}, false},
		{"url:below", map[string]string{"url": "string"}, SearchParameter{Type: "string", Name: "url", Modifier: "below"}, false},
		{"url:above", map[string]string{"url": "string"}, SearchParameter{Type: "string", Name: "url", Modifier: "above"}, false},
	}

	//test && assert
	for ndx, tt := range processSearchParameterTests {
		actual, actualErr := ProcessSearchParameter(tt.searchParameterWithModifier, tt.searchParameterLookup)
		if tt.expectedError {
			require.Error(t, actualErr, "Expected error but got none for processSearchParameterTests[%d] %s", ndx, tt.searchParameterWithModifier)
		} else {
			require.NoError(t, actualErr, "Expected no error but got one for processSearchParameterTests[%d] %s", ndx, tt.searchParameterWithModifier)
			require.Equal(t, tt.expected, actual)
		}
	}
}

//mimic tests from https://hl7.org/fhir/r4/search.html#token
func TestProcessSearchParameterValue(t *testing.T) {
	//setup
	t.Parallel()
	var processSearchParameterValueTests = []struct {
		searchParameter       SearchParameter // input
		searchValueWithPrefix string          // input (search value)
		expected              SearchParameterValue
		expectedError         bool // expected result
	}{
		{SearchParameter{Type: "number", Name: "probability", Modifier: ""}, "gt0.8", SearchParameterValue{Value: 0.8, Prefix: "gt", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "number", Name: "probability", Modifier: ""}, "100", SearchParameterValue{Value: float64(100), Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "number", Name: "probability", Modifier: ""}, "100.00", SearchParameterValue{Value: float64(100), Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "number", Name: "probability", Modifier: ""}, "1e2", SearchParameterValue{Value: float64(100), Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "number", Name: "probability", Modifier: ""}, "lt100", SearchParameterValue{Value: float64(100), Prefix: "lt", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "number", Name: "probability", Modifier: ""}, "le100", SearchParameterValue{Value: float64(100), Prefix: "le", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "number", Name: "probability", Modifier: ""}, "gt100", SearchParameterValue{Value: float64(100), Prefix: "gt", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "number", Name: "probability", Modifier: ""}, "ge100", SearchParameterValue{Value: float64(100), Prefix: "ge", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "number", Name: "probability", Modifier: ""}, "ne100", SearchParameterValue{Value: float64(100), Prefix: "ne", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "number", Name: "probability", Modifier: ""}, "unknown100", SearchParameterValue{}, true}, //unknown prefix, invalid number error
		{SearchParameter{Type: "number", Name: "probability", Modifier: ""}, "", SearchParameterValue{}, true},           //empty string, invalid number error

		{SearchParameter{Type: "date", Name: "issueDate", Modifier: ""}, "eq2013-01-14", SearchParameterValue{Value: time.Date(2013, time.January, 14, 0, 0, 0, 0, time.UTC), Prefix: "eq", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "date", Name: "issueDate", Modifier: ""}, "ne2013-01-14", SearchParameterValue{Value: time.Date(2013, time.January, 14, 0, 0, 0, 0, time.UTC), Prefix: "ne", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "date", Name: "issueDate", Modifier: ""}, "lt2013-01-14T10:00:00Z", SearchParameterValue{Value: time.Date(2013, time.January, 14, 10, 0, 0, 0, time.UTC), Prefix: "lt", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "date", Name: "issueDate", Modifier: ""}, "lt2013-01-14T10:00", SearchParameterValue{}, true},          //missing seconds
		{SearchParameter{Type: "date", Name: "issueDate", Modifier: ""}, "lt2013-01-14T10:00Z", SearchParameterValue{}, true},         //missing timezone
		{SearchParameter{Type: "date", Name: "issueDate", Modifier: ""}, "unknown2013-01-14T10:00:00Z", SearchParameterValue{}, true}, //unkown prefix, causes invalid date error
		{SearchParameter{Type: "date", Name: "issueDate", Modifier: ""}, "", SearchParameterValue{}, true},                            //empty date, invalid date error

		{SearchParameter{Type: "string", Name: "given", Modifier: ""}, "eve", SearchParameterValue{Value: "eve", Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "string", Name: "given", Modifier: "contains"}, "eve", SearchParameterValue{Value: "eve", Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "string", Name: "given", Modifier: "exact"}, "Eve", SearchParameterValue{Value: "Eve", Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "string", Name: "given", Modifier: ""}, "", SearchParameterValue{}, true}, //empty string, invalid string error

		{SearchParameter{Type: "uri", Name: "url", Modifier: ""}, "http://acme.org/fhir/ValueSet/123", SearchParameterValue{Value: "http://acme.org/fhir/ValueSet/123", Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "uri", Name: "url", Modifier: "below"}, "http://acme.org/fhir/", SearchParameterValue{Value: "http://acme.org/fhir/", Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "uri", Name: "url", Modifier: "above"}, "http://acme.org/fhir/", SearchParameterValue{Value: "http://acme.org/fhir/", Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "uri", Name: "url", Modifier: ""}, "urn:oid:1.2.3.4.5", SearchParameterValue{Value: "urn:oid:1.2.3.4.5", Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "uri", Name: "url", Modifier: ""}, "", SearchParameterValue{}, true}, //emtpy uri, invalid uri error

		{SearchParameter{Type: "token", Name: "identifier", Modifier: ""}, "http://acme.org/patient|2345", SearchParameterValue{Value: "2345", Prefix: "", SecondaryValues: map[string]interface{}{"identifierSystem": "http://acme.org/patient"}}, false},
		{SearchParameter{Type: "token", Name: "gender", Modifier: ""}, "male", SearchParameterValue{Value: "male", Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "token", Name: "gender", Modifier: "not"}, "male", SearchParameterValue{Value: "male", Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "token", Name: "section", Modifier: "not"}, "48765-2", SearchParameterValue{Value: "48765-2", Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "token", Name: "active", Modifier: ""}, "true", SearchParameterValue{Value: "true", Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "token", Name: "code", Modifier: ""}, "http://acme.org/conditions/codes|ha125", SearchParameterValue{Value: "ha125", Prefix: "", SecondaryValues: map[string]interface{}{"codeSystem": "http://acme.org/conditions/codes"}}, false},
		{SearchParameter{Type: "token", Name: "code", Modifier: ""}, "ha125", SearchParameterValue{Value: "ha125", Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "token", Name: "identifier", Modifier: "otype"}, "http://terminology.hl7.org/CodeSystem/v2-0203|MR|446053", SearchParameterValue{Value: "MR|446053", Prefix: "", SecondaryValues: map[string]interface{}{"identifierSystem": "http://terminology.hl7.org/CodeSystem/v2-0203"}}, false},
		{SearchParameter{Type: "token", Name: "code", Modifier: ""}, "|", SearchParameterValue{}, true}, //empty value should throw an error
		{SearchParameter{Type: "token", Name: "code", Modifier: ""}, "", SearchParameterValue{}, true},  //empty value should throw an error

		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, "5.4|http://unitsofmeasure.org|mg", SearchParameterValue{Value: float64(5.4), Prefix: "", SecondaryValues: map[string]interface{}{"valueQuantitySystem": "http://unitsofmeasure.org", "valueQuantityCode": "mg"}}, false},
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, "5.40e-3|http://unitsofmeasure.org|g", SearchParameterValue{Value: float64(0.0054), Prefix: "", SecondaryValues: map[string]interface{}{"valueQuantitySystem": "http://unitsofmeasure.org", "valueQuantityCode": "g"}}, false},
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, "5.4||mg", SearchParameterValue{Value: float64(5.4), Prefix: "", SecondaryValues: map[string]interface{}{"valueQuantityCode": "mg"}}, false},
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, "5.4", SearchParameterValue{Value: float64(5.4), Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, "le5.4|http://unitsofmeasure.org|mg", SearchParameterValue{Value: float64(5.4), Prefix: "le", SecondaryValues: map[string]interface{}{"valueQuantitySystem": "http://unitsofmeasure.org", "valueQuantityCode": "mg"}}, false},
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, "ap5.4|http://unitsofmeasure.org|mg", SearchParameterValue{Value: float64(5.4), Prefix: "ap", SecondaryValues: map[string]interface{}{"valueQuantitySystem": "http://unitsofmeasure.org", "valueQuantityCode": "mg"}}, false},
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, "unknown5.4", SearchParameterValue{}, true}, //unknown prefix, causes invalid number
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, "ap5.4|http://unitsofmeasure.org|mg|additional", SearchParameterValue{Value: float64(5.4), Prefix: "ap", SecondaryValues: map[string]interface{}{"valueQuantitySystem": "http://unitsofmeasure.org", "valueQuantityCode": "mg|additional"}}, false},
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, "5.4||", SearchParameterValue{Value: float64(5.4), Prefix: "", SecondaryValues: map[string]interface{}{}}, false},
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, "", SearchParameterValue{}, true},
	}

	//test && assert
	for ndx, tt := range processSearchParameterValueTests {
		actual, actualErr := ProcessSearchParameterValue(tt.searchParameter, tt.searchValueWithPrefix)
		if tt.expectedError {
			require.Error(t, actualErr, "Expected error but got none for processSearchParameterValueTests[%d] %s=%s", ndx, tt.searchParameter.Name, tt.searchValueWithPrefix)
		} else {
			require.NoError(t, actualErr, "Expected no error but got one for processSearchParameterValueTests[%d] %s", ndx, tt.searchParameter.Name, tt.searchValueWithPrefix)
			require.Equal(t, tt.expected, actual)
		}
	}
}

func TestSearchCodeToWhereClause(t *testing.T) {
	//setup
	var searchCodeToWhereClauseTests = []struct {
		searchParameter     SearchParameter
		searchValue         SearchParameterValue
		expectedClause      string
		expectedNamedParams map[string]interface{}
		expectedError       bool
	}{
		{SearchParameter{Type: "number", Name: "probability", Modifier: ""}, SearchParameterValue{Value: float64(100), Prefix: "gt", SecondaryValues: map[string]interface{}{}}, "probability > @probability", map[string]interface{}{"probability": float64(100)}, false},
		{SearchParameter{Type: "date", Name: "issueDate", Modifier: ""}, SearchParameterValue{Value: time.Date(2013, time.January, 14, 10, 0, 0, 0, time.UTC), Prefix: "lt", SecondaryValues: map[string]interface{}{}}, "issueDate < @issueDate", map[string]interface{}{"issueDate": time.Date(2013, time.January, 14, 10, 0, 0, 0, time.UTC)}, false},

		{SearchParameter{Type: "string", Name: "given", Modifier: ""}, SearchParameterValue{Value: "eve", Prefix: "", SecondaryValues: map[string]interface{}{}}, "given LIKE @given", map[string]interface{}{"given": "eve%"}, false},
		{SearchParameter{Type: "string", Name: "given", Modifier: "contains"}, SearchParameterValue{Value: "eve", Prefix: "", SecondaryValues: map[string]interface{}{}}, "given LIKE @given", map[string]interface{}{"given": "%eve%"}, false},
		{SearchParameter{Type: "string", Name: "given", Modifier: "exact"}, SearchParameterValue{Value: "eve", Prefix: "", SecondaryValues: map[string]interface{}{}}, "given = @given", map[string]interface{}{"given": "eve"}, false},

		{SearchParameter{Type: "uri", Name: "url", Modifier: "below"}, SearchParameterValue{Value: "http://acme.org/fhir/", Prefix: "", SecondaryValues: map[string]interface{}{}}, "url LIKE @url", map[string]interface{}{"url": "http://acme.org/fhir/%"}, false},
		{SearchParameter{Type: "uri", Name: "url", Modifier: "above"}, SearchParameterValue{Value: "http://acme.org/fhir/", Prefix: "", SecondaryValues: map[string]interface{}{}}, "", map[string]interface{}{}, true}, //above modifier not supported

		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, SearchParameterValue{Value: float64(5.4), Prefix: "", SecondaryValues: map[string]interface{}{"valueQuantityCode": "mg"}}, "valueQuantity = @valueQuantity AND valueQuantityCode = @valueQuantityCode", map[string]interface{}{"valueQuantity": float64(5.4), "valueQuantityCode": "mg"}, false},
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, SearchParameterValue{Value: float64(5.4), Prefix: "", SecondaryValues: map[string]interface{}{}}, "valueQuantity = @valueQuantity", map[string]interface{}{"valueQuantity": float64(5.4)}, false},
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, SearchParameterValue{Value: float64(5.4), Prefix: "le", SecondaryValues: map[string]interface{}{"valueQuantitySystem": "http://unitsofmeasure.org", "valueQuantityCode": "mg"}}, "valueQuantity <= @valueQuantity AND valueQuantityCode = @valueQuantityCode AND valueQuantitySystem = @valueQuantitySystem", map[string]interface{}{"valueQuantity": float64(5.4), "valueQuantitySystem": "http://unitsofmeasure.org", "valueQuantityCode": "mg"}, false},
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, SearchParameterValue{Value: float64(5.4), Prefix: "ap", SecondaryValues: map[string]interface{}{"valueQuantitySystem": "http://unitsofmeasure.org", "valueQuantityCode": "mg"}}, "", map[string]interface{}{}, true}, //ap modifier not supported
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, SearchParameterValue{Value: float64(5.4), Prefix: "ne", SecondaryValues: map[string]interface{}{"valueQuantitySystem": "http://unitsofmeasure.org", "valueQuantityCode": "mg"}}, "valueQuantity <> @valueQuantity AND valueQuantityCode = @valueQuantityCode AND valueQuantitySystem = @valueQuantitySystem", map[string]interface{}{"valueQuantity": float64(5.4), "valueQuantitySystem": "http://unitsofmeasure.org", "valueQuantityCode": "mg"}, false},
	}

	//test && assert
	for ndx, tt := range searchCodeToWhereClauseTests {
		actualClause, actualNamedParams, actualErr := SearchCodeToWhereClause(tt.searchParameter, tt.searchValue)
		if tt.expectedError {
			require.Error(t, actualErr, "Expected error but got none for searchCodeToWhereClauseTests[%d] %s=%s", ndx, tt.searchParameter.Name, tt.searchValue.Value)
		} else {
			require.NoError(t, actualErr, "Expected no error but got one for searchCodeToWhereClauseTests[%d] %s=%s", ndx, tt.searchParameter.Name, tt.searchValue.Value)
			require.Equal(t, tt.expectedClause, actualClause)
			require.Equal(t, tt.expectedNamedParams, actualNamedParams)
		}
	}

}
