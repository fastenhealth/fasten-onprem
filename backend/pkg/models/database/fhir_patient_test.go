package database

import (
	"encoding/json"
	"github.com/stretchr/testify/require"
	"os"
	"testing"
	"time"
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

	require.Equal(t, time.Date(1974, 12, 25, 0, 0, 0, 0, time.UTC), patientModel.Birthdate)

}
