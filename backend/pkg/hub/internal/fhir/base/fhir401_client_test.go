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

func TestFHIR401Client_ProcessPatients_Cigna_Empty(t *testing.T) {
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
	profiles, err := client.ProcessPatients([]fhir401.Patient{patient})

	//assert
	require.NoError(t, err)
	require.Equal(t, 1, len(profiles))
	require.Equal(t, "Patient", profiles[0].SourceResourceType)
	require.Equal(t, "A00000000000005", profiles[0].SourceResourceID)
}

func TestFHIR401Client_ProcessPatients_Cigna_Populated(t *testing.T) {
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
	profiles, err := client.ProcessPatients([]fhir401.Patient{patient})

	//assert
	require.NoError(t, err)
	require.Equal(t, 1, len(profiles))
	require.Equal(t, "Patient", profiles[0].SourceResourceType)
	require.Equal(t, "ifp-A00000000000005", profiles[0].SourceResourceID)
	require.Equal(t, "2022-06-20T15:45:22.043Z", profiles[0].UpdatedAt.Format(time.RFC3339Nano))
	require.Equal(t, "2013-01-12", *profiles[0].Demographics.Dob)
	require.Equal(t, "female", *profiles[0].Demographics.Gender)
	require.Equal(t, "female", *profiles[0].Demographics.GenderCodes)
	require.Equal(t, "UNK", *profiles[0].Demographics.MaritalStatusCodes)
	require.Equal(t, "unknown", *profiles[0].Demographics.MaritalStatus)
	require.Equal(t, "Monahan", *profiles[0].Demographics.Name.Family)
	require.Equal(t, []string{"Felecita"}, profiles[0].Demographics.Name.Given)
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
	profiles, err := client.ProcessPatients([]fhir401.Patient{patient})

	//assert
	require.NoError(t, err)
	require.Equal(t, 1, len(profiles))
	require.Equal(t, "Patient", profiles[0].SourceResourceType)
	require.Equal(t, "c088b7af-fc41-43cc-ab80-4a9ab8d47cd9", profiles[0].SourceResourceID)
	require.Equal(t, "0001-01-01T00:00:00Z", profiles[0].UpdatedAt.Format(time.RFC3339Nano))
	require.Equal(t, "1965-11-04", *profiles[0].Demographics.Dob)
	require.Equal(t, "female", *profiles[0].Demographics.Gender)
	require.Equal(t, "female", *profiles[0].Demographics.GenderCodes)
	require.Equal(t, "S", *profiles[0].Demographics.MaritalStatusCodes)
	require.Equal(t, "S", *profiles[0].Demographics.MaritalStatus)
	require.Equal(t, "Marks830", *profiles[0].Demographics.Name.Family)
	require.Equal(t, []string{"Alesha810"}, profiles[0].Demographics.Name.Given)
	require.Equal(t, "Ms.", *profiles[0].Demographics.Name.Prefix)
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
	orgs, err := client.ProcessOrganizations([]fhir401.Organization{org})

	//assert
	require.NoError(t, err)
	require.Equal(t, 1, len(orgs))
	require.Equal(t, "Organization", orgs[0].SourceResourceType)
	require.Equal(t, "ifp-51fb06f37e5ec973ce69132a9a2571f3", orgs[0].SourceResourceID)
	require.Equal(t, "2022-06-20T15:45:45.155Z", orgs[0].UpdatedAt.Format(time.RFC3339Nano))
	require.Equal(t, true, *orgs[0].Active)
	require.Equal(t, "SURPRISE", *orgs[0].Address.City)
	require.Equal(t, "AZ", *orgs[0].Address.State)
	require.Equal(t, []string{"13991 W GRAND AVE STE 105"}, orgs[0].Address.Street)
	require.Nil(t, orgs[0].Address.Country)
	require.Equal(t, "85374", *orgs[0].Address.Zip)
	require.Equal(t, "CIGNA MED GRP PHCY-SUN CITY WE", *orgs[0].Name)
}
