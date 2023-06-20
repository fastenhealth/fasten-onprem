package database

import (
	"context"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	databaseModel "github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models/database"
	"github.com/iancoleman/strcase"
	"golang.org/x/exp/maps"
	"golang.org/x/exp/slices"
	"strconv"
	"strings"
	"time"
)

type SearchParameterType string

const (
	SearchParameterTypeNumber    SearchParameterType = "number"
	SearchParameterTypeDate      SearchParameterType = "date"
	SearchParameterTypeString    SearchParameterType = "string"
	SearchParameterTypeToken     SearchParameterType = "token"
	SearchParameterTypeReference SearchParameterType = "reference"
	SearchParameterTypeUri       SearchParameterType = "uri"
	SearchParameterTypeComposite SearchParameterType = "composite"
	SearchParameterTypeQuantity  SearchParameterType = "quantity"
	SearchParameterTypeSpecial   SearchParameterType = "special"
)

const TABLE_ALIAS = "fhir"

func (sr *SqliteRepository) QueryResources(ctx context.Context, query models.QueryResource) ([]models.ResourceFhir, error) {
	//todo, until we actually parse the select statement, we will just return all resources based on "from"

	//SECURITY: this is required to ensure that only valid resource types are queried (since it's controlled by the user)
	if !slices.Contains(databaseModel.GetAllowedResourceTypes(), query.From) {
		return nil, fmt.Errorf("invalid resource type %s", query.From)
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
	currentUser, currentUserErr := sr.GetCurrentUser(ctx)
	if currentUserErr != nil {
		return nil, currentUserErr
	}
	whereNamedParameters["user_id"] = currentUser.ID.String()
	whereClauses = append(whereClauses, "(user_id = @user_id)")

	results := []models.ResourceFhir{}
	clientResp := sr.GormClient.
		Select(fmt.Sprintf("%s.*", TABLE_ALIAS)).
		Where(strings.Join(whereClauses, " AND "), whereNamedParameters).
		Group(fmt.Sprintf("%s.id", TABLE_ALIAS)).
		Table(strings.Join(fromClauses, ", ")).
		Find(&results)

	return results, clientResp.Error
}

/// INTERNAL functionality. These functions are exported for testing, but are not available in the Interface

type SearchParameter struct {
	Name     string
	Type     SearchParameterType
	Modifier string
}

//Items in the SearchParameterValueOperatorTree are AND'd together, and items within each SearchParameterValueOperatorTree are OR'd together
//For example, the following would be AND'd together, and then OR'd with the next SearchParameterValueOperatorTree
// {
//  {SearchParameterValue{Value: "foo"}, SearchParameterValue{Value: "bar"}}
//  {SearchParameterValue{Value: "baz"}},
// }
//This would result in the following SQL:
//  (value = "foo" OR value = "bar") AND (value = "baz")
type SearchParameterValueOperatorTree [][]SearchParameterValue

type SearchParameterValue struct {
	Prefix          string
	Value           interface{}
	SecondaryValues map[string]interface{}
}

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

	//if this is a token search parameter with a modifier, we need to throw an error
	if searchParameter.Type == SearchParameterTypeToken && len(searchParameter.Modifier) > 0 {
		return searchParameter, fmt.Errorf("token search parameter %s cannot have a modifier", searchParameter.Name)
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
func ProcessSearchParameterValueIntoOperatorTree(searchParameter SearchParameter, searchParamCodeValueOrValuesWithPrefix interface{}) (SearchParameterValueOperatorTree, error) {

	searchParamCodeValuesWithPrefix := []string{}
	switch v := searchParamCodeValueOrValuesWithPrefix.(type) {
	case string:
		searchParamCodeValuesWithPrefix = append(searchParamCodeValuesWithPrefix, v)
		break
	case []string:
		searchParamCodeValuesWithPrefix = v
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

func ProcessSearchParameterValue(searchParameter SearchParameter, searchValueWithPrefix string) (SearchParameterValue, error) {
	searchParameterValue := SearchParameterValue{
		SecondaryValues: map[string]interface{}{},
		Value:           searchValueWithPrefix,
	}
	if (searchParameter.Type == SearchParameterTypeString || searchParameter.Type == SearchParameterTypeUri) && len(searchParameterValue.Value.(string)) == 0 {
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
			if len(searchParameterValueParts[0]) > 0 {
				searchParameterValue.SecondaryValues[searchParameter.Name+"System"] = searchParameterValueParts[0]
			}
			if len(searchParameterValueParts[1]) > 0 {
				searchParameterValue.Value = searchParameterValueParts[1]
			}
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

func NamedParameterWithSuffix(parameterName string, suffix string) string {
	return fmt.Sprintf("%s_%s", parameterName, suffix)
}

func SearchCodeToWhereClause(searchParam SearchParameter, searchParamValue SearchParameterValue, namedParameterSuffix string) (string, map[string]interface{}, error) {

	//add named parameters to the lookup map. Basically, this is a map of all the named parameters that will be used in the where clause we're generating
	searchClauseNamedParams := map[string]interface{}{
		NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix): searchParamValue.Value,
	}
	for k, v := range searchParamValue.SecondaryValues {
		searchClauseNamedParams[NamedParameterWithSuffix(k, namedParameterSuffix)] = v
	}

	//parse the searchCode and searchCodeValue to determine the correct where clause
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//SIMPLE SEARCH PARAMETERS
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	switch searchParam.Type {
	case SearchParameterTypeNumber, SearchParameterTypeDate:

		if searchParamValue.Prefix == "" || searchParamValue.Prefix == "eq" {
			return fmt.Sprintf("(%s = @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParamValue.Prefix == "lt" || searchParamValue.Prefix == "eb" {
			return fmt.Sprintf("(%s < @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParamValue.Prefix == "le" {
			return fmt.Sprintf("(%s <= @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParamValue.Prefix == "gt" || searchParamValue.Prefix == "sa" {
			return fmt.Sprintf("(%s > @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParamValue.Prefix == "ge" {
			return fmt.Sprintf("(%s >= @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParamValue.Prefix == "ne" {
			return fmt.Sprintf("(%s <> @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParam.Modifier == "ap" {
			return "", nil, fmt.Errorf("search modifier 'ap' not supported for search parameter type %s (%s=%s)", searchParam.Type, searchParam.Name, searchParamValue.Value)
		}
	case SearchParameterTypeString:
		if searchParam.Modifier == "" {
			searchClauseNamedParams[NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix)] = searchParamValue.Value.(string) + "%" // "eve" matches "Eve" and "Evelyn"
			return fmt.Sprintf("(%s LIKE @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParam.Modifier == "exact" {
			// "eve" matches "eve" (not "Eve" or "EVE")
			return fmt.Sprintf("(%s = @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParam.Modifier == "contains" {
			searchClauseNamedParams[NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix)] = "%" + searchParamValue.Value.(string) + "%" // "eve" matches "Eve", "Evelyn" and "Severine"
			return fmt.Sprintf("(%s LIKE @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix)), searchClauseNamedParams, nil
		}
	case SearchParameterTypeUri:
		if searchParam.Modifier == "" {
			return fmt.Sprintf("(%s = @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParam.Modifier == "below" {
			searchClauseNamedParams[NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix)] = searchParamValue.Value.(string) + "%" // column starts with "http://example.com"
			return fmt.Sprintf("(%s LIKE @%s)", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix)), searchClauseNamedParams, nil
		} else if searchParam.Modifier == "above" {
			return "", nil, fmt.Errorf("search modifier 'above' not supported for search parameter type %s (%s=%s)", searchParam.Type, searchParam.Name, searchParamValue.Value)
		}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//COMPLEX SEARCH PARAMETERS
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	case SearchParameterTypeQuantity:

		//setup the clause
		var clause string
		if searchParamValue.Prefix == "" || searchParamValue.Prefix == "eq" {
			//TODO: when no prefix is specified, we need to search using BETWEEN (+/- 0.05)
			clause = fmt.Sprintf("%sJson.value ->> '$.value' = @%s", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix))
		} else if searchParamValue.Prefix == "lt" || searchParamValue.Prefix == "eb" {
			clause = fmt.Sprintf("%sJson.value ->> '$.value' < @%s", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix))
		} else if searchParamValue.Prefix == "le" {
			clause = fmt.Sprintf("%sJson.value ->> '$.value' <= @%s", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix))
		} else if searchParamValue.Prefix == "gt" || searchParamValue.Prefix == "sa" {
			clause = fmt.Sprintf("%sJson.value ->> '$.value' > @%s", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix))
		} else if searchParamValue.Prefix == "ge" {
			clause = fmt.Sprintf("%sJson.value ->> '$.value' >= @%s", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix))
		} else if searchParamValue.Prefix == "ne" {
			clause = fmt.Sprintf("%sJson.value ->> '$.value' <> @%s", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix))
		} else if searchParamValue.Prefix == "ap" {
			return "", nil, fmt.Errorf("search modifier 'ap' not supported for search parameter type %s (%s=%s)", searchParam.Type, searchParam.Name, searchParamValue.Value)
		}

		//append the code and/or system clauses (if required)
		//this looks like unnecessary code, however its required to ensure consistent tests
		allowedSecondaryKeys := []string{"code", "system"}

		for _, k := range allowedSecondaryKeys {
			namedParameterKey := fmt.Sprintf("%s%s", searchParam.Name, strings.Title(k))
			if _, ok := searchParamValue.SecondaryValues[namedParameterKey]; ok {
				clause += fmt.Sprintf(` AND %sJson.value ->> '$.%s' = @%s`, searchParam.Name, k, NamedParameterWithSuffix(namedParameterKey, namedParameterSuffix))
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
		clause := fmt.Sprintf("%sJson.value ->> '$.code' = @%s", searchParam.Name, NamedParameterWithSuffix(searchParam.Name, namedParameterSuffix))

		//append the code and/or system clauses (if required)
		//this looks like unnecessary code, however its required to ensure consistent tests
		allowedSecondaryKeys := []string{"system"}

		for _, k := range allowedSecondaryKeys {
			namedParameterKey := fmt.Sprintf("%s%s", searchParam.Name, strings.Title(k))
			if _, ok := searchParamValue.SecondaryValues[namedParameterKey]; ok {
				clause += fmt.Sprintf(` AND %sJson.value ->> '$.%s' = @%s`, searchParam.Name, k, NamedParameterWithSuffix(namedParameterKey, namedParameterSuffix))
			}
		}
		return fmt.Sprintf("(%s)", clause), searchClauseNamedParams, nil

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
	case SearchParameterTypeQuantity, SearchParameterTypeToken:
		//setup the clause
		return fmt.Sprintf("json_each(%s.%s) as %sJson", TABLE_ALIAS, searchParam.Name, searchParam.Name), nil
	}
	return "", nil
}
