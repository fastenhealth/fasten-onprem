package logica

import (
	"context"
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

func TestLogicaClient_SyncAll(t *testing.T) {
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
	client, _, err := NewClient(context.Background(), fakeConfig, testLogger, models.Source{
		SourceType:         "logica",
		PatientId:          "smart-1288992",
		ApiEndpointBaseUrl: "https://api.logicahealth.org/fastenhealth/data",
		ClientId:           "12b14c49-a4da-42f7-9e6f-2f19db622962",
	}, httpClient)
	require.NoError(t, err)

	db, err := database.NewRepository(fakeConfig, testLogger)
	require.NoError(t, err)

	//test
	err = client.SyncAll(db)
	require.NoError(t, err)

	//assert
	require.NoError(t, err)
}
