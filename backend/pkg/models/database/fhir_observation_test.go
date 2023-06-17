package database

import (
	"encoding/json"
	"github.com/stretchr/testify/require"
	"os"
	"testing"
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
	require.NoError(t, err)
	parsed, err := json.MarshalIndent(observationModel.Code, "", "  ")
	require.NoError(t, err)
	require.Equal(t, "", string(parsed))
}
