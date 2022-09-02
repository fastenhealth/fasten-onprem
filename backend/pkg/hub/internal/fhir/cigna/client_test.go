package cigna

import (
	mock_config "github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config/mock"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/base"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/golang/mock/gomock"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/require"
	"io/ioutil"
	"os"
	"testing"
)

func TestCignaClient_SyncAll(t *testing.T) {
	t.Parallel()
	//setup
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()
	fakeConfig := mock_config.NewMockInterface(mockCtrl)

	testDatabase, err := ioutil.TempFile("testdata", "fasten.db")
	require.NoError(t, err)
	defer os.Remove(testDatabase.Name())
	fakeConfig.EXPECT().GetString("web.database.location").AnyTimes().Return(testDatabase.Name())
	testLogger := logrus.WithFields(logrus.Fields{
		"type": "test",
	})
	httpClient := base.OAuthVcrSetup(t, false)
	client, err := NewClient(fakeConfig, testLogger, models.Source{
		ProviderId:         "cigna",
		PatientId:          "A00000000000005",
		ApiEndpointBaseUrl: "https://p-hi2.digitaledge.cigna.com/PatientAccess/v1-devportal",
		ClientId:           "e434426c-2aaf-413a-a39a-8f5f6130f287",
	}, httpClient)

	db, err := database.NewRepository(fakeConfig, testLogger)
	require.NoError(t, err)

	//test
	err = client.SyncAll(db)
	require.NoError(t, err)

	//assert
	require.NoError(t, err)
}
