package base

import (
	"encoding/json"
	mock_config "github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config/mock"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/fastenhealth/gofhir-models/fhir401"
	"github.com/golang/mock/gomock"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/require"
	"io/ioutil"
	"log"
	"os"
	"testing"
	"time"
)

// helpers
func readTestFixture(path string) ([]byte, error) {
	jsonFile, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer jsonFile.Close()
	return ioutil.ReadAll(jsonFile)
}

func TestNewFHIR401Client(t *testing.T) {
	t.Parallel()
	//setup
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()
	fakeConfig := mock_config.NewMockInterface(mockCtrl)

	testLogger := logrus.WithFields(logrus.Fields{
		"type": "test",
	})

	//test
	client, err := NewFHIR401Client(fakeConfig, testLogger, models.Source{
		RefreshToken: "test-refresh-token",
		AccessToken:  "test-access-token",
	})

	//assert
	require.NoError(t, err)
	require.Equal(t, client.Source.AccessToken, "test-access-token")
	require.Equal(t, client.Source.RefreshToken, "test-refresh-token")
}

func TestFHIR401Client_ProcessBundle(t *testing.T) {
	t.Parallel()
	//setup
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()
	fakeConfig := mock_config.NewMockInterface(mockCtrl)
	testLogger := logrus.WithFields(logrus.Fields{
		"type": "test",
	})
	client, err := NewFHIR401Client(fakeConfig, testLogger, models.Source{
		RefreshToken: "test-refresh-token",
		AccessToken:  "test-access-token",
	})
	require.NoError(t, err)

	jsonBytes, err := readTestFixture("testdata/fixtures/401-R4/bundle/cigna_syntheticuser05-everything.json")
	require.NoError(t, err)
	var bundle fhir401.Bundle
	err = json.Unmarshal(jsonBytes, &bundle)
	require.NoError(t, err)

	// test
	dependencyGraph, resoureceApiMap, skipped, err := client.ProcessBundle(bundle)
	log.Printf("%v", dependencyGraph)
	log.Printf("%v", resoureceApiMap)
	//assert
	require.NoError(t, err)
	require.Equal(t, 8, len(skipped))
	require.Equal(t, 4, len(resoureceApiMap))
	//require.Equal(t, "A00000000000005", profile.SourceResourceID)
}

func TestFHIR401Client_ProcessPatient_Cigna_Empty(t *testing.T) {
	t.Parallel()
	//setup
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()
	fakeConfig := mock_config.NewMockInterface(mockCtrl)
	testLogger := logrus.WithFields(logrus.Fields{
		"type": "test",
	})
	client, err := NewFHIR401Client(fakeConfig, testLogger, models.Source{
		RefreshToken: "test-refresh-token",
		AccessToken:  "test-access-token",
	})
	require.NoError(t, err)

	jsonBytes, err := readTestFixture("testdata/fixtures/401-R4/patient/cigna_syntheticuser05-patient-A00000000000005.json")
	require.NoError(t, err)
	var patient fhir401.Patient
	err = json.Unmarshal(jsonBytes, &patient)
	require.NoError(t, err)

	// test
	profile, err := client.ProcessPatient(patient)

	//assert
	require.NoError(t, err)
	require.Equal(t, "Patient", profile.SourceResourceType)
	require.Equal(t, "A00000000000005", profile.SourceResourceID)
}

func TestFHIR401Client_ProcessPatient_Cigna_Populated(t *testing.T) {
	t.Parallel()
	//setup
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()
	fakeConfig := mock_config.NewMockInterface(mockCtrl)
	testLogger := logrus.WithFields(logrus.Fields{
		"type": "test",
	})
	client, err := NewFHIR401Client(fakeConfig, testLogger, models.Source{
		RefreshToken: "test-refresh-token",
		AccessToken:  "test-access-token",
	})
	require.NoError(t, err)

	jsonBytes, err := readTestFixture("testdata/fixtures/401-R4/patient/cigna_syntheticuser05-patient-ifp-A00000000000005.json")
	require.NoError(t, err)
	var patient fhir401.Patient
	err = json.Unmarshal(jsonBytes, &patient)
	require.NoError(t, err)

	// test
	profile, err := client.ProcessPatient(patient)

	//assert
	require.NoError(t, err)
	require.Equal(t, "Patient", profile.SourceResourceType)
	require.Equal(t, "ifp-A00000000000005", profile.SourceResourceID)
	require.Equal(t, "2022-06-20T15:45:22.043Z", profile.UpdatedAt.Format(time.RFC3339Nano))
	require.Equal(t, "2013-01-12", *profile.Demographics.Dob)
	require.Equal(t, "female", *profile.Demographics.Gender)
	require.Equal(t, "female", *profile.Demographics.GenderCodes)
	require.Equal(t, "UNK", *profile.Demographics.MaritalStatusCodes)
	require.Equal(t, "unknown", *profile.Demographics.MaritalStatus)
	require.Equal(t, "Monahan", *profile.Demographics.Name.Family)
	require.Equal(t, []string{"Felecita"}, profile.Demographics.Name.Given)
}

func TestFHIR401Client_ProcessPatients_Synthea_Populated(t *testing.T) {
	t.Parallel()
	//setup
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()
	fakeConfig := mock_config.NewMockInterface(mockCtrl)
	testLogger := logrus.WithFields(logrus.Fields{
		"type": "test",
	})
	client, err := NewFHIR401Client(fakeConfig, testLogger, models.Source{
		RefreshToken: "test-refresh-token",
		AccessToken:  "test-access-token",
	})
	require.NoError(t, err)

	jsonBytes, err := readTestFixture("testdata/fixtures/401-R4/patient/synthea_Alesha810_Marks830_1e0a8bd3-3b82-4f17-b1d6-19043aa0db6b.json")
	require.NoError(t, err)
	var patient fhir401.Patient
	err = json.Unmarshal(jsonBytes, &patient)
	require.NoError(t, err)

	// test
	profile, err := client.ProcessPatient(patient)

	//assert
	require.NoError(t, err)
	require.Equal(t, "Patient", profile.SourceResourceType)
	require.Equal(t, "c088b7af-fc41-43cc-ab80-4a9ab8d47cd9", profile.SourceResourceID)
	require.Equal(t, "0001-01-01T00:00:00Z", profile.UpdatedAt.Format(time.RFC3339Nano))
	require.Equal(t, "1965-11-04", *profile.Demographics.Dob)
	require.Equal(t, "female", *profile.Demographics.Gender)
	require.Equal(t, "female", *profile.Demographics.GenderCodes)
	require.Equal(t, "S", *profile.Demographics.MaritalStatusCodes)
	require.Equal(t, "S", *profile.Demographics.MaritalStatus)
	require.Equal(t, "Marks830", *profile.Demographics.Name.Family)
	require.Equal(t, []string{"Alesha810"}, profile.Demographics.Name.Given)
	require.Equal(t, "Ms.", *profile.Demographics.Name.Prefix)
}

func TestFHIR401Client_ProcessOrganizations_Cigna(t *testing.T) {
	t.Parallel()
	//setup
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()
	fakeConfig := mock_config.NewMockInterface(mockCtrl)
	testLogger := logrus.WithFields(logrus.Fields{
		"type": "test",
	})
	client, err := NewFHIR401Client(fakeConfig, testLogger, models.Source{
		RefreshToken: "test-refresh-token",
		AccessToken:  "test-access-token",
	})
	require.NoError(t, err)

	jsonBytes, err := readTestFixture("testdata/fixtures/401-R4/organization/cigna_syntheticuser05-organziation-ifp-51fb06f37e5ec973ce69132a9a2571f3.json")
	require.NoError(t, err)
	var org fhir401.Organization
	err = json.Unmarshal(jsonBytes, &org)
	require.NoError(t, err)

	// test
	apiOrg, err := client.ProcessOrganization(org)

	//assert
	require.NoError(t, err)
	require.Equal(t, "Organization", apiOrg.SourceResourceType)
	require.Equal(t, "ifp-51fb06f37e5ec973ce69132a9a2571f3", apiOrg.SourceResourceID)
	require.Equal(t, "2022-06-20T15:45:45.155Z", apiOrg.UpdatedAt.Format(time.RFC3339Nano))
	require.Equal(t, true, *apiOrg.Active)
	require.Equal(t, "SURPRISE", *apiOrg.Address.City)
	require.Equal(t, "AZ", *apiOrg.Address.State)
	require.Equal(t, []string{"13991 W GRAND AVE STE 105"}, apiOrg.Address.Street)
	require.Nil(t, apiOrg.Address.Country)
	require.Equal(t, "85374", *apiOrg.Address.Zip)
	require.Equal(t, "CIGNA MED GRP PHCY-SUN CITY WE", *apiOrg.Name)
}
