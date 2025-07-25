package database

import (
	"encoding/json"
	"github.com/stretchr/testify/require"
	"os"
	"testing"
	"time"
)

func TestFhirAllergyIntolerance_ExtractSearchParameters(t *testing.T) {
	t.Parallel()
	//setup
	//var observationJson map[string]interface{}
	allergyIntoleranceBytes, err := os.ReadFile("../../../../frontend/src/lib/fixtures/r4/resources/allergyIntolerance/example1.json")
	require.NoError(t, err)
	//err = json.Unmarshal(allergyIntoleranceBytes, &observationJson)
	//require.NoError(t, err)

	//test
	allergyIntoleranceModel := FhirAllergyIntolerance{}
	err = allergyIntoleranceModel.PopulateAndExtractSearchParameters(allergyIntoleranceBytes)

	//assert

	var testClinicalStatus SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(allergyIntoleranceModel.ClinicalStatus), &testClinicalStatus)
	require.NoError(t, err)
	require.Equal(t, SearchParameterTokenType{
		{
			Code:   "active",
			Text:   "Active",
			System: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
		},
	}, testClinicalStatus)

	var testVerificationStatus SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(allergyIntoleranceModel.VerificationStatus), &testVerificationStatus)
	require.NoError(t, err)
	require.Equal(t, SearchParameterTokenType{
		{
			Code:   "confirmed",
			Text:   "Confirmed",
			System: "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
		},
	}, testVerificationStatus)

	require.NotEmpty(t, allergyIntoleranceModel.Type)

	var testType SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(allergyIntoleranceModel.Type), &testType)
	require.NoError(t, err)
	require.Equal(t, SearchParameterTokenType{
		{
			Code: "allergy",
		},
	}, testType)

	var testCategory SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(allergyIntoleranceModel.Category), &testCategory)
	require.NoError(t, err)
	require.Equal(t, SearchParameterTokenType{
		{
			Code: "food",
		},
	}, testCategory)

	var testCriticality SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(allergyIntoleranceModel.Criticality), &testCriticality)
	require.NoError(t, err)
	require.Equal(t, SearchParameterTokenType{
		{
			Code: "high",
		},
	}, testCriticality)

	var testCodeSystem SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(allergyIntoleranceModel.Code), &testCodeSystem)
	require.NoError(t, err)
	require.Equal(t, SearchParameterTokenType{
		{
			Code:   "227493005",
			System: "http://snomed.info/sct",
			Text:   "Cashew nuts",
		},
		{
			System: "http://www.nlm.nih.gov/research/umls/rxnorm",
			Code:   "1160593",
			Text:   "cashew nut allergenic extract Injectable Product",
		},
	}, testCodeSystem)

	require.Equal(t, "2012-06-12T00:00:00Z", allergyIntoleranceModel.Onset.Format(time.RFC3339))

	var testRecorder SearchParameterReferenceType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(allergyIntoleranceModel.Recorder), &testRecorder)
	require.NoError(t, err)
	require.Equal(t, SearchParameterReferenceType{
		{
			Reference: "Practitioner/example",
		},
	}, testRecorder)

	var testAsserter SearchParameterReferenceType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(allergyIntoleranceModel.Asserter), &testAsserter)
	require.NoError(t, err)
	require.Equal(t, SearchParameterReferenceType{
		{
			Reference: "Patient/example",
		},
	}, testAsserter)

	require.Equal(t, "2012-06", allergyIntoleranceModel.LastDate.Format("2006-01"))

	var testSeverity SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(allergyIntoleranceModel.Severity), &testSeverity)
	require.NoError(t, err)
	require.Equal(t, SearchParameterTokenType{
		{
			Code: "severe",
		},
		{
			Code: "moderate",
		},
	}, testSeverity)

	var testManifestation SearchParameterTokenType
	require.NoError(t, err)
	err = json.Unmarshal(json.RawMessage(allergyIntoleranceModel.Manifestation), &testManifestation)
	require.NoError(t, err)
	require.Equal(t, SearchParameterTokenType{
		{
			System: "http://snomed.info/sct",
			Code:   "39579001",
			Text:   "Anaphylactic reaction",
		},
		{
			System: "http://snomed.info/sct",
			Code:   "64305001",
			Text:   "Urticaria",
		},
	}, testManifestation)
}

//func TestFhirAllergyIntolerance2_ExtractSearchParameters(t *testing.T) {
//	t.Parallel()
//	//setup
//	//var observationJson map[string]interface{}
//	conditionBytes, err := os.ReadFile("../../../../frontend/src/lib/fixtures/r4/resources/allergyIntolerance/example2.json")
//	require.NoError(t, err)
//	//err = json.Unmarshal(conditionBytes, &observationJson)
//	//require.NoError(t, err)
//
//	//test
//	conditionModel := FhirCondition{}
//	err = conditionModel.PopulateAndExtractSearchParameters(conditionBytes)
//
//	//assert
//
//	var testClinicalStatus SearchParameterTokenType
//	require.NoError(t, err)
//	err = json.Unmarshal(json.RawMessage(conditionModel.ClinicalStatus), &testClinicalStatus)
//	require.NoError(t, err)
//	require.Equal(t, SearchParameterTokenType{
//		{
//			Code:   "active",
//			System: "http://terminology.hl7.org/CodeSystem/condition-clinical",
//		},
//	}, testClinicalStatus)
//
//	var testVerificationStatus SearchParameterTokenType
//	require.NoError(t, err)
//	err = json.Unmarshal(json.RawMessage(conditionModel.VerificationStatus), &testVerificationStatus)
//	require.NoError(t, err)
//	require.Equal(t, SearchParameterTokenType{
//		{
//			Code:   "confirmed",
//			System: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
//		},
//	}, testVerificationStatus)
//
//	var testCategory SearchParameterTokenType
//	require.NoError(t, err)
//	err = json.Unmarshal(json.RawMessage(conditionModel.Category), &testCategory)
//	require.NoError(t, err)
//	require.Equal(t, SearchParameterTokenType{
//		{
//			Code:   "problem-list-item",
//			System: "http://terminology.hl7.org/CodeSystem/condition-category",
//			Text:   "Problem List Item",
//		},
//	}, testCategory)
//
//	var testSeverity SearchParameterTokenType
//	require.NoError(t, err)
//	err = json.Unmarshal(json.RawMessage(conditionModel.Severity), &testSeverity)
//	require.NoError(t, err)
//	require.Equal(t, SearchParameterTokenType{
//		{
//			Code:   "255604002",
//			System: "http://snomed.info/sct",
//			Text:   "Mild",
//		},
//	}, testSeverity)
//
//	var testOnsetInfo SearchParameterStringType
//	err = json.Unmarshal(json.RawMessage(conditionModel.OnsetInfo), &testOnsetInfo)
//	require.NoError(t, err)
//
//	require.Equal(t, SearchParameterStringType{"approximately November 2012"}, testOnsetInfo)
//
//}
