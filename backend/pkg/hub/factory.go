package hub

import (
	"errors"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/aetna"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/base"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/cigna"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"net/http"
)

func NewClient(providerId string, appConfig config.Interface, globalLogger logrus.FieldLogger, credentials models.Source, testHttpClient ...*http.Client) (base.Client, *models.Source, error) {

	var providerClient base.Client
	var updatedSource *models.Source
	var err error
	switch providerId {
	case "aetna":
		providerClient, updatedSource, err = aetna.NewClient(appConfig, globalLogger, credentials, testHttpClient...)
	case "anthem":
		providerClient, updatedSource, err = cigna.NewClient(appConfig, globalLogger, credentials, testHttpClient...)
	case "cigna":
		providerClient, updatedSource, err = cigna.NewClient(appConfig, globalLogger, credentials, testHttpClient...)
	default:
		return nil, updatedSource, errors.New(fmt.Sprintf("Unknown Provider Type: %s", providerId))
	}

	return providerClient, updatedSource, err
}
