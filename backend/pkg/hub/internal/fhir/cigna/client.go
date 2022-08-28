package cigna

import (
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/base"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"net/http"
)

type CignaClient struct {
	base.FhirBaseClient
}

func NewClient(appConfig config.Interface, globalLogger logrus.FieldLogger, credentials models.ProviderCredential, testHttpClient ...*http.Client) (base.Client, error) {
	baseClient, err := base.NewBaseClient(appConfig, globalLogger, credentials, testHttpClient...)
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

	//bundle, err := c.GetPatientEverything(c.Credential.PatientId)
	//if err != nil {
	//	return err
	//}
	//c.Logger.Infof("bundle lenght: ", bundle.Total)
	return nil
}

//func (c CignaClient) PatientProfile() (models.PatientProfile, error) {
//	patient, err := c.GetPatientEverything(fmt.Sprintf("Patient/%s/", c.Credential.PatientId))
//
//
//
//	return nil
//}
