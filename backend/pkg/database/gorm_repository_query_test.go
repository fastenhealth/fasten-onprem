package database

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	mock_config "github.com/fastenhealth/fasten-onprem/backend/pkg/config/mock"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/event_bus"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

// mimic tests from https://hl7.org/fhir/r4/search.html#token
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
		{"id", map[string]string{"id": "keyword"}, SearchParameter{Type: "keyword", Name: "id", Modifier: ""}, false},

		{"given", map[string]string{"given": "string"}, SearchParameter{Type: "string", Name: "given", Modifier: ""}, false},
		{"given:contains", map[string]string{"given": "string"}, SearchParameter{Type: "string", Name: "given", Modifier: "contains"}, false},
		{"given:exact", map[string]string{"given": "string"}, SearchParameter{Type: "string", Name: "given", Modifier: "exact"}, false},
		{"url:below", map[string]string{"url": "string"}, SearchParameter{Type: "string", Name: "url", Modifier: "below"}, false},
		{"url:above", map[string]string{"url": "string"}, SearchParameter{Type: "string", Name: "url", Modifier: "above"}, false},

		{"display", map[string]string{"display": "token"}, SearchParameter{Type: "token", Name: "display", Modifier: ""}, false},
		{"display:not", map[string]string{"display": "token"}, SearchParameter{Type: "token", Name: "display", Modifier: "not"}, false},
		{"display:unsupported", map[string]string{"display": "token"}, SearchParameter{}, true},
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

// mimic tests from https://hl7.org/fhir/r4/search.html#token
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
		{SearchParameter{Type: "token", Name: "code", Modifier: ""}, "http://acme.org/conditions/codes|", SearchParameterValue{Value: "", Prefix: "", SecondaryValues: map[string]interface{}{"codeSystem": "http://acme.org/conditions/codes"}}, false},
		{SearchParameter{Type: "token", Name: "code", Modifier: ""}, "|807-1", SearchParameterValue{Value: "807-1", Prefix: "", SecondaryValues: map[string]interface{}{"codeSystem": ""}}, false},

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

		{SearchParameter{Type: "keyword", Name: "id", Modifier: ""}, "1234", SearchParameterValue{Value: "1234", SecondaryValues: map[string]interface{}{}}, false},
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
		searchLevelSuffix   string
		expectedClause      string
		expectedNamedParams map[string]interface{}
		expectedError       bool
	}{
		{SearchParameter{Type: "number", Name: "probability", Modifier: ""}, SearchParameterValue{Value: float64(100), Prefix: "gt", SecondaryValues: map[string]interface{}{}}, "0_0", "(probability > @probability_0_0)", map[string]interface{}{"probability_0_0": float64(100)}, false},
		{SearchParameter{Type: "date", Name: "issueDate", Modifier: ""}, SearchParameterValue{Value: time.Date(2013, time.January, 14, 10, 0, 0, 0, time.UTC), Prefix: "lt", SecondaryValues: map[string]interface{}{}}, "1_1", "(issueDate < @issueDate_1_1)", map[string]interface{}{"issueDate_1_1": time.Date(2013, time.January, 14, 10, 0, 0, 0, time.UTC)}, false},

		{SearchParameter{Type: "string", Name: "given", Modifier: ""}, SearchParameterValue{Value: "eve", Prefix: "", SecondaryValues: map[string]interface{}{}}, "0_0", "(givenJson.value LIKE @given_0_0)", map[string]interface{}{"given_0_0": "eve%"}, false},
		{SearchParameter{Type: "string", Name: "given", Modifier: "contains"}, SearchParameterValue{Value: "eve", Prefix: "", SecondaryValues: map[string]interface{}{}}, "0_0", "(givenJson.value LIKE @given_contains_0_0)", map[string]interface{}{"given_contains_0_0": "%eve%"}, false},
		{SearchParameter{Type: "string", Name: "given", Modifier: "exact"}, SearchParameterValue{Value: "eve", Prefix: "", SecondaryValues: map[string]interface{}{}}, "0_0", "(givenJson.value = @given_exact_0_0)", map[string]interface{}{"given_exact_0_0": "eve"}, false},

		{SearchParameter{Type: "uri", Name: "url", Modifier: "below"}, SearchParameterValue{Value: "http://acme.org/fhir/", Prefix: "", SecondaryValues: map[string]interface{}{}}, "0_0", "(url LIKE @url_below_0_0)", map[string]interface{}{"url_below_0_0": "http://acme.org/fhir/%"}, false},
		{SearchParameter{Type: "uri", Name: "url", Modifier: "above"}, SearchParameterValue{Value: "http://acme.org/fhir/", Prefix: "", SecondaryValues: map[string]interface{}{}}, "0_0", "", map[string]interface{}{}, true}, //above modifier not supported

		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, SearchParameterValue{Value: float64(5.4), Prefix: "", SecondaryValues: map[string]interface{}{"valueQuantityCode": "mg"}}, "0_0", "(valueQuantityJson.value ->> '$.value' = @valueQuantity_0_0 AND valueQuantityJson.value ->> '$.code' = @valueQuantityCode_0_0)", map[string]interface{}{"valueQuantity_0_0": float64(5.4), "valueQuantityCode_0_0": "mg"}, false},
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, SearchParameterValue{Value: float64(5.4), Prefix: "", SecondaryValues: map[string]interface{}{}}, "0_0", "(valueQuantityJson.value ->> '$.value' = @valueQuantity_0_0)", map[string]interface{}{"valueQuantity_0_0": float64(5.4)}, false},
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, SearchParameterValue{Value: float64(5.4), Prefix: "le", SecondaryValues: map[string]interface{}{"valueQuantitySystem": "http://unitsofmeasure.org", "valueQuantityCode": "mg"}}, "0_0", "(valueQuantityJson.value ->> '$.value' <= @valueQuantity_0_0 AND valueQuantityJson.value ->> '$.code' = @valueQuantityCode_0_0 AND valueQuantityJson.value ->> '$.system' = @valueQuantitySystem_0_0)", map[string]interface{}{"valueQuantity_0_0": float64(5.4), "valueQuantitySystem_0_0": "http://unitsofmeasure.org", "valueQuantityCode_0_0": "mg"}, false},
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, SearchParameterValue{Value: float64(5.4), Prefix: "ap", SecondaryValues: map[string]interface{}{"valueQuantitySystem": "http://unitsofmeasure.org", "valueQuantityCode": "mg"}}, "0_0", "", map[string]interface{}{}, true}, //ap modifier not supported
		{SearchParameter{Type: "quantity", Name: "valueQuantity", Modifier: ""}, SearchParameterValue{Value: float64(5.4), Prefix: "ne", SecondaryValues: map[string]interface{}{"valueQuantitySystem": "http://unitsofmeasure.org", "valueQuantityCode": "mg"}}, "0_0", "(valueQuantityJson.value ->> '$.value' <> @valueQuantity_0_0 AND valueQuantityJson.value ->> '$.code' = @valueQuantityCode_0_0 AND valueQuantityJson.value ->> '$.system' = @valueQuantitySystem_0_0)", map[string]interface{}{"valueQuantity_0_0": float64(5.4), "valueQuantitySystem_0_0": "http://unitsofmeasure.org", "valueQuantityCode_0_0": "mg"}, false},

		{SearchParameter{Type: "token", Name: "code", Modifier: ""}, SearchParameterValue{Value: "ha125", Prefix: "", SecondaryValues: map[string]interface{}{"codeSystem": "http://acme.org/conditions/codes"}}, "0_0", "(codeJson.value ->> '$.code' = @code_0_0 AND codeJson.value ->> '$.system' = @codeSystem_0_0)", map[string]interface{}{"code_0_0": "ha125", "codeSystem_0_0": "http://acme.org/conditions/codes"}, false},
		{SearchParameter{Type: "token", Name: "code", Modifier: ""}, SearchParameterValue{Value: "ha125", Prefix: "", SecondaryValues: map[string]interface{}{}}, "0_0", "(codeJson.value ->> '$.code' = @code_0_0)", map[string]interface{}{"code_0_0": "ha125"}, false},
		{SearchParameter{Type: "token", Name: "identifier", Modifier: ""}, SearchParameterValue{Value: "MR|446053", Prefix: "", SecondaryValues: map[string]interface{}{"identifierSystem": "http://terminology.hl7.org/CodeSystem/v2-0203"}}, "0_0", "(identifierJson.value ->> '$.code' = @identifier_0_0 AND identifierJson.value ->> '$.system' = @identifierSystem_0_0)", map[string]interface{}{"identifier_0_0": "MR|446053", "identifierSystem_0_0": "http://terminology.hl7.org/CodeSystem/v2-0203"}, false},
		{SearchParameter{Type: "token", Name: "gender", Modifier: ""}, SearchParameterValue{Value: "male", Prefix: "", SecondaryValues: map[string]interface{}{"genderSystem": "http://terminology.hl7.org/CodeSystem/v2-0203"}}, "0_0", "(genderJson.value ->> '$.code' = @gender_0_0 AND genderJson.value ->> '$.system' = @genderSystem_0_0)", map[string]interface{}{"gender_0_0": "male", "genderSystem_0_0": "http://terminology.hl7.org/CodeSystem/v2-0203"}, false},
		{SearchParameter{Type: "token", Name: "gender", Modifier: "not"}, SearchParameterValue{Value: "male", Prefix: "", SecondaryValues: map[string]interface{}{"genderSystem": "http://terminology.hl7.org/CodeSystem/v2-0203"}}, "0_0", "(genderJson.value ->> '$.code' <> @gender_not_0_0 AND genderJson.value ->> '$.system' = @genderSystem_not_0_0)", map[string]interface{}{"gender_not_0_0": "male", "genderSystem_not_0_0": "http://terminology.hl7.org/CodeSystem/v2-0203"}, false},

		{SearchParameter{Type: "keyword", Name: "id", Modifier: ""}, SearchParameterValue{Value: "1234", Prefix: "", SecondaryValues: map[string]interface{}{}}, "0_0", "(id = @id_0_0)", map[string]interface{}{"id_0_0": "1234"}, false},
	}

	//test && assert
	for ndx, tt := range searchCodeToWhereClauseTests {
		actualClause, actualNamedParams, actualErr := SearchCodeToWhereClause(tt.searchParameter, tt.searchValue, tt.searchLevelSuffix)
		if tt.expectedError {
			require.Error(t, actualErr, "Expected error but got none for searchCodeToWhereClauseTests[%d] %s=%s", ndx, tt.searchParameter.Name, tt.searchValue.Value)
		} else {
			require.NoError(t, actualErr, "Expected no error but got one for searchCodeToWhereClauseTests[%d] %s=%s", ndx, tt.searchParameter.Name, tt.searchValue.Value)
			require.Equal(t, tt.expectedClause, actualClause)
			require.Equal(t, tt.expectedNamedParams, actualNamedParams)
		}
	}

}

// TODO
func TestSearchCodeToFromClause(t *testing.T) {
	//setup
	var searchCodeToFromClauseTests = []struct {
		searchParameter SearchParameter
		expectedClause  string
		expectedError   bool
	}{
		{SearchParameter{Type: "number", Name: "probability", Modifier: ""}, "", false},
		{SearchParameter{Type: "date", Name: "issueDate", Modifier: ""}, "", false},
		{SearchParameter{Type: "keyword", Name: "id", Modifier: ""}, "", false},
		{SearchParameter{Type: "token", Name: "hello", Modifier: ""}, "json_each(fhir.hello) as helloJson", false},
	}

	//test && assert
	for ndx, tt := range searchCodeToFromClauseTests {
		actualClause, actualErr := SearchCodeToFromClause(tt.searchParameter)
		if tt.expectedError {
			require.Error(t, actualErr, "Expected error but got none for searchCodeToFromClauseTests[%d] %s", ndx, tt.searchParameter.Name)
		} else {
			require.NoError(t, actualErr, "Expected no error but got one for searchCodeToFromClauseTests[%d] %s", ndx, tt.searchParameter.Name)
			require.Equal(t, tt.expectedClause, actualClause)
		}
	}

}

//Aggregation tests

// mimic tests from https://hl7.org/fhir/r4/search.html#token
func TestProcessAggregationParameter(t *testing.T) {
	//setup
	t.Parallel()
	var processSearchParameterTests = []struct {
		aggregationFieldWithFn models.QueryResourceAggregation // input
		searchParameterLookup  map[string]string               // input (allowed search parameters)
		expected               AggregationParameter
		expectedError          bool // expected result
	}{
		//primitive types
		{models.QueryResourceAggregation{Field: "test"}, map[string]string{"test": "keyword"}, AggregationParameter{SearchParameter: SearchParameter{Type: "keyword", Name: "test", Modifier: ""}}, false},
		{models.QueryResourceAggregation{Field: "test"}, map[string]string{"test": "number"}, AggregationParameter{SearchParameter: SearchParameter{Type: "number", Name: "test", Modifier: ""}}, false},
		{models.QueryResourceAggregation{Field: "test"}, map[string]string{"test": "uri"}, AggregationParameter{SearchParameter: SearchParameter{Type: "uri", Name: "test", Modifier: ""}}, false},
		{models.QueryResourceAggregation{Field: "test"}, map[string]string{"test": "date"}, AggregationParameter{SearchParameter: SearchParameter{Type: "date", Name: "test", Modifier: ""}}, false},

		{models.QueryResourceAggregation{Field: "test:hello"}, map[string]string{"test": "keyword"}, AggregationParameter{SearchParameter: SearchParameter{Type: "date", Name: "test", Modifier: ""}}, true}, //cannot have a modifier
		{models.QueryResourceAggregation{Field: "test:hello"}, map[string]string{"test": "number"}, AggregationParameter{SearchParameter: SearchParameter{Type: "date", Name: "test", Modifier: ""}}, true},  //cannot have a modifier
		{models.QueryResourceAggregation{Field: "test:hello"}, map[string]string{"test": "uri"}, AggregationParameter{SearchParameter: SearchParameter{Type: "date", Name: "test", Modifier: ""}}, true},     //cannot have a modifier
		{models.QueryResourceAggregation{Field: "test:hello"}, map[string]string{"test": "date"}, AggregationParameter{SearchParameter: SearchParameter{Type: "date", Name: "test", Modifier: ""}}, true},    //cannot have a modifier

		//complex types
		{models.QueryResourceAggregation{Field: "test"}, map[string]string{"test": "reference"}, AggregationParameter{SearchParameter: SearchParameter{Type: "reference", Name: "test", Modifier: ""}}, true}, //complex types should throw an error when missing modifier
		{models.QueryResourceAggregation{Field: "test"}, map[string]string{"test": "string"}, AggregationParameter{SearchParameter: SearchParameter{Type: "string", Name: "test", Modifier: ""}}, true},       //complex types should throw an error when missing modifier
		{models.QueryResourceAggregation{Field: "test"}, map[string]string{"test": "quantity"}, AggregationParameter{SearchParameter: SearchParameter{Type: "quantity", Name: "test", Modifier: ""}}, true},   //complex types should throw an error when missing modifier

		{models.QueryResourceAggregation{Field: "test:hello"}, map[string]string{"test": "reference"}, AggregationParameter{SearchParameter: SearchParameter{Type: "reference", Name: "test", Modifier: "hello"}}, false},
		{models.QueryResourceAggregation{Field: "test:hello"}, map[string]string{"test": "string"}, AggregationParameter{SearchParameter: SearchParameter{Type: "string", Name: "test", Modifier: "hello"}}, false},
		{models.QueryResourceAggregation{Field: "test:hello"}, map[string]string{"test": "quantity"}, AggregationParameter{SearchParameter: SearchParameter{Type: "quantity", Name: "test", Modifier: "hello"}}, false},

		//token type
		{models.QueryResourceAggregation{Field: "code"}, map[string]string{"code": "token"}, AggregationParameter{SearchParameter: SearchParameter{Type: "token", Name: "code", Modifier: ""}}, false},
		{models.QueryResourceAggregation{Field: "code:code"}, map[string]string{"code": "token"}, AggregationParameter{SearchParameter: SearchParameter{Type: "token", Name: "code", Modifier: "code"}}, false},
	}

	//test && assert
	for ndx, tt := range processSearchParameterTests {
		actual, actualErr := ProcessAggregationParameter(tt.aggregationFieldWithFn, tt.searchParameterLookup)
		if tt.expectedError {
			require.Error(t, actualErr, "Expected error but got none for processAggregationParameterTests[%d] %s", ndx, tt.aggregationFieldWithFn)
		} else {
			require.NoError(t, actualErr, "Expected no error but got one for processAggregationParameterTests[%d] %s", ndx, tt.aggregationFieldWithFn)
			require.Equal(t, tt.expected, actual)
		}
	}
}

func (suite *RepositoryTestSuite) TestQueryResources_SQL() {
	//setup
	fakeConfig := mock_config.NewMockInterface(suite.MockCtrl)
	fakeConfig.EXPECT().GetString("database.location").Return(suite.TestDatabase.Name()).AnyTimes()
	fakeConfig.EXPECT().GetString("database.type").Return("sqlite").AnyTimes()
	fakeConfig.EXPECT().IsSet("database.encryption.key").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetString("log.level").Return("INFO").AnyTimes()
	fakeConfig.EXPECT().GetBool("database.validation_mode").Return(false).AnyTimes()
	fakeConfig.EXPECT().GetBool("database.encryption.enabled").Return(false).AnyTimes()
	dbRepo, err := NewRepository(fakeConfig, logrus.WithField("test", suite.T().Name()), event_bus.NewNoopEventBusServer())
	require.NoError(suite.T(), err)
	userModel := &models.User{
		Username: "test_username",
		Password: "testpassword",
		Email:    "test@test.com",
	}
	err = dbRepo.CreateUser(context.Background(), userModel)
	require.NoError(suite.T(), err)

	sqliteRepo := dbRepo.(*GormRepository)
	sqliteRepo.GormClient = sqliteRepo.GormClient.Session(&gorm.Session{DryRun: true})

	//test
	authContext := context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, "test_username")

	sqlQuery, err := sqliteRepo.sqlQueryResources(authContext, models.QueryResource{
		Select: []string{},
		Where: map[string]interface{}{
			"code": "test_code",
		},
		From: "Observation",
	})
	require.NoError(suite.T(), err)
	var results []map[string]interface{}
	statement := sqlQuery.Find(&results).Statement
	sqlString := statement.SQL.String()
	sqlParams := statement.Vars

	//assert
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), sqlString,
		strings.Join([]string{
			"SELECT fhir.*",
			"FROM fhir_observation as fhir, json_each(fhir.code) as codeJson",
			"WHERE ((codeJson.value ->> '$.code' = ?)) AND (user_id = ?) GROUP BY `fhir`.`id`",
			"ORDER BY fhir.sort_date DESC"}, " "))
	require.Equal(suite.T(), sqlParams, []interface{}{
		"test_code", "00000000-0000-0000-0000-000000000000",
	})
}
