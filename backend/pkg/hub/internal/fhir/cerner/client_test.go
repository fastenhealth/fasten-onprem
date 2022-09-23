package cerner

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

func TestCernerClient_SyncAll(t *testing.T) {
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
		SourceType:         "cerner",
		PatientId:          "12724066",
		ApiEndpointBaseUrl: "https://fhir-myrecord.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d",
		ClientId:           "89efc22c-e879-4c02-a423-c3b98a0117a3",
	}, httpClient)

	db, err := database.NewRepository(fakeConfig, testLogger)
	require.NoError(t, err)

	//test
	err = client.SyncAll(db)
	require.NoError(t, err)

	//assert
	require.NoError(t, err)
}
