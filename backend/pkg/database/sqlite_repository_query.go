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

func (sr *SqliteRepository) QueryResources(ctx context.Context, query models.QueryResource) (interface{}, error) {
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
	for searchParamCodeWithModifier, searchParamCodeValue := range query.Where {
		searchParameter, err := ProcessSearchParameter(searchParamCodeWithModifier, searchCodeToTypeLookup)
		if err != nil {
			return nil, err
		}
		searchParameterValue, err := ProcessSearchParameterValue(searchParameter, searchParamCodeValue)
		if err != nil {
			return nil, err
		}

		if searchParameter.Type == SearchParameterTypeToken && len(query.Where) > 1 {
			//token query is incredibly complicated, and we cannot support multiple token queries at the same time.
			//TODO: this constraint should be fixed in the future.
			return nil, fmt.Errorf("token search parameter %s cannot be used with other search parameters", searchParameter.Name)
		}

		whereClause, clauseNamedParameters, err := SearchCodeToWhereClause(searchParameter, searchParameterValue)
		if err != nil {
			return nil, err
		}
		//add generated where clause to the list, and add the named parameters to the map of existing named parameters
		whereClauses = append(whereClauses, whereClause)
		maps.Copy(whereNamedParameters, clauseNamedParameters)

		fromClause, err := SearchCodeToFromClause(searchParameter, searchParameterValue)
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
	whereClauses = append(whereClauses, "user_id = @user_id")

	results := []map[string]interface{}{}
	clientResp := sr.GormClient.Where(strings.Join(whereClauses, " AND "), whereNamedParameters).Table(strings.Join(fromClauses, ", ")).Find(&results)

	return results, clientResp.Error
}

/// INTERNAL functionality. These functions are exported for testing, but are not available in the Interface

type SearchParameter struct {
	Name     string
	Type     SearchParameterType
	Modifier string
}

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

func SearchCodeToWhereClause(searchParam SearchParameter, searchParamValue SearchParameterValue) (string, map[string]interface{}, error) {

	//add named parameters to the lookup map. Basically, this is a map of all the named parameters that will be used in the where clause we're generating
	searchClauseNamedParams := map[string]interface{}{
		searchParam.Name: searchParamValue.Value,
	}
	for k, v := range searchParamValue.SecondaryValues {
		searchClauseNamedParams[k] = v
	}

	//parse the searchCode and searchCodeValue to determine the correct where clause
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//SIMPLE SEARCH PARAMETERS
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	switch searchParam.Type {
	case SearchParameterTypeNumber, SearchParameterTypeDate:

		if searchParamValue.Prefix == "" || searchParamValue.Prefix == "eq" {
			return fmt.Sprintf("%s = @%s", searchParam.Name, searchParam.Name), searchClauseNamedParams, nil
		} else if searchParamValue.Prefix == "lt" || searchParamValue.Prefix == "eb" {
			return fmt.Sprintf("%s < @%s", searchParam.Name, searchParam.Name), searchClauseNamedParams, nil
		} else if searchParamValue.Prefix == "le" {
			return fmt.Sprintf("%s <= @%s", searchParam.Name, searchParam.Name), searchClauseNamedParams, nil
		} else if searchParamValue.Prefix == "gt" || searchParamValue.Prefix == "sa" {
			return fmt.Sprintf("%s > @%s", searchParam.Name, searchParam.Name), searchClauseNamedParams, nil
		} else if searchParamValue.Prefix == "ge" {
			return fmt.Sprintf("%s >= @%s", searchParam.Name, searchParam.Name), searchClauseNamedParams, nil
		} else if searchParamValue.Prefix == "ne" {
			return fmt.Sprintf("%s <> @%s", searchParam.Name, searchParam.Name), searchClauseNamedParams, nil
		} else if searchParam.Modifier == "ap" {
			return "", nil, fmt.Errorf("search modifier 'ap' not supported for search parameter type %s (%s=%s)", searchParam.Type, searchParam.Name, searchParamValue.Value)
		}
	case SearchParameterTypeString:
		if searchParam.Modifier == "" {
			searchClauseNamedParams[searchParam.Name] = searchParamValue.Value.(string) + "%" // "eve" matches "Eve" and "Evelyn"
			return fmt.Sprintf("%s LIKE @%s", searchParam.Name, searchParam.Name), searchClauseNamedParams, nil
		} else if searchParam.Modifier == "exact" {
			// "eve" matches "eve" (not "Eve" or "EVE")
			return fmt.Sprintf("%s = @%s", searchParam.Name, searchParam.Name), searchClauseNamedParams, nil
		} else if searchParam.Modifier == "contains" {
			searchClauseNamedParams[searchParam.Name] = "%" + searchParamValue.Value.(string) + "%" // "eve" matches "Eve", "Evelyn" and "Severine"
			return fmt.Sprintf("%s LIKE @%s", searchParam.Name, searchParam.Name), searchClauseNamedParams, nil
		}
	case SearchParameterTypeUri:
		if searchParam.Modifier == "" {
			return fmt.Sprintf("%s = @%s", searchParam.Name, searchParam.Name), searchClauseNamedParams, nil
		} else if searchParam.Modifier == "below" {
			searchClauseNamedParams[searchParam.Name] = searchParamValue.Value.(string) + "%" // column starts with "http://example.com"
			return fmt.Sprintf("%s LIKE @%s", searchParam.Name, searchParam.Name), searchClauseNamedParams, nil
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
			clause = fmt.Sprintf("%sJson.value ->> '$.value' = @%s", searchParam.Name, searchParam.Name)
		} else if searchParamValue.Prefix == "lt" || searchParamValue.Prefix == "eb" {
			clause = fmt.Sprintf("%sJson.value ->> '$.value' < @%s", searchParam.Name, searchParam.Name)
		} else if searchParamValue.Prefix == "le" {
			clause = fmt.Sprintf("%sJson.value ->> '$.value' <= @%s", searchParam.Name, searchParam.Name)
		} else if searchParamValue.Prefix == "gt" || searchParamValue.Prefix == "sa" {
			clause = fmt.Sprintf("%sJson.value ->> '$.value' > @%s", searchParam.Name, searchParam.Name)
		} else if searchParamValue.Prefix == "ge" {
			clause = fmt.Sprintf("%sJson.value ->> '$.value' >= @%s", searchParam.Name, searchParam.Name)
		} else if searchParamValue.Prefix == "ne" {
			clause = fmt.Sprintf("%sJson.value ->> '$.value' <> @%s", searchParam.Name, searchParam.Name)
		} else if searchParamValue.Prefix == "ap" {
			return "", nil, fmt.Errorf("search modifier 'ap' not supported for search parameter type %s (%s=%s)", searchParam.Type, searchParam.Name, searchParamValue.Value)
		}

		//append the code and/or system clauses (if required)
		//this looks like unnecessary code, however its required to ensure consistent tests
		allowedSecondaryKeys := []string{"code", "system"}

		for _, k := range allowedSecondaryKeys {
			namedParameterKey := fmt.Sprintf("%s%s", searchParam.Name, strings.Title(k))
			if _, ok := searchParamValue.SecondaryValues[namedParameterKey]; ok {
				clause += fmt.Sprintf(` AND %sJson.value ->> '$.%s' = @%s`, searchParam.Name, k, namedParameterKey)
			}
		}

		return clause, searchClauseNamedParams, nil
	case SearchParameterTypeToken:
		//unfortunately we don't know the datatype of this token, so we need to check all possible datatypes
		// - Coding - https://hl7.org/fhir/r4/datatypes.html#Coding
		// - Identifier - https://hl7.org/fhir/r4/datatypes.html#Identifier
		// - ContactPoint - https://hl7.org/fhir/r4/datatypes.html#ContactPoint
		// - CodeableConcept - https://hl7.org/fhir/r4/datatypes.html#CodeableConcept

		//TODO: we should support these as well.
		// - code - https://hl7.org/fhir/r4/datatypes.html#code
		// - boolean - https://hl7.org/fhir/r4/datatypes.html#boolean
		// - uri - https://hl7.org/fhir/r4/datatypes.html#uri
		// - string - https://hl7.org/fhir/r4/datatypes.html#string

		//theres's only one secondary key we care about (System), so we can just check for that
		namedParameterSystemKey := fmt.Sprintf("%sSystem", searchParam.Name)
		clauses := []string{}

		//Coding clause
		codingClause := fmt.Sprintf("%sJson.value ->> '$.code' = @%s", searchParam.Name, searchParam.Name)
		if _, ok := searchParamValue.SecondaryValues[namedParameterSystemKey]; ok {
			codingClause += fmt.Sprintf(` AND %sJson.value ->> '$.system' = @%s`, searchParam.Name, namedParameterSystemKey)
		}
		clauses = append(clauses, codingClause)

		//Identifier clause
		identifierClause := fmt.Sprintf("%sJson.value ->> '$.value' = @%s", searchParam.Name, searchParam.Name)
		if _, ok := searchParamValue.SecondaryValues[namedParameterSystemKey]; ok {
			identifierClause += fmt.Sprintf(` AND %sJson.value ->> '$.system' = @%s`, searchParam.Name, namedParameterSystemKey)
		}
		clauses = append(clauses, identifierClause)

		//ContactPoint clause
		contactPointClause := fmt.Sprintf("%sJson.value ->> '$.value' = @%s", searchParam.Name, searchParam.Name)
		//no system for contact point
		clauses = append(clauses, contactPointClause)

		//CodeableConcept clause (this is the most complicated, as it has a nested coding)
		codeableConceptClause := fmt.Sprintf("%sCodeableConceptJson.value ->> '$.code' = @%s", searchParam.Name, searchParam.Name)
		if _, ok := searchParamValue.SecondaryValues[namedParameterSystemKey]; ok {
			codeableConceptClause += fmt.Sprintf(` AND %sCodeableConceptJson.value ->> '$.system' = @%s`, searchParam.Name, namedParameterSystemKey)
		}
		clauses = append(clauses, codeableConceptClause)
		//SECURITY: double (( and )) are required to prevent SQL injection/user_id clause being ignored.
		return fmt.Sprintf("((%s))", strings.Join(clauses, ") OR (")), searchClauseNamedParams, nil

	case SearchParameterTypeReference:
		return "", nil, fmt.Errorf("search parameter type %s not supported", searchParam.Type)
	}
	return "", searchClauseNamedParams, nil
}

func SearchCodeToFromClause(searchParam SearchParameter, searchParamValue SearchParameterValue) (string, error) {
	//complex search parameters (e.g. token, reference, quantities, special) require the use of `json_*` FROM clauses

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//COMPLEX SEARCH PARAMETERS
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	switch searchParam.Type {
	case SearchParameterTypeQuantity:
		//setup the clause
		return fmt.Sprintf("json_each(%s.%s) as %sJson", TABLE_ALIAS, searchParam.Name, searchParam.Name), nil
	case SearchParameterTypeToken:
		//unfortunately we don't know the datatype of this token, so we need to check multiple possible datatypes
		return fmt.Sprintf("json_each(%s.%s) as %sJson, json_each(json_extract(%sJson.value, '$.coding')) as %sCodeableConceptJson",
			TABLE_ALIAS, searchParam.Name, searchParam.Name,
			searchParam.Name, searchParam.Name,
		), nil
	}
	return "", nil
}
