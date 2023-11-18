package database

import (
	"encoding/json"
	"github.com/stretchr/testify/require"
	"os"
	"testing"
	"time"
)

func TestFhirEncounter_ExtractSearchParameters(t *testing.T) {
	t.Parallel()
	//setup
	//var observationJson map[string]interface{}
	encounterBytes, err := os.ReadFile("../../../../frontend/src/lib/fixtures/r4/resources/encounter/example1.json")
	require.NoError(t, err)

	//test
	encounterModel := FhirEncounter{}
	err = encounterModel.PopulateAndExtractSearchParameters(encounterBytes)

	//assert
	var testStatus SearchParameterTokenType
	err = json.Unmarshal(json.RawMessage(encounterModel.Status), &testStatus)
	require.NoError(t, err)
	require.Equal(t, SearchParameterTokenType{{Code: "in-progress"}}, testStatus)
}

func TestFhirEncounter2_ExtractSearchParameters(t *testing.T) {
	t.Parallel()
	//setup
	//var observationJson map[string]interface{}
	encounterBytes, err := os.ReadFile("../../../../frontend/src/lib/fixtures/r4/resources/encounter/example2.json")
	require.NoError(t, err)

	//test
	encounterModel := FhirEncounter{}
	err = encounterModel.PopulateAndExtractSearchParameters(encounterBytes)

	//assert
	var testStatus SearchParameterTokenType
	err = json.Unmarshal(json.RawMessage(encounterModel.Status), &testStatus)
	require.NoError(t, err)
	require.Equal(t, SearchParameterTokenType{{Code: "finished"}}, testStatus)

	require.Equal(t, time.Date(2015, time.January, 17, 16, 0, 0, 0, time.UTC), *encounterModel.Date)

}
