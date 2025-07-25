package database

import (
	"encoding/json"
	"github.com/stretchr/testify/require"
	"os"
	"testing"
	"time"
)

func TestFhirCarePlan_ExtractSearchParameters(t *testing.T) {
	t.Parallel()
	//setup
	carePlanBytes, err := os.ReadFile("../../../../frontend/src/lib/fixtures/r4/resources/carePlan/heartOperationPlan.json")
	require.NoError(t, err)
	//test
	carePlanModel := FhirCarePlan{}
	err = carePlanModel.PopulateAndExtractSearchParameters(carePlanBytes)

	//assert

	var testActivityCode SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(carePlanModel.ActivityCode), &testActivityCode)
	require.NoError(t, err)
	require.Equal(t, SearchParameterTokenType{
		{
			System: "http://snomed.info/sct",
			Code:   "64915003",
			Text:   "Operation on heart",
		},
	}, testActivityCode)

	require.Equal(t, "2011-06-27T09:30:10+01:00", carePlanModel.ActivityDate.Format(time.RFC3339))

	var testCareTeam SearchParameterReferenceType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(carePlanModel.CareTeam), &testCareTeam)
	require.NoError(t, err)
	require.Equal(t, SearchParameterReferenceType{
		{
			Reference: "#careteam",
		},
	}, testCareTeam)

	require.Nil(t, carePlanModel.Category)

	var testCondition SearchParameterReferenceType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(carePlanModel.Condition), &testCondition)
	require.NoError(t, err)
	require.Equal(t, SearchParameterReferenceType{
		{
			Reference: "Condition/f201",
			Display:   "?????",
		},
	}, testCondition)

	require.Equal(t, "2011-06-26T00:00:00Z", carePlanModel.Date.Format(time.RFC3339)) //TODO date periods are not handled correctly

	var testGoal SearchParameterReferenceType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(carePlanModel.Goal), &testGoal)
	require.NoError(t, err)
	require.Equal(t, SearchParameterReferenceType{
		{
			Reference: "#goal",
		},
	}, testGoal)

	var testIntent SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(carePlanModel.Intent), &testIntent)
	require.NoError(t, err)
	require.Equal(t, SearchParameterTokenType{
		{
			Code: "plan",
		},
	}, testIntent)
}
