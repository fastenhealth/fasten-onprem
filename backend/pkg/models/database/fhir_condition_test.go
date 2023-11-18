package database

import (
	"encoding/json"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

type SearchParameterTokenType struct {
	System string `json:"system"`
	Code   string `json:"code"`
}

type SearchParameterStringType []string

func TestFhirCondition_ExtractSearchParameters(t *testing.T) {
	t.Parallel()
	//setup
	//var observationJson map[string]interface{}
	conditionBytes, err := os.ReadFile("../../../../frontend/src/lib/fixtures/r4/resources/condition/example1.json")
	require.NoError(t, err)
	//err = json.Unmarshal(conditionBytes, &observationJson)
	//require.NoError(t, err)

	//test
	conditionModel := FhirCondition{}
	err = conditionModel.PopulateAndExtractSearchParameters(conditionBytes)

	//assert

	var testClinicalStatus []SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(conditionModel.ClinicalStatus), &testClinicalStatus)
	require.NoError(t, err)
	require.Equal(t, []SearchParameterTokenType{
		{
			Code:   "active",
			System: "http://terminology.hl7.org/CodeSystem/condition-clinical",
		},
	}, testClinicalStatus)

	var testVerificationStatus []SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(conditionModel.VerificationStatus), &testVerificationStatus)
	require.NoError(t, err)
	require.Equal(t, []SearchParameterTokenType{
		{
			Code:   "confirmed",
			System: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
		},
	}, testVerificationStatus)

	var testCategory []SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(conditionModel.Category), &testCategory)
	require.NoError(t, err)
	require.Equal(t, []SearchParameterTokenType{
		{
			Code:   "encounter-diagnosis",
			System: "http://terminology.hl7.org/CodeSystem/condition-category",
		},
		{
			Code:   "439401001",
			System: "http://snomed.info/sct",
		},
	}, testCategory)

	var testSeverity []SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(conditionModel.Severity), &testSeverity)
	require.NoError(t, err)
	require.Equal(t, []SearchParameterTokenType{
		{
			Code:   "24484000",
			System: "http://snomed.info/sct",
		},
	}, testSeverity)

	var testCodeSystem []SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(conditionModel.Code), &testCodeSystem)
	require.NoError(t, err)
	require.Equal(t, []SearchParameterTokenType{
		{
			Code:   "39065001",
			System: "http://snomed.info/sct",
		},
	}, testCodeSystem)

	var testBodySite []SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(conditionModel.BodySite), &testBodySite)
	require.NoError(t, err)
	require.Equal(t, []SearchParameterTokenType{
		{
			Code:   "49521004",
			System: "http://snomed.info/sct",
		},
	}, testBodySite)

	require.Equal(t, time.Date(2012, 05, 24, 0, 0, 0, 0, time.UTC), *conditionModel.OnsetDate)

}

func TestFhirCondition2_ExtractSearchParameters(t *testing.T) {
	t.Parallel()
	//setup
	//var observationJson map[string]interface{}
	conditionBytes, err := os.ReadFile("../../../../frontend/src/lib/fixtures/r4/resources/condition/example2.json")
	require.NoError(t, err)
	//err = json.Unmarshal(conditionBytes, &observationJson)
	//require.NoError(t, err)

	//test
	conditionModel := FhirCondition{}
	err = conditionModel.PopulateAndExtractSearchParameters(conditionBytes)

	//assert

	var testClinicalStatus []SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(conditionModel.ClinicalStatus), &testClinicalStatus)
	require.NoError(t, err)
	require.Equal(t, []SearchParameterTokenType{
		{
			Code:   "active",
			System: "http://terminology.hl7.org/CodeSystem/condition-clinical",
		},
	}, testClinicalStatus)

	var testVerificationStatus []SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(conditionModel.VerificationStatus), &testVerificationStatus)
	require.NoError(t, err)
	require.Equal(t, []SearchParameterTokenType{
		{
			Code:   "confirmed",
			System: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
		},
	}, testVerificationStatus)

	var testCategory []SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(conditionModel.Category), &testCategory)
	require.NoError(t, err)
	require.Equal(t, []SearchParameterTokenType{
		{
			Code:   "problem-list-item",
			System: "http://terminology.hl7.org/CodeSystem/condition-category",
		},
	}, testCategory)

	var testSeverity []SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(conditionModel.Severity), &testSeverity)
	require.NoError(t, err)
	require.Equal(t, []SearchParameterTokenType{
		{
			Code:   "255604002",
			System: "http://snomed.info/sct",
		},
	}, testSeverity)

	var testOnsetInfo SearchParameterStringType
	err = json.Unmarshal(json.RawMessage(conditionModel.OnsetInfo), &testOnsetInfo)
	require.NoError(t, err)

	require.Equal(t, SearchParameterStringType{"approximately November 2012"}, testOnsetInfo)

}
