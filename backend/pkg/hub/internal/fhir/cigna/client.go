package cigna

import (
	"context"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/config"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/database"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/hub/internal/fhir/base"
	"github.com/fastenhealth/fastenhealth-onprem/backend/pkg/models"
	"github.com/sirupsen/logrus"
	"net/http"
)

type CignaClient struct {
	*base.FHIR401Client
}

func NewClient(ctx context.Context, appConfig config.Interface, globalLogger logrus.FieldLogger, source models.Source, testHttpClient ...*http.Client) (base.Client, *models.Source, error) {
	baseClient, updatedSource, err := base.NewFHIR401Client(ctx, appConfig, globalLogger, source, testHttpClient...)
	return CignaClient{
		baseClient,
	}, updatedSource, err
}

func (c CignaClient) SyncAll(db database.DatabaseRepository) error {

	bundle, err := c.GetPatientBundle(c.Source.PatientId)
	if err != nil {
		return err
	}

	wrappedResourceModels, err := c.ProcessBundle(bundle)

	//todo, create the resources in dependency order

	for _, apiModel := range wrappedResourceModels {
		err = db.UpsertResource(context.Background(), apiModel)
		if err != nil {
			return err
		}
	}
	return nil
}
