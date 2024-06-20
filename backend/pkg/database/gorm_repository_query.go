package database

import (
	"context"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	databaseModel "github.com/fastenhealth/fasten-onprem/backend/pkg/models/database"
	"github.com/iancoleman/strcase"
	"github.com/samber/lo"
	"golang.org/x/exp/maps"
	"golang.org/x/exp/slices"
	"gorm.io/gorm"
)

type SearchParameterType string

const (
	//simple types
	SearchParameterTypeNumber  SearchParameterType = "number"
	SearchParameterTypeDate    SearchParameterType = "date"
	SearchParameterTypeUri     SearchParameterType = "uri"
	SearchParameterTypeKeyword SearchParameterType = "keyword" //this is a literal/string primitive.

	//complex types
	SearchParameterTypeString    SearchParameterType = "string"
	SearchParameterTypeToken     SearchParameterType = "token"
	SearchParameterTypeReference SearchParameterType = "reference"
	SearchParameterTypeQuantity  SearchParameterType = "quantity"
	SearchParameterTypeComposite SearchParameterType = "composite"
	SearchParameterTypeSpecial   SearchParameterType = "special"
)

const TABLE_ALIAS = "fhir"

// Allows users to use SearchParameters to query resources
// Can generate simple or complex queries, depending on the SearchParameter type:
//
// eg. Simple
// SELECT fhir.*
// FROM fhir_observation as fhir, json_each(fhir.code) as codeJson
//
// result = inteface{} ([]database.IFhirResource)
//
// eg. Complex
// SELECT fhir.*
// FROM fhir_observation as fhir, json_each(fhir.code) as codeJson
// WHERE (
//
//	(codeJson.value ->> '$.code' = "29463-7" AND codeJson.value ->> '$.system' = "http://loinc.org")
//	OR (codeJson.value ->> '$.code' = "3141-9" AND codeJson.value ->> '$.system' = "http://loinc.org")
//	OR (codeJson.value ->> '$.code' = "27113001" AND codeJson.value ->> '$.system' = "http://snomed.info/sct")
//
// )
// AND (user_id = "6efcd7c5-3f29-4f0d-926d-a66ff68bbfc2")
// GROUP BY `fhir`.`id`
//
// results = []map[string]any{}
func (gr *GormRepository) QueryResources(ctx context.Context, query models.QueryResource) (interface{}, error) {

	sqlQuery, err := gr.sqlQueryResources(ctx, query)
	if err != nil {
		return nil, err
	}

	if query.Aggregations != nil && (query.Aggregations.GroupBy != nil || query.Aggregations.CountBy != nil) {
		results := []map[string]any{}
		clientResp := sqlQuery.Find(&results)
		return results, clientResp.Error

	} else {

		//find the associated Gorm Model for this query
		queryModelSlice, err := databaseModel.NewFhirResourceModelSliceByType(query.From)
		if err != nil {
			return nil, err
		}

		clientResp := sqlQuery.Find(&queryModelSlice)
		return queryModelSlice, clientResp.Error
	}

}

// see QueryResources
// this function has all the logic, but should only be called directly for testing
func (gr *GormRepository) sqlQueryResources(ctx context.Context, query models.QueryResource) (*gorm.DB, error) {
	//todo, until we actually parse the select statement, we will just return all resources based on "from"

	//SECURITY: this is required to ensure that only valid resource types are queried (since it's controlled by the user)
	if !slices.Contains(databaseModel.GetAllowedResourceTypes(), query.From) {
		return nil, fmt.Errorf("invalid resource type %s", query.From)
	}

	if queryValidate := query.Validate(); queryValidate != nil {
		return nil, queryValidate
	}

	//find the associated Gorm Model for this query
	queryModel, err := databaseModel.NewFhirResourceModelByType(query.From)
	if err != nil {
		return nil, err
	}

	//SECURITY: this would be unsafe as the user controls the query.From value, however we've validated it is a valid resource type above
	fromClauses := []string{fmt.Sprintf("%s as %s", strcase.ToSnake("Fhir"+query.From), TABLE_ALIAS)}
	whereClauses := []string{}
	whereNamedParameters := map[string]interface{}{}

	//find the FHIR search types associated with each where clause. Any unknown parameters will be ignored.
	searchCodeToTypeLookup := queryModel.GetSearchParameters()
	for searchParamCodeWithModifier, searchParamCodeValueOrValuesWithPrefix := range query.Where {
		searchParameter, err := ProcessSearchParameter(searchParamCodeWithModifier, searchCodeToTypeLookup)
		if err != nil {
			return nil, err
		}

		searchParameterValueOperatorTree, err := ProcessSearchParameterValueIntoOperatorTree(searchParameter, searchParamCodeValueOrValuesWithPrefix)
		if err != nil {
			return nil, err
		}

		for ndxANDlevel, searchParameterValueOperatorAND := range searchParameterValueOperatorTree {
			whereORClauses := []string{}
			for ndxORlevel, searchParameterValueOperatorOR := range searchParameterValueOperatorAND {
				whereORClause, clauseNamedParameters, err := SearchCodeToWhereClause(searchParameter, searchParameterValueOperatorOR, fmt.Sprintf("%d_%d", ndxANDlevel, ndxORlevel))
				if err != nil {
					return nil, err
				}
				//add generated where clause to the list, and add the named parameters to the map of existing named parameters
				whereORClauses = append(whereORClauses, whereORClause)
				maps.Copy(whereNamedParameters, clauseNamedParameters)
			}
			whereClauses = append(whereClauses, fmt.Sprintf("(%s)", strings.Join(whereORClauses, " OR ")))
		}

		fromClause, err := SearchCodeToFromClause(searchParameter)
		if err != nil {
			return nil, err
		}
		if len(fromClause) > 0 {
			fromClauses = append(fromClauses, fromClause)
		}
	}

	//SECURITY: for safety, we will always add/override the current user_id to the where clause. This is to ensure that the user doesnt attempt to override this value in their own where clause
	currentUser, currentUserErr := gr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}
	whereNamedParameters["user_id"] = currentUser.ID.String()
	whereClauses = append(whereClauses, "(user_id = @user_id)")

	//defaults
	selectClauses := []string{fmt.Sprintf("%s.*", TABLE_ALIAS)}
	groupClause := fmt.Sprintf("%s.id", TABLE_ALIAS)
	orderClause := fmt.Sprintf("%s.sort_date DESC", TABLE_ALIAS)
	if query.Aggregations != nil {

		//Handle Aggregations

		if query.Aggregations.CountBy != nil {
			//populate the group by and order by clause with the count by values
			query.Aggregations.OrderBy = &models.QueryResourceAggregation{
				Field:    "*",
				Function: "count",
			}
			query.Aggregations.GroupBy = query.Aggregations.CountBy

			if query.Aggregations.GroupBy.Field == "*" {
				//we need to get the count of all resources, so we need to remove the group by clause and replace it by
				// `source_resource_type` which will be the same for all resources
				query.Aggregations.GroupBy.Field = "source_resource_type"
			}
		}

		//process order by clause
		if query.Aggregations.OrderBy != nil {
			orderAsc := true //default to ascending, switch to desc if parameter is a date type.
			if !(query.Aggregations.OrderBy.Field == "*") {
				orderAggregationParam, err := ProcessAggregationParameter(*query.Aggregations.OrderBy, searchCodeToTypeLookup)
				if err != nil {
					return nil, err
				}
				orderAggregationFromClause, err := SearchCodeToFromClause(orderAggregationParam.SearchParameter)
				if err != nil {
					return nil, err
				}
				fromClauses = append(fromClauses, orderAggregationFromClause)

				//if the order by is a date type, we need to order by DESC (most recent first)
				if orderAggregationParam.Type == SearchParameterTypeDate {
					orderAsc = false
				}

				orderClause = AggregationParameterToClause(orderAggregationParam)
				if orderAsc {
					orderClause = fmt.Sprintf("%s ASC", orderClause)
				} else {
					orderClause = fmt.Sprintf("%s DESC", orderClause)
				}
			} else {
				orderClause = fmt.Sprintf("%s(%s) DESC", query.Aggregations.OrderBy.Function, query.Aggregations.OrderBy.Field)
			}
		}

		//process group by clause
		if query.Aggregations.GroupBy != nil {
			groupAggregationParam, err := ProcessAggregationParameter(*query.Aggregations.GroupBy, searchCodeToTypeLookup)
			if err != nil {
				return nil, err
			}
			groupAggregationFromClause, err := SearchCodeToFromClause(groupAggregationParam.SearchParameter)
			if err != nil {
				return nil, err
			}
			fromClauses = append(fromClauses, groupAggregationFromClause)

			groupClause = AggregationParameterToClause(groupAggregationParam)
			selectClauses = []string{
				fmt.Sprintf("%s as %s", groupClause, "label"),
			}

			if query.Aggregations.OrderBy == nil || query.Aggregations.OrderBy.Field == "*" {
				selectClauses = append(selectClauses, fmt.Sprintf("%s as %s", "count(*)", "value"))
				orderClause = fmt.Sprintf("%s DESC", "count(*)")
			} else {
				//use the orderBy aggregation as the value
				orderAggregationParam, err := ProcessAggregationParameter(*query.Aggregations.OrderBy, searchCodeToTypeLookup)
				if err != nil {
					return nil, err
				}

				orderSelectClause := AggregationParameterToClause(orderAggregationParam)
				selectClauses = append(selectClauses, fmt.Sprintf("%s as %s", orderSelectClause, "value"))
			}

		}
	}

	// Debugging
	//log.Printf("whereClauses: %v", whereClauses)
	//log.Printf("whereNamedParameters: %v", whereNamedParameters)

	//ensure Where and From clauses are unique
	whereClauses = lo.Uniq(whereClauses)
	whereClauses = lo.Compact(whereClauses)
	sort.Strings(whereClauses)
	fromClauses = lo.Uniq(fromClauses)
	fromClauses = lo.Compact(fromClauses)
	sort.Strings(fromClauses)
	sort.Strings(selectClauses)

	sqlQuery := gr.GormClient.WithContext(ctx).
		Select(strings.Join(selectClauses, ", ")).
		Where(strings.Join(whereClauses, " AND "), whereNamedParameters).
		Group(groupClause).
		Order(orderClause).
		Table(strings.Join(fromClauses, ", "))

	//add limit and offset clauses if present
	if query.Limit != nil {
		sqlQuery = sqlQuery.Limit(*query.Limit)
	}
	if query.Offset != nil {
		sqlQuery = sqlQuery.Offset(*query.Offset)
	}

	return sqlQuery, nil
}

/// INTERNAL functionality. These functions are exported for testing, but are not available in the Interface
//TODO: dont export these, instead use casting to convert the interface to the GormRepository struct, then call ehese functions directly

type SearchParameter struct {
	Name     string
	Type     SearchParameterType
	Modifier string
}

type AggregationParameter struct {
	SearchParameter
	Function string //count, sum, avg, min, max, etc
}

// Lists in the SearchParameterValueOperatorTree are AND'd together, and items within each SearchParameterValueOperatorTree list are OR'd together
// For example, the following would be AND'd together, and then OR'd with the next SearchParameterValueOperatorTree
//
//	{
//	 {SearchParameterValue{Value: "foo"}, SearchParameterValue{Value: "bar"}}
//	 {SearchParameterValue{Value: "baz"}},
//	}
//
// This would result in the following SQL:
//
//	(value = "foo" OR value = "bar") AND (value = "baz")
type SearchParameterValueOperatorTree [][]SearchParameterValue

type SearchParameterValue struct {
	Prefix          string
	Value           interface{}
	SecondaryValues map[string]interface{}
}

// SearchParameters are made up of parameter names and modifiers. For example, "name" and "name:exact" are both valid search parameters
// This function will parse the searchCodeWithModifier and return the SearchParameter
func ProcessSearchParameter(searchCodeWithModifier string, searchParamTypeLookup map[string]string) (SearchParameter, error) {
	searchParameter := SearchParameter{}

	//determine the searchCode searchCodeModifier
	//TODO: this is only applicable to string, token, reference and uri type (however unknown names & modifiers are ignored)
	if searchCodeParts := strings.SplitN(searchCodeWithModifier, ":", 2); len(searchCodeParts) == 2 {
		searchParameter.Name = searchCodeParts[0]
		searchParameter.Modifier = searchCodeParts[1]
	} else {
		searchParameter.Name = searchCodeParts[0]
		searchParameter.Modifier = ""
	}

	//next, determine the searchCodeType for this Resource (or throw an error if it is unknown)
	searchParamTypeStr, searchParamTypeOk := searchParamTypeLookup[searchParameter.Name]
	if !searchParamTypeOk {
		return searchParameter, fmt.Errorf("unknown search parameter: %s", searchParameter.Name)
	} else {
		searchParameter.Type = SearchParameterType(searchParamTypeStr)
	}

	//only a limited set of token modifiers are allowed. Otherwise we need to throw an error
	allowedTokenModifiers := []string{"not"}
	if searchParameter.Type == SearchParameterTypeToken && len(searchParameter.Modifier) > 0 && !lo.Contains(allowedTokenModifiers, searchParameter.Modifier) {
		return searchParameter, fmt.Errorf("token search parameter %s does not support this modifier: %s", searchParameter.Name, searchParameter.Modifier)
	}

	return searchParameter, nil
}

// ProcessSearchParameterValueIntoOperatorTree searchParamCodeValueOrValuesWithPrefix may be a single string, or a list of strings
// each string, may itself be a concatenation of multiple values, seperated by a comma
// so we need to do three stages of processing:
// 1. split the searchParamCodeValueOrValuesWithPrefix into a list of strings
// 2. split each string into a list of values
// 3. use the ProcessSearchParameterValue function to split each value into a list of prefixes and values
// these are then stored in a multidimentional list of SearchParameterValueOperatorTree
// top level is AND'd together, and each item within the lists are OR'd together
//
// For example, searchParamCodeValueOrValuesWithPrefix may be:
//
//	"code": "29463-7,3141-9,27113001" = OR
//	"code": ["le29463-7", "gt3141-9", "27113001"] = AND
func ProcessSearchParameterValueIntoOperatorTree(searchParameter SearchParameter, searchParamCodeValueOrValuesWithPrefix interface{}) (SearchParameterValueOperatorTree, error) {

	searchParamCodeValuesWithPrefix := []string{}
	switch v := searchParamCodeValueOrValuesWithPrefix.(type) {
	case string:
		searchParamCodeValuesWithPrefix = append(searchParamCodeValuesWithPrefix, v)
		break
	case []string:
		searchParamCodeValuesWithPrefix = v
		break
	case []interface{}:
		for _, searchParamCodeValue := range v {
			searchParamCodeValuesWithPrefix = append(searchParamCodeValuesWithPrefix, fmt.Sprintf("%v", searchParamCodeValue))
		}
		break
	default:
		return nil, fmt.Errorf("invalid search parameter value type %T, must be a string or a list of strings (%s=%v)", v, searchParameter.Name, searchParamCodeValueOrValuesWithPrefix)
	}

	//generate a SearchParameterValueOperatorTree, because we may have multiple OR and AND operators for the same search parameter.
	//ie, (code = "foo" OR code = "bar") AND (code = "baz")
	searchParamCodeValueOperatorTree := SearchParameterValueOperatorTree{}

	//loop through each searchParamCodeValueWithPrefix, and split it into a list of values (comma seperated)
	for _, searchParamCodeValuesInANDClause := range searchParamCodeValuesWithPrefix {
		searchParameterValuesOperatorOR := []SearchParameterValue{}
		for _, searchParamCodeValueInORClause := range strings.Split(searchParamCodeValuesInANDClause, ",") {
			searchParameterValue, err := ProcessSearchParameterValue(searchParameter, searchParamCodeValueInORClause)
			if err != nil {
				return nil, err
			}
			searchParameterValuesOperatorOR = append(searchParameterValuesOperatorOR, searchParameterValue)
		}
		searchParamCodeValueOperatorTree = append(searchParamCodeValueOperatorTree, searchParameterValuesOperatorOR)
	}
	return searchParamCodeValueOperatorTree, nil
}

// ProcessSearchParameterValue searchValueWithPrefix may or may not have a prefix which needs to be parsed
// this function will parse the searchValueWithPrefix and return the SearchParameterValue
// for example, "eq2018-01-01" would return a SearchParameterValue with a prefix of "eq" and a value of "2018-01-01"
// and "2018-01-01" would return a SearchParameterValue with a value of "2018-01-01"
//
// some query types, like token, quantity and reference, have secondary values that need to be parsed
// for example, code="http://loinc.org|29463-7" would return a SearchParameterValue with a value of "29463-7" and a secondary value of { "codeSystem": "http://loinc.org" }
func ProcessSearchParameterValue(searchParameter SearchParameter, searchValueWithPrefix string) (SearchParameterValue, error) {
	searchParameterValue := SearchParameterValue{
		SecondaryValues: map[string]interface{}{},
		Value:           searchValueWithPrefix,
	}
	if (searchParameter.Type == SearchParameterTypeString || searchParameter.Type == SearchParameterTypeUri || searchParameter.Type == SearchParameterTypeKeyword) && len(searchParameterValue.Value.(string)) == 0 {
		return searchParameterValue, fmt.Errorf("invalid search parameter value: (%s=%s)", searchParameter.Name, searchParameterValue.Value)
	}

	//certain types (like number,date and quanitty have a prefix that needs to be parsed)
	if searchParameter.Type == SearchParameterTypeNumber || searchParameter.Type == SearchParameterTypeDate || searchParameter.Type == SearchParameterTypeQuantity {
		//loop though all known/allowed prefixes, and determine if the searchValueWithPrefix starts with one of them
		allowedPrefixes := []string{"eq", "ne", "gt", "lt", "ge", "le", "sa", "eb", "ap"}
		for _, allowedPrefix := range allowedPrefixes {
			if strings.HasPrefix(searchValueWithPrefix, allowedPrefix) {
				searchParameterValue.Prefix = allowedPrefix
				searchParameterValue.Value = strings.TrimPrefix(searchValueWithPrefix, allowedPrefix)
				break
			}
		}
	}

	//certain Types (like token, quantity, reference) have secondary query values that need to be parsed (delimited by "|") value
	if searchParameter.Type == SearchParameterTypeQuantity {
		if searchParameterValueParts := strings.SplitN(searchParameterValue.Value.(string), "|", 3); len(searchParameterValueParts) == 1 {
			searchParameterValue.Value = searchParameterValueParts[0]
		} else if len(searchParameterValueParts) == 2 {
			searchParameterValue.Value = searchParameterValueParts[0]
			if len(searchParameterValueParts[1]) > 0 {
				searchParameterValue.SecondaryValues[searchParameter.Name+"System"] = searchParameterValueParts[1]
			}
		} else if len(searchParameterValueParts) == 3 {
			searchParameterValue.Value = searchParameterValueParts[0]
			if len(searchParameterValueParts[1]) > 0 {
				searchParameterValue.SecondaryValues[searchParameter.Name+"System"] = searchParameterValueParts[1]
			}
			if len(searchParameterValueParts[2]) > 0 {
				searchParameterValue.SecondaryValues[searchParameter.Name+"Code"] = searchParameterValueParts[2]
			}
		}
	} else if searchParameter.Type == SearchParameterTypeToken {
		if searchParameterValueParts := strings.SplitN(searchParameterValue.Value.(string), "|", 2); len(searchParameterValueParts) == 1 {
			searchParameterValue.Value = searchParameterValueParts[0] //this is a code
			if len(searchParameterValue.Value.(string)) == 0 {
				return searchParameterValue, fmt.Errorf("invalid search parameter value: (%s=%s)", searchParameter.Name, searchParameterValue.Value)
			}
		} else if len(searchParameterValueParts) == 2 {
			//if theres 2 parts, first is always system, second is always the code. Either one may be emty. If both are emty this is invalid.
			searchParameterValue.SecondaryValues[searchParameter.Name+"System"] = searchParameterValueParts[0]
			searchParameterValue.Value = searchParameterValueParts[1]
			if len(searchParameterValueParts[0]) == 0 && len(searchParameterValueParts[1]) == 0 {
				return searchParameterValue, fmt.Errorf("invalid search parameter value: (%s=%s)", searchParameter.Name, searchParameterValue.Value)
			}
		}
	} else if searchParameter.Type == SearchParameterTypeReference {
		//todo
		return searchParameterValue, fmt.Errorf("search parameter type not yet implemented: %s", searchParameter.Type)
	}

	//certain types (Quantity and Number) need to be converted to Float64
	if searchParameter.Type == SearchParameterTypeQuantity || searchParameter.Type == SearchParameterTypeNumber {
		if conv, err := strconv.ParseFloat(searchParameterValue.Value.(string), 64); err == nil {
			searchParameterValue.Value = conv
		} else {
			return searchParameterValue, fmt.Errorf("invalid search parameter value (NaN): (%s=%s)", searchParameter.Name, searchParameterValue.Value)
		}
	} else if searchParameter.Type == SearchParameterTypeDate {
		//other types (like date) need to be converted to a time.Time
		if conv, err := time.Parse(time.RFC3339, searchParameterValue.Value.(string)); err == nil {
			searchParameterValue.Value = conv
		} else {
			// fallback to parsing just a date (without time)
			if conv, err := time.Parse("2006-01-02", searchParameterValue.Value.(string)); err == nil {
				searchParameterValue.Value = conv
			} else {
				return searchParameterValue, fmt.Errorf("invalid search parameter value (invalid date): (%s=%s)", searchParameter.Name, searchParameterValue.Value)
			}
		}
	}
	return searchParameterValue, nil
}

func NamedParameterWithSuffix(parameterName string, parameterModifier string, suffix string) string {
	if len(parameterModifier) > 0 {
		return fmt.Sprintf("%s_%s_%s", parameterName, parameterModifier, suffix)
	} else {
		return fmt.Sprintf("%s_%s", parameterName, suffix)
	}
}

// SearchCodeToWhereClause converts a searchCode and searchCodeValue to a where clause and a map of named parameters
func SearchCodeToWhereClause(searchParam SearchParameter, searchParamValue SearchParameterValue, namedParameterSuffix string) (string, map[string]interface{}, error) {

	//add named parameters to the lookup map. Basically, this is a map of all the named parameters that will be used in the where clause we're generating
	searchClauseNamedParams := map[string]interface{}{
		NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix): searchParamValue.Value,
	}
	for k, v := range searchParamValue.SecondaryValues {
		searchClauseNamedParams[NamedParameterWithSuffix(k, searchParam.Modifier, namedParameterSuffix)] = v
	}

	//parse the searchCode and searchCodeValue to determine the correct where clause
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//SIMPLE SEARCH PARAMETERS
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	switch searchParam.Type {
	case SearchParameterTypeNumber, SearchParameterTypeDate:

		if searchParamValue.Prefix == "" || searchParamValue.Prefix == "eq" {
			return fmt.Sprintf("(%s = @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParamValue.Prefix == "lt" || searchParamValue.Prefix == "eb" {
			return fmt.Sprintf("(%s < @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParamValue.Prefix == "le" {
			return fmt.Sprintf("(%s <= @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParamValue.Prefix == "gt" || searchParamValue.Prefix == "sa" {
			return fmt.Sprintf("(%s > @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParamValue.Prefix == "ge" {
			return fmt.Sprintf("(%s >= @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParamValue.Prefix == "ne" {
			return fmt.Sprintf("(%s <> @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParam.Modifier == "ap" {
			return "", nil, fmt.Errorf("search modifier 'ap' not supported for search parameter type %s (%s=%s)", searchParam.Type, searchParam.Name, searchParamValue.Value)
		}

	case SearchParameterTypeUri:
		if searchParam.Modifier == "" {
			return fmt.Sprintf("(%s = @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParam.Modifier == "below" {
			searchClauseNamedParams[NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)] = searchParamValue.Value.(string) + "%" // column starts with "http://example.com"
			return fmt.Sprintf("(%s LIKE @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParam.Modifier == "above" {
			return "", nil, fmt.Errorf("search modifier 'above' not supported for search parameter type %s (%s=%s)", searchParam.Type, searchParam.Name, searchParamValue.Value)
		}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//COMPLEX SEARCH PARAMETERS
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	case SearchParameterTypeString:
		if searchParam.Modifier == "" {
			searchClauseNamedParams[NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)] = searchParamValue.Value.(string) + "%" // "eve" matches "Eve" and "Evelyn"
			return fmt.Sprintf("(%sJson.value LIKE @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParam.Modifier == "exact" {
			// "eve" matches "eve" (not "Eve" or "EVE")
			return fmt.Sprintf("(%sJson.value = @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParam.Modifier == "contains" {
			searchClauseNamedParams[NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)] = "%" + searchParamValue.Value.(string) + "%" // "eve" matches "Eve", "Evelyn" and "Severine"
			return fmt.Sprintf("(%sJson.value LIKE @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)), searchClauseNamedParams, nil
		}
	case SearchParameterTypeQuantity:

		//setup the clause
		var clause string
		if searchParamValue.Prefix == "" || searchParamValue.Prefix == "eq" {
			//TODO: when no prefix is specified, we need to search using BETWEEN (+/- 0.05)
			clause = fmt.Sprintf("%sJson.value ->> '$.value' = @%s", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix))
		} else if searchParamValue.Prefix == "lt" || searchParamValue.Prefix == "eb" {
			clause = fmt.Sprintf("%sJson.value ->> '$.value' < @%s", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix))
		} else if searchParamValue.Prefix == "le" {
			clause = fmt.Sprintf("%sJson.value ->> '$.value' <= @%s", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix))
		} else if searchParamValue.Prefix == "gt" || searchParamValue.Prefix == "sa" {
			clause = fmt.Sprintf("%sJson.value ->> '$.value' > @%s", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix))
		} else if searchParamValue.Prefix == "ge" {
			clause = fmt.Sprintf("%sJson.value ->> '$.value' >= @%s", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix))
		} else if searchParamValue.Prefix == "ne" {
			clause = fmt.Sprintf("%sJson.value ->> '$.value' <> @%s", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix))
		} else if searchParamValue.Prefix == "ap" {
			return "", nil, fmt.Errorf("search modifier 'ap' not supported for search parameter type %s (%s=%s)", searchParam.Type, searchParam.Name, searchParamValue.Value)
		}

		//append the code and/or system clauses (if required)
		//this looks like unnecessary code, however its required to ensure consistent tests
		allowedSecondaryKeys := []string{"code", "system"}

		for _, k := range allowedSecondaryKeys {
			namedParameterKey := fmt.Sprintf("%s%s", searchParam.Name, strings.Title(k))
			if _, ok := searchParamValue.SecondaryValues[namedParameterKey]; ok {
				clause += fmt.Sprintf(` AND %sJson.value ->> '$.%s' = @%s`, searchParam.Name, k, NamedParameterWithSuffix(namedParameterKey, searchParam.Modifier, namedParameterSuffix))
			}
		}

		return fmt.Sprintf("(%s)", clause), searchClauseNamedParams, nil
	case SearchParameterTypeToken:
		//unfortunately we don't know the datatype of this token, however, we're already preprocessed this field in backend/pkg/models/database/generate.go
		// all of the following datatypes will be stored in a JSON object with the following structure:
		// {
		//   "system": "http://example.com",
		//   "code": "example-code",
		//   "text": "example display"
		// }
		// primitive datatypes will not have a system or text, just a code (e.g. "code": true or "code": "http://www.example.com")
		//
		// - Coding - https://hl7.org/fhir/r4/datatypes.html#Coding
		// - Identifier - https://hl7.org/fhir/r4/datatypes.html#Identifier
		// - ContactPoint - https://hl7.org/fhir/r4/datatypes.html#ContactPoint
		// - CodeableConcept - https://hl7.org/fhir/r4/datatypes.html#CodeableConcept
		// - code - https://hl7.org/fhir/r4/datatypes.html#code
		// - boolean - https://hl7.org/fhir/r4/datatypes.html#boolean
		// - uri - https://hl7.org/fhir/r4/datatypes.html#uri
		// - string - https://hl7.org/fhir/r4/datatypes.html#string

		//TODO: support ":text" modifier

		//setup the clause
		clause := []string{}
		if searchParamValue.Value.(string) != "" {
			if searchParam.Modifier == "" {
				clause = append(clause, fmt.Sprintf("%sJson.value ->> '$.code' = @%s", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)))
			} else if searchParam.Modifier == "not" {
				clause = append(clause, fmt.Sprintf("%sJson.value ->> '$.code' <> @%s", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)))
			}
		}

		//append the code and/or system clauses (if required)
		//this looks like unnecessary code, however its required to ensure consistent tests
		allowedSecondaryKeys := []string{"system"}

		for _, k := range allowedSecondaryKeys {
			namedParameterKey := fmt.Sprintf("%s%s", searchParam.Name, strings.Title(k))
			if _, ok := searchParamValue.SecondaryValues[namedParameterKey]; ok {
				clause = append(clause, fmt.Sprintf(`%sJson.value ->> '$.%s' = @%s`, searchParam.Name, k, NamedParameterWithSuffix(namedParameterKey, searchParam.Modifier, namedParameterSuffix)))
			}
		}
		return fmt.Sprintf("(%s)", strings.Join(clause, " AND ")), searchClauseNamedParams, nil

	case SearchParameterTypeKeyword:
		//setup the clause
		return fmt.Sprintf("(%s = @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, searchParam.Modifier, namedParameterSuffix)), searchClauseNamedParams, nil
	case SearchParameterTypeReference:
		return "", nil, fmt.Errorf("search parameter type %s not supported", searchParam.Type)
	}
	return "", searchClauseNamedParams, nil
}

func SearchCodeToFromClause(searchParam SearchParameter) (string, error) {
	//complex search parameters (e.g. token, reference, quantities, special) require the use of `json_*` FROM clauses

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//COMPLEX SEARCH PARAMETERS
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	switch searchParam.Type {
	case SearchParameterTypeQuantity, SearchParameterTypeToken, SearchParameterTypeString:
		//setup the clause
		return fmt.Sprintf("json_each(%s.%s) as %sJson", TABLE_ALIAS, searchParam.Name, searchParam.Name), nil
	}
	return "", nil
}

func AggregationParameterToClause(aggParameter AggregationParameter) string {
	var clause string

	switch aggParameter.Type {
	case SearchParameterTypeQuantity, SearchParameterTypeString:
		//setup the clause
		clause = fmt.Sprintf("(%sJson.value ->> '$.%s')", aggParameter.Name, aggParameter.Modifier)
	case SearchParameterTypeToken:
		//modifier is optional for token types.
		if aggParameter.Modifier != "" {
			clause = fmt.Sprintf("(%sJson.value ->> '$.%s')", aggParameter.Name, aggParameter.Modifier)
		} else {
			//if no modifier is specified, use the system and code to generate the clause
			//((codeJson.value ->> '$.system') || '|' || (codeJson.value ->> '$.code'))
			clause = fmt.Sprintf("((%sJson.value ->> '$.system') || '|' || (%sJson.value ->> '$.code'))", aggParameter.Name, aggParameter.Name)
		}

	default:
		clause = fmt.Sprintf("%s.%s", TABLE_ALIAS, aggParameter.Name)
	}

	if len(aggParameter.Function) > 0 {
		clause = fmt.Sprintf("%s(%s)", aggParameter.Function, clause)
	}
	return clause
}

// ProcessAggregationParameter processes the aggregation parameters which are fields with optional properties:
// Fields that are primitive types (number, uri) must not have any property specified:
// eg. `probability`
//
// Fields that are complex types (token, quantity) must have a property specified:
// eg. `identifier:code`
//
// if the a property is specified, its set as the modifier, and used when generating the SQL query groupBy, orderBy, etc clause
func ProcessAggregationParameter(aggregationFieldWithFn models.QueryResourceAggregation, searchParamTypeLookup map[string]string) (AggregationParameter, error) {
	aggregationParameter := AggregationParameter{
		SearchParameter: SearchParameter{},
		Function:        aggregationFieldWithFn.Function,
	}

	//determine the searchCode searchCodeModifier
	//TODO: this is only applicable to string, token, reference and uri type (however unknown names & modifiers are ignored)
	if aggregationFieldParts := strings.SplitN(aggregationFieldWithFn.Field, ":", 2); len(aggregationFieldParts) == 2 {
		aggregationParameter.Name = aggregationFieldParts[0]
		aggregationParameter.Modifier = aggregationFieldParts[1]
	} else {
		aggregationParameter.Name = aggregationFieldParts[0]
		aggregationParameter.Modifier = ""
	}

	//next, determine the searchCodeType for this Resource (or throw an error if it is unknown)
	searchParamTypeStr, searchParamTypeOk := searchParamTypeLookup[aggregationParameter.Name]
	if !searchParamTypeOk {
		return aggregationParameter, fmt.Errorf("unknown search parameter in aggregation: %s", aggregationParameter.Name)
	} else {
		aggregationParameter.Type = SearchParameterType(searchParamTypeStr)
	}

	//primitive types should not have a modifier, we need to throw an error
	if aggregationParameter.Type == SearchParameterTypeNumber || aggregationParameter.Type == SearchParameterTypeUri || aggregationParameter.Type == SearchParameterTypeKeyword || aggregationParameter.Type == SearchParameterTypeDate {
		if len(aggregationParameter.Modifier) > 0 {
			return aggregationParameter, fmt.Errorf("primitive aggregation parameter %s cannot have a property (%s)", aggregationParameter.Name, aggregationParameter.Modifier)
		}
	} else if aggregationParameter.Type == SearchParameterTypeToken {
		//modifier is optional for token types
	} else {
		//complex types must have a modifier
		if len(aggregationParameter.Modifier) == 0 {
			return aggregationParameter, fmt.Errorf("complex aggregation parameter %s must have a property", aggregationParameter.Name)
		}
	}
	return aggregationParameter, nil
}
