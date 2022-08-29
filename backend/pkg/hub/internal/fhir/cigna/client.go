package cigna

import (
	"encoding/json"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/base"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"net/http"
)

type CignaClient struct {
	base.FHIR401Client
}

func NewClient(appConfig config.Interface, globalLogger logrus.FieldLogger, credentials models.ProviderCredential, testHttpClient ...*http.Client) (base.Client, error) {
	baseClient, err := base.NewFHIR401Client(appConfig, globalLogger, credentials, testHttpClient...)
	return CignaClient{
		baseClient,
	}, err

}

func (c CignaClient) SyncAll() error {
	patient, err := c.GetPatient(c.Credential.PatientId)
	if err != nil {
		return err
	}
	c.Logger.Infof("patient: %v", patient)

	bundle, err := c.GetPatientEverything(c.Credential.PatientId)
	if err != nil {
		return err
	}

	bundleJson, err := json.Marshal(bundle)
	if err != nil {
		return err
	}
	c.Logger.Infof("bundle lenght: ", string(bundleJson))
	return nil
}

//func (c CignaClient) PatientProfile() (models.PatientProfile, error) {
//	patient, err := c.GetPatientEverything(fmt.Sprintf("Patient/%s/", c.Credential.PatientId))
//
//
//
//	return nil
//}
