package database

import (
	"encoding/json"
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestFhirObservation_ExtractSearchParameters(t *testing.T) {
	t.Parallel()
	//setup
	//var observationJson map[string]interface{}
	observationBytes, err := os.ReadFile("../../../../frontend/src/lib/fixtures/r4/resources/observation/example1.json")
	require.NoError(t, err)
	//err = json.Unmarshal(observationBytes, &observationJson)
	//require.NoError(t, err)

	//test
	observationModel := FhirObservation{}
	err = observationModel.PopulateAndExtractSearchParameters(observationBytes)

	//assert
	type CodeSystemType struct {
		System string `json:"system"`
		Code   string `json:"code"`
	}
	var testCodeSystem []CodeSystemType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(observationModel.Code), &testCodeSystem)
	require.NoError(t, err)
	require.Equal(t, []CodeSystemType{
		{
			Code:   "29463-7",
			System: "http://loinc.org",
		},
		{
			Code:   "3141-9",
			System: "http://loinc.org",
		},
		{
			Code:   "27113001",
			System: "http://snomed.info/sct",
		},
		{
			Code:   "body-weight",
			System: "http://acme.org/devices/clinical-codes",
		},
	}, testCodeSystem)

	var testCategory []CodeSystemType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(observationModel.Category), &testCategory)
	require.NoError(t, err)
	require.Equal(t, []CodeSystemType{
		{
			Code:   "vital-signs",
			System: "http://terminology.hl7.org/CodeSystem/observation-category",
		},
	}, testCategory)

	var testStatus []interface{}
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(observationModel.Status), &testStatus)
	require.NoError(t, err)
	require.Equal(t, []interface{}{
		map[string]interface{}{
			"code": "final",
		},
	}, testStatus)
}