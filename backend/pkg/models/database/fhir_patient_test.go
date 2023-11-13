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
	require.Equal(t, []interface{}{
		map[string]interface{}{"code": "(03) 5555 6473","system": "phone"},
		map[string]interface{}{"code": "(03) 3410 5613","system": "phone"},
		map[string]interface{}{"code":"(03) 5555 8834","system": "phone"},
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

	var testGender []interface{}
	err = json.Unmarshal(json.RawMessage(patientModel.Gender), &testGender)
	require.NoError(t, err)
	require.Equal(t, []interface{}{
		map[string]interface{}{"code": "male"},
	}, testGender)
	
	// TODO: Fix the Goja query issues for handling the deceasedBoolean field and them uncomment this unit test
	// var testDeceased []interface{}
	// err = json.Unmarshal(json.RawMessage(patientModel.Deceased), &testDeceased)
	// require.NoError(t, err)
	// require.Equal(t, []interface{}{
	// 	map[string]interface{}{"code": true},
	// }, testDeceased)

	var testfamily []string
	err = json.Unmarshal(json.RawMessage(patientModel.Family), &testfamily)
	require.NoError(t, err)
	require.Equal(t, []string{
		"Chalmers", "Windsor",
	}, testfamily)

	var testPhonetic []string
	err = json.Unmarshal(json.RawMessage(patientModel.Phonetic), &testPhonetic)
	require.NoError(t, err)
	require.Equal(t, []string{
		"Peter James Chalmers","Jim", "Peter James Windsor",
	}, testPhonetic)

	var testOrganisation []interface{}
	err = json.Unmarshal(json.RawMessage(patientModel.Organization), &testOrganisation)
	require.NoError(t, err)
	require.Equal(t, []interface{}{
		map[string]interface{}{
			"reference": "Organization/1",
			"__path__": "Patient.managingOrganization",
		},
	}, testOrganisation)


	require.Equal(t, time.Date(1974, 12, 25, 0, 0, 0, 0, time.UTC), *patientModel.Birthdate)

}
