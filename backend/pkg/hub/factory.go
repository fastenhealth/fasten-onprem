package hub

import (
	"errors"
	"fmt"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/base"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/cigna"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"net/http"
)

func NewClient(providerId string, appConfig config.Interface, globalLogger logrus.FieldLogger, credentials models.ProviderCredential, testHttpClient ...*http.Client) (base.Client, error) {

	var providerClient base.Client
	var err error
	switch providerId {
	case "anthem":
		providerClient, err = cigna.NewClient(appConfig, globalLogger, credentials, testHttpClient...)
	case "cigna":
		providerClient, err = cigna.NewClient(appConfig, globalLogger, credentials, testHttpClient...)
	default:
		return nil, errors.New(fmt.Sprintf("Unknown Provider Type: %s", providerId))
	}

	return providerClient, err
}
