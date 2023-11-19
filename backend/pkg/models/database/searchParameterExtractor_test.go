package database

import (
	"encoding/json"
	"github.com/dop251/goja"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"os"
	"testing"
)

// Define the suite, and absorb the built-in basic suite
// functionality from testify - including a T() method which
// returns the current testing context
type SearchParameterExtractorTestSuite struct {
	suite.Suite
	VM *goja.Runtime
}

// BeforeTest has a function to be executed right before the test starts and receives the suite and test names as input
func (suite *SearchParameterExtractorTestSuite) BeforeTest(suiteName, testName string) {
	vm := goja.New()
	// setup the global window object
	vm.Set("window", vm.NewObject())
	// compile the fhirpath library
	fhirPathJsProgram, err := goja.Compile("fhirpath.min.js", fhirPathJs, true)
	if err != nil {
		require.NoError(suite.T(), err)
	}
	// compile the searchParametersExtractor library
	searchParametersExtractorJsProgram, err := goja.Compile("searchParameterExtractor.js", searchParameterExtractorJs, true)
	if err != nil {
		require.NoError(suite.T(), err)
	}
	// add the fhirpath library in the goja vm
	_, err = vm.RunProgram(fhirPathJsProgram)
	if err != nil {
		require.NoError(suite.T(), err)
	}
	// add the searchParametersExtractor library in the goja vm
	_, err = vm.RunProgram(searchParametersExtractorJsProgram)
	if err != nil {
		require.NoError(suite.T(), err)
	}

	suite.VM = vm

}

// AfterTest has a function to be executed right after the test finishes and receives the suite and test names as input
func (suite *SearchParameterExtractorTestSuite) AfterTest(suiteName, testName string) {
}

// In order for 'go test' to run this suite, we need to create
// a normal test function and pass our suite to suite.Run
func TestSearchParameterExtractorTestSuite(t *testing.T) {
	suite.Run(t, new(SearchParameterExtractorTestSuite))

}

func (suite *SearchParameterExtractorTestSuite) TestFhirpathEvaluate() {
	//setup
	resourceRaw, err := os.ReadFile("../../../../frontend/src/lib/fixtures/r4/resources/observation/example1.json")
	require.NoError(suite.T(), err)
	var resourceRawMap map[string]interface{}
	err = json.Unmarshal(resourceRaw, &resourceRawMap)
	if err != nil {
		require.NoError(suite.T(), err)
	}
	err = suite.VM.Set("fhirResource", resourceRawMap)
	require.NoError(suite.T(), err)

	//test
	result, err := suite.VM.RunString("fhirpathEvaluate(fhirResource, 'Observation.status')")
	require.NoError(suite.T(), err)

	//assert
	require.Equal(suite.T(), "final", result.String())
}

// Testing Date extraction

func (suite *SearchParameterExtractorTestSuite) TestExtractDateSearchParameters_Date() {
	//setup
	resourceRaw := []byte(`
{
  "resourceType" : "Observation",
  "id" : "2",
  "effectiveDateTime": "2016-03-28"
}
	`)
	var resourceRawMap map[string]interface{}
	err := json.Unmarshal(resourceRaw, &resourceRawMap)
	if err != nil {
		require.NoError(suite.T(), err)
	}
	err = suite.VM.Set("fhirResource", resourceRawMap)
	require.NoError(suite.T(), err)

	//test
	result, err := suite.VM.RunString("extractSimpleSearchParameters(fhirResource,  'AllergyIntolerance.recordedDate | CarePlan.period | CareTeam.period | ClinicalImpression.date | Composition.date | Consent.dateTime | DiagnosticReport.effectiveDateTime | DiagnosticReport.effectivePeriod | Encounter.period | EpisodeOfCare.period | FamilyMemberHistory.date | Flag.period | (Immunization.occurrenceDateTime) | List.date | Observation.effectiveDateTime | Observation.effectivePeriod | Observation.effectiveTiming | Observation.effectiveInstant | Procedure.performedDateTime | Procedure.performedPeriod | Procedure.performedString | Procedure.performedAge | Procedure.performedRange | (RiskAssessment.occurrenceDateTime) | SupplyRequest.authoredOn')")
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), "2016-03-28", result.String())
	//TODO: this is broken
}
func (suite *SearchParameterExtractorTestSuite) TestExtractDateSearchParameters_Period() {
	//setup
	resourceRaw := []byte(`
{
  "resourceType" : "Observation",
  "id" : "2",
  "effectivePeriod": {
    "start": "2013-04-02T09:30:10+01:00"
  }
}
	`)
	var resourceRawMap map[string]interface{}
	err := json.Unmarshal(resourceRaw, &resourceRawMap)
	if err != nil {
		require.NoError(suite.T(), err)
	}
	err = suite.VM.Set("fhirResource", resourceRawMap)
	require.NoError(suite.T(), err)

	//test
	result, err := suite.VM.RunString("extractDateSearchParameters(fhirResource,  'AllergyIntolerance.recordedDate | CarePlan.period | CareTeam.period | ClinicalImpression.date | Composition.date | Consent.dateTime | DiagnosticReport.effectiveDateTime | DiagnosticReport.effectivePeriod | Encounter.period | EpisodeOfCare.period | FamilyMemberHistory.date | Flag.period | (Immunization.occurrenceDateTime) | List.date | Observation.effectiveDateTime | Observation.effectivePeriod | Observation.effectiveTiming | Observation.effectiveInstant | Procedure.performedDateTime | Procedure.performedPeriod | Procedure.performedString | Procedure.performedAge | Procedure.performedRange | (RiskAssessment.occurrenceDateTime) | SupplyRequest.authoredOn')")
	require.NoError(suite.T(), err)
	require.Equal(suite.T(), "2013-04-02T09:30:10+01:00", result.String())
}

// Testing String extraction

func (suite *SearchParameterExtractorTestSuite) TestExtractStringSearchParameters_Simple() {
	//setup
	resourceRaw, err := os.ReadFile("../../../../frontend/src/lib/fixtures/r4/resources/patient/example1.json")
	require.NoError(suite.T(), err)
	var resourceRawMap map[string]interface{}
	err = json.Unmarshal(resourceRaw, &resourceRawMap)
	if err != nil {
		require.NoError(suite.T(), err)
	}
	err = suite.VM.Set("fhirResource", resourceRawMap)
	require.NoError(suite.T(), err)

	//test
	result, err := suite.VM.RunString("extractStringSearchParameters(fhirResource, 'Patient.address.city | Person.address.city | Practitioner.address.city | RelatedPerson.address.city')")
	require.NoError(suite.T(), err)
	var resultSearchParameter SearchParameterStringType
	err = json.Unmarshal([]byte(result.String()), &resultSearchParameter)
	//assert
	require.Equal(suite.T(), SearchParameterStringType{"PleasantVille"}, resultSearchParameter)
}
func (suite *SearchParameterExtractorTestSuite) TestExtractStringSearchParameters_SimpleWithMultipleValues() {
	//setup
	resourceRaw := []byte(`
{
  "resourceType": "Patient",
  "id": "f001",

  "address": [
    {
      "use": "home",
      "line": ["Van Egmondkade 23"],
      "city": "Amsterdam",
      "postalCode": "1024 RJ",
      "country": "NLD"
    },
    {
      "use": "home",
      "line": ["Van Egmondkade 23"],
      "city": "England",
      "postalCode": "1024 RJ",
      "country": "NLD"
    }
  ]
}
	`)

	var resourceRawMap map[string]interface{}
	err := json.Unmarshal(resourceRaw, &resourceRawMap)
	if err != nil {
		require.NoError(suite.T(), err)
	}
	err = suite.VM.Set("fhirResource", resourceRawMap)
	require.NoError(suite.T(), err)

	//test
	result, err := suite.VM.RunString("extractStringSearchParameters(fhirResource, 'Patient.address.city | Person.address.city | Practitioner.address.city | RelatedPerson.address.city')")
	require.NoError(suite.T(), err)
	var resultSearchParameter SearchParameterStringType
	err = json.Unmarshal([]byte(result.String()), &resultSearchParameter)
	//assert
	require.Equal(suite.T(), SearchParameterStringType{"Amsterdam", "England"}, resultSearchParameter)
}
func (suite *SearchParameterExtractorTestSuite) TestExtractStringSearchParameters_SimpleWithNoResult() {
	//setup
	resourceRaw := []byte(`
{
  "resourceType": "Patient",
  "id": "f001",
  "address": []
}
	`)

	var resourceRawMap map[string]interface{}
	err := json.Unmarshal(resourceRaw, &resourceRawMap)
	if err != nil {
		require.NoError(suite.T(), err)
	}
	err = suite.VM.Set("fhirResource", resourceRawMap)
	require.NoError(suite.T(), err)

	//test
	result, err := suite.VM.RunString("extractStringSearchParameters(fhirResource, 'Patient.address.city | Person.address.city | Practitioner.address.city | RelatedPerson.address.city')")
	require.NoError(suite.T(), err)
	var resultSearchParameter SearchParameterStringType
	err = json.Unmarshal([]byte(result.String()), &resultSearchParameter)
	//assert
	require.Nil(suite.T(), resultSearchParameter)
}
func (suite *SearchParameterExtractorTestSuite) TestExtractStringSearchParameters_ComplexWithText() {
	//setup
	resourceRaw := []byte(`
{
  "resourceType": "Patient",
  "id": "f001",
  "name": [
    {
      "use": "official",
      "family": "Chalmers",
      "given": ["Peter", "James"]
    },
    {
      "use": "usual",
      "given": ["Jim"]
    },
    {
      "use": "maiden",
      "family": "Windsor",
      "given": ["Peter", "James"],
      "period": {
        "end": "2002"
      }
    }
  ]
}
	`)
	var resourceRawMap map[string]interface{}
	err := json.Unmarshal(resourceRaw, &resourceRawMap)
	if err != nil {
		require.NoError(suite.T(), err)
	}
	err = suite.VM.Set("fhirResource", resourceRawMap)
	require.NoError(suite.T(), err)

	//test
	result, err := suite.VM.RunString("extractStringSearchParameters(fhirResource, 'Patient.name')")
	require.NoError(suite.T(), err)
	var resultSearchParameter SearchParameterStringType
	err = json.Unmarshal([]byte(result.String()), &resultSearchParameter)
	//assert
	require.Equal(suite.T(), SearchParameterStringType{"Peter James Chalmers", "Jim", "Peter James Windsor"}, resultSearchParameter)
}

// Testing Token extraction
func (suite *SearchParameterExtractorTestSuite) TestExtractTokenSearchParameters_Coding() {
	//setup
	resourceRaw := []byte(`
{
  "resourceType" : "Location",
  "id" : "2",
  "operationalStatus" : {
    "system" : "http://terminology.hl7.org/CodeSystem/v2-0116",
    "code" : "H",
    "display" : "Housekeeping"
  }
}
	`)
	var resourceRawMap map[string]interface{}
	err := json.Unmarshal(resourceRaw, &resourceRawMap)
	if err != nil {
		require.NoError(suite.T(), err)
	}
	err = suite.VM.Set("fhirResource", resourceRawMap)
	require.NoError(suite.T(), err)

	//test
	result, err := suite.VM.RunString("extractTokenSearchParameters(fhirResource, 'Location.operationalStatus')")
	require.NoError(suite.T(), err)
	var resultSearchParameter SearchParameterTokenType
	err = json.Unmarshal([]byte(result.String()), &resultSearchParameter)
	//assert
	require.Equal(suite.T(), SearchParameterTokenType{{
		System: "http://terminology.hl7.org/CodeSystem/v2-0116",
		Code:   "H",
		Text:   "Housekeeping",
	}}, resultSearchParameter)
}
func (suite *SearchParameterExtractorTestSuite) TestExtractTokenSearchParameters_Nil() {
	//setup
	resourceRaw := []byte(`
{
  "resourceType" : "Location",
  "id" : "2"
}
	`)
	var resourceRawMap map[string]interface{}
	err := json.Unmarshal(resourceRaw, &resourceRawMap)
	if err != nil {
		require.NoError(suite.T(), err)
	}
	err = suite.VM.Set("fhirResource", resourceRawMap)
	require.NoError(suite.T(), err)

	//test
	result, err := suite.VM.RunString("extractTokenSearchParameters(fhirResource, 'Location.operationalStatus')")
	require.NoError(suite.T(), err)
	var resultSearchParameter SearchParameterTokenType
	err = json.Unmarshal([]byte(result.String()), &resultSearchParameter)
	//assert
	require.Nil(suite.T(), resultSearchParameter)
}
func (suite *SearchParameterExtractorTestSuite) TestExtractTokenSearchParameters_CodableConcept() {
	//setup
	resourceRaw := []byte(`
{
  "resourceType": "Patient",
  "id": "f001",
  "communication": [
    {
      "language": {
        "coding": [
          {
            "system": "urn:ietf:bcp:47",
            "code": "nl",
            "display": "Dutch"
          }
        ],
        "text": "Nederlands"
      },
      "preferred": true
    }
  ]
}


	`)
	var resourceRawMap map[string]interface{}
	err := json.Unmarshal(resourceRaw, &resourceRawMap)
	if err != nil {
		require.NoError(suite.T(), err)
	}
	err = suite.VM.Set("fhirResource", resourceRawMap)
	require.NoError(suite.T(), err)

	//test
	result, err := suite.VM.RunString("extractTokenSearchParameters(fhirResource, 'Patient.communication.language')")
	require.NoError(suite.T(), err)
	var resultSearchParameter SearchParameterTokenType
	err = json.Unmarshal([]byte(result.String()), &resultSearchParameter)
	//assert
	require.Equal(suite.T(), SearchParameterTokenType{{
		System: "urn:ietf:bcp:47",
		Code:   "nl",
		Text:   "Dutch",
	}}, resultSearchParameter)
}
func (suite *SearchParameterExtractorTestSuite) TestExtractTokenSearchParameters_Identifier() {
	//setup
	resourceRaw := []byte(`
{
  "resourceType": "Patient",
  "id": "f001",
  "identifier": [
    {
      "use": "usual",
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
            "code": "MR"
          }
        ]
      },
      "system": "urn:oid:1.2.36.146.595.217.0.1",
      "value": "12345",
      "period": {
        "start": "2001-05-06"
      },
      "assigner": {
        "display": "Acme Healthcare"
      }
    }
  ]
}


	`)
	var resourceRawMap map[string]interface{}
	err := json.Unmarshal(resourceRaw, &resourceRawMap)
	if err != nil {
		require.NoError(suite.T(), err)
	}
	err = suite.VM.Set("fhirResource", resourceRawMap)
	require.NoError(suite.T(), err)

	//test
	result, err := suite.VM.RunString("extractTokenSearchParameters(fhirResource, 'Patient.identifier')")
	require.NoError(suite.T(), err)
	var resultSearchParameter SearchParameterTokenType
	err = json.Unmarshal([]byte(result.String()), &resultSearchParameter)
	//assert
	require.Equal(suite.T(), SearchParameterTokenType{{
		System: "urn:oid:1.2.36.146.595.217.0.1",
		Code:   "12345",
		Text:   "",
	}}, resultSearchParameter)
}
func (suite *SearchParameterExtractorTestSuite) TestExtractTokenSearchParameters_ContactPoint() {
	//setup
	resourceRaw := []byte(`
{
  "resourceType": "Patient",
  "id": "f001",
  "telecom": [
    {
      "use": "home"
    },
    {
      "system": "phone",
      "value": "(03) 5555 6473",
      "use": "work",
      "rank": 1
    },
    {
      "system": "phone",
      "value": "(03) 3410 5613",
      "use": "mobile",
      "rank": 2
    },
    {
      "system": "phone",
      "value": "(03) 5555 8834",
      "use": "old",
      "period": {
        "end": "2014"
      }
    }
  ]
}


	`)
	var resourceRawMap map[string]interface{}
	err := json.Unmarshal(resourceRaw, &resourceRawMap)
	if err != nil {
		require.NoError(suite.T(), err)
	}
	err = suite.VM.Set("fhirResource", resourceRawMap)
	require.NoError(suite.T(), err)

	//test
	result, err := suite.VM.RunString("extractTokenSearchParameters(fhirResource, 'Patient.telecom | Person.telecom | Practitioner.telecom | PractitionerRole.telecom | RelatedPerson.telecom')")
	require.NoError(suite.T(), err)
	var resultSearchParameter SearchParameterTokenType
	err = json.Unmarshal([]byte(result.String()), &resultSearchParameter)
	//assert
	require.Equal(suite.T(), SearchParameterTokenType{
		{
			System: "phone",
			Code:   "(03) 5555 6473",
			Text:   "",
		},
		{
			System: "phone",
			Code:   "(03) 3410 5613",
			Text:   "",
		},
		{
			System: "phone",
			Code:   "(03) 5555 8834",
			Text:   "",
		},
	}, resultSearchParameter)
}
func (suite *SearchParameterExtractorTestSuite) TestExtractTokenSearchParameters_code() {
	//setup
	resourceRaw := []byte(`
{
  "resourceType": "Patient",
  "id": "f001",
  "gender": "male"
}


	`)
	var resourceRawMap map[string]interface{}
	err := json.Unmarshal(resourceRaw, &resourceRawMap)
	if err != nil {
		require.NoError(suite.T(), err)
	}
	err = suite.VM.Set("fhirResource", resourceRawMap)
	require.NoError(suite.T(), err)

	//test
	result, err := suite.VM.RunString("extractTokenSearchParameters(fhirResource, 'Patient.gender | Person.gender | Practitioner.gender | RelatedPerson.gender')")
	require.NoError(suite.T(), err)
	var resultSearchParameter SearchParameterTokenType
	err = json.Unmarshal([]byte(result.String()), &resultSearchParameter)
	//assert
	require.Equal(suite.T(), SearchParameterTokenType{
		{
			System: "",
			Code:   "male",
			Text:   "",
		},
	}, resultSearchParameter)
}

// Testing Reference extraction

// Testing Quantity extraction

// Testing Uri extraction

// Testing Keyword extraction

// Testing Catchall extraction
