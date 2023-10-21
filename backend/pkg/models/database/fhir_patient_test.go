package database

import (
	"encoding/json"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestFhirPatient_ExtractSearchParameters(t *testing.T) {
	t.Parallel()
	//setup
	//var observationJson map[string]interface{}
	patientBytes, err := os.ReadFile("../../../../frontend/src/lib/fixtures/r4/resources/patient/example1.json")
	require.NoError(t, err)
	//err = json.Unmarshal(patientBytes, &observationJson)
	//require.NoError(t, err)

	//test
	patientModel := FhirPatient{}
	err = patientModel.PopulateAndExtractSearchParameters(patientBytes)

	//assert
	type CodeType struct {
		Code bool `json:"code"`
	}

	var testCode []CodeType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(patientModel.Active), &testCode)
	require.NoError(t, err)
	require.Equal(t, []CodeType{
		{
			Code: true,
		},
	}, testCode)

	var testName []string
	err = json.Unmarshal(json.RawMessage(patientModel.Name), &testName)
	require.NoError(t, err)
	require.Equal(t, []string{
		"Peter James Chalmers", "Jim", "Peter James Windsor",
	}, testName)

	var testAddress []string
	err = json.Unmarshal(json.RawMessage(patientModel.Address), &testAddress)
	require.NoError(t, err)
	require.Equal(t, []string{
		"534 Erewhon St PleasantVille Vic 3999",
	}, testAddress)

	var testTelecom []interface{}
	err = json.Unmarshal(json.RawMessage(patientModel.Telecom), &testTelecom)
	require.NoError(t, err)
	telecom_1 := map[string]interface{}{
		"code": "(03) 5555 6473",
		"system": "phone",
	}
	telecom_2 := map[string]interface{}{
		"code": "(03) 3410 5613",
		"system": "phone",
	}
	telecom_3 := map[string]interface{}{
		"code":"(03) 5555 8834",
		"system": "phone",
	}
	require.Equal(t, []interface{}{
		telecom_1,
		telecom_2,
		telecom_3,
	}, testTelecom)

	var testIdentifier []interface{}
	err = json.Unmarshal(json.RawMessage(patientModel.Identifier), &testIdentifier)
	require.NoError(t, err)
	require.Equal(t, []interface{}{
		map[string]interface{}{
			"code": "12345",
			"system": "urn:oid:1.2.36.146.595.217.0.1",
		},
	}, testIdentifier)

	require.Equal(t, time.Date(1974, 12, 25, 0, 0, 0, 0, time.UTC), *patientModel.Birthdate)

}